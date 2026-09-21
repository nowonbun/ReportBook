import { join } from 'node:path'
import { createBookStore } from './db.mjs'
import { createApp } from './app-server.mjs'

const file = process.env.REPORTBOOK_DB_PATH || join(import.meta.dirname, '..', 'data', 'reportbook.sqlite')
const host = process.env.HOST || '127.0.0.1'
const port = Number(process.env.PORT || 5173)
const store = createBookStore(file, [])
const server = createApp(store)
server.listen(port, host, () => console.log(`ReportBook: http://${host}:${port} (SQLite: ${file})`))
const shutdown = () => server.close(() => { store.close(); process.exit(0) })
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
