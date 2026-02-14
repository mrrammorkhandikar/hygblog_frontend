export const allPostsQuery = `
*[_type == "post"] | order(date desc) {
  "id": slug.current,
  title,
  excerpt,
  category,
  date,
  "image": image.asset->url,
  content
}
`

export const singlePostQuery = `
  *[_type == "post" && slug.current == $slug][0]{
    title,
    date,
    category,
    excerpt,
    content,
    "image": mainImage.asset->url
  }
`


