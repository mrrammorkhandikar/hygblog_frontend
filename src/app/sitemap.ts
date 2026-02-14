import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages = [
    {
      url: 'https://hygieneshelf.in',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: 'https://hygieneshelf.in/about',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: 'https://hygieneshelf.in/blogs',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: 'https://hygieneshelf.in/contact',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: 'https://hygieneshelf.in/newsletter',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: 'https://hygieneshelf.in/careers',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: 'https://hygieneshelf.in/products',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: 'https://hygieneshelf.in/terms',
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: 'https://hygieneshelf.in/privacy',
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: 'https://hygieneshelf.in/disclaimer',
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ];

  // Fetch blog posts from API
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/posts?published=true&limit=100`, {
      next: { revalidate: 1800 } // Revalidate every 30 minutes
    });
    
    if (response.ok) {
      const data = await response.json();
      const blogPosts = Array.isArray(data.data) ? data.data : [];
      
      const blogPages = blogPosts.map((post: any) => {
        // Define priority based on hygiene-related keywords
        let priority = 0.6;
        if (post.featured) priority = 0.8;
        
        // Boost priority for hygiene-related content
        const hygieneKeywords = ['hygiene', 'health', 'oral', 'dental', 'kids', 'tooth', 'teeth', 'cleaning', 'sanitation'];
        const title = post.title.toLowerCase();
        const category = post.category?.toLowerCase() || '';
        const content = (post.excerpt || '').toLowerCase();
        
        if (hygieneKeywords.some(keyword => 
          title.includes(keyword) || 
          category.includes(keyword) || 
          content.includes(keyword)
        )) {
          priority = post.featured ? 0.9 : 0.75;
        }
        
        return {
          url: `https://hygieneshelf.in/blogs/${post.slug}`,
          lastModified: new Date(post.updated_at || post.created_at),
          changeFrequency: post.featured ? 'weekly' as const : 'monthly' as const,
          priority: priority,
        };
      });

      return [...staticPages, ...blogPages];
    }
  } catch (error) {
    console.error('Failed to fetch blog posts for sitemap:', error);
  }

  // Return static pages only if blog fetch fails
  return staticPages;
}