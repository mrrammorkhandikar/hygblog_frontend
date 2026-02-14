'use client';
import { useEffect, useState, useCallback } from 'react';
import { apiGet, apiPost, apiDelete, apiPut } from '../api';
import ImageUploadManager from '../../../components/ImageUploadManager';

type Author = {
  id: string;
  username: string;
  email: string | null;
  blog: any | null;
  blog_name: string | null;
  status: 'publish' | 'draft' | null;
  created_at: string;
  updated_at: string;
  authers_image: string | null;
  description: string | null;
  title: string | null;
  socialmedia: any[];
};

export default function AdminAuthors() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    confirmPassword: '',
    blog_name: '',
    status: 'draft' as 'publish' | 'draft',
    authers_image: '',
    description: '',
    title: '',
    socialmedia: [] as any[]
  });

  // Image upload
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'publish' | 'draft' | ''>('');
  const [sortBy, setSortBy] = useState<'username' | 'email' | 'created_at'>('username');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  // Load authors
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const authorsData = await apiGet<Author[]>('/authors', token);
      setAuthors(Array.isArray(authorsData) ? authorsData : []);
    } catch (err: any) {
      console.error('Failed to load authors:', err);
      setError('Failed to load authors. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token, loadData]);

  // Reset form
  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      email: '',
      confirmPassword: '',
      blog_name: '',
      status: 'draft',
      authers_image: '',
      description: '',
      title: '',
      socialmedia: []
    });
    setImagePreview(null);
    setImageUrl(null);
    setIsEditing(false);
    setEditingId(null);
  };

  // Validate form
  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.username.trim()) {
      errors.push('Username is required');
    }

    if (!isEditing && !formData.password) {
      errors.push('Password is required for new authors');
    }

    if (!isEditing && formData.password !== formData.confirmPassword) {
      errors.push('Passwords do not match');
    }

    return errors;
  };

  // Handle create/update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const authorData: any = {
        username: formData.username.trim(),
        email: formData.email.trim() || null,
        blog_name: formData.blog_name.trim() || null,
        status: formData.status,
        authers_image: imageUrl || formData.authers_image,
        description: formData.description.trim() || null,
        title: formData.title.trim() || null,
        socialmedia: formData.socialmedia
      };

      // Only include password for new authors or when updating password
      if (!isEditing) {
        authorData.password = formData.password;
      } else if (formData.password) {
        authorData.password = formData.password;
      }

      if (isEditing && editingId) {
        await apiPut(`/authors/${editingId}`, token, authorData);
        setSuccess('Author updated successfully!');
      } else {
        await apiPost('/authors', token, authorData);
        setSuccess('Author created successfully!');
      }

      resetForm();
      await loadData();
    } catch (err: any) {
      console.error('Failed to save author:', err);
      setError(err.message || 'Failed to save author. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (author: Author) => {
    setFormData({
      username: author.username,
      password: '',
      email: author.email || '',
      confirmPassword: '',
      blog_name: author.blog_name || '',
      status: author.status as 'publish' | 'draft' || 'draft',
      authers_image: author.authers_image || '',
      description: author.description || '',
      title: author.title || '',
      socialmedia: author.socialmedia || []
    });
    setImageUrl(author.authers_image || null);
    setImagePreview(author.authers_image || null);
    setIsEditing(true);
    setEditingId(author.id);
  };

  // Handle delete
  const handleDelete = async (id: string, username: string) => {
    if (!confirm(`Are you sure you want to delete the author "${username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await apiDelete(`/authors/${id}`, token);
      setSuccess('Author deleted successfully!');
      await loadData();
    } catch (err: any) {
      console.error('Failed to delete author:', err);
      setError(err.message || 'Failed to delete author.');
    } finally {
      setLoading(false);
    }
  };

  // Handle social media changes
  const handleSocialMediaChange = (index: number, field: string, value: string) => {
    const updatedSocialMedia = [...formData.socialmedia];
    if (!updatedSocialMedia[index]) {
      updatedSocialMedia[index] = {};
    }
    updatedSocialMedia[index][field] = value;
    setFormData({ ...formData, socialmedia: updatedSocialMedia });
  };

  const addSocialMedia = () => {
    setFormData({
      ...formData,
      socialmedia: [...formData.socialmedia, { platform: '', url: '' }]
    });
  };

  const removeSocialMedia = (index: number) => {
    const updatedSocialMedia = formData.socialmedia.filter((_, i) => i !== index);
    setFormData({ ...formData, socialmedia: updatedSocialMedia });
  };

  // Filter and sort authors
  const filteredAuthors = authors
    .filter(author => {
      const matchesSearch = author.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (author.email && author.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (author.title && author.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (author.description && author.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = !statusFilter || author.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredAuthors.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedAuthors = filteredAuthors.slice(startIndex, startIndex + pageSize);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy, sortDirection]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Authors</h1>
        <div className="text-sm text-gray-500">
          {filteredAuthors.length} of {authors.length} authors
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {isEditing ? 'Edit Author' : 'Add New Author'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-black mb-2">
                Username *
              </label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                placeholder="johndoe"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                placeholder="author@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-black mb-2">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                placeholder="e.g., Senior Dentist, Author"
              />
            </div>

            <div>
              <label htmlFor="blog_name" className="block text-sm font-medium text-black mb-2">
                Blog Name
              </label>
              <input
                id="blog_name"
                type="text"
                value={formData.blog_name}
                onChange={(e) => setFormData({ ...formData, blog_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                placeholder="Blog name..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
                Password {isEditing ? '(leave blank to keep current)' : '*'}
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                required={!isEditing}
              />
            </div>

            {!isEditing && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-2">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-black mb-2">
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'publish' | 'draft' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
              >
                <option value="draft">Draft</option>
                <option value="publish">Published</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-black mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
              placeholder="Brief description about the author..."
              rows={3}
            />
          </div>

          {/* Social Media Links */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Social Media Links
            </label>
            {formData.socialmedia.map((social, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <select
                  value={social.platform || ''}
                  onChange={(e) => handleSocialMediaChange(index, 'platform', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                >
                  <option value="">Select Platform</option>
                  <option value="Instagram">Instagram</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Twitter">Twitter</option>
                  <option value="Facebook">Facebook</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Website">Website</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="url"
                  placeholder="URL"
                  value={social.url || ''}
                  onChange={(e) => handleSocialMediaChange(index, 'url', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                />
                <button
                  type="button"
                  onClick={() => removeSocialMedia(index)}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSocialMedia}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Add Social Media
            </button>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Profile Image
            </label>
            <ImageUploadManager
              onImageUpload={(_, url) => { setImagePreview(url); setImageUrl(url); }}
              onImageRemove={() => { setImagePreview(null); setImageUrl(null); }}
              maxFileSize={5 * 1024 * 1024}
              multiple={false}
              existingImages={imagePreview ? [imagePreview] : []}
              uploadEndpoint="/image-upload/author-profile"
              showPreview={true}
            />
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{loading ? 'Saving...' : (isEditing ? 'Update Author' : 'Add Author')}</span>
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black placeholder-gray-400"
                placeholder="Search authors..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600 whitespace-nowrap">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'publish' | 'draft' | '')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-black placeholder-gray-400"
              >
                <option value="">All Status</option>
                <option value="publish">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600 whitespace-nowrap">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-black placeholder-gray-400"
              >
                <option value="username">Username</option>
                <option value="email">Email</option>
                <option value="created_at">Created Date</option>
              </select>
            </div>

            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
              title={`Sort ${sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Authors Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Social Media</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
                      <span>Loading authors...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedAuthors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    {searchTerm || statusFilter ? 'No authors found matching your filters.' : 'No authors found. Create your first author above.'}
                  </td>
                </tr>
              ) : (
                paginatedAuthors.map((author) => (
                  <tr key={author.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {author.authers_image ? (
                        <img
                          src={author.authers_image}
                          alt={`${author.username} avatar`}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{author.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{author.email || '—'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{author.title || '—'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        author.status === 'publish' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {author.status === 'publish' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {author.socialmedia && author.socialmedia.length > 0
                          ? `${author.socialmedia.length} link${author.socialmedia.length > 1 ? 's' : ''}`
                          : '—'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {new Date(author.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEdit(author)}
                          className="text-teal-600 hover:text-teal-900 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(author.id, author.username)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
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
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 rounded-lg shadow-sm border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-gray-300 rounded text-sm text-black placeholder-gray-400"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-700">per page</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm text-black placeholder-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex items-center space-x-1 text-black placeholder-gray-400">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 text-sm rounded ${
                        currentPage === pageNum
                          ? 'bg-teal-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 text-black placeholder-gray-400 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>

            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
