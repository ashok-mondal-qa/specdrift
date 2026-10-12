# specdrift

> Working name. A prototype, not on npm yet.

Checks the API traffic in your Playwright UI tests against your OpenAPI spec.

UI tests often run against mocked API responses. When the backend changes, those mocks keep
passing while the real app breaks. specdrift is meant to catch that, and to show which documented
endpoints the UI suite never touches.

## Status

**Stage 2 of 4: smallest useful version (output format waiting for approval).**

Stage 1 found that Redocly CLI's experimental `drift` command, fed a HAR from Playwright, already
catches stale mocks and reports coverage. So specdrift is now a thin Playwright add-on that uses
it: one HAR per test, mocked vs live labels, results per test. See
[docs/decisions.md](docs/decisions.md).

| Stage | What | State |
|---|---|---|
| 1 | Try the nearest existing tools on a sample app and record what they do and don't do | Done |
| 2 | Smallest useful version: a Playwright fixture plus a CLI that runs Redocly `drift` per test and prints drift and coverage | Prototype works; output format to approve |
| 3 | Publish: npm package, GitHub Action, demo repo with CI, README and walkthrough | Blocked on stage 2 |
| 4 | Add to the portfolio site | Blocked on stage 3 (the repo itself went public early, on 2026-10-12) |

### Stage 1 checklist

- [x] Build or pick a small sample app with an OpenAPI spec and a few Playwright UI tests that mock the API
- [x] Run `pw-radar` on it; record what it reports for UI tests, mocks and HAR files
- [x] Run `@tracecov/playwright` on it; record the same, and what its licence allows
- [x] Try `openapi-mock-validator` on the mocks
- [x] Check whether Redocly CLI has a `drift` command that reads HAR (the research notes disagree)
- [x] Confirm that `route.fulfill` mock bodies can be captured from a Playwright reporter or fixture
- [x] Write the result in `docs/decisions.md`: go, change scope, or switch project

## Background

Existing tools cover parts of this: Redocly CLI `drift`, `pw-radar`, `@tracecov/playwright` and
`openapi-mock-validator`. What each one did on the sample app is in
[docs/decisions.md](docs/decisions.md); the wider survey is in
[docs/research/prior_art_check.md](docs/research/prior_art_check.md) and
[docs/research/tool_landscape_gaps.md](docs/research/tool_landscape_gaps.md).

To try the prototype, see [spike/README.md](spike/README.md).

## Licence

[MIT](LICENSE)
