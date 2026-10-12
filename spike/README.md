# Stage 1 spike: does an existing tool already do this?

A throwaway test bench, not the product. It holds a tiny app, an API spec, two Playwright
tests and one small experiment per existing tool. The result is written up in
[docs/decisions.md](../docs/decisions.md).

## The setup in plain words

- `app/` is a two-file web app. Its backend sends users with a `fullName` field.
- `openapi.json` is the API spec. It agrees with the backend.
- `tests/users-mocked.spec.ts` fakes the backend with an **old** response that still uses `name`.
  It passes. This is the problem specdrift is about: the fake answer has drifted from the spec,
  and nothing notices.
- `tests/users-live.spec.ts` runs the same page against the real backend. It also passes, while
  the page shows "undefined" for every name.

## The experiments

| Command | Question it answers |
| --- | --- |
| `npm run try:capture` | Can a test see the body of a response that `page.route` faked, and does Playwright's HAR recording keep it? |
| `npm run try:pw-radar` | Does pw-radar notice the stale mock in a UI test? |
| `npm run try:tracecov` | Does TraceCov see UI-test traffic at all, and can the free edition read a HAR? |
| `npm run try:mock-validator` | Does openapi-mock-validator catch the stale mock if it is handed the body? |
| `npm run try:redocly` | Does Redocly CLI have a `drift` command, and what does it say about the HAR? |
| `npm run try:addon` | Prototype of the chosen design: one HAR per test, Redocly as the engine, results per test marked mocked or live. |

## Run it

```bash
npm install
npx playwright install chromium
npm test                 # the two sample tests, both green
npm run try:redocly      # exits 1 because it finds the drift; that is the expected result
```

Versions tried on 2026-10-12: Playwright 1.56.1, pw-radar 0.2.2, @tracecov/playwright 0.25.3,
openapi-mock-validator 0.3.0, @redocly/cli 2.62.1.
