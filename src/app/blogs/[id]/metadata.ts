import { Metadata } from 'next';
import { fetchBlogPost } from '@/app/blogs/[id]/actions';

interface Params {
  id: string;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  let blog: any = null;

  try {
    blog = await fetchBlogPost(id);
  } catch (error) {
    console.error('Failed to fetch blog post for metadata:', error);
  }

  if (!blog) {
    return {
      title: 'Blog Post Not Found | Hygiene Shelf',
      description: 'The requested blog post could not be found on Hygiene Shelf.',
      openGraph: {
        title: 'Blog Post Not Found | Hygiene Shelf',
        description: 'The requested blog post could not be found on Hygiene Shelf.',
        type: 'article',
        url: `https://hygieneshelf.in/blogs/${id}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Blog Post Not Found | Hygiene Shelf',
        description: 'The requested blog post could not be found on Hygiene Shelf.',
      },
    };
  }

  // Extract keywords from the blog content or tags
  const keywords = [
    ...(blog.tags || []),
    blog.category || '',
    'health',
    'hygiene',
    'wellness',
    'oral care',
    'dental health',
    'kids hygiene',
    'home hygiene',
    'mental hygiene',
    'Dr. Bushra Mirza',
    'healthcare advice'
  ]
    .filter(Boolean)
    .map(keyword => keyword.toLowerCase())
    .filter((keyword, index, arr) => arr.indexOf(keyword) === index) // Remove duplicates
    .slice(0, 10) // Limit to 10 keywords
    .join(', ');

  const title = blog.seo_title || blog.title;
  const description = blog.seo_description || blog.excerpt || `Read expert health and hygiene insights from Dr. Bushra Mirza. Learn about ${blog.title.toLowerCase()} and other important health topics.`;

  return {
    title: `${title} | Hygiene Shelf`,
    description: description,
    keywords: keywords,
    authors: [{ name: blog.author || 'Dr. Bushra Mirza' }],
    creator: 'Dr. Bushra Mirza',
    publisher: 'Hygiene Shelf',
    openGraph: {
      title: title,
      description: description,
      url: `https://hygieneshelf.in/blogs/${blog.slug}`,
      siteName: 'Hygiene Shelf',
      images: [
        {
          url: blog.image_url || '/Images/thelogohytitle.png',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'article',
      publishedTime: new Date(blog.created_at).toISOString(),
      modifiedTime: new Date(blog.updated_at).toISOString(),
      authors: [blog.author || 'Dr. Bushra Mirza'],
      tags: blog.tags || [],
      section: blog.category || 'Health',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [blog.image_url || '/Images/thelogohytitle.png'],
      creator: '@drbushramirza',
    },
    alternates: {
      canonical: `https://hygieneshelf.in/blogs/${blog.slug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}