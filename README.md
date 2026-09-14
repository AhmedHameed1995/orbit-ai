# Orbit — meeting intelligence

Orbit is a product-focused rebuild of Fathom's post-meeting experience. It turns a
recorded conversation into a useful operating surface: searchable meetings, source-
linked summaries, action items, transcript moments, clips, and a public share view.

**Live:** https://orbit-meeting-intelligence.cheery-grape-5370.chatgpt.site

**Anonymous share demo:** https://orbit-meeting-intelligence.cheery-grape-5370.chatgpt.site/?share=atlas-q3

## Product scope

The recording bot is intentionally stubbed. The assignment explicitly allows this,
and the build spends that time on the workflow that begins when a meeting ends.

The seeded flagship call is a realistic 62-minute customer implementation review with
eight speakers. It is designed to pressure-test transcript density, speaker identity,
talk-time context, actions, and evidence-linked summaries.

## Working flows

- Six seeded meetings with search and type filters
- 62-minute playback timeline and eight-person participant grid
- Summary template switching: General, Customer Success, Executive Brief
- Summary bullets linked to source timestamps
- Speaker-attributed transcript with jump-to-time behavior
- Save any transcript segment as a new clip
- Check off action items and jump to their source moments
- Ask Orbit with a transcript-grounded answer
- Share controls with audience selection and copy-link feedback
- Public `?share=atlas-q3` view that needs no account
- Responsive desktop, tablet, and mobile layouts

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Agent capture

Codex lifecycle capture is configured in `.codex/hooks.json`. It records only the raw
user prompt and final response to `.agent-logs/`. See `CAPTURE-TEST.md` for the two-
session canary proof.

## Reconnaissance

`recon/PRODUCT-RECON.md` separates directly verified Fathom behavior from the
authenticated flows that require the user's calendar and meeting credentials. The
folder also contains captured source and implementation screenshots.
