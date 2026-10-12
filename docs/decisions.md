# Decisions

## 2026-10-12: Make the repo public now, before stage 3

**Decided by Ashok.**

The repo goes public on GitHub (`ashok-mondal-qa/specdrift`) while stage 2 is still open, under
the MIT licence. The original plan made it public in stage 4, after the npm package and demo.

**Public:** README, this file, `spike/`, `CLAUDE.md` and the two tool-focused research notes
(`prior_art_check.md`, `tool_landscape_gaps.md`).

**Kept out of git:** the other research notes, which are about why the project was picked rather
than about the tool, and the account rules (`CLAUDE.local.md`).

**Rejected:** waiting for stage 3 (the Stage 1 findings are already useful to read); publishing
every file; pushing without a licence (nobody could legally reuse the code).

**Why MIT:** short, permissive, and the same licence as Redocly CLI, which this builds on.

**Consequence:** the README must keep saying this is a prototype that is not on npm.

## 2026-10-12: Narrow specdrift to a thin Playwright add-on

**Decided by Ashok** after the Stage 1 result below (option 1).

specdrift is now a small Playwright add-on, not a new validation engine. It does three things:

1. Records one HAR file per test, through a Playwright fixture.
2. Runs Redocly CLI's `drift` command on each HAR as the engine.
3. Prints the result per test, marking each API call as mocked or live, plus which spec
   operations the UI tests never call. It exits 1 when a mock has drifted.

**Rejected:** writing our own spec matcher and validator (Redocly already does it, for free);
stopping the project (the per-test and mocked-vs-live parts are still missing elsewhere);
contributing upstream only.

**Why:** It stays small and explainable, it names the prior art honestly, and it fills the gap
Stage 1 actually found.

**Found while prototyping (`spike/experiments/addon/`):** Playwright's HAR marks responses that
`page.route` faked with `"_wasFulfilled": true`, so mocked vs live needs no extra code.
Keeping only JSON responses removes the "undocumented endpoint: GET /" noise from the page itself.

**Risk:** Redocly marks `drift` as experimental. Pin its version and keep the call in one place
so it can be swapped for openapi-mock-validator if it changes.

## 2026-10-12: Stage 1 result, the gap is mostly closed by Redocly CLI

**Status: decided, see the entry above.**

### What was tested

A sample app, an OpenAPI spec and Playwright UI tests that mock the API with a stale response
(`name` instead of `fullName`), all in [`spike/`](../spike/README.md). Each check below can be
re-run from there.

### What each tool did

| Tool | Sees UI-test traffic? | Catches the stale mock? | Coverage for UI tests? | Notes |
| --- | --- | --- | --- | --- |
| **Redocly CLI `drift`** (MIT, free, marked experimental) | Yes, through a HAR file | **Yes**: missing `fullName` and `email`, unexpected `name` | **Yes**, with `--coverage` | Exits 1 on findings, so it can gate CI. Also flags the HTML page itself as an "undocumented endpoint" (noise). |
| **pw-radar** 0.2.2 (Apache-2.0, not MIT as the research assumed) | Only with a hand-written `page.on('response')` listener | **Partly**: flags the extra `name` field, but only when field names are passed in by hand. Misses missing fields and wrong types (`{ id: "2" }` passed). | Yes | Always exits 0. Records field names, never values. |
| **@tracecov/playwright** 0.25.3 (TraceCov Community licence) | **No.** The fixture wraps `request`, not `page`; the report said 0 of 4 operations tested. | No. Recording the stale body by hand gave no diagnostics. | Only for API tests | HAR import throws: "HAR import requires TraceCov Professional". |
| **openapi-mock-validator** 0.3.0 (MIT) | No (a library only) | **Yes**, all three problems, when given the body | No | Ignores the spec's `servers` prefix: `/api/users` matched nothing until `/api` was stripped by hand. |

### Other questions from the checklist

- **Can `route.fulfill` bodies be captured?** Yes, two ways. A `page.on('response')` listener
  gets the faked body, and Playwright's own `recordHar` writes it into the HAR. Neither marks
  the response as faked; telling mocked from live needs a wrapper around `page.route`.
- **Does Redocly have a `drift` command that reads HAR?** Yes. `redocly drift <traffic> --api
  <spec>` exists in @redocly/cli 2.62.1, reads HAR, Kong, Nginx/Apache JSON and NDJSON, and can
  print coverage. The research notes that doubted it were wrong.
- **Is the name free?** `specdrift` is not taken on npm.

### What this means

Playwright's built-in HAR recording plus `redocly drift` already does the core job of the
planned tool: it validates mocked and live bodies against the spec, reports coverage and fails
CI, for free, with no code. CLAUDE.md rule 1 says to stop and say so when that happens.

What is still missing, and was not tested end to end:

- Per-test results ("which test's mock drifted"). A HAR is per browser context, so a suite
  would need one HAR per test and a way to map findings back.
- Marking which responses were mocked and which were live.
- A setup step: nothing wires `recordHar` into a Playwright suite automatically, and the HTML
  page shows up as noise.
- Redocly marks the command experimental, so it may change.

### Options

1. **Narrow specdrift to a thin Playwright add-on** that records one HAR per test, labels mocked
   vs live, runs Redocly's `drift` as the engine and prints results per test. Small and easy to
   explain, and honest about the prior art. *(Recommended.)*
2. **Stop specdrift** and start the second project (the Playwright test selector). In
   interviews, describe this check and what it found.
3. **Contribute upstream** instead: for example, `servers` prefix support in
   openapi-mock-validator, or page-traffic support in pw-radar.
