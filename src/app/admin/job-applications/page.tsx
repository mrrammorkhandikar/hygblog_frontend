'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiDelete } from '../api';

type JobApplication = {
  id: string;
  email: string | null;
  full_name: string | null;
  age_group: string | null;
  contact_number: string | null;
  location: string | null;
  education: string | null;
  internship_position: string | null;
  experience: string | null;
  resume_file_path: string | null;
  created_at: string;
};

export default function AdminJobApplications() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'full_name' | 'email' | 'created_at'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  // Load job applications
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const applicationsData = await apiGet<JobApplication[]>('/job-applications', token);
      setApplications(Array.isArray(applicationsData) ? applicationsData : []);
    } catch (err: any) {
      console.error('Failed to load job applications:', err);
      setError('Failed to load job applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job application? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await apiDelete(`/job-applications/${id}`, token);
      setSuccess('Job application deleted successfully!');
      await loadData();
    } catch (err: any) {
      console.error('Failed to delete job application:', err);
      setError(err.message || 'Failed to delete job application.');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort applications
  const filteredApplications = applications
    .filter(application => {
      const matchesSearch = (application.full_name && application.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (application.email && application.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (application.internship_position && application.internship_position.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (application.location && application.location.toLowerCase().includes(searchTerm.toLowerCase()));

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
  const totalPages = Math.ceil(filteredApplications.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + pageSize);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortDirection]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
        <div className="text-sm text-gray-500">
          {filteredApplications.length} of {applications.length} applications
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
                placeholder="Search applications..."
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
                <option value="created_at">Created Date</option>
                <option value="full_name">Full Name</option>
                <option value="email">Email</option>
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

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
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
                      <span>Loading applications...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedApplications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    {searchTerm ? 'No applications found matching your search.' : 'No job applications found.'}
                  </td>
                </tr>
              ) : (
                paginatedApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{application.full_name || '—'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{application.email || '—'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{application.internship_position || '—'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{application.location || '—'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {new Date(application.created_at).toLocaleDateString()} {new Date(application.created_at).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setIsModalOpen(true);
                          }}
                          className="text-teal-600 hover:text-teal-900 text-sm font-medium"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleDelete(application.id)}
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

      {/* Application Modal */}
      {isModalOpen && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Job Application Details</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <div className="mt-1 text-gray-900">{selectedApplication.full_name || '—'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <div className="mt-1 text-gray-900">{selectedApplication.email || '—'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Contact Number</label>
                    <div className="mt-1 text-gray-900">{selectedApplication.contact_number || '—'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <div className="mt-1 text-gray-900">{selectedApplication.location || '—'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Age Group</label>
                    <div className="mt-1 text-gray-900">{selectedApplication.age_group || '—'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Education</label>
                    <div className="mt-1 text-gray-900">{selectedApplication.education || '—'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Internship Position</label>
                    <div className="mt-1 text-gray-900">{selectedApplication.internship_position || '—'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Experience</label>
                    <div className="mt-1 text-gray-900">{selectedApplication.experience || '—'}</div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Resume</label>
                  {selectedApplication.resume_file_path ? (
                    <a
                      href={selectedApplication.resume_file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-teal-600 hover:text-teal-900 underline"
                    >
                      View Resume
                    </a>
                  ) : (
                    <div className="mt-1 text-gray-500">No resume available</div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Applied</label>
                  <div className="mt-1 text-gray-900">
                    {new Date(selectedApplication.created_at).toLocaleDateString()} at {new Date(selectedApplication.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

