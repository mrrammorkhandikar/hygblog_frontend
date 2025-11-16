'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost, apiPut, apiDelete } from '../api';

type Author = {
  id: string;
  username: string;
  email: string | null;
  blog: any | null;
  blog_name: string | null;
  status: 'publish' | 'draft' | null;
  created_at: string;
  updated_at: string;
};

type AuthorForm = {
  username: string;
  password: string;
  email?: string;
  confirmPassword?: string;
  blog_name?: string; // Optional, will be null
  status?: 'publish' | 'draft'; // Optional, will be null
};

export default function AuthorManagement() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [formData, setFormData] = useState<AuthorForm>({
    username: '',
    password: '',
    email: '',
    confirmPassword: '',
    blog_name: '',
    status: 'draft',
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  // === Auth Check ===
  useEffect(() => {
    setIsClient(true);
    const adminToken = localStorage.getItem('adminToken');
    setToken(adminToken);
  }, []);

  useEffect(() => {
    if (!isClient || !token) return;
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchAuthors();
  }, [token, router, isClient]);

  // === Fetch Authors ===
  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const data = await apiGet<Author[]>('/authors', token);
      setAuthors(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch authors');
    } finally {
      setLoading(false);
    }
  };

  // === Form Validation ===
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!formData.username.trim()) errors.username = 'Username is required';
    if (!editingAuthor && !formData.password) errors.password = 'Password is required';
    if (!editingAuthor && formData.password !== formData.confirmPassword)
      errors.confirmPassword = 'Passwords do not match';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // === Submit (Create / Update) === =
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      console.log('Frontend: Attempting to save author');
      console.log('Frontend: editingAuthor?', !!editingAuthor);
      console.log('Frontend: token exists?', !!token);

      const payload: any = {
        username: formData.username.trim(),
        email: formData.email?.trim() || null,
        blog_name: formData.blog_name?.trim() || null,
        status: formData.status || 'draft',
        password: !editingAuthor ? formData.password : undefined,
      };

      // For editing, allow updating password if provided
      if (editingAuthor && formData.password) {
        payload.password = formData.password;
      }

      console.log('Frontend: Sending payload:', payload);

      if (editingAuthor) {
        console.log('Frontend: Updating existing author');
        await apiPut(`/authors/${editingAuthor.id}`, token, payload);
      } else {
        console.log('Frontend: Creating new author');
        await apiPost('/authors', token, payload);
      }

      console.log('Frontend: Success! Closing modal');
      closeModal();
      fetchAuthors();
    } catch (err: any) {
      console.log('Frontend: Error occurred:', err);
      console.log('Frontend: Error status:', err.status);
      console.log('Frontend: Error details:', err.details);
      setError(err.message || 'Failed to save author');
    }
  };

  // === Edit Author ===
  const handleEdit = (author: Author) => {
    setEditingAuthor(author);
    setFormData({
      username: author.username,
      password: '',
      email: author.email || '',
      confirmPassword: '',
      blog_name: author.blog_name || '',
      status: author.status as 'publish' | 'draft' || undefined,
    });
    setShowModal(true);
  };

  // === Delete Author ===
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this author? This cannot be undone.')) return;
    try {
      await apiDelete(`/authors/${id}`, token);
      fetchAuthors();
    } catch (err: any) {
      setError(err.message || 'Failed to delete author');
    }
  };

  // === Close Modal & Reset ===
  const closeModal = () => {
    setShowModal(false);
    setEditingAuthor(null);
    setFormData({ username: '', password: '', email: '', confirmPassword: '', blog_name: '', status: 'draft' });
    setFormErrors({});
  };

  if (!isClient || !token) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Authors</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Author
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading authors...</div>
      ) : authors.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H9a4 4 0 01-4-4v-1m10 0v1a4 4 0 01-4 4m4-4H9" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No authors yet</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first author.</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add First Author
          </button>
        </div>
      ) : (
        /* Authors Table */
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blog Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {authors.map((author) => (
                  <tr key={author.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {author.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {author.email || <span className="text-gray-400 italic">—</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {author.blog_name || <span className="text-gray-400 italic">—</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {author.status ? (
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            author.status === 'publish'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {author.status}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(author.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(author)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(author.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingAuthor ? 'Edit Author' : 'Add New Author'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="johndoe"
                  required
                />
                {formErrors.username && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>
                )}
              </div>

              {/* Password (required for create) */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  required={!editingAuthor}
                />
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="author@example.com"
                />
              </div>

              {/* Confirm Password (only on create) */}
              {!editingAuthor && (
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    required
                  />
                  {formErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                  )}
                </div>
              )}

              {editingAuthor && (
                <p className="text-sm text-gray-500">
                  Leave password and email blank to keep current values.
                </p>
              )}

              {/* Submit */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingAuthor ? 'Update' : 'Create'} Author
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
