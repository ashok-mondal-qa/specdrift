// Prototype of the add-on's check step: for each test's HAR, keep only JSON API calls,
// run Redocly's drift on it, and print the result grouped by test, marked mocked or live.
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync, writeFileSync, mkdtempSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { createRequire } from 'node:module'

const [dir = 'specdrift-results', spec = 'openapi.json'] = process.argv.slice(2)
const tmp = mkdtempSync(join(tmpdir(), 'specdrift-'))
// Run Redocly's script with node itself: spawning `npx` fails on Windows, where it is npx.cmd.
const redocly = join(createRequire(import.meta.url).resolve('@redocly/cli/package.json'), '..', 'bin', 'cli.js')
let failed = 0

for (const file of readdirSync(dir).filter((f) => f.endsWith('.har'))) {
  const har = JSON.parse(readFileSync(join(dir, file), 'utf8'))
  har.log.entries = har.log.entries.filter((e) => e.response.content.mimeType?.includes('json'))
  const filtered = join(tmp, file)
  writeFileSync(filtered, JSON.stringify(har))

  let report
  try {
    report = execFileSync(process.execPath, [redocly, 'drift', filtered, '--api', spec, '--match-mode', 'basepath', '--format', 'json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  } catch (error) {
    if (!error.stdout) throw error // redocly did not run at all
    report = error.stdout // redocly exits 1 when it finds drift
  }
  const { problems } = JSON.parse(report)

  console.log(`\n${file.replace(/\.har$/, '').replaceAll('_', ' ')}`)
  har.log.entries.forEach((entry, i) => {
    const source = entry._wasFulfilled ? 'mocked' : 'live'
    const found = problems.filter((p) => p.exchangeIndex === i)
    const url = new URL(entry.request.url).pathname
    console.log(`  ${found.length ? '✗' : '✓'} ${entry.request.method} ${url} (${source})`)
    for (const p of found) console.log(`      ${p.message}`)
    if (found.length) failed++
  })
}
process.exit(failed ? 1 : 0)
