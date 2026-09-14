#!/usr/bin/env node
/**
 * 8x assignment agent-capture hook.
 * Appends prompts and final responses to .agent-logs/<date>_<time>_<session-id>.md
 *
 * Usage (from .claude/settings.json):
 *   node .claude/hooks/capture.mjs prompt     <- UserPromptSubmit
 *   node .claude/hooks/capture.mjs response   <- Stop
 *
 * Reads the hook payload as JSON on stdin. Never throws into the agent: on any
 * failure it writes to stderr and exits 0 so the session is unaffected.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const KIND = process.argv[2] === 'response' ? 'RESPONSE' : 'PROMPT';
const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const LOG_DIR = path.join(PROJECT_DIR, '.agent-logs');

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

/** Pull the model name out of the session transcript (hook payload omits it). */
function modelFromTranscript(transcriptPath) {
  if (!transcriptPath || !fs.existsSync(transcriptPath)) return 'unknown';
  try {
    const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (!line) continue;
      try {
        const model = JSON.parse(line)?.message?.model;
        if (model) return model;
      } catch {}
    }
  } catch {}
  return 'unknown';
}

function gitAuthor() {
  for (const key of ['agentlog.author', 'user.name']) {
    try {
      const v = execFileSync('git', ['config', '--get', key], {
        cwd: PROJECT_DIR,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();
      if (v) return v;
    } catch {}
  }
  return 'unknown';
}

function stamp(d) {
  const p = (n, w = 2) => String(n).padStart(w, '0');
  return {
    date: `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`,
    file: `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}_${p(d.getUTCHours())}-${p(d.getUTCMinutes())}-${p(d.getUTCSeconds())}`,
    iso: d.toISOString(),
  };
}

/** One file per session; find it by the session id suffix in the filename. */
function sessionFile(sessionId, now) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  const suffix = `_${sessionId}.md`;
  const existing = fs
    .readdirSync(LOG_DIR)
    .filter((f) => f.endsWith(suffix))
    .sort();
  if (existing.length) return path.join(LOG_DIR, existing[0]);
  return path.join(LOG_DIR, `${now.file}${suffix}`);
}

function createFile(file, { sessionId, now, model, project }) {
  const author = gitAuthor();
  const short = sessionId.slice(0, 8);
  const header = `---
session_id: ${sessionId}
date: ${now.date}
author: ${author}
model: ${model}
tool: claude-code
project: ${project}
total_exchanges: 0
first_prompt_time: ${now.iso}
last_prompt_time: ${now.iso}
---

# Session Log - ${now.date}

Session: \`${short}\` | Project: \`${project}\` | Author: \`${author}\`

---

`;
  fs.writeFileSync(file, header, 'utf8');
}

function setFrontmatterField(text, key, value) {
  const end = text.indexOf('\n---', 4);
  if (!text.startsWith('---') || end === -1) return text;
  const head = text.slice(0, end);
  const tail = text.slice(end);
  const re = new RegExp(`^${key}: .*$`, 'm');
  return (re.test(head) ? head.replace(re, `${key}: ${value}`) : head) + tail;
}

function main() {
  const raw = readStdin();
  let data = {};
  try {
    data = JSON.parse(raw);
  } catch {
    process.stderr.write('[capture] stdin was not JSON; nothing logged\n');
    return;
  }

  const sessionId = data.session_id || 'no-session';
  const project = path.basename(PROJECT_DIR);
  const now = stamp(new Date());
  const model = modelFromTranscript(data.transcript_path);

  const body =
    KIND === 'PROMPT'
      ? data.prompt
      : data.last_assistant_message;

  if (!body || !String(body).trim()) {
    process.stderr.write(`[capture] empty ${KIND.toLowerCase()}; nothing logged\n`);
    return;
  }

  const file = sessionFile(sessionId, now);
  if (!fs.existsSync(file)) createFile(file, { sessionId, now, model, project });

  let text = fs.readFileSync(file, 'utf8');
  const short = sessionId.slice(0, 8);

  // Prompts open an exchange; responses close the one that is already open.
  const prompts = (text.match(/\[LOG_ENTRY type=PROMPT /g) || []).length;
  const num = KIND === 'PROMPT' ? prompts + 1 : Math.max(prompts, 1);

  text +=
    `[LOG_ENTRY type=${KIND} num=${num} session=${short}]\n` +
    `timestamp: ${now.iso}\n` +
    `model: ${model}\n\n` +
    `${String(body).trim()}\n\n\n`;

  text = setFrontmatterField(text, 'total_exchanges', num);
  text = setFrontmatterField(text, 'last_prompt_time', now.iso);
  if (model !== 'unknown') text = setFrontmatterField(text, 'model', model);

  fs.writeFileSync(file, text, 'utf8');
  process.stderr.write(`[capture] ${KIND} #${num} -> ${path.relative(PROJECT_DIR, file)}\n`);
}

try {
  main();
} catch (err) {
  process.stderr.write(`[capture] failed: ${err && err.message}\n`);
}
process.exit(0);
