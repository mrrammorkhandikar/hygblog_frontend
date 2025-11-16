'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiDelete, apiPut } from '../app/admin/api';

interface ImageData {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  uploadDate: string;
  path: string;
  url: string;
  folder?: string;
}

interface ImageManagementTableProps {
  token: string;
  onImageSelect?: (image: ImageData) => void;
  selectable?: boolean;
}

export default function ImageManagementTable({ token, onImageSelect, selectable = false }: ImageManagementTableProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [folderFilter, setFolderFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingImage, setEditingImage] = useState<ImageData | null>(null);
  const [newFilename, setNewFilename] = useState('');

  // Load folders for filter
  useEffect(() => {
    if (!token) return;
    apiGet<{ success: boolean; data: string[] }>('/images/folders/list', token)
      .then(response => {
        // Handle the API response structure
        if (response && response.data && Array.isArray(response.data)) {
          setFolders(response.data);
        } else {
          setFolders([]);
        }
      })
      .catch(error => {
        console.error('Error loading folders:', error);
        setFolders([]);
      });
  }, [token]);

  // Load images with filters
  const loadImages = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(folderFilter && { folder: folderFilter }),
      });

      const response = await apiGet<{
        success: boolean;
        data: ImageData[];
        pagination: {
          total: number;
          page: number;
          totalPages: number;
          limit: number;
        };
      }>(`/images?${params}`, token);

      setImages(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load images:', err);
      setError('Failed to load images. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, pageSize, searchTerm, folderFilter]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, folderFilter]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  const handleDelete = async (image: ImageData) => {
    try {
      await apiDelete(`/images/${image.id}`, token);
      await loadImages();
      setShowDeleteModal(false);
      setSelectedImage(null);
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete image. Please try again.');
    }
  };

  const handleEdit = async () => {
    if (!editingImage || !newFilename.trim()) return;

    try {
      await apiPut(`/images/${editingImage.id}`, token, {
        filename: newFilename.trim()
      });

      await loadImages();
      setShowEditModal(false);
      setEditingImage(null);
      setNewFilename('');
    } catch (err) {
      console.error('Edit failed:', err);
      alert('Failed to update image. Please try again.');
    }
  };

  const openEditModal = (image: ImageData) => {
    setEditingImage(image);
    setNewFilename(image.originalName.replace(/\.[^/.]+$/, "")); // Remove extension
    setShowEditModal(true);
  };

  const openDetailModal = (image: ImageData) => {
    setSelectedImage(image);
    setShowDetailModal(true);
  };

  const openDeleteModal = (image: ImageData) => {
    setSelectedImage(image);
    setShowDeleteModal(true);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Images
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search by filename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black placeholder-gray-500"
            />
          </div>

          {/* Folder Filter */}
          <div>
            <label htmlFor="folder" className="block text-sm font-medium text-gray-700 mb-1">
              Folder
            </label>
            <select
              id="folder"
              value={folderFilter}
              onChange={(e) => setFolderFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black placeholder-gray-500  "
            >
              <option value="">All Folders</option>
              {folders.map(folder => (
                <option key={folder} value={folder}>{folder}</option>
              ))}
            </select>
          </div>

          {/* Page Size */}
          <div>
            <label htmlFor="pageSize" className="block text-sm font-medium text-gray-700 mb-1">
              Per Page
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black placeholder-gray-500"
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading images...</p>
        </div>
      )}

      {/* Images Table */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preview
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Filename
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Folder
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {images.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No images found
                    </td>
                  </tr>
                ) : (
                  images.map((image) => (
                    <tr key={image.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <img
                          src={image.url}
                          alt={image.originalName}
                          className="w-16 h-16 object-cover rounded-lg border cursor-pointer"
                          onClick={() => openDetailModal(image)}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">{image.originalName}</div>
                        <div className="text-sm text-gray-500">{image.filename}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {formatFileSize(image.size)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {formatDate(image.uploadDate)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {image.folder || 'default'}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          {selectable && (
                            <button
                              onClick={() => onImageSelect?.(image)}
                              className="text-teal-600 hover:text-teal-900 font-medium"
                            >
                              Select
                            </button>
                          )}
                          <button
                            onClick={() => openDetailModal(image)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => openEditModal(image)}
                            className="text-green-600 hover:text-green-900 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteModal(image)}
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
          {images.length > 0 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-700">
                  Showing page {currentPage} of {totalPages}
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
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
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

      {/* Detail Modal */}
      {showDetailModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Image Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <img
                src={selectedImage.url}
                alt={selectedImage.originalName}
                className="max-w-full h-auto rounded-lg border"
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Original Name:</strong> {selectedImage.originalName}
                </div>
                <div>
                  <strong>Filename:</strong> {selectedImage.filename}
                </div>
                <div>
                  <strong>Size:</strong> {formatFileSize(selectedImage.size)}
                </div>
                <div>
                  <strong>Upload Date:</strong> {formatDate(selectedImage.uploadDate)}
                </div>
                <div>
                  <strong>Folder:</strong> {selectedImage.folder || 'default'}
                </div>
                <div>
                  <strong>Path:</strong> {selectedImage.path}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Image</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filename (without extension)
                </label>
                <input
                  type="text"
                  value={newFilename}
                  onChange={(e) => setNewFilename(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirm Delete</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <p>Are you sure you want to delete "{selectedImage.originalName}"? This action cannot be undone.</p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(selectedImage)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}