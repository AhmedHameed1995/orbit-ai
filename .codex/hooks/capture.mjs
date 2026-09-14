#!/usr/bin/env node
/**
 * Append only the raw prompt and final response from Codex lifecycle events.
 * The hook payload is JSON on stdin. Failures never interrupt the agent.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const kind = process.argv[2] === 'response' ? 'RESPONSE' : 'PROMPT';

function readPayload() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8'));
  } catch {
    return null;
  }
}

function gitValue(cwd, key, fallback) {
  try {
    return execFileSync('git', ['config', '--get', key], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim() || fallback;
  } catch {
    return fallback;
  }
}

function utcStamp(date) {
  const pad = (value) => String(value).padStart(2, '0');
  const day = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
  return {
    day,
    file: `${day}_${pad(date.getUTCHours())}-${pad(date.getUTCMinutes())}-${pad(date.getUTCSeconds())}`,
    iso: date.toISOString(),
  };
}

function updateFrontmatter(text, key, value) {
  const end = text.indexOf('\n---', 4);
  if (!text.startsWith('---') || end < 0) return text;
  const head = text.slice(0, end);
  const tail = text.slice(end);
  const pattern = new RegExp(`^${key}: .*$`, 'm');
  return `${head.replace(pattern, `${key}: ${value}`)}${tail}`;
}

function logFile(logDir, sessionId, stamp) {
  fs.mkdirSync(logDir, { recursive: true });
  const suffix = `_${sessionId}.md`;
  const existing = fs.readdirSync(logDir).find((name) => name.endsWith(suffix));
  return path.join(logDir, existing || `${stamp.file}${suffix}`);
}

function initialize(file, data, stamp, cwd) {
  const author = gitValue(cwd, 'agentlog.author', gitValue(cwd, 'user.name', 'unknown'));
  const project = path.basename(cwd);
  const shortId = data.session_id.slice(0, 8);
  fs.writeFileSync(file, `---
session_id: ${data.session_id}
date: ${stamp.day}
author: ${author}
model: ${data.model || 'unknown'}
tool: codex
project: ${project}
total_exchanges: 0
first_prompt_time: ${stamp.iso}
last_prompt_time: ${stamp.iso}
---

# Session Log - ${stamp.day}

Session: \`${shortId}\` | Project: \`${project}\` | Author: \`${author}\`

---

`, 'utf8');
}

function main() {
  const data = readPayload();
  if (!data?.session_id) return;

  const body = kind === 'PROMPT' ? data.prompt : data.last_assistant_message;
  if (!body || !String(body).trim()) return;

  const cwd = data.cwd || process.cwd();
  const logDir = path.join(cwd, '.agent-logs');
  const stamp = utcStamp(new Date());
  const file = logFile(logDir, data.session_id, stamp);
  if (!fs.existsSync(file)) initialize(file, data, stamp, cwd);

  let text = fs.readFileSync(file, 'utf8');
  const promptCount = (text.match(/\[LOG_ENTRY type=PROMPT /g) || []).length;
  const exchange = kind === 'PROMPT' ? promptCount + 1 : Math.max(promptCount, 1);
  text += `[LOG_ENTRY type=${kind} num=${exchange} session=${data.session_id.slice(0, 8)}]\n`;
  text += `timestamp: ${stamp.iso}\nmodel: ${data.model || 'unknown'}\n\n${String(body).trim()}\n\n\n`;
  text = updateFrontmatter(text, 'total_exchanges', exchange);
  text = updateFrontmatter(text, 'last_prompt_time', stamp.iso);
  fs.writeFileSync(file, text, 'utf8');
}

try {
  main();
} catch (error) {
  process.stderr.write(`[capture] ${error instanceof Error ? error.message : String(error)}\n`);
}

process.stdout.write('{}\n');
