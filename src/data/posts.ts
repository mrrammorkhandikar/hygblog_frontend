export type Post = {
  id: string
  title: string
  excerpt: string
  category: string
  date: string
  image?: string
  tags?: string[]
  content: string
}

export const categories = [
  'Dental Care',
  'Cosmetic Dentistry',
  'Pediatric Dentistry',
  'Oral Surgery',
] as const

export const posts: Post[] = [
  {
    id: 'teeth-whitening-basics',
    title: 'Teeth Whitening: What to Expect',
    excerpt: 'Understand the process, safety, and results of professional whitening.',
    category: 'Cosmetic Dentistry',
    date: '2025-10-01',
    image: '/Images/TeethWhitening.avif',
    tags: ['cosmetic', 'whitening'],
    content:
      'Professional teeth whitening is a safe and effective way to brighten your smile. In-office procedures offer quick results with minimal sensitivity when performed by trained professionals.'
  },
  {
    id: 'dental-implants-overview',
    title: 'Dental Implants: A Complete Guide',
    excerpt: 'How implants replace missing teeth and what recovery involves.',
    category: 'Oral Surgery',
    date: '2025-09-22',
    image: '/Images/DentalImplants.avif',
    tags: ['implants', 'restoration'],
    content:
      'Dental implants are titanium posts placed in the jawbone to replace missing teeth. With proper planning, they provide excellent long-term function and aesthetics.'
  },
  {
    id: 'root-canal-myths',
    title: 'Root Canal Treatment: Myths vs Facts',
    excerpt: 'Debunking common myths around endodontic therapy.',
    category: 'Dental Care',
    date: '2025-09-14',
    image: '/Images/RootCanalTreatment.jpg',
    tags: ['endodontics', 'pain-relief'],
    content:
      'Modern root canal therapy is comfortable and predictable. It relieves pain by removing infected tissue and preserving your natural tooth.'
  },
  {
    id: 'pediatric-first-visit',
    title: 'Your Child&apos;s First Dental Visit',
    excerpt: 'Tips for a positive experience and long-term oral health.',
    category: 'Pediatric Dentistry',
    date: '2025-08-30',
    image: '/Images/PediatricCare.jpg',
    tags: ['kids', 'prevention'],
    content:
      'Early visits build healthy habits and reduce anxiety. Parents can prepare children with simple explanations and by practicing toothbrushing together.'
  },
  {
    id: 'crowns-vs-fillings',
    title: 'Dental Crowns vs Fillings: When to Choose Which',
    excerpt: 'Understand treatment options based on cavity size and tooth strength.',
    category: 'Dental Care',
    date: '2025-08-12',
    image: '/Images/DentalCrowns.jpg',
    tags: ['restorative', 'crowns', 'fillings'],
    content:
      'Fillings repair minor cavities, while crowns reinforce weakened teeth after large decay or root canal. Your dentist will recommend the most conservative option that protects the tooth.'
  },
  {
    id: 'smile-designing-intro',
    title: 'Smile Designing: Aesthetic Planning 101',
    excerpt: 'How dentists plan enhancements for natural-looking results.',
    category: 'Cosmetic Dentistry',
    date: '2025-07-28',
    image: '/Images/SmileDesigning.webp',
    tags: ['aesthetics', 'planning'],
    content:
      'Smile design considers facial proportions, gum health, and tooth shape to create harmonious improvements. Digital previews help patients visualize outcomes.'
  },
]