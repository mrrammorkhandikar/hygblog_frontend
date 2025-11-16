'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { apiGet, apiDelete, getCurrentUser, apiPut } from '../api';
import { useRouter } from 'next/navigation';
import ImageManagementTable from '../../../components/ImageManagementTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Author = {
  id: string;
  username: string;
  blog_name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
  blog?: any | null;
  status?: string | null;
};

type BlogPost = {
  id: string;
  title: string;
  published: boolean;
  created_at: string;
  updated_at: string;
};

type Post = {
  id: string;
  title: string;
  excerpt?: string;
  seo_title?: string;
  published?: boolean;
  created_at: string;
  updated_at: string;
  author?: string;
  featured?: boolean;
  category?: string;
  tags?: string[];
};

type SortField = 'title' | 'published' | 'updated_at' | 'created_at';
type SortDirection = 'asc' | 'desc';

// My Profile Component
function MyProfileTab({ token }: { token: string }) {
  const user = getCurrentUser();
  if (!user) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Access denied: Not authenticated.
      </div>
    );
  }

  const isAuthor = user.role === 'author';

  const [profile, setProfile] = useState<any>(null);
  const [authorPosts, setAuthorPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    blog_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Load profile data
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const profileData = await apiGet<any>('/authors/me', token);
      setProfile(profileData);
      setEditForm({
        blog_name: profileData.blog_name || '',
        email: profileData.email || '',
        password: '',
        confirmPassword: ''
      });

      // Load blogs if author
      if (isAuthor) {
        const postsData = await apiGet<{ data: BlogPost[] }>('/posts?author=' + user.authorName + '&limit=10', token);
        setAuthorPosts(postsData.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load profile:', err);
      if (err.status === 403) {
        setError(isAuthor ? 'Access denied: Authors profile not set up. Please contact admin to create your author account.' : 'Access denied.');
      } else if (err.status === 404) {
        setError(isAuthor ? 'Author profile not found. Please contact admin to create your author account.' : 'Admin profile not found.');
      } else {
        setError('Failed to load profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (editForm.password && editForm.password !== editForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updateData: any = { email: editForm.email || null };
      if (isAuthor) updateData.blog_name = editForm.blog_name || null;
      if (editForm.password) updateData.password = editForm.password;

      const updatedProfile = await apiPut<any>('/authors/me', token, updateData);
      setProfile(updatedProfile);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
        <p className="mt-2 text-gray-600 text-center">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">My Profile</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {profile && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Account Information</h3>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Username:</span> {profile.username}</div>
              <div><span className="font-medium">Email:</span> {profile.email || 'Not set'}</div>
              <div><span className="font-medium">Role:</span> {profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : user.role.charAt(0).toUpperCase() + user.role.slice(1)}</div>
              <div><span className="font-medium">Member since:</span> {new Date(profile.created_at).toLocaleDateString()}</div>
              {isAuthor && (
                <>
                  <div><span className="font-medium">Blog Name:</span> {profile.blog_name || 'Not set'}</div>
                  <div><span className="font-medium">Status:</span> {profile.status ? profile.status.charAt(0).toUpperCase() + profile.status.slice(1) : 'Unknown'}</div>
                  <div><span className="font-medium">Last updated:</span> {new Date(profile.updated_at).toLocaleDateString()}</div>
                  {profile.blog && (
                    <div><span className="font-medium">Blog Settings:</span> <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-auto">{JSON.stringify(profile.blog, null, 2)}</pre></div>
                  )}
                </>
              )}
            </div>
          </div>

          {isAuthor && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-4">My Blogs</h3>
              {authorPosts.length === 0 ? (
                <p className="text-sm text-gray-600">No blogs written yet.</p>
              ) : (
                <div className="space-y-3">
                  {authorPosts.map((post) => (
                    <div key={post.id} className="bg-white p-3 rounded border shadow-sm">
                      <h4 className="font-medium text-gray-900">{post.title}</h4>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          post.published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                        <span>Created: {new Date(post.created_at).toLocaleDateString()}</span>
                        <span>Updated: {new Date(post.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Edit Profile</h3>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                placeholder="Enter your email"
              />
            </div>

            {isAuthor && (
              <div>
                <label htmlFor="blog_name" className="block text-sm font-medium text-black mb-1">
                  Blog Name
                </label>
                <input
                  id="blog_name"
                  type="text"
                  value={editForm.blog_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, blog_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                  placeholder="Enter your blog name"
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black mb-1">
                New Password (leave blank to keep current)
              </label>
              <input
                id="password"
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-1">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={editForm.confirmPassword}
                onChange={(e) => setEditForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                placeholder="Confirm new password"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [publishedFilter, setPublishedFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('updated_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [categories, setCategories] = useState<{ id: string; name: string; }[]>([]);
  const [tags, setTags] = useState<{ id: string; name: string; }[]>([]);
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'images' | 'profile'>('posts');

  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  // Handle hydration
  useEffect(() => {
    setMounted(true);
    const user = getCurrentUser();
    if (user) {
      setUserRole(user.role);
    }
  }, []);

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load initial data
  useEffect(() => {
    if (!token) return;

    Promise.all([
      apiGet<{ id: string; name: string; }[]>('/categories', token),
      apiGet<{ id: string; name: string; }[]>('/tags', token)
    ])
      .then(([categoriesData, tagsData]) => {
        setCategories(categoriesData);
        setTags(tagsData);
      })
      .catch(console.error);
  }, [token]);

  // Load posts with filters
  const loadPosts = useCallback(async () => {
    if (!token) {
      router.push('/admin/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sort: sortField,
        order: sortDirection,
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(publishedFilter && { published: publishedFilter }),
      });

      const response = await apiGet<{
        data: Post[];
        pagination: {
          total: number;
          page: number;
          totalPages: number;
          limit: number;
        };
      }>(`/posts?${params}`, token);

      setPosts(response.data || []);
    } catch (err) {
      console.error('Failed to load posts:', err);
      setError('Failed to load posts. Please try again.');
      if (err instanceof Error && err.message.includes('401')) {
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, pageSize, sortField, sortDirection, debouncedSearchTerm, categoryFilter, publishedFilter, router]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, categoryFilter, publishedFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await apiDelete(`/posts/${id}`, token);
      await loadPosts(); // Reload posts after deletion
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete post. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="text-gray-400">↕</span>;
    }
    return <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  // Helper function to get tag name from ID
  const getTagName = (tagId: string) => {
    const tag = tags.find(t => t.id === tagId);
    return tag ? tag.name : `Tag ${tagId}`;
  };

  if (!mounted) {
    return <div className="space-y-6">Loading...</div>; // Prevent hydration mismatch
  }

  if (!token) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Dashboard</h1>
          <p className="text-muted-foreground  text-black">
            Manage your blog posts, content, and settings
          </p>
        </div>
        <Link href="/admin/create">
          <Button>
            <span className="hidden sm:inline">Create New Post</span>
            <span className="sm:hidden">New Post</span>
          </Button>
        </Link>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'posts'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Posts
            </button>
            {userRole === 'admin' && (
              <button
                onClick={() => setActiveTab('images')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'images'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Images
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'posts' ? (
        <>
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-black mb-1">
              Search
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-black mb-1">
              Category
            </label>
            <select
              id="category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Published Filter */}
          <div>
            <label htmlFor="published" className="block text-sm font-medium text-black mb-1">
              Status
            </label>
            <select
              id="published"
              value={publishedFilter}
              onChange={(e) => setPublishedFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
            >
              <option value="">All Status</option>
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </select>
          </div>

          {/* Page Size */}
          <div>
            <label htmlFor="pageSize" className="block text-sm font-medium text-black mb-1">
              Per Page
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-700  font-medium">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <p className="mt-2 text-black">Loading posts...</p>
          </CardContent>
        </Card>
      )}

      {/* Posts Table */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Title</span>
                      <SortIcon field="title" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tags
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('published')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      <SortIcon field="published" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('updated_at')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Last Modified</span>
                      <SortIcon field="updated_at" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No posts found. {debouncedSearchTerm || categoryFilter || publishedFilter ? 'Try adjusting your filters.' : 'Create your first post!'}
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <div className="font-medium text-gray-900">{post.title}</div>
                            {post.featured && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                Featured
                              </span>
                            )}
                          </div>
                          {post.excerpt && (
                            <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {post.excerpt}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {post.category || '-'}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(post.tags) && post.tags.length > 0 ? (
                            post.tags.slice(0, 3).map((tagId, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {getTagName(tagId)}
                              </span>
                            ))
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              No tags
                            </span>
                          )}
                          {Array.isArray(post.tags) && post.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{post.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          post.published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {post.author || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {formatDate(post.updated_at)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/edit/${post.id}`}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id, post.title)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {posts.length > 0 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-700">
                  Showing page {currentPage} of posts
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage}
                  </span>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={posts.length < pageSize}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
        </>
      ) : activeTab === 'images' ? (
        /* Images Tab */
        <ImageManagementTable token={token || ''} />
      ) : (
        /* Profile Tab */
        <MyProfileTab token={token || ''} />
      ) }
    </div>
  );
}
