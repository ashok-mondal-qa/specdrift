// Check the same stale mocks with openapi-mock-validator.
// Run: node experiments/mock-validator/validate.mjs
import { readFileSync } from 'node:fs'
import { OpenAPIMockValidator } from 'openapi-mock-validator'

const spec = JSON.parse(readFileSync(new URL('../../openapi.json', import.meta.url), 'utf8'))
const validator = new OpenAPIMockValidator(spec)
await validator.init()

const mocks = [
  { url: '/api/users', body: [{ id: 1, name: 'Ada Lovelace' }] },
  { url: '/api/users/2', body: { id: '2' } },
  { url: '/api/users/2', body: { id: 2, fullName: 'Alan Turing', email: 'alan@example.test' } },
]

for (const mock of mocks) {
  // The spec's `servers: [{ url: '/api' }]` is not applied, so the URL as the browser sent it
  // matches nothing. Strip the prefix by hand to get past that.
  const asSent = validator.matchPath(mock.url, 'GET')
  const match = asSent ?? validator.matchPath(mock.url.replace(/^\/api/, ''), 'GET')
  console.log(`GET ${mock.url} -> as sent: ${asSent ? asSent.path : 'no match'}, prefix stripped: ${match ? match.path : 'no match'}`)
  if (!match) continue
  const result = validator.validateResponse(match.path, 'GET', 200, mock.body)
  console.log(JSON.stringify(result, null, 2))
}
