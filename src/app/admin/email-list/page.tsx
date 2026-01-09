'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiDelete, apiPost, apiPut, getCurrentUser } from '../api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Download, Plus, Edit, Trash2, Mail, UserPlus } from 'lucide-react';
import { format } from 'date-fns';

type Subscriber = {
  id: string;
  email: string;
  name: string | null;
  unique_user_id: string | null;
  subscribed_at: string;
  created_at: string;
  updated_at: string;
};

type SortField = 'email' | 'name' | 'subscribed_at' | 'created_at';
type SortDirection = 'asc' | 'desc';

export default function EmailListPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('subscribed_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [mounted, setMounted] = useState(false);
  
  // Add subscriber form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubscriber, setNewSubscriber] = useState({
    email: '',
    name: '',
    unique_user_id: ''
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Edit subscriber form state
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState<Subscriber | null>(null);
  const [editSubscriber, setEditSubscriber] = useState({
    email: '',
    name: '',
    unique_user_id: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editEmailExists, setEditEmailExists] = useState<boolean | null>(null);
  const [checkingEditEmail, setCheckingEditEmail] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load subscribers
  const loadSubscribers = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sort: sortField,
        order: sortDirection,
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
      });

      const response = await apiGet<{
        data: Subscriber[];
        pagination: {
          total: number;
          page: number;
          totalPages: number;
          limit: number;
        };
      }>(`/newsletter/subscribers?${params}`, token);

      setSubscribers(response.data || []);
      setTotalSubscribers(response.pagination.total || 0);
    } catch (err) {
      console.error('Failed to load subscribers:', err);
      setError('Failed to load subscribers. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, pageSize, sortField, sortDirection, debouncedSearchTerm]);

  useEffect(() => {
    loadSubscribers();
  }, [loadSubscribers]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to delete subscriber "${email}"?`)) return;

    try {
      await apiDelete(`/newsletter/subscribers/${id}`, token);
      await loadSubscribers(); // Reload subscribers after deletion
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete subscriber. Please try again.');
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_API || 'http://localhost:8080'}/newsletter/export`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export subscribers. Please try again.');
    }
  };

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newSubscriber.email || !emailRegex.test(newSubscriber.email)) {
      setAddError('Please enter a valid email address');
      setAddLoading(false);
      return;
    }

    try {
      const response = await apiPost('/newsletter/subscribe', token, {
        email: newSubscriber.email,
        name: newSubscriber.name || null,
        unique_user_id: newSubscriber.unique_user_id || null
      });

      // Type guard to check if response is the expected type
      const responseData = response as { message?: string; error?: string; subscriber?: any };
      
      if (responseData.message === 'Successfully subscribed to newsletter' || 
          responseData.message === 'Already subscribed') {
        // Refresh the subscriber list
        await loadSubscribers();
        // Reset form
        setNewSubscriber({ email: '', name: '', unique_user_id: '' });
        setShowAddForm(false);
        alert('Subscriber added successfully!');
      } else {
        setAddError(responseData.error || 'Failed to add subscriber');
      }
    } catch (err: any) {
      console.error('Add subscriber failed:', err);
      setAddError(err.message || 'Failed to add subscriber. Please try again.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof newSubscriber, value: string) => {
    setNewSubscriber(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Check email existence when email field changes
    if (field === 'email') {
      checkEmailExists(value);
    }
  };

  const checkEmailExists = async (email: string) => {
    if (!email.trim()) {
      setEmailExists(null);
      return;
    }

    // Validate email format first
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailExists(null);
      return;
    }

    setCheckingEmail(true);
    try {
      // Use fetch directly for query parameters
      const response = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_API || 'http://localhost:8080'}/newsletter/check?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const checkData = await response.json() as { isSubscribed?: boolean; subscriber?: any };
      
      if (checkData.isSubscribed) {
        setEmailExists(true);
      } else {
        setEmailExists(false);
      }
    } catch (err) {
      console.error('Email check failed:', err);
      setEmailExists(null);
    } finally {
      setCheckingEmail(false);
    }
  };

  // Edit subscriber functions
  const handleEditClick = (subscriber: Subscriber) => {
    setEditingSubscriber(subscriber);
    setEditSubscriber({
      email: subscriber.email,
      name: subscriber.name || '',
      unique_user_id: subscriber.unique_user_id || ''
    });
    setEditError(null);
    setEditEmailExists(null);
    setCheckingEditEmail(false);
    setShowEditForm(true);
  };

  const handleEditInputChange = (field: keyof typeof editSubscriber, value: string) => {
    setEditSubscriber(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Check email existence when email field changes (but skip if it's the same email)
    if (field === 'email' && value !== editingSubscriber?.email) {
      checkEditEmailExists(value);
    }
  };

  const checkEditEmailExists = async (email: string) => {
    if (!email.trim() || email === editingSubscriber?.email) {
      setEditEmailExists(null);
      return;
    }

    // Validate email format first
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEditEmailExists(null);
      return;
    }

    setCheckingEditEmail(true);
    try {
      // Use fetch directly for query parameters
      const response = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_API || 'http://localhost:8080'}/newsletter/check?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const checkData = await response.json() as { isSubscribed?: boolean; subscriber?: any };
      
      if (checkData.isSubscribed && checkData.subscriber?.id !== editingSubscriber?.id) {
        setEditEmailExists(true);
      } else {
        setEditEmailExists(false);
      }
    } catch (err) {
      console.error('Edit email check failed:', err);
      setEditEmailExists(null);
    } finally {
      setCheckingEditEmail(false);
    }
  };

  const handleUpdateSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editSubscriber.email || !emailRegex.test(editSubscriber.email)) {
      setEditError('Please enter a valid email address');
      setEditLoading(false);
      return;
    }

    try {
      // Use the new PUT endpoint to update the existing subscriber
      const response = await apiPut(`/newsletter/subscribers/${editingSubscriber?.id}`, token, {
        email: editSubscriber.email,
        name: editSubscriber.name || null,
        unique_user_id: editSubscriber.unique_user_id || null
      });

      // Type guard to check if response is the expected type
      const responseData = response as { message?: string; error?: string; subscriber?: any };
      
      if (responseData.message === 'Subscriber updated successfully') {
        // Refresh the subscriber list
        await loadSubscribers();
        // Reset form
        setEditSubscriber({ email: '', name: '', unique_user_id: '' });
        setEditingSubscriber(null);
        setShowEditForm(false);
        alert('Subscriber updated successfully!');
      } else {
        setEditError(responseData.error || 'Failed to update subscriber');
      }
    } catch (err: any) {
      console.error('Update subscriber failed:', err);
      setEditError(err.message || 'Failed to update subscriber. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditSubscriber({ email: '', name: '', unique_user_id: '' });
    setEditingSubscriber(null);
    setEditError(null);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return format(date, 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="text-gray-400">↕</span>;
    }
    return <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  if (!mounted) {
    return <div className="space-y-6">Loading...</div>;
  }

  if (!token) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Email List Management</h1>
          <p className="text-muted-foreground text-black">
            Manage newsletter subscribers and email list
          </p>
        </div>
        <div className="flex items-center space-x-4 text-black">
          <Button onClick={() => setShowAddForm(!showAddForm)} variant="outline">
            <UserPlus className="w-4 h-4 mr-2" />
            {showAddForm ? 'Cancel' : 'Add Subscriber'}
          </Button>
          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Edit Subscriber Form */}
      {showEditForm && editingSubscriber && (
        <Card className='text-black'>
          <CardHeader>
            <CardTitle>Edit Subscriber</CardTitle>
            <CardDescription>
              Update subscriber information for {editingSubscriber.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateSubscriber} className="space-y-4">
              {editError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {editError}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email Address *</Label>
                  <div className="relative">
                    <Input
                      className={`placeholder:text-gray-500 ${editEmailExists === true ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : editEmailExists === false ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : ''}`}
                      id="edit-email"
                      type="email"
                      placeholder="subscriber@example.com"
                      value={editSubscriber.email}
                      onChange={(e) => handleEditInputChange('email', e.target.value)}
                      required
                    />
                    {checkingEditEmail && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                      </div>
                    )}
                    {editEmailExists === true && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}
                    {editEmailExists === false && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {editEmailExists === true && (
                    <p className="text-sm text-red-600">This email is already subscribed to the newsletter (different subscriber)</p>
                  )}
                  {editEmailExists === false && (
                    <p className="text-sm text-green-600">This email is available for subscription</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name (Optional)</Label>
                  <Input
                    id="edit-name"
                    className='placeholder:text-gray-500'
                    type="text"
                    placeholder="John Doe"
                    value={editSubscriber.name}
                    onChange={(e) => handleEditInputChange('name', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-unique_user_id">Unique User ID (Optional)</Label>
                <Input
                  id="edit-unique_user_id"
                  type="text"
                  placeholder="12345678-1234-1234-1234-123456789012"
                  value={editSubscriber.unique_user_id}
                  onChange={(e) => handleEditInputChange('unique_user_id', e.target.value)}
                  className="font-mono"
                />
                <p className="text-sm text-gray-500">
                  Optional UUID for tracking unique users across sessions
                </p>
              </div>
              
              <div className="flex items-center space-x-4 ">
                <Button type="submit" className='text-white' disabled={editLoading}>
                  {editLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Update Subscriber
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Add Subscriber Form */}
      {showAddForm && (
        <Card className='text-black'>
          <CardHeader>
            <CardTitle>Add New Subscriber</CardTitle>
            <CardDescription>
              Manually add a new subscriber to the newsletter list
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSubscriber} className="space-y-4">
              {addError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {addError}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Input
                      className={`placeholder:text-gray-500 ${emailExists === true ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : emailExists === false ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : ''}`}
                      id="email"
                      type="email"
                      placeholder="subscriber@example.com"
                      value={newSubscriber.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                    {checkingEmail && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                      </div>
                    )}
                    {emailExists === true && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}
                    {emailExists === false && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {emailExists === true && (
                    <p className="text-sm text-red-600">This email is already subscribed to the newsletter</p>
                  )}
                  {emailExists === false && (
                    <p className="text-sm text-green-600">This email is available for subscription</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name (Optional)</Label>
                  <Input
                    id="name"
                    className='placeholder:text-gray-500'
                    type="text"
                    placeholder="John Doe"
                    value={newSubscriber.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unique_user_id">Unique User ID (Optional)</Label>
                <Input
                  id="unique_user_id"
                  type="text"
                  placeholder="12345678-1234-1234-1234-123456789012"
                  value={newSubscriber.unique_user_id}
                  onChange={(e) => handleInputChange('unique_user_id', e.target.value)}
                  className="font-mono"
                />
                <p className="text-sm text-gray-500">
                  Optional UUID for tracking unique users across sessions
                </p>
              </div>
              
              <div className="flex items-center space-x-4 ">
                <Button type="submit" className='text-white' disabled={addLoading}>
                  {addLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Subscriber
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddForm(false);
                    setNewSubscriber({ email: '', name: '', unique_user_id: '' });
                    setAddError(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Subscribers</p>
                <p className="text-2xl font-bold text-black">{totalSubscribers}</p>
              </div>
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 text-black ">
            <div className="flex-1">
              <Label htmlFor="search" className="block text-sm font-medium text-black mb-1">
                Search Subscribers
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 placeholder:text-gray-400"
                />
              </div>
            </div>
            <div className="flex items-end space-x-2 text-black">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSortField('subscribed_at');
                  setSortDirection('desc');
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-700 font-medium">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <p className="mt-2 text-black">Loading subscribers...</p>
          </CardContent>
        </Card>
      )}

      {/* Subscribers Table */}
      {!loading && (
        <Card className='text-black'>
          <CardHeader>
            <CardTitle className='text-black'>Subscribers</CardTitle>
            <CardDescription>
              Manage your newsletter subscriber list
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Email</span>
                        <SortIcon field="email" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Name</span>
                        <SortIcon field="name" />
                      </div>
                    </TableHead>
                    <TableHead>Unique User ID</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('subscribed_at')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Subscribed</span>
                        <SortIcon field="subscribed_at" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Created</span>
                        <SortIcon field="created_at" />
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No subscribers found. {debouncedSearchTerm ? 'Try adjusting your search.' : 'Start collecting subscribers!'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    subscribers.map((subscriber) => (
                      <TableRow key={subscriber.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {subscriber.email}
                        </TableCell>
                        <TableCell>
                          {subscriber.name || (
                            <span className="text-gray-500 italic">No name</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {subscriber.unique_user_id ? (
                            <Badge variant="secondary" className="text-xs">
                              {subscriber.unique_user_id.slice(0, 8)}...
                            </Badge>
                          ) : (
                            <span className="text-gray-500 italic">None</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {formatDate(subscriber.subscribed_at)}
                        </TableCell>
                        <TableCell>
                          {formatDate(subscriber.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(subscriber)}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Copy email to clipboard
                                navigator.clipboard.writeText(subscriber.email);
                                alert('Email copied to clipboard!');
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Copy Email
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(subscriber.id, subscriber.email)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {subscribers.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalSubscribers)} of {totalSubscribers} subscribers
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={subscribers.length < pageSize}
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
