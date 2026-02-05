import { notFound } from 'next/navigation';
import { fetchBlogPost } from './actions';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowLeft, Share2, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CategoriesBox from '@/components/CategoriesBox';
import GoogleAdsBox from '@/components/GoogleAdsBox';
import EngagementSection from '@/components/EngagementSection';

type Blog = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  category?: string;
  tags?: string[];
  image_url?: string;
  date: string;
  published: boolean;
  featured: boolean;
  author?: string;
  created_at: string;
  updated_at: string;
};

type ContentBlock = {
  id: string;
  type: 'text' | 'image' | 'ul' | 'ol' | 'blockquote';
  content: string;
  metadata?: {
    level?: number;
    size?: 'small' | 'medium' | 'large' | 'custom';
    width?: number;
    height?: number;
    alt?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
  };
  listItems?: ListItem[];
  affiliateLink?: { type: 'affiliate' | 'custom' | null; id?: string; name?: string; url?: string };
};

type ListItem = {
  id: string;
  type: 'text' | 'image';
  content: string;
  imageMetadata?: { size?: 'small' | 'medium' | 'large' | 'custom'; width?: number; height?: number; alt?: string };
  nestedList?: { type: 'ul' | 'ol'; items: ListItem[] };
};

async function getRelatedBlogs(currentSlug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/posts?published=true&limit=10&sortBy=date&sortOrder=desc`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch related blogs');
    }
    
    const result = await response.json();
    const allBlogs = Array.isArray(result.data) ? result.data : [];
    
    // Filter out the current blog and get 3 random blogs
    const filteredBlogs = allBlogs
      .filter((blog: any) => blog.slug !== currentSlug)
      .sort(() => 0.5 - Math.random()) // Shuffle array
      .slice(0, 3); // Take first 3
    
    return filteredBlogs;
  } catch (error) {
    console.error('Failed to fetch related blogs:', error);
    return [];
  }
}

export default async function BlogDetailServer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Fetch blog post
  const blogResult = await fetchBlogPost(id);
  
  if (!blogResult) {
    notFound();
  }
  
  // Type assertion for the blog object
  const blog: Blog = blogResult as Blog;
  
  // Fetch related blogs
  const relatedBlogs = await getRelatedBlogs(id);

  // Generate JSON-LD structured data for the article
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.excerpt || `Read expert health and hygiene insights from Dr. Bushra Mirza. Learn about ${blog.title.toLowerCase()} and other important health topics.`,
    image: blog.image_url || '/Images/thelogohytitle.png',
    author: {
      '@type': 'Person',
      name: blog.author || 'Dr. Bushra Mirza',
      jobTitle: 'Dentist and Health Expert',
      url: 'https://hygieneshelf.in/about'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Hygiene Shelf',
      logo: {
        '@type': 'ImageObject',
        url: '/Images/thelogohytitle.png'
      }
    },
    datePublished: new Date(blog.created_at).toISOString(),
    dateModified: new Date(blog.updated_at).toISOString(),
    mainEntityOfPage: `https://hygieneshelf.in/blogs/${blog.slug}`,
    keywords: blog.tags ? blog.tags.join(',') : blog.category || '',
    articleSection: blog.category || 'Health'
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogDetailClient blog={blog} relatedBlogs={relatedBlogs} />
    </>
  );
}

// Client Component
const BlogDetailClient = ({ blog, relatedBlogs }: { blog: Blog, relatedBlogs: Blog[] }) => {
  // Parse text formatting for display
  function parseFormattedText(text: string): string {
    if (!text) return '';

    // Convert markdown-style formatting to HTML
    let formatted = text;

    // Bold: **text** -> <strong>text</strong>
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic: *text* -> <em>text</em>
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Underline: <u>text</u> -> <u>text</u> (already HTML)
    // Note: This is already HTML so it will be rendered

    return formatted;
  }

  // Parse and render content blocks
  const renderContentBlocks = (content: string) => {
    try {
      const blocks: ContentBlock[] = JSON.parse(content);
      return blocks.map((block) => {
        const { type, content: blockContent, metadata, listItems, affiliateLink } = block;

        const renderContentElement = (element: React.ReactElement) => {
          if (affiliateLink?.url) {
            return (
              <a
                key={block.id}
                href={affiliateLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {element}
              </a>
            );
          }
          return element;
        };

        switch (type) {
          case 'text':
            const level = metadata?.level || 0;
            let contentClass = "";
            if (metadata?.bold) contentClass += " font-bold";
            if (metadata?.italic) contentClass += " italic";
            if (metadata?.underline) contentClass += " underline";

            const formattedContent = parseFormattedText(blockContent || 'Empty paragraph');

            if (level === 0) {
              return renderContentElement(
                <p key={block.id} className={`mb-6 leading-relaxed text-gray-800 text-base${contentClass}`} dangerouslySetInnerHTML={{ __html: formattedContent }} />
              );
            } else {
              // H1, H2, H3 as titles with different sizes
              const baseClass = `font-bold text-[#0f766e]${contentClass}`;
              const formattedHeading = parseFormattedText(blockContent || 'Empty heading');

              if (level === 1) {
                return renderContentElement(
                  <h1 key={block.id} className={`${baseClass} text-4xl md:text-5xl mt-12 mb-6 leading-tight`} style={{ fontFamily: '"Playfair Display", serif' }} dangerouslySetInnerHTML={{ __html: formattedHeading }} />
                );
              } else if (level === 2) {
                return renderContentElement(
                  <h2 key={block.id} className={`${baseClass} text-3xl md:text-4xl mt-10 mb-5 leading-tight`} style={{ fontFamily: '"Playfair Display", serif' }} dangerouslySetInnerHTML={{ __html: formattedHeading }} />
                );
              } else if (level === 3) {
                return renderContentElement(
                  <h3 key={block.id} className={`${baseClass} text-2xl md:text-3xl mt-8 mb-4 leading-tight`} style={{ fontFamily: '"Playfair Display", serif' }} dangerouslySetInnerHTML={{ __html: formattedHeading }} />
                );
              }
              // Fallback for other levels (though admin only allows 0-3 now)
              return renderContentElement(
                <p key={block.id} className={`mb-6 leading-relaxed text-gray-800 text-base${contentClass}`} dangerouslySetInnerHTML={{ __html: formattedContent }} />
              );
            }

          case 'blockquote':
            const formattedQuote = parseFormattedText(blockContent || 'Empty quote');
            return renderContentElement(
              <blockquote key={block.id} className="mb-8 pl-6 border-l-4 border-[#0f766e] italic text-gray-700 text-lg" dangerouslySetInnerHTML={{ __html: formattedQuote }} />
            );

          case 'image':
            // Don't render image if src is empty or invalid
            if (!blockContent || blockContent.trim() === '') {
              return null;
            }
            
            const imageElement = (
              <img
                src={blockContent}
                alt={metadata?.alt || ''}
                className={`rounded-lg ${metadata?.size === 'small' ? 'max-w-sm' : metadata?.size === 'large' || metadata?.size === 'medium' ? 'w-full' : 'max-w-2xl'} mx-auto`}
                style={{
                  width: metadata?.size === 'custom' ? metadata.width : undefined,
                  height: metadata?.size === 'custom' ? metadata.height : undefined,
                }}
              />
            );

            return (
              <div key={block.id} className="mb-8">
                {affiliateLink?.url ? (
                  <a href={affiliateLink.url} target="_blank" rel="noopener noreferrer">
                    {imageElement}
                  </a>
                ) : (
                  imageElement
                )}
              </div>
            );

          case 'ul':
          case 'ol':
            const ListTag = type;
            return (
              <ListTag
                key={block.id}
                className="mb-8 pl-6"
                style={{ listStyleType: type === 'ul' ? 'disc' : 'decimal' }}
              >
                {listItems?.map((item) => (
                  <li key={item.id} className="mb-2">
                    {item.type === 'text' ? (
                      <span dangerouslySetInnerHTML={{ __html: parseFormattedText(item.content || 'Empty item') }} />
                    ) : (
                      // Don't render image if src is empty or invalid
                      item.content && item.content.trim() !== '' ? (
                        <img
                          src={item.content}
                          alt={item.imageMetadata?.alt || ''}
                          className="rounded max-w-sm"
                        />
                      ) : null
                    )}
                  </li>
                ))}
              </ListTag>
            );

          default:
            return null;
        }
      });
    } catch (err) {
      return <p className="mb-4">This article content is coming soon...</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7fdff] via-[#eefdfa] to-[#f3fbff] text-slate-800 antialiased">
      {/* ---------- Hero Section with Blog Image ---------- */}
      <header className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background:
              'radial-gradient(closest-side, rgba(14,165,233,0.06), transparent 40%), radial-gradient(closest-side, rgba(15,118,110,0.04), transparent 30%)',
          }}
        />
        <div className="relative h-96 md:h-[500px] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${blog.image_url ?? 'https://source.unsplash.com/collection/medical/1200x800?nature,health'})`,
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 lg:px-20 text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <div className="flex items-center justify-center mb-6">
                <span className="bg-[#0f766e] text-white px-4 py-2 rounded-full text-sm font-medium">
                  {blog.category || 'Health'}
                </span>
              </div>
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-6"
                style={{ fontFamily: `"Playfair Display", serif` }}
              >
                {blog.title}
              </h1>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>5 min read</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative gradient divider */}
        <div className="h-20 -mt-6 pointer-events-none">
          <svg viewBox="0 0 1440 120" className="w-full block" preserveAspectRatio="none">
            <defs>
              <linearGradient id="g1" x1="0" x2="1">
                <stop offset="0%" stopColor="#ecfeff" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
            </defs>
            <path
              d="M0,40 C240,100 480,0 720,40 C960,80 1200,20 1440,60 L1440 120 L0 120 Z"
              fill="url(#g1)"
              opacity="0.95"
            />
          </svg>
        </div>
      </header>

      {/* ---------- Article Content ---------- */}
      <article className="relative bg-white -mt-8 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Button
              onClick={() => (window.location.href = '/blogs')}
              className="bg-transparent hover:bg-slate-50 text-[#0f766e] border border-[#0f766e] rounded-full px-6 py-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Articles
            </Button>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1 max-w-4xl">
              {/* Article Header */}
              <motion.header
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.9 } },
                }}
                initial="hidden"
                animate="visible"
                className="mb-12"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#f0fdfa] rounded-full flex items-center justify-center">
                      <span className="text-[#0f766e] font-semibold text-lg">
                        {blog.author ? blog.author.charAt(0).toUpperCase() : 'D'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-[#0f766e]">{blog.author || 'Dr. Bushra Mirza'}</p>
                      <p className="text-sm text-slate-500">Health & Hygiene Expert</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <Button size="sm" variant="outline" className="rounded-full">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-full">
                      <Bookmark className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.header>

              {/* Article Content */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.9, delay: 0.3 } },
                }}
                initial="hidden"
                animate="visible"
                className="prose prose-slate max-w-none"
              >
                {/* Description/Excerpt */}
                {blog.excerpt && (
                  <p className="text-lg text-gray-700 leading-relaxed mb-8 italic border-l-4 border-[#0f766e] pl-6">
                    {blog.excerpt}
                  </p>
                )}
                <div>
                  {blog.content ? renderContentBlocks(blog.content) : <p>This article content is coming soon...</p>}
                </div>
              </motion.div>

              {/* Article Footer */}
              <motion.footer
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.9, delay: 0.5 } },
                }}
                initial="hidden"
                animate="visible"
                className="mt-16 pt-8 border-t border-slate-200"
              >
                <div className="flex flex-wrap flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex flex-wrap gap-2">
                    {blog.tags && blog.tags.map((tag: string, index: number) => {
                      // Only show tags that are valid (not UUIDs or invalid entries)
                      const isValidTag = typeof tag === 'string' && tag.trim() !== '' && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(tag);
                      return isValidTag ? (
                        <a
                          key={index}
                          href={`/blogs?search=${encodeURIComponent(tag)}`}
                          className="bg-[#f0fdfa] text-[#0f766e] px-3 py-1 rounded-full text-sm hover:bg-[#e6f7f4] transition-colors"
                        >
                          #{tag}
                        </a>
                      ) : null;
                    }).filter(Boolean)}
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <Button
                      onClick={() => (window.location.href = '/blogs')}
                      className="bg-[#0f766e] hover:bg-[#0d5e59] text-white rounded-full px-6 py-2"
                    >
                      Explore All Articles
                    </Button>
                    <a 
                      href="/about"
                      className="text-[#0f766e] hover:text-[#06b6d4] transition-colors font-medium text-sm"
                    >
                      About Dr. Bushra
                    </a>
                  </div>
                </div>
              </motion.footer>
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-[#0f766e] mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>Explore More Topics</h4>
                <CategoriesBox />
              </div>
              <GoogleAdsBox />
            </div>
          </div>
        </div>
      </article>

      {/* ---------- Engagement Section ---------- */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20">
          <EngagementSection postId={blog.id} />
        </div>
      </section>

      {/* ---------- Related Articles Section ---------- */}
      <section className="py-20 bg-gradient-to-b from-[#f7fffd] to-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-[#0f766e] mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
              More Hygiene Insights
            </h3>
            <p className="text-lg text-slate-600">
              Explore more expert advice on health and hygiene topics
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {relatedBlogs.length > 0 ? (
              relatedBlogs.map((relatedBlog, i) => (
                <motion.article
                  key={relatedBlog.id}
                  whileHover={{ translateY: -6, boxShadow: '0 18px 40px rgba(8, 89, 76, 0.08)' }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 cursor-pointer transition group"
                  onClick={() => (window.location.href = `/blogs/${relatedBlog.slug}`)}
                >
                  <div
                    className="h-48 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${relatedBlog.image_url ?? 'https://source.unsplash.com/collection/medical/800x600?nature,health'})`,
                    }}
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-white bg-[#0f766e] px-3 py-1 rounded-full">
                        {relatedBlog.category || 'Health'}
                      </span>
                      <div className="flex items-center text-sm text-slate-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(relatedBlog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <h4 className="text-lg font-semibold text-[#0f766e] mb-3 group-hover:text-[#06b6d4] transition" style={{ fontFamily: '"Playfair Display", serif' }}>
                      {relatedBlog.title}
                    </h4>
                    <p className="text-slate-600 mb-4 line-clamp-2">
                      {relatedBlog.excerpt || 'Explore more insights on health and wellness topics.'}
                    </p>
                    <div className="flex items-center text-[#0f766e] font-medium group-hover:text-[#06b6d4] transition">
                      <span>Read article</span>
                      <ArrowLeft className="w-4 h-4 ml-1 rotate-180 group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                </motion.article>
              ))
            ) : (
              // Fallback placeholder cards if no related blogs are loaded
              [1, 2, 3].map((i) => (
                <motion.article
                  key={i}
                  whileHover={{ translateY: -6, boxShadow: '0 18px 40px rgba(8, 89, 76, 0.08)' }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 cursor-pointer transition group"
                  onClick={() => (window.location.href = '/blogs')}
                >
                  <div
                    className="h-48 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(https://source.unsplash.com/collection/medical-${i + 10}/800x600?nature,health)`,
                    }}
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-white bg-[#0f766e] px-3 py-1 rounded-full">
                        Health
                      </span>
                      <div className="flex items-center text-sm text-slate-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        Recent
                      </div>
                    </div>
                    <h4 className="text-lg font-semibold text-[#0f766e] mb-3 group-hover:text-[#06b6d4] transition" style={{ fontFamily: '"Playfair Display", serif' }}>
                      Related Health Topic #{i}
                    </h4>
                    <p className="text-slate-600 mb-4 line-clamp-2">
                      Explore more insights on health and wellness topics that complement this article.
                    </p>
                    <div className="flex items-center text-[#0f766e] font-medium group-hover:text-[#06b6d4] transition">
                      <span>Read article</span>
                      <ArrowLeft className="w-4 h-4 ml-1 rotate-180 group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                </motion.article>
              ))
            )}
          </motion.div>
        </div>
      </section>

      {/* ---------- Extra Styles ---------- */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=Playfair+Display:wght@400;600;700;900&display=swap');

        body { font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }

        img { image-rendering: auto; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

        a, button { -webkit-tap-highlight-color: rgba(0,0,0,0); }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        html { scroll-behavior: smooth; }

        .prose { max-width: none; }
        .prose p { margin-bottom: 1.5em; line-height: 1.7; }
        .prose h2 { font-family: "Playfair Display", serif; color: #0f766e; margin-top: 2em; margin-bottom: 1em; }
        .prose h3 { font-family: "Playfair Display", serif; color: #0f766e; margin-top: 1.5em; margin-bottom: 0.5em; }
        .prose ul, .prose ol { margin-bottom: 1.5em; padding-left: 1.5em; }
        .prose li { margin-bottom: 0.5em; }
        .prose blockquote { border-left: 4px solid #0f766e; padding-left: 1em; font-style: italic; color: #374151; }
      `}</style>
    </div>
  );
};