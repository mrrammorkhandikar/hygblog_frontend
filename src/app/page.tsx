
import { posts } from '@/data/posts'
import HomePage from './home/page'

export default function Content() {
  const recent = posts.slice(0, 3)
  const tokan = process.env.NEXT_PUBLIC_API_TOKEN || ''

  return (
    <>
      <HomePage token={tokan} />
    </>
  )
}