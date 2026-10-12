# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## specdrift

Working name for an open-source tool that checks the API traffic seen in Playwright UI tests
(`page.route` mocks, HAR files, live responses) against an OpenAPI spec. It reports mocks that no
longer match the spec, and which documented operations the UI suite never exercises.

Owner: Ashok Mondal, QA automation engineer. This is a portfolio project meant to be public, used
by other testers, and discussed in interviews. Why it was chosen over eleven other ideas is in
`docs/research/project-selection-report.md` (kept locally, not in git; only the two tool-focused
research notes are public).

## Current stage

See the "Status" section of `README.md`. Update it at the end of every working session.

Since the Stage 1 result (`docs/decisions.md`, 2026-10-12) specdrift is a thin Playwright add-on,
not a validation engine: Redocly CLI's experimental `drift` command does the spec matching.
Do not write a spec matcher or validator of our own.

## Repo layout and commands

There is no product code yet. The repo root has no `package.json`, no build, no lint and no CI.
The only runnable code is `spike/`, a throwaway Stage 1 test bench with its own `package.json`.
Run everything below from `spike/`.

```bash
npm install
npx playwright install chromium
npm test                                         # the two sample tests, both green
npx playwright test tests/users-mocked.spec.ts   # one file
npx playwright test -g "mocked API"              # one test by title
npm run try:addon                                # the Stage 2 prototype
```

The other `try:*` scripts are one experiment per existing tool; `spike/README.md` says which
question each one answers.

- `try:redocly` and `try:addon` exit 1 on purpose: the sample mock is stale and finding that is
  the expected result. Exit 0 from either would be the failure.
- `try:redocly` writes `experiments/run.har`, and `try:tracecov` reads it, so run them in that
  order.
- Playwright starts the sample app itself on port 3100 (`webServer` in `playwright.config.ts`,
  `reuseExistingServer: true`). `npm run app` is only for looking at the page by hand.

## How the prototype fits together

The sample is built around one deliberate mismatch. `spike/app/server.mjs` and
`spike/openapi.json` agree on `fullName` and `email`; the mocked tests fulfil `**/api/users`
with the old `name` field. Both sample tests pass anyway, which is the problem being shown.
Keep that mismatch when editing the sample.

`spike/experiments/addon/` is the design chosen for Stage 2, in two halves:

1. `fixture.ts` overrides Playwright's `context` fixture so each test records its own HAR to
   `specdrift-results/<test title path>.har`. The HAR is only written when the context closes.
2. `check.mjs [dir] [spec]` reads each HAR, keeps only JSON responses (this drops the
   "undocumented endpoint: GET /" noise from the HTML page), writes the filtered copy to a temp
   dir, runs `redocly drift ... --match-mode basepath --format json` on it, and joins Redocly's
   `problems[].exchangeIndex` back to the HAR entries to print per-test lines.

Things that only show up when reading these together:

- Mocked vs live comes from `"_wasFulfilled": true`, which Playwright itself puts on HAR entries
  that `page.route` fulfilled. No wrapper around `page.route` is needed. (The older Stage 1
  entry in `docs/decisions.md` says a wrapper is needed; the newer entry above it corrects that.)
- `exchangeIndex` is an index into the filtered entry list, so the filter and the lookup must
  stay in step.
- The spec's `servers` is `/api`, hence `--match-mode basepath`.
- Redocly exits 1 when it finds drift, so `check.mjs` reads the report from the thrown error's
  `stdout`.
- `drift` is experimental. Keep its version pinned and the call in one place so the engine can
  be swapped for `openapi-mock-validator`.

## How we work here

These are standing rules. Follow them without being asked.

1. **Verify before building.** No feature work until the Stage 1 checklist in `README.md` is done
   and its result is written down (done, see `docs/decisions.md`). If an existing tool already does the job, stop and say so.
2. **One stage at a time.** Finish and record the current stage before starting the next. Do not
   start the second portfolio project (the Playwright test selector) until this one is published.
3. **Write decisions down.** Any choice that a future reader would question goes in
   `docs/decisions.md` as a dated entry: what was decided, what was rejected, why. Create the file
   with the first decision.
4. **Show before building anything visible.** CLI output format, report layout, README structure:
   show a sample and wait for a yes.
5. **The tool must test itself.** Every feature lands with tests, and CI runs them. A testing tool
   without tests is the first thing an interviewer will notice.
6. **Test before publishing.** Run the tool against the demo repo and read the output before any
   push, npm publish or release. Report failures as failures.
7. **Honest claims only.** Never write "first", "only" or "unique" in the README or anywhere
   public. Prior art exists for each half of this tool (`pw-radar`, `@tracecov/playwright`,
   `openapi-mock-validator`); name it and say how this differs. No invented numbers.
8. **Small commits, plain messages.** One change per commit. Commit only when Ashok asks.
9. **Ask before anything public or irreversible:** creating the GitHub repo, pushing, publishing
   to npm, tagging a release.

## Accounts

Account rules are in `CLAUDE.local.md`, which is not in git. Read it before any push.

## Scope guard

Not in scope: a hosted service, a dashboard, a general contract-testing framework, AI features.
The tool is a CLI plus a Playwright integration plus a GitHub Action, sharing one core.
