import test from 'node:test'
import assert from 'node:assert/strict'
import { once } from 'node:events'
import { createBookStore } from '../server/db.mjs'
import { createApp } from '../server/app-server.mjs'

const sample = { title: 'API 도서', author: 'API 저자', status: '읽는 중', category: '과학', registeredDate: '2025-09-20', tags: [] }

test('도서 API가 조회·생성·수정·삭제하고 SQLite에 반영한다', async () => {
  const store = createBookStore(':memory:', [])
  const server = createApp(store)
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const base = `http://127.0.0.1:${server.address().port}`
  try {
    let response = await fetch(`${base}/api/books`)
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), [])

    response = await fetch(`${base}/api/books`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(sample) })
    assert.equal(response.status, 201)
    const created = await response.json()
    assert.ok(created.id > 0)
    assert.equal(store.get(created.id)?.title, sample.title)

    response = await fetch(`${base}/api/books/${created.id}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...sample, title: '수정됨' }) })
    assert.equal(response.status, 200)
    assert.equal((await response.json()).title, '수정됨')

    response = await fetch(`${base}/api/books/${created.id}`, { method: 'DELETE' })
    assert.equal(response.status, 204)
    assert.equal(store.list().length, 0)
  } finally { server.close(); store.close() }
})

test('잘못된 입력은 400, 없는 도서는 404를 반환한다', async () => {
  const store = createBookStore(':memory:', [])
  const server = createApp(store)
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const base = `http://127.0.0.1:${server.address().port}`
  try {
    const invalid = await fetch(`${base}/api/books`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...sample, title: '' }) })
    assert.equal(invalid.status, 400)
    const missing = await fetch(`${base}/api/books/9999`)
    assert.equal(missing.status, 404)
  } finally { server.close(); store.close() }
})

test('일일 독서 세부 기록 API가 조회·생성·수정·삭제한다', async () => {
  const store = createBookStore(':memory:', [{ ...sample, title:'읽는 책' }])
  const bookId = store.list()[0].id
  const server = createApp(store)
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const base = `http://127.0.0.1:${server.address().port}`
  const payload = { bookId, readDate:'2026-09-21', pagesRead:25, minutesRead:50, summary:'요약', thoughts:'감상', tags:['일일'], memo:'메모' }
  try {
    let response = await fetch(`${base}/api/reading-logs`, { method:'POST', headers:{ 'content-type':'application/json' }, body:JSON.stringify(payload) })
    assert.equal(response.status, 201)
    const created = await response.json()
    assert.equal(created.bookTitle, '읽는 책')

    response = await fetch(`${base}/api/reading-logs`)
    assert.equal((await response.json()).length, 1)

    response = await fetch(`${base}/api/reading-logs/${created.id}`, { method:'PUT', headers:{ 'content-type':'application/json' }, body:JSON.stringify({ ...payload, pagesRead:30 }) })
    assert.equal((await response.json()).pagesRead, 30)

    response = await fetch(`${base}/api/reading-logs`, { method:'POST', headers:{ 'content-type':'application/json' }, body:JSON.stringify({ ...payload, pagesRead:0 }) })
    assert.equal(response.status, 400)

    response = await fetch(`${base}/api/reading-logs/${created.id}`, { method:'DELETE' })
    assert.equal(response.status, 204)
  } finally { server.close(); store.close() }
})
