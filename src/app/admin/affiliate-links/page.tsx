'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../api';
import { useRouter } from 'next/navigation';

type AffiliateLink = {
  id: string;
  name: string;
  url: string;
  provider: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export default function AffiliateLinksPage() {
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<AffiliateLink | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    provider: '',
    description: '',
    is_active: true,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Search, sort, pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'provider'>('created_at');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  const loadAffiliateLinks = useCallback(async () => {
    if (!token) {
      router.push('/admin/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sortBy,
        sortOrder: sortDirection,
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await apiGet<{ data: AffiliateLink[]; pagination: { total: number; totalPages: number } }>(
        `/affiliate-links?${queryParams.toString()}`,
        token
      );
      setAffiliateLinks(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      console.error('Failed to load affiliate links:', err);
      const errorMessage = err.response?.data?.message || err.message || String(err);
      setError(`Failed to load affiliate links: ${errorMessage}`);
      if (err.message.includes('401')) {
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  }, [token, router, currentPage, pageSize, sortBy, sortDirection, searchTerm]);

  useEffect(() => {
    loadAffiliateLinks();
  }, [loadAffiliateLinks]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const { name, value, type } = e.target as HTMLInputElement;
  const checked = (e.target as HTMLInputElement).checked;
  setFormData((prev) => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : value,
  }));
  setErrors((prev) => ({ ...prev, [name]: '' })); // Clear error for the changed field
  validateForm(); // Re-run validation to update errors state
};

const validateForm = useCallback(() => {
  const newErrors: { [key: string]: string } = {};
  if (!formData.name.trim()) {
    newErrors.name = 'Product Name is required.';
  } else if (formData.name.trim().length > 255) {
    newErrors.name = 'Product Name cannot exceed 255 characters.';
  }

  if (!formData.url.trim()) {
    newErrors.url = 'Affiliate URL is required.';
  } else if (!/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/i.test(formData.url)) {
    newErrors.url = 'Please enter a valid URL (e.g., https://example.com).';
  }

  if (!formData.provider.trim()) {
    newErrors.provider = 'Provider is required.';
  } else if (formData.provider.trim().length > 255) {
    newErrors.provider = 'Provider cannot exceed 255 characters.';
  }

  if (formData.description && formData.description.length > 1000) {
    newErrors.description = 'Description cannot exceed 1000 characters.';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
}, [formData]);

  const handleAddEditLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Authentication token not found. Please log in.');
      return;
    }

    setLoading(true);
    setErrors({}); // Clear previous errors
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      setLoading(false); // Stop loading if validation fails
      setError('Please correct the errors in the form.');
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        url: formData.url.trim(),
        provider: formData.provider.trim(),
        description: formData.description?.trim() || null,
        is_active: formData.is_active,
      };

      if (editingLink) {
        await apiPut(`/affiliate-links/${editingLink.id}`, token, payload);
        setSuccess('Affiliate link updated successfully!');
      } else {
        await apiPost('/affiliate-links', token, payload);
        setSuccess('Affiliate link added successfully!');
      }
      await loadAffiliateLinks();
      closeModal();
    } catch (err: any) {
      console.error('Failed to save affiliate link:', err);
      const errorMessage = err.response?.data?.message || err.message || String(err);
      setError(`Failed to save affiliate link: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (link: AffiliateLink) => {
    setEditingLink(link);
    setFormData({
      name: link.name,
      url: link.url,
      provider: link.provider,
      description: link.description || '',
      is_active: link.is_active,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the affiliate link "${name}"?`)) return;
    if (!token) {
      setError('Authentication token not found. Please log in.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await apiDelete(`/affiliate-links/${id}`, token);
      setSuccess('Affiliate link deleted successfully!');
      await loadAffiliateLinks();
    } catch (err: any) {
      console.error('Failed to delete affiliate link:', err);
      const errorMessage = err.response?.data?.message || err.message || String(err);
      setError(`Failed to delete affiliate link: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setEditingLink(null);
    setFormData({
      name: '',
      url: '',
      provider: '',
      description: '',
      is_active: true,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLink(null);
  };

  if (loading) {
    return <div className="text-center py-8">Loading affiliate links...</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Affiliate Links Management</h1>

      {/* Notifications */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="flex justify-end mb-4">
        <button
          onClick={openModal}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md shadow-sm transition-colors"
        >
          Add New Affiliate Link
        </button>
      </div>

      {/* Search, Sort, Pagination Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Search affiliate links..."
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as 'name' | 'created_at' | 'provider');
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="name">Name</option>
                <option value="provider">Provider</option>
                <option value="created_at">Created Date</option>
              </select>
            </div>

            <button
              onClick={() => {
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                setCurrentPage(1);
              }}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
              title={`Sort ${sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </button>

            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Page size:</label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {affiliateLinks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No affiliate links found. Click "Add New Affiliate Link" to create one.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {affiliateLinks.map((link) => (
                <tr key={link.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{link.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline">
                    <a href={link.url} target="_blank" rel="noopener noreferrer">{link.url}</a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{link.provider}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{link.description || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        link.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {link.is_active ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditClick(link)}
                      className="text-teal-600 hover:text-teal-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(link.id, link.name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal for Add/Edit Affiliate Link */}
      {isModalOpen && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
    <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {editingLink ? 'Edit Affiliate Link' : 'Add New Affiliate Link'}
      </h2>
      <form onSubmit={handleAddEditLink} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Product Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            maxLength={255}
            placeholder="Enter product name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700">
            Affiliate URL
          </label>
          <input
            type="url"
            name="url"
            id="url"
            value={formData.url}
            onChange={handleInputChange}
            onBlur={(e) => {
              if (e.target.value && !e.target.value.startsWith('http://') && !e.target.value.startsWith('https://')) {
                setFormData((prev) => ({ ...prev, url: `https://${e.target.value}` }));
                validateForm();
              }
            }}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            placeholder="https://example.com/affiliate-link"
          />
          {errors.url && <p className="mt-1 text-sm text-red-600">{errors.url}</p>}
        </div>
        <div>
          <label htmlFor="provider" className="block text-sm font-medium text-gray-700">
            Provider
          </label>
          <input
            type="text"
            name="provider"
            id="provider"
            value={formData.provider}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            maxLength={255}
            placeholder="Enter provider name (e.g., Amazon, eBay)"
          />
          {errors.provider && <p className="mt-1 text-sm text-red-600">{errors.provider}</p>}
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Product Description (Optional)
          </label>
          <textarea
            name="description"
            id="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            maxLength={1000}
            placeholder="Provide a brief description of the product"
          ></textarea>
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="is_active" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900">
              {formData.is_active ? 'Active' : 'Inactive'}
            </span>
          </label>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || Object.keys(errors).length > 0}
            aria-disabled={loading || Object.keys(errors).length > 0}
            aria-busy={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {editingLink ? 'Saving...' : 'Adding...'}
              </>
            ) : (
              editingLink ? 'Save Changes' : 'Add Link'
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
}