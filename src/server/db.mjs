import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const validate = book => {
  if (!book || typeof book !== 'object' || Array.isArray(book)) throw new Error('도서 정보가 올바르지 않습니다.')
  if (typeof book.title !== 'string' || !book.title.trim()) throw new Error('책 제목은 필수입니다.')
  if (typeof book.author !== 'string' || !book.author.trim()) throw new Error('저자는 필수입니다.')
  return { ...book, title: book.title.trim(), author: book.author.trim() }
}

const invalid = message => { const error = new Error(message); error.status = 400; return error }

const validateReadingLog = (raw, findBook) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw invalid('일일 독서 기록이 올바르지 않습니다.')
  const bookId = Number(raw.bookId)
  const book = Number.isSafeInteger(bookId) && bookId > 0 ? findBook(bookId) : null
  if (!book) throw invalid('도서를 찾을 수 없습니다.')
  if (book.status !== '읽는 중') throw invalid('읽는 중인 도서만 일일 기록을 작성할 수 있습니다.')
  if (typeof raw.readDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(raw.readDate)) throw invalid('읽은 날짜는 필수입니다.')
  const pagesRead = Number(raw.pagesRead)
  const minutesRead = Number(raw.minutesRead)
  if (!Number.isSafeInteger(pagesRead) || pagesRead < 1) throw invalid('읽은 페이지 수는 1 이상의 정수여야 합니다.')
  if (!Number.isSafeInteger(minutesRead) || minutesRead < 0) throw invalid('읽은 시간은 0 이상의 분 단위 정수여야 합니다.')
  return {
    bookId, readDate:raw.readDate, pagesRead, minutesRead,
    summary:String(raw.summary || '').slice(0, 2000),
    thoughts:String(raw.thoughts || '').slice(0, 2000),
    tags:Array.isArray(raw.tags) ? raw.tags.map(value => String(value).trim()).filter(Boolean).slice(0, 30) : [],
    memo:String(raw.memo || '').slice(0, 500),
    createdAt:typeof raw.createdAt === 'string' && raw.createdAt ? raw.createdAt : new Date().toISOString(),
  }
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
    CREATE TABLE IF NOT EXISTS reading_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      read_date TEXT NOT NULL,
      pages_read INTEGER NOT NULL CHECK (pages_read > 0),
      minutes_read INTEGER NOT NULL DEFAULT 0 CHECK (minutes_read >= 0),
      payload TEXT NOT NULL CHECK (json_valid(payload)),
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS reading_logs_date_idx ON reading_logs(read_date DESC, id DESC);
    CREATE INDEX IF NOT EXISTS reading_logs_book_idx ON reading_logs(book_id);
  `)

  const selectAll = db.prepare('SELECT id, payload FROM books ORDER BY registered_date DESC, id DESC')
  const selectOne = db.prepare('SELECT id, payload FROM books WHERE id = ?')
  const insert = db.prepare('INSERT INTO books (title, author, status, category, registered_date, payload) VALUES (?, ?, ?, ?, ?, ?)')
  const insertWithId = db.prepare('INSERT INTO books (id, title, author, status, category, registered_date, payload) VALUES (?, ?, ?, ?, ?, ?, ?)')
  const updateRow = db.prepare('UPDATE books SET title = ?, author = ?, status = ?, category = ?, registered_date = ?, payload = ? WHERE id = ?')
  const deleteRow = db.prepare('DELETE FROM books WHERE id = ?')
  const decode = row => row ? { ...JSON.parse(row.payload), id: Number(row.id) } : null
  const values = book => [book.title, book.author, String(book.status || ''), String(book.category || ''), String(book.registeredDate || ''), JSON.stringify(book)]
  const selectLogs = db.prepare(`SELECT reading_logs.id, reading_logs.payload, books.title AS book_title, books.author AS book_author
    FROM reading_logs JOIN books ON books.id = reading_logs.book_id
    ORDER BY reading_logs.read_date DESC, reading_logs.id DESC`)
  const selectLog = db.prepare(`SELECT reading_logs.id, reading_logs.payload, books.title AS book_title, books.author AS book_author
    FROM reading_logs JOIN books ON books.id = reading_logs.book_id WHERE reading_logs.id = ?`)
  const insertLog = db.prepare('INSERT INTO reading_logs (book_id, read_date, pages_read, minutes_read, payload, created_at) VALUES (?, ?, ?, ?, ?, ?)')
  const updateLog = db.prepare('UPDATE reading_logs SET book_id = ?, read_date = ?, pages_read = ?, minutes_read = ?, payload = ?, created_at = ? WHERE id = ?')
  const deleteLog = db.prepare('DELETE FROM reading_logs WHERE id = ?')
  const decodeLog = row => row ? { ...JSON.parse(row.payload), id:Number(row.id), bookTitle:row.book_title, bookAuthor:row.book_author } : null
  const logValues = log => [log.bookId, log.readDate, log.pagesRead, log.minutesRead, JSON.stringify(log), log.createdAt]

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
    listReadingLogs: () => selectLogs.all().map(decodeLog),
    getReadingLog: id => decodeLog(selectLog.get(id)),
    createReadingLog(raw) {
      const log = validateReadingLog(raw, id => decode(selectOne.get(id)))
      const result = insertLog.run(...logValues(log))
      return decodeLog(selectLog.get(Number(result.lastInsertRowid)))
    },
    updateReadingLog(id, raw) {
      if (!selectLog.get(id)) return null
      const log = validateReadingLog(raw, bookId => decode(selectOne.get(bookId)))
      updateLog.run(...logValues(log), id)
      return decodeLog(selectLog.get(id))
    },
    removeReadingLog: id => deleteLog.run(id).changes > 0,
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
