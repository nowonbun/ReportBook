import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const validate = book => {
  if (!book || typeof book !== 'object' || Array.isArray(book)) throw new Error('도서 정보가 올바르지 않습니다.')
  if (typeof book.title !== 'string' || !book.title.trim()) throw new Error('책 제목은 필수입니다.')
  if (typeof book.author !== 'string' || !book.author.trim()) throw new Error('저자는 필수입니다.')
  return { ...book, title: book.title.trim(), author: book.author.trim() }
}

export function createBookStore(file, seedBooks = []) {
  if (file !== ':memory:') mkdirSync(dirname(resolve(file)), { recursive: true })
  const db = new DatabaseSync(file)
  db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT '',
      registered_date TEXT NOT NULL DEFAULT '',
      payload TEXT NOT NULL CHECK (json_valid(payload))
    );
    CREATE INDEX IF NOT EXISTS books_registered_idx ON books(registered_date DESC, id DESC);
    CREATE INDEX IF NOT EXISTS books_status_idx ON books(status);
    CREATE INDEX IF NOT EXISTS books_category_idx ON books(category);
  `)

  const selectAll = db.prepare('SELECT id, payload FROM books ORDER BY registered_date DESC, id DESC')
  const selectOne = db.prepare('SELECT id, payload FROM books WHERE id = ?')
  const insert = db.prepare('INSERT INTO books (title, author, status, category, registered_date, payload) VALUES (?, ?, ?, ?, ?, ?)')
  const insertWithId = db.prepare('INSERT INTO books (id, title, author, status, category, registered_date, payload) VALUES (?, ?, ?, ?, ?, ?, ?)')
  const updateRow = db.prepare('UPDATE books SET title = ?, author = ?, status = ?, category = ?, registered_date = ?, payload = ? WHERE id = ?')
  const deleteRow = db.prepare('DELETE FROM books WHERE id = ?')
  const decode = row => row ? { ...JSON.parse(row.payload), id: Number(row.id) } : null
  const values = book => [book.title, book.author, String(book.status || ''), String(book.category || ''), String(book.registeredDate || ''), JSON.stringify(book)]

  const seedRows = items => {
    for (const raw of items) {
      const book = validate(raw)
      if (Number.isSafeInteger(book.id) && book.id > 0) insertWithId.run(book.id, ...values(book))
      else insert.run(...values(book))
    }
  }

  if (!db.prepare("SELECT value FROM app_meta WHERE key = 'seeded'").get()) {
    db.exec('BEGIN')
    try {
      seedRows(seedBooks)
      db.prepare("INSERT INTO app_meta (key, value) VALUES ('seeded', '1')").run()
      db.exec('COMMIT')
    } catch (error) { db.exec('ROLLBACK'); throw error }
  }

  return {
    list: () => selectAll.all().map(decode),
    get: id => decode(selectOne.get(id)),
    create(raw) {
      const book = validate(raw)
      const { id: _ignored, ...withoutId } = book
      const result = insert.run(...values(withoutId))
      return decode(selectOne.get(Number(result.lastInsertRowid)))
    },
    update(id, raw) {
      if (!selectOne.get(id)) return null
      const book = validate(raw)
      updateRow.run(...values({ ...book, id }), id)
      return decode(selectOne.get(id))
    },
    remove: id => deleteRow.run(id).changes > 0,
    reset(items) {
      db.exec('BEGIN')
      try { db.prepare('DELETE FROM books').run(); seedRows(items); db.exec('COMMIT') }
      catch (error) { db.exec('ROLLBACK'); throw error }
      return selectAll.all().map(decode)
    },
    count: () => Number(db.prepare('SELECT count(*) AS count FROM books').get().count),
    close: () => db.close(),
  }
}
