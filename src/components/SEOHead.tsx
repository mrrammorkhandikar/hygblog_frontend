import React from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'organization' | 'person';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  canonical?: string;
  category?: string;
  tags?: string[];
  publisher?: {
    name: string;
    logo: string;
    url: string;
  };
  breadcrumb?: {
    name: string;
    url: string;
  }[];
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  image = '/Images/thelogohytitle.png',
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  canonical,
  category,
  tags,
  publisher,
  breadcrumb
}) => {
  const siteTitle = "Hygiene Shelf - Health & Hygiene Insights from Dr. Bushra Mirza";
  const siteDescription = "Discover evidence-based health and hygiene articles, practical tips, and expert guidance from Dr. Bushra Mirza. Learn about oral care, mental wellness, holistic health, and family hygiene practices.";
  const siteUrl = "https://hygieneshelf.in";
  
  const pageTitle = title ? `${title} | Hygiene Shelf` : siteTitle;
  const pageDescription = description || siteDescription;
  const pageUrl = url ? `${siteUrl}${url}` : siteUrl;
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : pageUrl;

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'Article' : 
              type === 'organization' ? 'Organization' : 
              type === 'person' ? 'Person' : 'WebSite',
    name: pageTitle,
    description: pageDescription,
    url: pageUrl,
    image: image.startsWith('http') ? image : `${siteUrl}${image}`,
    ...(type === 'article' && {
      author: {
        '@type': 'Person',
        name: author || 'Dr. Bushra Mirza',
        url: `${siteUrl}/about`
      },
      publisher: publisher || {
        '@type': 'Organization',
        name: 'Hygiene Shelf',
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/Images/thelogohytitle.png`
        }
      },
      datePublished: publishedTime,
      dateModified: modifiedTime || publishedTime,
      headline: title,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl
      },
      ...(category && { articleSection: category }),
      ...(tags && { keywords: tags.join(', ') })
    }),
    ...((type === 'website' || !type) && {
      publisher: publisher || {
        '@type': 'Organization',
        name: 'Hygiene Shelf',
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/Images/thelogohytitle.png`
        }
      }
    })
  };

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = breadcrumb ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumb.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.url}`
    }))
  } : null;

  return (
    <>
      {/* Primary JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Breadcrumb JSON-LD if provided */}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
    </>
  );
};

export default SEOHead;