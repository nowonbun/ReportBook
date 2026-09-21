import { categories, type Book, type BookStatus, type Page } from './data.js'

const root = document.getElementById('root')!
const pageNames: Record<Page, string> = {
  dashboard: '대시보드',
  books: '도서 목록',
  write: '독서 기록 작성',
  categories: '카테고리',
  search: '검색',
  stats: '통계',
  notes: '메모',
  settings: '설정',
}

const nav: [Page, string][] = [
  ['dashboard', 'home'],
  ['books', 'book'],
  ['write', 'pencil'],
  ['categories', 'folder'],
  ['search', 'search'],
  ['stats', 'stats'],
  ['notes', 'file'],
  ['settings', 'settings'],
]
const paths: Record<string, string> = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  book: '<path d="M12 6c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V5c-4-1-7-1-10 1Zm0 0v15"/>',
  pencil: '<path d="m4 20 4-.7L20 7.4 16.6 4 4.7 15.9 4 20ZM14.5 6l3.5 3.5"/>',
  folder: '<path d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v11H3z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
  stats: '<path d="M4 21v-6h3v6M10 21V9h3v12M16 21V4h3v17"/>',
  file: '<path d="M6 2h9l4 4v16H6zM14 2v5h5M9 12h7M9 16h7"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M10 2h4l.5 2.2 2 1.1 2.2-.7 2 3.4-1.7 1.5v2.3l1.7 1.5-2 3.4-2.2-.7-2 1.1L14 22h-4l-.5-2.2-2-1.1-2.2.7-2-3.4L5 14.5v-2.3L3.3 10.7l2-3.4 2.2.7 2-1.1z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 3"/>',
  right: '<path d="m9 5 7 7-7 7"/>',
  left: '<path d="m15 5-7 7 7 7"/>',
  grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
  list: '<path d="M8 5h13M8 12h13M8 19h13M3 5h1M3 12h1M3 19h1"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1"/><path d="m3 17 5-5 4 4 3-3 6 6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v2M12 21v2M1 12h2M21 12h2M4 4l2 2M18 18l2 2M4 20l2-2M18 6l2-2"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  star: '<path d="m12 2 3 6 7 .9-5 5 .9 7.1-5.9-3.2-5.9 3.2.9-7.1-5-5 7-.9z"/>',
  trash: '<path d="M4 6h16M8 6V4h8v2M6 6l1 15h10l1-15M10 10v7M14 10v7"/>',
  save: '<path d="M4 3h14l3 3v15H3V3zM7 3v6h10V3M7 21v-8h10v8"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  close: '<path d="M5 5l14 14M19 5 5 19"/>',
  link: '<path d="M10 13a5 5 0 0 0 7 .2l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7-.2l-3 3a5 5 0 0 0 7 7l2-2"/>',
}

const icon = (name: string, size = 20) => `
  <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" stroke-width="1.9" stroke-linecap="round"
       stroke-linejoin="round" aria-hidden="true">
    ${paths[name] || paths.book}
  </svg>
`

const escapeHtml = (value: unknown) => String(value ?? '').replace(
  /[&<>"']/g,
  character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]!,
)

const formatDate = (value: string) => (
  value ? `${value.replaceAll('-', '. ')}.` : '-'
)

const statusClass = (value: BookStatus) => {
  const classes: Record<BookStatus, string> = {
    완독: 'done',
    '읽는 중': 'reading',
    '읽고 싶음': 'wishlist',
    중단: 'stopped',
  }
  return classes[value]
}

const categoryClass = (value: string) => {
  const classes: Record<string, string> = {
    소설: 'novel',
    자기계발: 'growth',
    역사: 'history',
    인문: 'humanities',
    과학: 'science',
    IT: 'tech',
    에세이: 'essay',
  }
  return classes[value] || 'other'
}

const badge = (value: BookStatus) => `
  <span class="status-badge ${statusClass(value)}">
    <i></i>${escapeHtml(value)}
  </span>
`

const cover = (book: Book, className = '') => {
  if (book.cover) {
    return `
      <img class="book-cover ${className}" src="${escapeHtml(book.cover)}"
           alt="${escapeHtml(book.title)} 표지">
    `
  }

  return `
    <div class="book-cover cover-placeholder ${className}">
      ${icon('book', 25)}
      <span>${escapeHtml(book.title)}</span>
    </div>
  `
}

const stars = (value: number) => `
  <span class="stars">
    ${[1, 2, 3, 4, 5]
      .map(score => `<span style="color:${value >= score ? '#ef9314' : '#cdd3db'}">★</span>`)
      .join('')}
  </span>
`

const titleBlock = (
  name: string,
  subtitle: string,
  symbol: string,
  actions = '',
) => `
  <div class="page-heading">
    <div class="page-title">
      ${icon(symbol, 46)}
      <div>
        <h1>${name}</h1>
        <p>${subtitle}</p>
      </div>
    </div>
    ${actions}
  </div>
`
const today = () => new Date().toISOString().slice(0, 10)
const blank = (): Book => ({
  id: 0,
  title: '',
  author: '',
  publisher: '',
  category: '소설',
  subcategory: '',
  status: '완독',
  startDate: '',
  endDate: '',
  publishedDate: '',
  registeredDate: today(),
  pages: 0,
  hours: 0,
  rating: 0,
  summary: '',
  original: '',
  translation: '',
  thoughts: '',
  memo: '',
  tags: [],
  links: [],
  favoriteQuote: false,
  cover: '',
})

let books: Book[] = []
let page: Page = location.hash.slice(1) in pageNames
  ? location.hash.slice(1) as Page
  : 'dashboard'
let query = ''
let filter: BookStatus | '전체' = '전체'
let categoryFilter = '전체'
let sort = 'recent'
let view: 'list' | 'grid' = 'list'
let pageNumber = 1
let pageSize = 10
let selected: number[] = []
let editing: Book = blank()
let actionId: number | null = null
let actionMenuPosition: { left: number, top: number } | null = null
let menuOpen = false
let dark = false
let toast = ''
let tagInput = ''
let linkInput = ''

const api = async (path: string, method = 'GET', data?: unknown) => {
  const response = await fetch(path, {
    method,
    headers: data ? { 'content-type': 'application/json' } : undefined,
    body: data ? JSON.stringify(data) : undefined,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.status === 204 ? null : response.json()
}

const loadBooks = async () => {
  try {
    books = await api('/api/books')
    render()
  } catch {
    notice('서버에서 도서 목록을 불러오지 못했습니다.')
  }
}

const notice = (message: string) => {
  toast = message
  render()

  setTimeout(() => {
    if (toast === message) {
      toast = ''
      render()
    }
  }, 3500)
}

const counts = () => ({
  all: books.length,
  done: books.filter(book => book.status === '완독').length,
  reading: books.filter(book => book.status === '읽는 중').length,
  wishlist: books.filter(book => book.status === '읽고 싶음').length,
})

const categoryCounts = () => categories
  .map(name => ({
    name,
    count: books.filter(book => book.category === name).length,
  }))
  .filter(item => item.count)
  .sort((left, right) => right.count - left.count)

const filtered = () => {
  const searchTerm = query.trim().toLowerCase()

  return books
    .filter(book => {
      const matchesStatus = filter === '전체' || book.status === filter
      const matchesCategory = categoryFilter === '전체' || book.category === categoryFilter
      const matchesSearch = !searchTerm || [
        book.title,
        book.author,
        book.category,
        book.memo,
        ...book.tags,
      ].some(value => value.toLowerCase().includes(searchTerm))

      return matchesStatus && matchesCategory && matchesSearch
    })
    .sort((left, right) => {
      if (sort === 'title') return left.title.localeCompare(right.title, 'ko')
      if (sort === 'rating') return right.rating - left.rating
      return right.registeredDate.localeCompare(left.registeredDate)
    })
}

const navigate = (next: Page) => {
  page = next
  location.hash = next
  menuOpen = false
  actionId = null
  actionMenuPosition = null
  window.scrollTo(0, 0)
  render()
}

const openNew = () => {
  editing = blank()
  tagInput = ''
  linkInput = ''
  navigate('write')
}

const openEdit = (id: number) => {
  const book = books.find(candidate => candidate.id === id)
  if (!book) return

  editing = {
    ...book,
    tags: [...book.tags],
    links: [...book.links],
  }
  navigate('write')
}

function dashboard() {
  const c = counts(), cats = categoryCounts(), total = c.all || 1
  const year = new Date().getFullYear()
  const yearly = books.filter(book => book.status === '완독' && book.endDate?.startsWith(`${year}-`))
  const monthly = Array.from({ length: 12 }, (_, month) => yearly.filter(book => Number(book.endDate.slice(5, 7)) === month + 1).length)
  const maxMonth = Math.max(1, ...monthly)
  const hours = books.reduce((sum, book) => sum + (Number(book.hours) || 0), 0)
  return `<div class="dashboard-intro">
<div>
<h1>좋은 하루입니다! <span class="heading-emoji">📖</span>
</h1>
<p>지금까지의 독서 여정을 한눈에 확인해보세요.</p>
</div>
<div class="intro-quote">
<strong>「本は、まだ見ぬ世界への扉である。」</strong>
<span>“책은 아직 보지 못한 세계로 가는 문이다.”</span>
</div>
</div>
  <div class="metric-grid">
  <div class="metric-card">
<span class="metric-icon green">${icon('book', 33)}</span>
<div>
<span>총 등록 도서</span>
<strong>${c.all} <small>권</small>
</strong>
</div>
</div>
  <div class="metric-card">
<span class="metric-icon mint">${icon('check', 34)}</span>
<div>
<span>완독한 책</span>
<strong>${c.done} <small>권</small>
</strong>
</div>
<em>(${(c.done / total * 100).toFixed(1)}%)</em>
</div>
  <div class="metric-card">
<span class="metric-icon coral">${icon('book', 33)}</span>
<div>
<span>읽는 중인 책</span>
<strong>${c.reading} <small>권</small>
</strong>
</div>
</div>
  <div class="metric-card">
<span class="metric-icon amber">${icon('clock', 33)}</span>
<div>
<span>올해 읽은 책</span>
<strong>${yearly.length} <small>권</small>
</strong>
</div>
<em>(${year}년)</em>
</div>
</div>
  <div class="dashboard-charts">
<section class="panel reading-panel">
<h2>독서 현황</h2>
<div class="reading-chart">
<div class="donut" style="background:conic-gradient(#294a3d 0 ${c.done / total * 100}%,#8bb39c 0 ${(c.done + c.reading) / total * 100}%,#d7d9db 0)">
<div>총 ${c.all}권</div>
</div>
<div class="chart-legend">
<div>
<i class="legend-swatch dark-green">
</i>완독 <span>${c.done} (${(c.done / total * 100).toFixed(1)}%)</span>
</div>
<div>
<i class="legend-swatch light-green">
</i>읽는 중 <span>${c.reading} (${(c.reading / total * 100).toFixed(1)}%)</span>
</div>
<div>
<i class="legend-swatch gray">
</i>읽고 싶음 <span>${c.wishlist} (${(c.wishlist / total * 100).toFixed(1)}%)</span>
</div>
</div>
</div>
</section>
  <section class="panel monthly-panel">
<h2>월별 독서 수 <span>(${year}년)</span>
</h2>
<div class="bar-chart">
<div class="y-axis">
<span>${maxMonth}</span>
<span>${Math.ceil(maxMonth * .75)}</span>
<span>${Math.ceil(maxMonth * .5)}</span>
<span>${Math.ceil(maxMonth * .25)}</span>
<span>0</span>
</div>
<div class="bar-grid">${monthly.map((value, index) => `<div class="bar-column">
<span class="bar" style="height:${value / maxMonth * 100}%" title="${index + 1}월 ${value}권">
</span>
<small>${index + 1}월</small>
</div>`).join('')}</div>
</div>
</section>
  <section class="panel category-panel">
<div class="panel-heading">
<h2>카테고리 분포</h2>
<button class="text-link" data-action="nav" data-page="categories">전체보기 ${icon('right', 17)}</button>
</div>${cats.length ? `<div class="category-bars">${cats.slice(0, 6).map(item => `<button class="category-bar-row" data-action="category" data-category="${escapeHtml(item.name)}">
<span>${item.name}</span>
<i class="category-bar ${categoryClass(item.name)}" style="width:${Math.max(15, item.count / (cats[0]?.count || 1) * 100)}%">
</i>
<small>${item.count}</small>
</button>`).join('')}</div>` : '<div class="empty-state compact">등록된 도서가 없습니다.</div>'}</section>
</div>
  <section class="panel recent-panel">
<div class="panel-heading">
<h2>최근 읽은 책</h2>
<button class="text-link" data-action="nav" data-page="books">더보기 ${icon('right', 17)}</button>
</div>${books.length ? `<div class="recent-grid">${books.slice(0, 5).map(book => `<button class="recent-book" data-action="edit" data-id="${book.id}">${cover(book)}<div>
<strong>${escapeHtml(book.title)}</strong>
<span>${escapeHtml(book.author)}</span>
<small>${formatDate(book.endDate || book.startDate)}</small>${badge(book.status)}</div>
</button>`).join('')}</div>` : '<div class="empty-state compact">아직 등록한 책이 없습니다.</div>'}</section>
  <div class="bottom-widgets">
<section class="panel weekly-panel">
<h2>기록된 독서 시간</h2>
<div class="weekly-body">${icon('clock', 29)}<strong>${hours}시간</strong>
</div>
<p>도서별로 입력한 읽은 시간의 합계입니다.</p>
</section>
<section class="panel goal-panel">
<h2>독서 목표</h2>
<div>${icon('target', 30)}<strong>설정된 목표가 없습니다.</strong>
</div>
<p>목표 기능은 아직 제공하지 않습니다.</p>
</section>
<section class="panel quote-panel">
<span>❝</span>
<p>책을 읽는다는 것은<br>자신의 가능성을 조금씩 넓혀가는 일이다.</p>
<small>- 무라카미 하루키 -</small>
</section>
</div>`
}

function catalog() {
  const c = counts()
  const result = filtered()
  const max = Math.max(1, Math.ceil(result.length / pageSize))

  pageNumber = Math.min(pageNumber, max)

  const visible = result.slice((pageNumber - 1) * pageSize, pageNumber * pageSize)

  const heading = titleBlock(
    page === 'search' ? '도서 검색' : '도서 목록',
    page === 'search'
      ? '읽고 싶은 책을 찾아보세요.'
      : '지금까지 읽은 책과 읽고 싶은 책을 관리하세요.',
    'book',
    `<button class="primary-button" data-action="new">
      ${icon('plus', 20)} 새 도서 등록
    </button>`,
  )

  const actionMenu = (book: Book) => {
    if (actionId !== book.id || !actionMenuPosition) return ''

    return `<div
      class="action-menu"
      style="left:${actionMenuPosition.left}px; top:${actionMenuPosition.top}px"
    >
      <button data-action="edit" data-id="${book.id}">${icon('pencil', 15)} 편집</button>
      <button data-action="delete" data-id="${book.id}">${icon('trash', 15)} 삭제</button>
    </div>`
  }

  return `${heading}
  <div class="catalog-controls">
<div class="tabs">${([['전체', c.all], ['완독', c.done], ['읽는 중', c.reading], ['읽고 싶음', c.wishlist]] as const).map(([name, count]) => `<button data-action="filter" data-filter="${name}" class="${filter === name ? 'active' : ''}">${name} (${count})</button>`).join('')}</div>
<div class="controls-right">
<label class="select-wrap">${icon('stats', 16)}<select id="sort">
<option value="recent" ${sort === 'recent' ? 'selected' : ''}>최근 등록순</option>
<option value="title" ${sort === 'title' ? 'selected' : ''}>제목순</option>
<option value="rating" ${sort === 'rating' ? 'selected' : ''}>평점순</option>
</select>⌄</label>
<button class="view-button ${view === 'list' ? 'active' : ''}" data-action="view" data-view="list">${icon('list', 18)} 리스트</button>
<button class="view-button ${view === 'grid' ? 'active' : ''}" data-action="view" data-view="grid">${icon('grid', 18)} 그리드</button>
</div>
</div>
  ${categoryFilter !== '전체' || query ? `<div class="active-filters">${categoryFilter !== '전체' ? `<button data-action="clear-category">${escapeHtml(categoryFilter)} ×</button>` : ''}${query ? `<button data-action="clear-query">“${escapeHtml(query)}” ×</button>` : ''}</div>` : ''}
  ${selected.length ? `<div class="selection-toolbar">
<span>${selected.length}권 선택됨</span>
<button data-action="delete-selected">${icon('trash', 16)} 선택 삭제</button>
<button data-action="clear-selection">선택 해제</button>
</div>` : ''}
  ${view === 'list' ? `<div class="table-shell">
<table class="book-table">
<thead>
<tr>
<th>
<input type="checkbox" id="select-all" ${visible.length && visible.every(book => selected.includes(book.id)) ? 'checked' : ''} aria-label="현재 페이지 전체 선택">
</th>
<th>표지</th>
<th>제목 / 저자</th>
<th>상태</th>
<th>카테고리</th>
<th>읽은 기간</th>
<th>평점</th>
<th>메모</th>
<th>등록일</th>
<th>작업</th>
</tr>
</thead>
<tbody>${visible.map(book => `<tr>
<td>
<input type="checkbox" class="book-select" data-id="${book.id}" ${selected.includes(book.id) ? 'checked' : ''} aria-label="${escapeHtml(book.title)} 선택">
</td>
<td>${cover(book, 'table-cover')}</td>
<td>
<button class="book-title-button" data-action="edit" data-id="${book.id}">
<strong>${escapeHtml(book.title)}</strong>
<span>${escapeHtml(book.author)}</span>
</button>
</td>
<td>${badge(book.status)}</td>
<td>
<span class="category-pill ${categoryClass(book.category)}">${escapeHtml(book.category)}</span>
</td>
<td class="date-cell">${book.startDate ? `${formatDate(book.startDate)}<br>${book.endDate ? '~ ' + formatDate(book.endDate) : '~'}` : '-'}</td>
<td>${book.rating ? `<div class="rating-cell">${stars(book.rating)}<span>${book.rating.toFixed(1)}</span>
</div>` : '-'}</td>
<td class="memo-cell">${escapeHtml(book.memo || '-')}</td>
<td class="date-cell">${formatDate(book.registeredDate)}</td>
<td class="actions-cell">
<button class="dots-button" data-action="actions" data-id="${book.id}" aria-label="${escapeHtml(book.title)} 작업">${icon('more', 20)}</button>${actionMenu(book)}</td>
</tr>`).join('')}</tbody>
</table>${visible.length ? '' : ('<div class="empty-state">' + (c.all === 0 ? '등록된 도서가 없습니다.' : '검색 결과가 없습니다.') + '</div>')}</div>` : `<div class="book-grid">${visible.map(book => `<article class="grid-book-card">
<button data-action="edit" data-id="${book.id}">${cover(book)}<strong>${escapeHtml(book.title)}</strong>
<span>${escapeHtml(book.author)}</span>
</button>
<div>${badge(book.status)}<span class="category-pill ${categoryClass(book.category)}">${escapeHtml(book.category)}</span>
</div>
<p>${escapeHtml(book.memo || '기록된 메모가 없습니다.')}</p>
<div class="grid-actions">${stars(book.rating)}<button data-action="edit" data-id="${book.id}">편집</button>
</div>
</article>`).join('') || ('<div class="empty-state">' + (c.all === 0 ? '등록된 도서가 없습니다.' : '검색 결과가 없습니다.') + '</div>')}</div>`}
  <div class="catalog-footer">
<span>총 ${result.length}권의 도서</span>
<div class="pagination">
<button data-action="page" data-number="${pageNumber - 1}" ${pageNumber === 1 ? 'disabled' : ''}>${icon('left', 18)}</button>${Array.from({ length: max }, (_, index) => `<button data-action="page" data-number="${index + 1}" class="${pageNumber === index + 1 ? 'active' : ''}">${index + 1}</button>`).join('')}<button data-action="page" data-number="${pageNumber + 1}" ${pageNumber === max ? 'disabled' : ''}>${icon('right', 18)}</button>
</div>
<label class="select-wrap page-size">
<select id="page-size">
<option value="10" ${pageSize === 10 ? 'selected' : ''}>10개씩 보기</option>
<option value="20" ${pageSize === 20 ? 'selected' : ''}>20개씩 보기</option>
<option value="50" ${pageSize === 50 ? 'selected' : ''}>50개씩 보기</option>
</select>⌄</label>
</div>`
}

function field(
  name: keyof Book,
  label: string,
  required = false,
  type = 'text',
  placeholder = '',
) {
  const requiredMark = required ? ' <b aria-hidden="true">*</b>' : ''

  return `<label>
    <span class="field-label">${label}${requiredMark}</span>
    <input
      data-field="${name}"
      type="${type}"
      ${required ? 'required' : ''}
      value="${escapeHtml(editing[name])}"
      placeholder="${placeholder}"
    >
  </label>`
}
const textarea = (name: keyof Book, placeholder: string, max = 2000) => `<textarea data-field="${name}" maxlength="${max}" placeholder="${placeholder}">${escapeHtml(editing[name])}</textarea>`
function formPage() {
  return `<div class="breadcrumb">
<button data-action="nav" data-page="books">도서 목록</button>${icon('right', 15)} 독서 기록 작성</div>
  <div class="page-heading form-heading">
<div class="page-title">${icon('pencil', 44)}<div>
<h1>${editing.id ? '독서 기록 수정' : '독서 기록 작성'}</h1>
<p>읽은 내용을 기록하고, 나만의 생각을 정리해보세요.</p>
</div>
</div>
<div class="heading-actions">
<button class="secondary-button" data-action="draft">${icon('save', 18)} 임시저장</button>
<button class="primary-button" type="submit" form="book-form">${icon('check', 20)} 저장하기</button>
</div>
</div>
  <form id="book-form" class="book-form">
<section class="panel form-basic">
<div class="basic-fields">
<h2>1. 책 기본 정보</h2>${field('title', '책 제목', true, 'text', '책 제목을 입력하세요')}<div class="field-row two">${field('author', '저자', true, 'text', '저자 이름')}${field('publisher', '출판사', false, 'text', '출판사')}</div>
<div class="field-row three">
<label>
<span class="field-label">카테고리 <b aria-hidden="true">*</b></span>
<select data-field="category">${categories.map(value => `<option ${editing.category === value ? 'selected' : ''}>${value}</option>`).join('')}</select>
</label>
<label>세부 카테고리<select data-field="subcategory">${['', '일본 문학', '한국 문학', '해외 문학', '비문학'].map(value => `<option value="${value}" ${editing.subcategory === value ? 'selected' : ''}>${value || '선택하세요'}</option>`).join('')}</select>
</label>${field('publishedDate', '출판일', false, 'date')}</div>
</div>
<div class="cover-edit">
<div class="cover-preview">${editing.cover ? `<img src="${escapeHtml(editing.cover)}" alt="책 표지">` : icon('book', 60)}</div>
<label class="cover-drop">${icon('image', 28)}<span>표지 이미지 변경<br>
<small>(드래그 앤 드롭)<br>또는 클릭해서 선택</small>
</span>
<input type="file" id="cover-file" accept="image/*">
</label>
<button type="button" class="secondary-button cover-search" data-action="cover-help">${icon('search', 16)} 표지 자동 검색</button>
</div>
</section>
  <div class="form-row">
<section class="panel reading-detail">
<h2>2. 읽은 기간 및 분량</h2>
<div class="reading-fields">${field('startDate', '읽기 시작일', false, 'date')}<span>~</span>${field('endDate', '읽기 종료일', false, 'date')}<label>총 페이지 수<div class="suffix-input">
<input data-field="pages" type="number" min="0" value="${editing.pages || ''}" placeholder="0">
<span>쪽</span>
</div>
</label>
<label>읽은 시간 (선택)<div class="suffix-input">
<input data-field="hours" type="number" min="0" step="0.5" value="${editing.hours || ''}" placeholder="0">
<span>시간</span>
</div>
</label>
</div>
</section>
<section class="panel status-edit">
<h2>읽기 상태</h2>
<div class="radio-grid">${(['완독', '읽는 중', '읽고 싶음', '중단'] as BookStatus[]).map(value => `<label>
<input type="radio" name="status" value="${value}" ${editing.status === value ? 'checked' : ''}>${value}</label>`).join('')}</div>
</section>
<section class="panel rating-edit">
<h2>평점</h2>
<div class="stars editable">${[1, 2, 3, 4, 5].map(value => `<button type="button" data-action="rating" data-rating="${value}" aria-label="${value}점" style="color:${editing.rating >= value ? '#ef9314' : '#cdd3db'}">★</button>`).join('')}</div>
<strong>${editing.rating.toFixed(1)} / 5.0</strong>
</section>
</div>
  <div class="form-columns">
<div class="form-main">
<section class="panel writing-panel">
<h2>3. 내용 요약</h2>${textarea('summary', '책의 내용을 간단히 정리해보세요.')}<small>${editing.summary.length} / 2000</small>
</section>
<section class="panel quote-writing">
<div class="section-title-row">
<h2>4. 일본어 원문 및 한국어 번역 (선택)</h2>
<label>
<input id="favorite-quote" type="checkbox" ${editing.favoriteQuote ? 'checked' : ''}> 좋은 문장으로 저장</label>
</div>
<div class="quote-fields">
<label>
<span>▣ &nbsp;일본어 원문</span>${textarea('original', '인상 깊은 원문을 적어보세요.')}</label>
<label>
<span>▧ &nbsp;한국어 번역</span>${textarea('translation', '번역을 적어보세요.')}</label>
</div>
</section>
<section class="panel writing-panel thoughts-panel">
<h2>5. 나의 생각 / 감상평</h2>${textarea('thoughts', '이 책을 읽고 떠오른 생각을 기록해보세요.')}<small>${editing.thoughts.length} / 2000</small>
</section>
</div>
<div class="form-aside">
<section class="panel tags-panel">
<h2>태그</h2>
<div class="tag-box">
<div class="tag-list">${editing.tags.map(value => `<button type="button" data-action="remove-tag" data-tag="${escapeHtml(value)}">#${escapeHtml(value)} ×</button>`).join('')}</div>
<div class="inline-entry">
<input id="tag-input" value="${escapeHtml(tagInput)}" placeholder="태그 추가">
<button type="button" data-action="add-tag">${icon('plus', 16)}</button>
</div>
</div>
</section>
<section class="panel memo-panel">
<h2>${icon('file', 17)} 메모 (선택)</h2>${textarea('memo', '나중에 다시 읽을 때 기억하고 싶은 점', 500)}<small>${editing.memo.length} / 500</small>
</section>
<section class="panel links-panel">
<h2>${icon('link', 17)} 관련 링크 (선택)</h2>
<div class="inline-entry">
<input id="link-input" type="url" value="${escapeHtml(linkInput)}" placeholder="관련 링크를 입력하세요.">
<button type="button" data-action="add-link">${icon('plus', 16)} 추가</button>
</div>${editing.links.map((value, index) => `<div class="saved-link">
<a href="${escapeHtml(value)}" target="_blank" rel="noreferrer">${escapeHtml(value)}</a>
<button type="button" data-action="remove-link" data-index="${index}">×</button>
</div>`).join('')}</section>
</div>
</div>
</form>`
}

function categoriesPage() { return `${titleBlock('카테고리', '분야별로 나의 책장을 살펴보세요.', 'folder')}<div class="category-card-grid">${categoryCounts().map(item => `<button class="panel category-card" data-action="category" data-category="${escapeHtml(item.name)}">
<span class="category-card-icon ${categoryClass(item.name)}">${icon('book', 28)}</span>
<strong>${escapeHtml(item.name)}</strong>
<span>${item.count}권의 도서</span>${icon('right', 19)}</button>`).join('')}</div>` }
function statsPage() { const c = counts(), total = c.all || 1; return `${titleBlock('독서 통계', '나의 독서 기록을 숫자로 확인해보세요.', 'stats')}<div class="metric-grid stats-metrics">
<div class="metric-card">${icon('book', 38)}<div>
<span>전체 도서</span>
<strong>${c.all}권</strong>
</div>
</div>
<div class="metric-card">${icon('check', 38)}<div>
<span>완독</span>
<strong>${c.done}권</strong>
</div>
</div>
<div class="metric-card">${icon('clock', 38)}<div>
<span>읽는 중</span>
<strong>${c.reading}권</strong>
</div>
</div>
<div class="metric-card">${icon('star', 38)}<div>
<span>평균 평점</span>
<strong>${(books.filter(b => b.rating).reduce((sum, b) => sum + b.rating, 0) / (books.filter(b => b.rating).length || 1)).toFixed(1)}점</strong>
</div>
</div>
</div>
<div class="stats-layout">
<section class="panel">
<h2>독서 현황</h2>
<div class="stat-progress-list">${(['완독', '읽는 중', '읽고 싶음'] as BookStatus[]).map(value => { const count = books.filter(b => b.status === value).length; return `<div>
<span>${value}</span>
<div>
<i style="width:${count / total * 100}%">
</i>
</div>
<strong>${count}권</strong>
</div>` }).join('')}</div>
</section>
<section class="panel">
<h2>분야별 도서</h2>
<div class="category-bars stats-category-bars">${categoryCounts().map(item => `<button class="category-bar-row" data-action="category" data-category="${escapeHtml(item.name)}">
<span>${item.name}</span>
<i class="category-bar ${categoryClass(item.name)}" style="width:${item.count / (categoryCounts()[0]?.count || 1) * 100}%">
</i>
<small>${item.count}</small>
</button>`).join('')}</div>
</section>
</div>` }
function notesPage() { return `${titleBlock('메모', '책과 함께 남긴 생각을 다시 읽어보세요.', 'file')}<div class="notes-grid">${books.filter(book => book.memo || book.thoughts).map(book => `<button class="panel note-card" data-action="edit" data-id="${book.id}">
<div>${cover(book)}<div>
<strong>${escapeHtml(book.title)}</strong>
<span>${escapeHtml(book.author)}</span>
</div>
</div>
<p>${escapeHtml(book.memo || book.thoughts)}</p>
<small>${formatDate(book.endDate || book.registeredDate)}</small>
</button>`).join('')}</div>` }
function settingsPage() { return `${titleBlock('설정', '나에게 맞는 독서 기록 공간을 만드세요.', 'settings')}<section class="panel settings-panel">
<h2>화면 설정</h2>
<div>
<span>${icon('sun', 20)} 어두운 화면</span>
<button class="toggle ${dark ? 'on' : ''}" data-action="dark" aria-label="어두운 화면 켜기/끄기">
<i>
</i>
</button>
</div>
<p>독서 기록은 이 서버의 SQLite 데이터베이스에 저장됩니다.</p>
</section>
<section class="panel settings-panel">
<h2>데이터 관리</h2>
<div>
<span>${icon('save', 20)} 기록 내보내기</span>
<button class="secondary-button" data-action="export">JSON 다운로드</button>
</div>
</section>` }

function render() {
  const content: Record<Page, () => string> = { dashboard, books: catalog, write: formPage, categories: categoriesPage, search: catalog, stats: statsPage, notes: notesPage, settings: settingsPage }
  const date = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }).format(new Date())
  root.innerHTML = `<div class="app-shell ${dark ? 'dark' : ''}">
<aside class="sidebar ${menuOpen ? 'open' : ''}">
<div class="brand">${icon('book', 39)}<strong>나의 독서기록</strong>
</div>
<p class="brand-subtitle">좋은 문장이<br>좋은 하루를 만든다.</p>
<nav class="sidebar-nav" aria-label="주 메뉴">${nav.map(([name, symbol]) => `<button class="nav-item ${page === name ? 'active' : ''}" data-action="nav" data-page="${name}">${icon(symbol, 20)}<span>${pageNames[name]}</span>
</button>`).join('')}</nav>
<div class="sidebar-bottom">
<div class="forest forest-back">
</div>
<div class="forest forest-front">
</div>
<blockquote>“읽는다는 것은,<br>다른 인생을 사는 것이다.”<small>- 앙드레 모루아 -</small>
</blockquote>
</div>
</aside>${menuOpen ? `
<button class="mobile-overlay" data-action="close-menu" aria-label="메뉴 닫기">
</button>
` : ''}<div class="workspace">
<header class="topbar">
<button class="mobile-menu icon-button" data-action="open-menu" aria-label="메뉴 열기">${icon('menu', 23)}</button>
<div class="top-search">${icon('search', 21)}<input id="global-search" value="${escapeHtml(query)}" placeholder="책 제목, 저자, 키워드로 검색..." aria-label="도서 검색">${query ? `<button data-action="clear-query" aria-label="검색어 지우기">${icon('close', 16)}</button>` : ''}</div>
<div class="topbar-right">${icon('sun', 27)}<span class="top-motto">
<span class="leaf">❧</span> 오늘도, 좋은 책과 함께</span>
<span class="top-date">${date}</span>
</div>
</header>
<main class="main-content">${content[page]()}</main>
</div>${toast ? `<div class="toast" role="status">${icon('check', 18)} ${escapeHtml(toast)}<button data-action="close-toast" aria-label="알림 닫기">${icon('close', 15)}</button>
</div>` : ''}</div>`
}

root.addEventListener('click', async event => {
  const target = (event.target as Element).closest<HTMLElement>('[data-action]')
  if (!target) return
  const action = target.dataset.action, id = Number(target.dataset.id)
  if (action === 'nav') { const next = target.dataset.page as Page; next === 'write' ? openNew() : navigate(next) }
  if (action === 'new') openNew()
  if (action === 'edit') openEdit(id)
  if (action === 'actions') {
    if (actionId === id) {
      actionId = null
      actionMenuPosition = null
    } else {
      const fallbackRect = { right: 108, bottom: 0 }
      const rect = typeof target.getBoundingClientRect === 'function'
        ? target.getBoundingClientRect()
        : fallbackRect
      const menuWidth = 108
      const viewportWidth = window.innerWidth || 1200

      actionId = id
      actionMenuPosition = {
        left: Math.max(8, Math.min(rect.right - menuWidth, viewportWidth - menuWidth - 8)),
        top: rect.bottom + 6,
      }
    }

    render()
  }
  if (action === 'delete' || action === 'delete-selected') { const ids = action === 'delete' ? [id] : selected; if (ids.length && confirm(`${ids.length}권의 도서를 삭제하시겠습니까?`)) { try { await Promise.all(ids.map(bookId => api(`/api/books/${bookId}`, 'DELETE'))); books = books.filter(book => !ids.includes(book.id)); selected = []; actionId = null; notice('도서를 삭제했습니다.') } catch (error) { notice(`삭제 실패: ${(error as Error).message}`) } } }
  if (action === 'filter') { filter = target.dataset.filter as BookStatus | '전체'; pageNumber = 1; render() }
  if (action === 'view') { view = target.dataset.view as 'list' | 'grid'; render() }
  if (action === 'category') { categoryFilter = target.dataset.category || '전체'; filter = '전체'; pageNumber = 1; navigate('books') }
  if (action === 'clear-category') { categoryFilter = '전체'; render() }
  if (action === 'clear-query') { query = ''; render() }
  if (action === 'clear-selection') { selected = []; render() }
  if (action === 'page') { pageNumber = Number(target.dataset.number); render() }
  if (action === 'open-menu') { menuOpen = true; render() }
  if (action === 'close-menu') { menuOpen = false; render() }
  if (action === 'close-toast') { toast = ''; render() }
  if (action === 'draft') { localStorage.setItem('reportbook-draft', JSON.stringify(editing)); notice('임시 저장했습니다.') }
  if (action === 'cover-help') notice('표지 이미지를 선택해 업로드해주세요.')
  if (action === 'rating') { editing.rating = Number(target.dataset.rating); render() }
  if (action === 'add-tag') { const value = tagInput.trim().replace(/^#/, ''); if (value && !editing.tags.includes(value)) editing.tags.push(value); tagInput = ''; render() }
  if (action === 'remove-tag') { editing.tags = editing.tags.filter(value => value !== target.dataset.tag); render() }
  if (action === 'add-link') { const value = linkInput.trim(); if (value) { try { const parsed = new URL(value); if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('unsupported protocol'); editing.links.push(value); linkInput = ''; render() } catch { notice('http 또는 https 링크를 입력해주세요.') } } }
  if (action === 'remove-link') { editing.links.splice(Number(target.dataset.index), 1); render() }
  if (action === 'dark') { dark = !dark; render() }
  if (action === 'export') { const url = URL.createObjectURL(new Blob([JSON.stringify(books, null, 2)], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = '나의-독서기록.json'; link.click(); URL.revokeObjectURL(url) }
})

root.addEventListener('input', event => {
  const element = event.target as HTMLInputElement | HTMLTextAreaElement
  if (element.id === 'global-search') { const position = element.selectionStart; query = element.value; page = 'search'; location.hash = 'search'; pageNumber = 1; render(); const next = document.getElementById('global-search') as HTMLInputElement; next.focus(); next.setSelectionRange(position, position); return }
  if (element.id === 'tag-input') { tagInput = element.value; return }
  if (element.id === 'link-input') { linkInput = element.value; return }
  const field = element.dataset.field as keyof Book | undefined
  if (field) { (editing as unknown as Record<string, unknown>)[field] = field === 'pages' || field === 'hours' ? Number(element.value) : element.value }
})
root.addEventListener('change', event => {
  const element = event.target as HTMLInputElement | HTMLSelectElement
  if (element.id === 'sort') { sort = element.value; pageNumber = 1; render() }
  if (element.id === 'page-size') { pageSize = Number(element.value); pageNumber = 1; render() }
  if (element.id === 'select-all') { const ids = filtered().slice((pageNumber - 1) * pageSize, pageNumber * pageSize).map(book => book.id); selected = element.checked ? [...new Set([...selected, ...ids])] : selected.filter(id => !ids.includes(id)); render() }
  if (element.classList.contains('book-select')) { const id = Number(element.dataset.id); selected = element.checked ? [...selected, id] : selected.filter(value => value !== id); render() }
  if (element.name === 'status') editing.status = element.value as BookStatus
  if (element.id === 'favorite-quote') editing.favoriteQuote = element.checked
  if (element.dataset.field && element.tagName === 'SELECT') (editing as unknown as Record<string, unknown>)[element.dataset.field] = element.value
  if (element.id === 'cover-file') { const file = (element as HTMLInputElement).files?.[0]; if (!file) return; if (file.size > 2_000_000) { notice('2MB 이하의 이미지를 선택해주세요.'); return } const reader = new FileReader(); reader.onload = () => { editing.cover = String(reader.result); render() }; reader.readAsDataURL(file) }
})
root.addEventListener('keydown', event => { const element = event.target as HTMLElement; if (event.key === 'Enter' && (element.id === 'tag-input' || element.id === 'link-input')) { event.preventDefault(); root.querySelector<HTMLElement>(`[data-action="${element.id === 'tag-input' ? 'add-tag' : 'add-link'}"]`)?.click() } else if (event.key === 'Enter' && element.id === 'global-search') { event.preventDefault(); navigate('search') } })
root.addEventListener('submit', async event => { if ((event.target as HTMLElement).id !== 'book-form') return; event.preventDefault(); if (!editing.title.trim() || !editing.author.trim()) { notice('책 제목과 저자를 입력해주세요.'); return } try { const wasEditing = Boolean(editing.id); const payload = { ...editing, title: editing.title.trim(), author: editing.author.trim(), registeredDate: editing.registeredDate || today() }; const saved = await api(wasEditing ? `/api/books/${editing.id}` : '/api/books', wasEditing ? 'PUT' : 'POST', payload) as Book; books = wasEditing ? books.map(book => book.id === editing.id ? saved : book) : [saved, ...books]; navigate('books'); notice(wasEditing ? '독서 기록을 수정했습니다.' : '새 독서 기록을 저장했습니다.') } catch (error) { notice(`저장 실패: ${(error as Error).message}`) } })
window.addEventListener('hashchange', () => { const next = location.hash.slice(1) as Page; if (next in pageNames && next !== page) { page = next; render() } })
render()
void loadBooks()
