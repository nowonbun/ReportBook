import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('화면은 localStorage가 아닌 SQLite API에서 읽고, 새 기록을 API로 저장한다', async () => {
  const listeners = {}
  const root = { innerHTML:'', addEventListener:(name, callback) => { listeners[name] = callback }, querySelector:() => null }
  const calls = []
  globalThis.document = { getElementById:() => root, createElement:() => ({ click() {} }) }
  globalThis.localStorage = { getItem:key => key === 'reportbook-books' ? JSON.stringify([{ id:99, title:'옛 브라우저 데이터', author:'이전 저자' }]) : null, setItem() {} }
  globalThis.location = { hash:'' }
  globalThis.window = { scrollTo() {}, addEventListener:(name, callback) => { listeners[name] = callback } }
  globalThis.fetch = async (url, options = {}) => {
    calls.push([url, options.method || 'GET'])
    if (options.method === 'POST') return { ok:true, json:async () => ({ ...JSON.parse(options.body), id:2 }) }
    return { ok:true, json:async () => [{ id:1, title:'서버 도서', author:'서버 저자', status:'완독', category:'소설', registeredDate:'2025-09-20', tags:[], links:[], rating:0, memo:'' }] }
  }
  await import(`../dist/app.js?test=${Date.now()}`)
  await new Promise(resolve => setTimeout(resolve, 0))
  assert.deepEqual(calls[0], ['/api/books', 'GET'])
  assert.match(root.innerHTML, /서버 도서/)
  assert.doesNotMatch(root.innerHTML, /옛 브라우저 데이터/)

  const action = (name, extra = {}) => { const target = { dataset:{ action:name, ...extra } }; listeners.click({ target:{ closest:() => target } }) }
  action('new')
  assert.match(root.innerHTML, /<span class="field-label">책 제목 <b aria-hidden="true">\*<\/b><\/span>/)
  assert.match(root.innerHTML, /<span class="field-label">카테고리 <b aria-hidden="true">\*<\/b><\/span>/)
  listeners.input({ target:{ dataset:{ field:'title' }, value:'새 기록' } })
  listeners.input({ target:{ dataset:{ field:'author' }, value:'새 저자' } })
  await listeners.submit({ target:{ id:'book-form' }, preventDefault() {} })
  assert.ok(calls.some(([url, method]) => url === '/api/books' && method === 'POST'))
})

test('도서가 없으면 대시보드와 목록에 예시 수치를 표시하지 않는다', async () => {
  const listeners = {}
  const root = { innerHTML:'', addEventListener:(name, callback) => { listeners[name] = callback }, querySelector:() => null }
  globalThis.document = { getElementById:() => root, createElement:() => ({ click() {} }) }
  globalThis.localStorage = { getItem:() => null, setItem() {} }
  globalThis.location = { hash:'' }
  globalThis.window = { scrollTo() {}, addEventListener:(name, callback) => { listeners[name] = callback } }
  globalThis.fetch = async () => ({ ok:true, json:async () => [] })
  await import(`../dist/app.js?empty=${Date.now()}`)
  await new Promise(resolve => setTimeout(resolve, 0))
  assert.match(root.innerHTML, /총 0권/)
  assert.doesNotMatch(root.innerHTML, /5시간 30분|연간 20권|2025년/)
  location.hash = '#books'
  listeners.hashchange()
  assert.match(root.innerHTML, /등록된 도서가 없습니다/)
})

test('도서 목록의 작업 메뉴는 테이블 영역 밖에서도 표시된다', async () => {
  const source = await readFile(new URL('../client/app.ts', import.meta.url), 'utf8')
  const styles = await readFile(new URL('../client/styles.css', import.meta.url), 'utf8')

  assert.match(source, /actionMenuPosition/)
  assert.match(source, /getBoundingClientRect/)
  assert.match(styles, /\.action-menu\s*\{\s*position:fixed;/)
})
