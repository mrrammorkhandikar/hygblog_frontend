'use server';

import { apiGet } from '@/app/admin/api';

export async function fetchBlogPost(slug: string) {
  try {
    const blog = await apiGet(`/posts/slug/${slug}`, '');
    return blog;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}