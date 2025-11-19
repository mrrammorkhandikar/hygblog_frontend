'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiDelete, apiPut } from '../api';
import ImageUploadManager from '../../../components/ImageUploadManager';

type Tag = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  image_url?: string;
  category_id?: string;
  tag_type: 'regular' | 'cloud' | 'seo';
  created_at: string;
  updated_at: string;
};

type Category = {
  id: string;
  name: string;
};

type TagType = 'regular' | 'cloud' | 'seo';

export default function AdminTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [slugOptions, setSlugOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category_id: '',
    tag_type: 'regular' as TagType
  });
  
  // Image upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [tagTypeFilter, setTagTypeFilter] = useState<TagType | ''>('');
  const [sortBy, setSortBy] = useState<'name' | 'slug' | 'created_at' | 'tag_type'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  // Load tags, categories, and slug options
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tagsData, categoriesData, slugOptionsData] = await Promise.all([
        apiGet<Tag[]>('/tags', token),
        apiGet<Category[]>('/categories', token),
        apiGet<{slugs: string[]}>('/tags/slug-options', token)
      ]);
      setTags(Array.isArray(tagsData) ? tagsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setSlugOptions(slugOptionsData?.slugs || []);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError('Failed to load tags and categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  // Reset form when tag type changes
  useEffect(() => {
    if (formData.tag_type !== 'regular') {
      setFormData(prev => ({
        ...prev,
        slug: '',
        category_id: ''
      }));
      setImageFile(null);
      setImagePreview(null);
      setImageUrl(null);
    }
  }, [formData.tag_type]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      category_id: '',
      tag_type: 'regular' as TagType
    });
    setImageFile(null);
    setImagePreview(null);
    setImageUrl(null);
    setIsEditing(false);
    setEditingId(null);
  };

  // Validate form based on tag type
  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.name.trim()) {
      errors.push('Tag name is required');
    }

    if (formData.tag_type === 'regular') {
      if (!formData.slug) {
        errors.push('Slug is required for regular tags');
      }
      if (!slugOptions.includes(formData.slug)) {
        errors.push('Please select a valid slug from the dropdown');
      }

      // For regular tags, image is required when creating new tags
      if (!isEditing && !imageUrl && !imagePreview) {
        errors.push('Tag image is required for regular tags');
      }
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
      const tagData: any = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        tag_type: formData.tag_type
      };

      // Add type-specific fields
      if (formData.tag_type === 'regular') {
        tagData.slug = formData.slug;
        tagData.category_id = formData.category_id || null;
        if (imageUrl) {
          tagData.image_url = imageUrl;
        }
      }

      if (isEditing && editingId) {
        await apiPut(`/tags/${editingId}`, token, tagData);
      } else {
        await apiPost('/tags', token, tagData);
      }

      resetForm();
      await loadData();
    } catch (err: any) {
      console.error('Failed to save tag:', err);
      setError(err.message || 'Failed to save tag. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (tag: Tag) => {
    setFormData({
      name: tag.name,
      slug: tag.slug || '',
      description: tag.description || '',
      category_id: tag.category_id || '',
      tag_type: tag.tag_type
    });
    setImageUrl(tag.image_url || null);
    setImagePreview(tag.image_url || null);
    setIsEditing(true);
    setEditingId(tag.id);
  };

  // Handle delete
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the tag "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await apiDelete(`/tags/${id}`, token);
      setSuccess('Tag and associated image deleted successfully!');
      await loadData();
    } catch (err: any) {
      console.error('Failed to delete tag:', err);
      setError(err.message || 'Failed to delete tag. It may be in use by posts.');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort tags
  const filteredTags = tags
    .filter(tag => {
      const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (tag.slug && tag.slug.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (tag.description && tag.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = !categoryFilter || tag.category_id === categoryFilter;
      const matchesTagType = !tagTypeFilter || tag.tag_type === tagTypeFilter;
      
      return matchesSearch && matchesCategory && matchesTagType;
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
  const totalPages = Math.ceil(filteredTags.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTags = filteredTags.slice(startIndex, startIndex + pageSize);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, tagTypeFilter, sortBy, sortDirection]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
        <div className="text-sm text-gray-500">
          {filteredTags.length} of {tags.length} tags
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
          {isEditing ? 'Edit Tag' : 'Add New Tag'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tag Type Selector */}
          <div>
            <label htmlFor="tag_type" className="block text-sm font-medium text-black mb-2">
              Type Of Tag *
            </label>
            <select
              id="tag_type"
              value={formData.tag_type}
              onChange={(e) => setFormData({ ...formData, tag_type: e.target.value as TagType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
              required
            >
              <option value="regular">Tags</option>
              <option value="cloud">Cloud Tags</option>
              <option value="seo">SEO Tags</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
                Name *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setFormData({
                    ...formData,
                    name
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                placeholder="Tag name..."
                required
              />
            </div>

            {/* Slug field - only for regular tags */}
            {formData.tag_type === 'regular' && (
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-black mb-2">
                  Slug *
                </label>
                <select
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                  required
                >
                  <option value="">Select a slug...</option>
                  {slugOptions.map(slug => (
                    <option key={slug} value={slug}>
                      {slug.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category field - only for regular tags */}
            {formData.tag_type === 'regular' && (
              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-black mb-2">
                  Category
                </label>
                <select
                  id="category_id"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                >
                  <option value="">No category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-black mb-2">
                Description
              </label>
              <input
                id="description"
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                placeholder="Tag description..."
              />
            </div>
          </div>

          {/* Image Upload - only for regular tags */}
          {formData.tag_type === 'regular' && (
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Tag Image *
              </label>
              <ImageUploadManager
                onImageUpload={(file, url) => { setImageFile(file); setImagePreview(url); setImageUrl(url); }}
                onImageRemove={() => { setImageFile(null); setImagePreview(null); setImageUrl(null); }}
                maxFileSize={5 * 1024 * 1024}
                multiple={false}
                existingImages={imagePreview ? [imagePreview] : []}
                uploadEndpoint="/image-upload/tag-image"
                showPreview={true}
              />
            </div>
          )}

          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{loading ? 'Saving...' : (isEditing ? 'Update Tag' : 'Add Tag')}</span>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Search tags..."
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600 whitespace-nowrap">Type:</label>
              <select
                value={tagTypeFilter}
                onChange={(e) => setTagTypeFilter(e.target.value as TagType | '')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Types</option>
                <option value="regular">Tags</option>
                <option value="cloud">Cloud Tags</option>
                <option value="seo">SEO Tags</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600 whitespace-nowrap">Category:</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600 whitespace-nowrap">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="name">Name</option>
                <option value="slug">Slug</option>
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

      {/* Tags Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
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
                      <span>Loading tags...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedTags.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    {searchTerm || categoryFilter || tagTypeFilter ? 'No tags found matching your filters.' : 'No tags found. Create your first tag above.'}
                  </td>
                </tr>
              ) : (
                paginatedTags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tag.image_url ? (
                        <img
                          src={tag.image_url}
                          alt={`${tag.name} image`}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{tag.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        tag.tag_type === 'regular' ? 'bg-blue-100 text-blue-800' :
                        tag.tag_type === 'cloud' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {tag.tag_type === 'regular' ? 'Tags' :
                         tag.tag_type === 'cloud' ? 'Cloud Tags' :
                         'SEO Tags'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 font-mono">{tag.slug || '—'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {tag.category_id ? 
                          categories.find(c => c.id === tag.category_id)?.name || 'Unknown' : 
                          '—'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {tag.description || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {new Date(tag.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEdit(tag)}
                          className="text-teal-600 hover:text-teal-900 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(tag.id, tag.name)}
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
                className="px-2 py-1 border border-gray-300 rounded text-sm"
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
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center space-x-1">
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
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
