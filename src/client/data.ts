export type BookStatus = '완독' | '읽는 중' | '읽고 싶음' | '중단'
export type Page = 'dashboard' | 'books' | 'write' | 'categories' | 'search' | 'stats' | 'notes' | 'settings'

export interface Book {
  id: number
  title: string
  author: string
  publisher: string
  category: string
  subcategory: string
  status: BookStatus
  startDate: string
  endDate: string
  publishedDate: string
  registeredDate: string
  pages: number
  hours: number
  rating: number
  summary: string
  original: string
  translation: string
  thoughts: string
  memo: string
  tags: string[]
  links: string[]
  favoriteQuote: boolean
  cover: string
}

export const categories = ['소설', '에세이', '자기계발', '역사', '인문', '과학', 'IT', '기타']
