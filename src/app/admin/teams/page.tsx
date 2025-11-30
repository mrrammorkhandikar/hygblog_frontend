'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiDelete, apiPut } from '../api';
import ImageUploadManager from '../../../components/ImageUploadManager';

type Team = {
  id: string;
  name: string;
  title?: string;
  description?: string;
  socialmedia: any[];
  image?: string;
  created_at: string;
  updated_at: string;
};

export default function AdminTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    socialmedia: [] as any[]
  });

  // Image upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'title' | 'created_at'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  // Load teams
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const teamsData = await apiGet<Team[]>('/teams', token);
      setTeams(Array.isArray(teamsData) ? teamsData : []);
    } catch (err: any) {
      console.error('Failed to load teams:', err);
      setError('Failed to load teams. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      description: '',
      socialmedia: []
    });
    setImageFile(null);
    setImagePreview(null);
    setImageUrl(null);
    setIsEditing(false);
    setEditingId(null);
  };

  // Validate form
  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.name.trim()) {
      errors.push('Team name is required');
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
      const teamData: any = {
        name: formData.name.trim(),
        title: formData.title.trim() || null,
        description: formData.description.trim() || null,
        socialmedia: formData.socialmedia,
        image: imageUrl
      };

      if (isEditing && editingId) {
        await apiPut(`/teams/${editingId}`, token, teamData);
      } else {
        await apiPost('/teams', token, teamData);
      }

      resetForm();
      await loadData();
    } catch (err: any) {
      console.error('Failed to save team:', err);
      setError(err.message || 'Failed to save team. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (team: Team) => {
    setFormData({
      name: team.name,
      title: team.title || '',
      description: team.description || '',
      socialmedia: team.socialmedia || []
    });
    setImageUrl(team.image || null);
    setImagePreview(team.image || null);
    setIsEditing(true);
    setEditingId(team.id);
  };

  // Handle delete
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the team "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await apiDelete(`/teams/${id}`, token);
      setSuccess('Team and associated image deleted successfully!');
      await loadData();
    } catch (err: any) {
      console.error('Failed to delete team:', err);
      setError(err.message || 'Failed to delete team. It may be in use by posts.');
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

  // Filter and sort teams
  const filteredTeams = teams
    .filter(team => {
      const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (team.title && team.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (team.description && team.description.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesSearch;
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
  const totalPages = Math.ceil(filteredTeams.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTeams = filteredTeams.slice(startIndex, startIndex + pageSize);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortDirection]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
        <div className="text-sm text-gray-500">
          {filteredTeams.length} of {teams.length} teams
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
          {isEditing ? 'Edit Team' : 'Add New Team'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
                Name *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                placeholder="Team name..."
                required
              />
            </div>

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
                placeholder="Team title..."
              />
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
              placeholder="Team description..."
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
              Team Image
            </label>
            <ImageUploadManager
              onImageUpload={(file, url) => { setImageFile(file); setImagePreview(url); setImageUrl(url); }}
              onImageRemove={() => { setImageFile(null); setImagePreview(null); setImageUrl(null); }}
              maxFileSize={5 * 1024 * 1024}
              multiple={false}
              existingImages={imagePreview ? [imagePreview] : []}
              uploadEndpoint="/image-upload/team-image"
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
              <span>{loading ? 'Saving...' : (isEditing ? 'Update Team' : 'Add Team')}</span>
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
                placeholder="Search teams..."
              />
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
                <option value="name">Name</option>
                <option value="title">Title</option>
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

      {/* Teams Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Social Media</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
                      <span>Loading teams...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedTeams.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    {searchTerm ? 'No teams found matching your filters.' : 'No teams found. Create your first team above.'}
                  </td>
                </tr>
              ) : (
                paginatedTeams.map((team) => (
                  <tr key={team.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {team.image ? (
                        <img
                          src={team.image}
                          alt={`${team.name} image`}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{team.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{team.title || '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {team.description || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {team.socialmedia && team.socialmedia.length > 0
                          ? `${team.socialmedia.length} link${team.socialmedia.length > 1 ? 's' : ''}`
                          : '—'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {new Date(team.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEdit(team)}
                          className="text-teal-600 hover:text-teal-900 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(team.id, team.name)}
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
