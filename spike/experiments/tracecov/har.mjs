// Feed TraceCov's core the HAR that Playwright recorded (it includes the mocked response)
// and print what it reports. Run: node experiments/tracecov/har.mjs
import { readFileSync } from 'node:fs'
import { CoverageMap, edition } from '@tracecov/core'

const here = (file) => new URL(file, import.meta.url).pathname
console.log('edition:', edition())
const map = CoverageMap.fromPath(here('../../openapi.json'))
try {
  map.recordFromHar(JSON.parse(readFileSync(here('../run.har'), 'utf8')))
  console.log(map.generateTextReport())
  console.log('diagnostics:', JSON.stringify(map.diagnostics(), null, 2))
} catch (error) {
  console.log('recordFromHar threw:', error.message)
}

// The same mocked response, recorded one call at a time (the free path).
const map2 = CoverageMap.fromPath(here('../../openapi.json'))
map2.record(
  { method: 'GET', url: 'http://localhost:3100/api/users' },
  { statusCode: 200, headers: { 'content-type': 'application/json' }, body: Buffer.from('[{"id":1,"name":"Ada Lovelace"}]') },
)
console.log(map2.generateTextReport())
console.log('diagnostics:', JSON.stringify(map2.diagnostics(), null, 2))
