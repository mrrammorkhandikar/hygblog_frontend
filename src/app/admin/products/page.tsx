'use client';
import { useEffect, useState, useCallback } from 'react';
import { apiGet, apiPost, apiDelete, apiPut } from '../api';
import ImageUploadManager from '../../../components/ImageUploadManager';

type Product = {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  price_numeric: number | null;
  price_text: string | null;
  images: any[] | null;
  preview_pdf: string | null;
  buy_link: string | null;
  features: any[] | null;
  metadata: any | null;
  created_at: string;
  updated_at: string;
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    price_numeric: '',
    price_text: '',
    images: [] as any[],
    preview_pdf: '',
    buy_link: '',
    features: [] as string[],
    metadata: {}
  });

  // Image upload - now supports multiple images
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // PDF upload
  const [uploadedPdf, setUploadedPdf] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>('');

  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'created_at'>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  // Load products
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const productsData = await apiGet<Product[]>('/products', token);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err: any) {
      console.error('Failed to load products:', err);
      setError('Failed to load products. Please try again.');
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
      title: '',
      author: '',
      description: '',
      price_numeric: '',
      price_text: '',
      images: [],
      preview_pdf: '',
      buy_link: '',
      features: [],
      metadata: {}
    });
    setUploadedImages([]);
    setUploadedPdf(null);
    setPdfFileName('');
    setIsEditing(false);
    setEditingId(null);
  };

  // Validate form
  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.title.trim()) {
      errors.push('Title is required');
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
      const productData: any = {
        title: formData.title.trim(),
        author: formData.author.trim() || null,
        description: formData.description.trim() || null,
        price_numeric: formData.price_numeric ? parseFloat(formData.price_numeric) : null,
        price_text: formData.price_text.trim() || null,
        images: formData.images,
        preview_pdf: formData.preview_pdf.trim() || null,
        buy_link: formData.buy_link.trim() || null,
        features: formData.features,
        metadata: formData.metadata
      };

      if (isEditing && editingId) {
        await apiPut(`/products/${editingId}`, token, productData);
        setSuccess('Product updated successfully!');
      } else {
        await apiPost('/products', token, productData);
        setSuccess('Product created successfully!');
      }

      resetForm();
      await loadData();

      // Reload the page to show updated data
      window.location.reload();
    } catch (err: any) {
      console.error('Failed to save product:', err);
      setError(err.message || 'Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (product: Product) => {
    console.log('Editing product:', product);
    console.log('Product images:', product.images);

    setFormData({
      title: product.title,
      author: product.author || '',
      description: product.description || '',
      price_numeric: product.price_numeric?.toString() || '',
      price_text: product.price_text || '',
      images: product.images || [],
      preview_pdf: product.preview_pdf || '',
      buy_link: product.buy_link || '',
      features: product.features || [],
      metadata: product.metadata || {}
    });

    // Load existing images for editing
    const existingImages = product.images ? product.images.map(img => {
      // Handle different image formats: objects with path property or direct URLs
      if (typeof img === 'string') {
        return img;
      } else if (img && typeof img === 'object' && img.path) {
        return img.path;
      }
      return '';
    }).filter(url => url !== '') : [];

    console.log('Extracted image URLs:', existingImages);
    setUploadedImages(existingImages);

    // Load existing PDF for editing
    if (product.preview_pdf) {
      setUploadedPdf(product.preview_pdf);
      // Extract filename from URL or use a default display name
      const urlParts = product.preview_pdf.split('/');
      const fileName = urlParts[urlParts.length - 1] || 'uploaded-pdf.pdf';
      setPdfFileName(fileName);
    } else {
      setUploadedPdf(null);
      setPdfFileName('');
    }

    setIsEditing(true);
    setEditingId(product.id);
  };

  // Handle delete
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the product "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await apiDelete(`/products/${id}`, token);
      setSuccess('Product deleted successfully!');
      await loadData();
    } catch (err: any) {
      console.error('Failed to delete product:', err);
      setError(err.message || 'Failed to delete product.');
    } finally {
      setLoading(false);
    }
  };

  // Handle features changes
  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = value;
    setFormData({ ...formData, features: updatedFeatures });
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    });
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: updatedFeatures });
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.author && product.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));

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
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pageSize);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortDirection]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <div className="text-sm text-gray-500">
          {filteredProducts.length} of {products.length} products
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
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-black mb-2">
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                placeholder="Product title..."
                required
              />
            </div>

            <div>
              <label htmlFor="author" className="block text-sm font-medium text-black mb-2">
                Author
              </label>
              <input
                id="author"
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                placeholder="Author name..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price_numeric" className="block text-sm font-medium text-black mb-2">
                Price (Numeric)
              </label>
              <input
                id="price_numeric"
                type="number"
                step="0.01"
                value={formData.price_numeric}
                onChange={(e) => setFormData({ ...formData, price_numeric: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                placeholder="299.00"
              />
            </div>

            <div>
              <label htmlFor="price_text" className="block text-sm font-medium text-black mb-2">
                Price (Text)
              </label>
              <input
                id="price_text"
                type="text"
                value={formData.price_text}
                onChange={(e) => setFormData({ ...formData, price_text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                placeholder="₹299"
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
              placeholder="Product description..."
              rows={3}
            />
          </div>

          {/* PDF Upload */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Preview PDF
            </label>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept=".pdf"
                onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const token = localStorage.getItem('adminToken');

                        // Check if token exists
                        if (!token) {
                          throw new Error('Authentication required. Please log in again.');
                        }

                        const formDataUpload = new FormData();
                        formDataUpload.append('productPdf', file);

                        console.log('Uploading PDF:', file.name, 'Size:', file.size);

                        const response = await fetch('/api/image-upload/product-pdf', {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${token}`
                          },
                          body: formDataUpload
                        });

                        console.log('Response status:', response.status, response.statusText);

                        if (!response.ok) {
                          let errorMessage = `Upload failed (${response.status})`;
                          try {
                            const errorData = await response.json();
                            console.error('Server error response:', errorData);
                            errorMessage = errorData.error || errorMessage;
                          } catch (parseError) {
                            console.error('Could not parse error response:', parseError);
                            // Try to get text response
                            try {
                              const textResponse = await response.text();
                              console.error('Raw error response:', textResponse);
                            } catch (textError) {
                              console.error('Could not get text response either:', textError);
                            }
                          }
                          throw new Error(errorMessage);
                        }

                        const result = await response.json();
                        console.log('Upload successful:', result);
                        setUploadedPdf(result.url);
                        setPdfFileName(file.name);
                        setFormData(prev => ({ ...prev, preview_pdf: result.url }));
                        setError(null); // Clear any previous errors
                        setSuccess('PDF uploaded successfully!');
                      } catch (error) {
                        console.error('PDF upload failed:', error);
                        const errorMessage = error instanceof Error ? error.message : 'Failed to upload PDF. Please try again.';
                        setError(`PDF Upload Error: ${errorMessage}`);
                      }
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                />
                {uploadedPdf && (
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedPdf(null);
                      setPdfFileName('');
                      setFormData(prev => ({ ...prev, preview_pdf: '' }));
                    }}
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>

              {uploadedPdf && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>📄</span>
                  <span>{pdfFileName}</span>
                  <a
                    href={uploadedPdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-900 underline"
                  >
                    View PDF
                  </a>
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="buy_link" className="block text-sm font-medium text-black mb-2">
              Buy Link
            </label>
            <input
              id="buy_link"
              type="url"
              value={formData.buy_link}
              onChange={(e) => setFormData({ ...formData, buy_link: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
              placeholder="https://..."
            />
          </div>

          {/* Current Product Images Preview */}
          {uploadedImages.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Current Images ({uploadedImages.length})
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                {uploadedImages.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={imageUrl}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        console.log('Removing image:', imageUrl);
                        setUploadedImages(prev => {
                          const filtered = prev.filter(img => img !== imageUrl);
                          console.log('Updated uploadedImages after removal:', filtered);
                          return filtered;
                        });
                        // Remove from formData.images
                        setFormData(prev => {
                          const filtered = prev.images.filter(img => img.path !== imageUrl);
                          console.log('Updated formData.images after removal:', filtered);
                          return {
                            ...prev,
                            images: filtered
                          };
                        });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Remove image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product Images Upload */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              {uploadedImages.length > 0 ? 'Add More Images' : 'Product Images (1-5 images)'}
            </label>
            <ImageUploadManager
              onImageUpload={(_, url) => {
                console.log('Image uploaded:', url);
                setUploadedImages(prev => {
                  const newImages = [...prev, url];
                  console.log('Updated uploadedImages:', newImages);
                  return newImages;
                });
                // Update formData.images with the new image
                setFormData(prev => {
                  const newImages = [...prev.images, { path: url, order: prev.images.length }];
                  console.log('Updated formData.images:', newImages);
                  return {
                    ...prev,
                    images: newImages
                  };
                });
              }}
              onImageRemove={(url) => {
                console.log('Removing image:', url);
                setUploadedImages(prev => {
                  const filtered = prev.filter(img => img !== url);
                  console.log('Updated uploadedImages after removal:', filtered);
                  return filtered;
                });
                // Remove from formData.images
                setFormData(prev => {
                  const filtered = prev.images.filter(img => img.path !== url);
                  console.log('Updated formData.images after removal:', filtered);
                  return {
                    ...prev,
                    images: filtered
                  };
                });
              }}
              maxFileSize={5 * 1024 * 1024}
              multiple={true}
              existingImages={[]} // Don't show existing images in the upload component since we show them above
              uploadEndpoint="/image-upload/product-images"
              showPreview={false} // Disable preview in upload component since we show current images above
            />
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Features
            </label>
            {formData.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  placeholder="Feature description..."
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                />
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addFeature}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Add Feature
            </button>
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
              <span>{loading ? 'Saving...' : (isEditing ? 'Update Product' : 'Add Product')}</span>
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
                placeholder="Search products..."
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
                <option value="title">Title</option>
                <option value="author">Author</option>
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

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Features</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
                      <span>Loading products...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    {searchTerm ? 'No products found matching your filters.' : 'No products found. Create your first product above.'}
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.title}</div>
                      {product.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {product.description.substring(0, 50)}...
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{product.author || '—'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {product.price_text || (product.price_numeric ? `₹${product.price_numeric}` : '—')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {product.features && product.features.length > 0
                          ? `${product.features.length} feature${product.features.length > 1 ? 's' : ''}`
                          : '—'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {new Date(product.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-teal-600 hover:text-teal-900 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.title)}
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
