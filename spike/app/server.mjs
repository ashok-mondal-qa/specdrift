// A tiny "real backend" for the spike. It follows openapi.json:
// users have `fullName`, not `name` (the backend renamed the field).
import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'

const users = [
  { id: 1, fullName: 'Ada Lovelace', email: 'ada@example.test' },
  { id: 2, fullName: 'Alan Turing', email: 'alan@example.test' },
]
const page = readFileSync(new URL('./index.html', import.meta.url))

const json = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'application/json' })
  res.end(JSON.stringify(body))
}

createServer((req, res) => {
  const { pathname } = new URL(req.url, 'http://x')
  const match = pathname.match(/^\/api\/users\/(\d+)$/)

  if (pathname === '/') return res.writeHead(200, { 'content-type': 'text/html' }).end(page)
  if (pathname === '/api/users' && req.method === 'GET') return json(res, 200, users)
  if (match && req.method === 'GET') {
    const user = users.find((u) => u.id === Number(match[1]))
    return user ? json(res, 200, user) : json(res, 404, { message: 'Not found' })
  }
  json(res, 404, { message: 'Not found' })
}).listen(3100, () => console.log('sample app on http://localhost:3100'))
