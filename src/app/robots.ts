import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/admin/',
          '/private/',
          '/_next/',
          '/404',
          '/500',
          '/search?',
          '/cart?',
          '/account?',
          '/*/print$',
        ],
      },
      {
        userAgent: 'ia_archiver',
        disallow: ['/'],
      },
    ],
    sitemap: 'https://hygieneshelf.in/sitemap.xml',
    host: 'https://hygieneshelf.in',
  };
}