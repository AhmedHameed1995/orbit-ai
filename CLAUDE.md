# 8x Assignment — Fathom rebuild

Rebuild of [fathom.video](https://fathom.video/) (the AI meeting notetaker) as a 24-hour
assignment. Judged on speed, product judgement, and UX/UI.

## Ground rules from the brief

- Agent capture must be running before any build work. See `CAPTURE-TEST.md`.
- `.agent-logs/` is committed, public, and never edited after the fact. Dead ends and
  wrong turns stay in.
- Commit logs as you go, interleaved with the code they produced. Not one dump at the end.
- Faking or stubbing the recording/capture layer is explicitly allowed, as long as the
  walkthrough says so.

## Deliverables

- Live link, open to a signed-out visitor
- Public repo with `.agent-logs/` in it
- Walkthrough video, camera on, under five minutes

## Scope decision

The recording bot is plumbing. The value is everything that happens *after* the call, so
that is what gets built. Capture layer is stubbed, and the walkthrough says so.

In priority order:

1. Meetings list, seeded with realistic data
2. Meeting detail: player with a two-way synced transcript, speaker rail, talk-time split
3. AI summary with switchable templates
4. Action items with assignees
5. Highlights: mark a moment, it lands on the timeline, it becomes a clip
6. Search across meetings
7. Share link that opens for someone who was not on the call and is not signed in

Seed data must include an eight-person call that runs an hour. Per the brief that is the
case that actually matters, so it drives the layout decisions rather than being an
afterthought.

## Stack

Next.js (App Router) + TypeScript + Tailwind. Seed data from JSON in the repo, no auth,
deployed to Vercel. No auth is deliberate: the live link has to open for anyone.

## Capture setup

- `.claude/hooks/capture.mjs` — hook script, writes to `.agent-logs/`
- `.claude/settings.json` — wires `UserPromptSubmit` (prompt) and `Stop` (final response)
- `Stop` gives `last_assistant_message`, which is the final response only: no thinking,
  no tool calls, no intermediate steps. That is what the brief asks for.
- Model name is not in the hook payload, so the script reads it from `transcript_path`.

Hooks load at session start. A session that was already open when the config was written
will not fire them.

## Things the agent cannot do — these are the human's to do

- Signing up for fathom.video, entering passwords, connecting a calendar via OAuth
- Pushing to GitHub and deploying to Vercel
- Recording the walkthrough

## TODO

- [ ] Set `git config agentlog.author <github-handle>` — currently falls back to `user.name`
- [ ] Run the two canary tests and write `CAPTURE-TEST.md`
- [ ] Then build
