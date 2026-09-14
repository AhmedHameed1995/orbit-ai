# Fathom product reconnaissance

Date: 2026-09-14

## What was directly inspected

- Live marketing site at `fathom.video` (redirects to `fathom.ai`).
- Live sign-up surface at `fathom.video/users/sign_up`.
- Official current Teams product page and its February 2026 call-detail visual.
- Current first-party Help Center documentation for onboarding, calls, transcripts,
  summaries, templates, action items, highlights, search, and sharing.

Screenshots:

- `01-homepage.png` — full live marketing page.
- `02-signup.png` — live free sign-up entry point.
- `03-teams-product.png` — full current Teams product page.
- `04-call-detail-reference.png` — official current call-detail product visual.

## Authenticated-flow boundary

The live sign-up screen offers Google and Microsoft OAuth only. Completing an account,
granting calendar access, admitting a bot to a real Zoom/Meet/Teams call, or sharing a
real recording would require the user's identity, calendar, and meeting credentials.
Those actions were not represented as completed. The build deliberately stubs capture
and focuses on the post-call workflow, which the assignment explicitly permits.

## Verified workflow model

1. Connect a Google or Microsoft calendar. Calendar events drive upcoming meetings and
   automatic capture. Consumer-domain sign-ups require a scheduled supported meeting in
   the next seven days.
2. Capture supports Zoom, Google Meet, and Microsoft Teams. Fathom is rolling out a newer
   bot-free desktop experience, while bot capture still exists for some platforms.
3. After processing, a call exposes the recording, transcript, AI summary, action items,
   questions/Ask Fathom, attendees, and sharing controls.
4. Playback and transcript are time-linked. Transcript rows are speaker-attributed and
   can be used to create a post-call highlight from the plus control beside a segment.
5. Highlights can be expanded or trimmed, categorized, and shared as clips. Playlists
   group clips from multiple calls.
6. Summary templates include General/Enhanced, Sales variants, Q&A, Demo, Customer
   Success, One-on-One, Project Update/Kick-Off, Candidate Interview, and Retrospective.
7. Action items include an assignee and source timestamp. Fathom can auto-extract them.
8. Standard search is supplemented by AI Search across accessible calls, with filters
   for date, team, internal/external meeting type, and who said it.
9. A full recording can be shared as anyone-with-link, same-domain, or invited-only.
   External viewers do not need a Fathom account when anyone-with-link is enabled.

## UI observations

- Current product visuals use a near-black shell with warm charcoal cards, white type,
  muted gray metadata, cyan primary accents, and occasional yellow/purple gradients.
- The meeting detail is information-dense but calm: primary content and video occupy the
  left/main area; attendees and action items form a utility rail.
- The most useful product-level navigation is meetings first, then clips/playlists,
  search, and shared/team surfaces.
- For a one-hour, eight-person call, persistent speaker identity, compact transcript
  density, jump-to-time behavior, and visible talk-time balance matter more than a large
  decorative video panel.

## Build decision

The implementation will be a seeded, no-auth post-call workspace. Capture is explicitly
stubbed. The product slice will prioritize:

1. A populated meetings inbox with search and useful filters.
2. A one-hour, eight-person call as the flagship record.
3. Synced playback/transcript navigation and speaker/talk-time context.
4. Switchable AI summaries and editable/checkable action items.
5. Creating a highlight from a transcript moment and turning it into a shareable clip.
6. A signed-out public share route.

This keeps the assignment's highest-value loop coherent: find a call, understand it,
verify the source moment, turn insight into follow-up, and share the exact evidence.
