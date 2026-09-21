import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize, sep } from 'node:path'

const root = join(import.meta.dirname, '..', 'dist')
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.png':'image/png' }
const json = (response, status, data) => {
  response.writeHead(status, { 'content-type':'application/json; charset=utf-8', 'cache-control':'no-store' })
  response.end(JSON.stringify(data))
}
const body = async request => {
  let text = ''
  for await (const chunk of request) {
    text += chunk.toString()
    if (text.length > 3_000_000) { const error = new Error('요청 크기가 너무 큽니다.'); error.status = 413; throw error }
  }
  try {
    const result = JSON.parse(text)
    if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error()
    return result
  } catch { const error = new Error('JSON 형식이 올바르지 않습니다.'); error.status = 400; throw error }
}

export function createApp(store) {
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url || '/', 'http://localhost')
      const path = url.pathname
      if (path === '/api/health' && request.method === 'GET') { json(response, 200, { ok:true, books:store.count() }); return }
      if (path === '/api/books' && request.method === 'GET') { json(response, 200, store.list()); return }
      if (path === '/api/books' && request.method === 'POST') { json(response, 201, store.create(await body(request))); return }
      if (path === '/api/reading-logs' && request.method === 'GET') { json(response, 200, store.listReadingLogs()); return }
      if (path === '/api/reading-logs' && request.method === 'POST') { json(response, 201, store.createReadingLog(await body(request))); return }
      const logMatch = /^\/api\/reading-logs\/([1-9]\d*)$/.exec(path)
      if (logMatch) {
        const id = Number(logMatch[1])
        if (request.method === 'GET') { const log = store.getReadingLog(id); log ? json(response, 200, log) : json(response, 404, { error:'일일 독서 기록을 찾을 수 없습니다.' }); return }
        if (request.method === 'PUT') { const log = store.updateReadingLog(id, await body(request)); log ? json(response, 200, log) : json(response, 404, { error:'일일 독서 기록을 찾을 수 없습니다.' }); return }
        if (request.method === 'DELETE') { if (store.removeReadingLog(id)) { response.writeHead(204); response.end() } else json(response, 404, { error:'일일 독서 기록을 찾을 수 없습니다.' }); return }
      }
      const match = /^\/api\/books\/([1-9]\d*)$/.exec(path)
      if (match) {
        const id = Number(match[1])
        if (request.method === 'GET') { const book = store.get(id); book ? json(response, 200, book) : json(response, 404, { error:'도서를 찾을 수 없습니다.' }); return }
        if (request.method === 'PUT') { const book = store.update(id, await body(request)); book ? json(response, 200, book) : json(response, 404, { error:'도서를 찾을 수 없습니다.' }); return }
        if (request.method === 'DELETE') { if (store.remove(id)) { response.writeHead(204); response.end() } else json(response, 404, { error:'도서를 찾을 수 없습니다.' }); return }
      }
      if (path.startsWith('/api/')) { json(response, 404, { error:'API 경로를 찾을 수 없습니다.' }); return }
      if (request.method !== 'GET' && request.method !== 'HEAD') { response.writeHead(405); response.end(); return }
      const file = normalize(join(root, decodeURIComponent(path === '/' ? '/index.html' : path)))
      if (!file.startsWith(root + sep)) { response.writeHead(403); response.end(); return }
      try {
        const content = await readFile(file)
        response.writeHead(200, { 'content-type':mime[extname(file)] || 'application/octet-stream' })
        response.end(request.method === 'HEAD' ? undefined : content)
      } catch { response.writeHead(404); response.end('Not found') }
    } catch (error) {
      const status = error.status || (error.message?.includes('필수') ? 400 : 500)
      json(response, status, { error:status === 500 ? '서버 오류가 발생했습니다.' : error.message })
      if (status === 500) console.error(error)
    }
  })
}
