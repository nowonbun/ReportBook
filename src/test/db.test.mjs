import test from 'node:test'
import assert from 'node:assert/strict'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { unlink } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { createBookStore } from '../server/db.mjs'

const sample = { title: '테스트 도서', author: '테스트 저자', status: '완독', category: '소설', registeredDate: '2025-09-20', tags: [] }

test('SQLite 파일에 도서를 저장하고 재연결 후에도 보존한다', async () => {
  const file = join(tmpdir(), `reportbook-test-${randomUUID()}.sqlite`)
  const first = createBookStore(file, [])
  const created = first.create(sample)
  assert.ok(created.id > 0)
  first.close()
  const second = createBookStore(file, [])
  assert.equal(second.get(created.id)?.title, sample.title)
  second.close()
  await unlink(file)
})

test('초기 데이터는 첫 생성 때 한 번만 들어가고, 수정·삭제가 동작한다', () => {
  const store = createBookStore(':memory:', [sample])
  assert.equal(store.list().length, 1)
  const id = store.list()[0].id
  const changed = store.update(id, { ...sample, title: '수정한 도서' })
  assert.equal(changed?.title, '수정한 도서')
  assert.equal(store.get(id)?.title, '수정한 도서')
  assert.equal(store.remove(id), true)
  assert.equal(store.get(id), null)
  assert.equal(store.list().length, 0)
  store.close()
})

test('제목과 저자가 없으면 저장하지 않는다', () => {
  const store = createBookStore(':memory:', [])
  assert.throws(() => store.create({ ...sample, title: ' ' }), /제목/)
  assert.throws(() => store.create({ ...sample, author: '' }), /저자/)
  store.close()
})

test('초기 데이터 복원 중 오류가 나면 기존 도서를 보존한다', () => {
  const store = createBookStore(':memory:', [sample])
  assert.throws(() => store.reset([{ ...sample, title:'' }]), /제목/)
  assert.equal(store.list().length, 1)
  assert.equal(store.list()[0].title, sample.title)
  store.close()
})

test('새 빈 DB에서 사용자가 처음 추가한 도서는 ID 1로 저장된다', () => {
  const store = createBookStore(':memory:', [])
  const mine = store.create({ ...sample, title:'첫 기록' })
  assert.equal(mine.id, 1)
  assert.equal(store.list()[0].title, '첫 기록')
  store.close()
})
