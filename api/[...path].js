import { readFileSync } from 'fs'
import { join } from 'path'
import jsonServer from 'json-server'

const db = JSON.parse(readFileSync(join(process.cwd(), 'db.json'), 'utf-8'))

const server = jsonServer.create()

server.use((req, _res, next) => {
  if (req.url?.startsWith('/api')) {
    req.url = req.url.slice(4) || '/'
  }
  if (req.url && req.url.length > 1 && req.url.endsWith('/')) {
    req.url = req.url.slice(0, -1)
  }
  next()
})

server.use(jsonServer.defaults())
server.use(jsonServer.router(db))

export default server
