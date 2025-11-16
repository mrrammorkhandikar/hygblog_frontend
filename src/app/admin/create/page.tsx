'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost, apiGet, apiGetLLMSuggestions, LLMSuggestionContext, LLMSuggestionResponse, getCurrentUser } from '../api';
import ImageUploadManager from '../../../components/ImageUploadManager';

// Debounced suggestion hook
const useDebouncedSuggestions = (fieldType: string, contextFn: () => LLMSuggestionContext & { content?: string }, delay = 1500) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    setToken(storedToken);
  }, []);

  const debouncedSuggestion = useCallback(
    debounce(async (currentValue: string) => {
      if (!token || !currentValue || currentValue.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const context = contextFn();
        const response = await apiGetLLMSuggestions(fieldType, context, currentValue, token);
        setSuggestions(response.suggestions);
        setShowSuggestions(response.suggestions.length > 0);
      } catch (error) {
        console.error('Suggestion error:', error);
        setShowSuggestions(false);
      }
    }, delay),
    [fieldType, contextFn, token, delay]
  );

  const cleanup = () => {
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return { suggestions, showSuggestions, triggerSuggestions: debouncedSuggestion, cleanup };
};

function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

type Category = { id: string; name: string; icon_url?: string };
type Tag = { id: string; name: string };

type Author = { id: string; username: string; blog_name: string | null; status: 'publish' | 'draft' };
type User = { id?: string; username: string; role: 'admin' | 'author'; authorName?: string };

type ListItem = {
  id: string;
  type: 'text' | 'image';
  content: string;
  imageMetadata?: { size?: 'small' | 'medium' | 'large' | 'custom'; width?: number; height?: number; alt?: string };
  nestedList?: { type: 'ul' | 'ol'; items: ListItem[] };
  affiliateLink?: { type: 'affiliate' | 'custom' | null; id?: string; name?: string; url?: string };
};

type ContentBlock = {
  id: string;
  type: 'text' | 'image' | 'ul' | 'ol' | 'blockquote';
  content: string;
  metadata?: {
    level?: number;
    size?: 'small' | 'medium' | 'large' | 'custom';
    width?: number;
    height?: number;
    alt?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
  };
  listItems?: ListItem[];
  affiliateLink?: { type: 'affiliate' | 'custom' | null; id?: string; name?: string; url?: string };
};

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [author, setAuthor] = useState('');
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const [titleImage, setTitleImage] = useState<File | null>(null);
  const [titleImagePreview, setTitleImagePreview] = useState<string | null>(null);
  const [titleImageUrl, setTitleImageUrl] = useState<string | null>(null);

  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    { id: '1', type: 'text', content: '', metadata: { level: 1 } }
  ]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authors, setAuthors] = useState<Author[]>([]);

  const [showPreview, setShowPreview] = useState(false);

  const router = useRouter();

  // Context function used by suggestions hook
  const getContextFromForm = (): LLMSuggestionContext & { content?: string } => {
    const selectedTagNames = selectedTagIds.map(tagId => {
      const tag = tags.find(t => t.id === tagId);
      return tag ? tag.name : '';
    }).filter(name => name.length > 0);

    // Extract content from all content blocks for better AI suggestions
    const contentText = contentBlocks.map(block => {
      if (block.type === 'text') {
        return block.content;
      }
      // For other types, include metadata if present
      return block.type === 'image' ? (block.metadata?.alt || block.type) : block.type;
    }).join(' ').trim();

    return {
      category: selectedCategoryId ? categories.find(c => c.id === selectedCategoryId)?.name : undefined,
      tags: selectedTagNames.length > 0 ? selectedTagNames : undefined,
      title: title.trim() || undefined,
      excerpt: excerpt.trim() || undefined,
      author: author.trim() || undefined,
      content: contentText || undefined
    };
  };

  // Debounced real-time suggestions
  const titleSuggestionsHook = useDebouncedSuggestions('title', getContextFromForm, 1200);
  const excerptSuggestionsHook = useDebouncedSuggestions('excerpt', getContextFromForm, 1500);
  const seoTitleSuggestionsHook = useDebouncedSuggestions('seo_title', getContextFromForm, 1200);
  const seoDescriptionSuggestionsHook = useDebouncedSuggestions('seo_description', getContextFromForm, 1500);
  const seoKeywordSuggestionsHook = useDebouncedSuggestions('seo_keywords', getContextFromForm, 1600);

  // Generate unique slug from title
  const generateSlug = (title: string): string => {
    // Convert to lowercase and replace spaces with hyphens
    const slug = title.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
    
    // Add timestamp to ensure uniqueness
    const timestamp = new Date().getTime();
    return `${slug}-${timestamp}`;
  };

  const validateForm = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = 'Title is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title]);

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

    // Get current user info
    const user = getCurrentUser();
    setCurrentUser(user);

    Promise.all([
      apiGet<Category[]>('/categories', token),
      apiGet<Tag[]>('/tags', token)
    ])
      .then(([categoriesData, tagsData]) => {
        setCategories(categoriesData);
        setTags(tagsData);
      })
      .catch(err => {
        console.error('Failed to load data:', err);
        setError('Failed to load categories or tags.');
      });

    // Load authors if user is admin
    if (user?.role === 'admin') {
      apiGet<Author[]>('/authors', token)
        .then(authorsData => {
          setAuthors(authorsData); // Show all authors for admin dropdown
        })
        .catch(err => {
          console.error('Failed to load authors:', err);
        });
    }
  }, [token, router, isClient]);

  useEffect(() => {
    validateForm();
  }, [title, validateForm]);

  // Set author name for authors and default for admins
  useEffect(() => {
    if (currentUser?.role === 'author' && currentUser.authorName) {
      setAuthor(currentUser.authorName);
    } else if (currentUser?.role === 'admin' && !author) {
      // Default to admin's username for admin posts
      setAuthor(currentUser.username);
    }
  }, [currentUser, author]);

  const addContentBlock = (type: 'text' | 'image' | 'ul' | 'ol') => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: '',
      metadata: type === 'text' ? { level: 3 } : type === 'image' ? { size: 'medium', alt: '' } : undefined,
      affiliateLink: { type: null }
    };

    if (type === 'ul' || type === 'ol') {
      newBlock.listItems = [
        { id: `${Date.now()}-item-1`, type: 'text', content: '', affiliateLink: { type: null } }
      ];
    }

    setContentBlocks(prev => [...prev, newBlock]);
  };

  const updateContentBlock = (id: string, updates: Partial<ContentBlock>) => {
    setContentBlocks(blocks =>
      blocks.map(block => (block.id === id ? { ...block, ...updates } : block))
    );
  };

  const removeContentBlock = (id: string) => {
    setContentBlocks(blocks => blocks.filter(block => block.id !== id));
  };

  const moveContentBlock = (id: string, direction: 'up' | 'down') => {
    const index = contentBlocks.findIndex(block => block.id === id);
    if (index === -1) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= contentBlocks.length) return;

    const newBlocks = [...contentBlocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    setContentBlocks(newBlocks);
  };

  // List item management
  const addListItem = (blockId: string, parentItemId?: string) => {
    setContentBlocks(blocks =>
      blocks.map(block => {
        if (block.id !== blockId) return block;

        const newItem: ListItem = {
          id: `${Date.now()}-item-${Math.random().toString(36).substr(2, 5)}`,
          type: 'text',
          content: '',
          affiliateLink: { type: null }
        };

        if (!parentItemId) {
          return { ...block, listItems: [...(block.listItems || []), newItem] };
        } else {
          return {
            ...block,
            listItems: (block.listItems || []).map(item =>
              item.id !== parentItemId
                ? item
                : {
                    ...item,
                    nestedList: {
                      ...(item.nestedList || { type: block.type as 'ul' | 'ol', items: [] }),
                      items: [...(item.nestedList?.items || []), newItem]
                    }
                  }
            )
          };
        }
      })
    );
  };

  const updateListItem = (blockId: string, itemId: string, updates: Partial<ListItem>, parentItemId?: string) => {
    setContentBlocks(blocks =>
      blocks.map(block => {
        if (block.id !== blockId) return block;

        if (!parentItemId) {
          return {
            ...block,
            listItems: (block.listItems || []).map(item =>
              item.id === itemId ? { ...item, ...updates } : item
            )
          };
        } else {
          return {
            ...block,
            listItems: (block.listItems || []).map(item =>
              item.id !== parentItemId
                ? item
                : {
                    ...item,
                    nestedList: item.nestedList
                      ? {
                          ...item.nestedList,
                          items: item.nestedList.items.map(nested =>
                            nested.id === itemId ? { ...nested, ...updates } : nested
                          )
                        }
                      : undefined
                  }
            )
          };
        }
      })
    );
  };

  const removeListItem = (blockId: string, itemId: string, parentItemId?: string) => {
    setContentBlocks(blocks =>
      blocks.map(block => {
        if (block.id !== blockId) return block;

        if (!parentItemId) {
          const updated = (block.listItems || []).filter(i => i.id !== itemId);
          return {
            ...block,
            listItems: updated.length > 0 ? updated : [{ id: `${Date.now()}-item-1`, type: 'text', content: '', affiliateLink: { type: null } }]
          };
        } else {
          return {
            ...block,
            listItems: (block.listItems || []).map(item =>
              item.id !== parentItemId
                ? item
                : {
                    ...item,
                    nestedList: item.nestedList
                      ? { ...item.nestedList, items: item.nestedList.items.filter(n => n.id !== itemId) }
                      : undefined
                  }
            )
          };
        }
      })
    );
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setError('Please correct the errors in the form.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const jsonContentBlocks = contentBlocks.map((block, index) => {
        const { id, type, content, metadata, listItems } = block;

        let affiliateLink: ContentBlock['affiliateLink'] = { type: null };
        if (block.affiliateLink?.type === 'custom' && block.affiliateLink.url) {
          affiliateLink = { type: 'custom', name: block.affiliateLink.name, url: block.affiliateLink.url };
        }

        return { id, blockNo: index + 1, type, content, metadata, listItems, affiliateLink };
      });

      const slug = generateSlug(title.trim());

      // Convert selected tag IDs to tag names
      const selectedTagNames = selectedTagIds.map(tagId => {
        const tag = tags.find(t => t.id === tagId);
        return tag ? tag.name : '';
      }).filter(name => name.length > 0);

      const postData: any = {
        title: title.trim(),
        slug, // ← Critical: unique slug
        excerpt: excerpt.trim(),
        content: JSON.stringify(jsonContentBlocks),
        category: selectedCategoryId ? categories.find(c => c.id === selectedCategoryId)?.name || '' : '',
        tags: selectedTagNames,
        image_url: titleImageUrl || null,
        seo_title: seoTitle.trim() || null,
        seo_description: seoDescription.trim() || null,
        seo_keywords: seoKeywords.trim() ? seoKeywords.split(',').map(k => k.trim()).filter(Boolean) : [],
        author: author.trim() || null,
        date: new Date().toISOString()
      };

      // Only include featured/published for admins
      if (currentUser?.role === 'admin') {
        postData.featured = featured;
        postData.published = published;
      }

      await apiPost('/posts', token, postData);
      router.push('/admin/dashboard');
    } catch (err: any) {
      console.error('Create post failed:', err);
      setError(err.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isClient || !token) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
        <button
          type="button"
          onClick={() => router.push('/admin/dashboard')}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-black mb-2">Title *</label>
              <div className="relative">
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrors(prev => ({ ...prev, title: '' }));
                    titleSuggestionsHook.triggerSuggestions(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-black placeholder-gray-500"
                  placeholder="Enter post title..."
                  required
                />
                {titleSuggestionsHook.showSuggestions && titleSuggestionsHook.suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-b-md shadow-lg max-h-40 overflow-y-auto">
                    {titleSuggestionsHook.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setTitle(suggestion);
                          setErrors(prev => ({ ...prev, title: '' }));
                        }}
                        className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-none rounded-none border-b border-gray-100 last:border-b-0"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="excerpt" className="block text-sm font-medium text-black mb-2">Excerpt</label>
              <div className="relative">
                <textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => {
                    setExcerpt(e.target.value);
                    excerptSuggestionsHook.triggerSuggestions(e.target.value);
                  }}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-black placeholder-gray-500"
                  placeholder="Brief description..."
                />
                {excerptSuggestionsHook.showSuggestions && excerptSuggestionsHook.suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-b-md shadow-lg max-h-40 overflow-y-auto">
                    {excerptSuggestionsHook.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setExcerpt(suggestion)}
                        className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-none rounded-none border-b border-gray-100 last:border-b-0"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
                <label htmlFor="author" className="block text-sm font-medium text-black mb-2">Author</label>
              {currentUser?.role === 'admin' ? (
                <select
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-black"
                >
                  <option value={currentUser.username}>{currentUser.username}</option>
                  {authors.map(auth => (
                    <option key={auth.id} value={auth.blog_name || auth.username}>
                      {auth.blog_name || auth.username}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="author"
                  type="text"
                  value={author}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-black"
                  readOnly
                />
              )}
            </div>
            {currentUser?.role === 'admin' && (
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded border-gray-300 text-teal-600" />
                  <span className="ml-2 text-sm text-gray-700">Featured Post</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="rounded border-gray-300 text-teal-600" />
                  <span className="ml-2 text-sm text-gray-700">Publish Immediately</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Title Image */}
        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Title Image</h2>
          <ImageUploadManager
            onImageUpload={(file, url) => { setTitleImage(file); setTitleImagePreview(url); setTitleImageUrl(url); }}
            onImageRemove={() => { setTitleImage(null); setTitleImagePreview(null); setTitleImageUrl(null); }}
            maxFileSize={5 * 1024 * 1024}
            multiple={false}
            existingImages={titleImagePreview ? [titleImagePreview] : []}
            uploadEndpoint="/image-upload/title"
            showPreview={true}
          />
        </div>

        {/* Category & Tags */}
        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Category & Tags</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-black mb-2">Category</label>
              <select
                id="category"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-black"
              >
                <option value="">Select a category...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Tags</label>
              <input
                type="text"
                value={tagSearchTerm}
                onChange={(e) => setTagSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-black placeholder-gray-500"
                placeholder="Search tags..."
              />
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3 space-y-2 mt-2">
                {filteredTags.map(tag => (
                  <label key={tag.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedTagIds.includes(tag.id)}
                      onChange={() => toggleTag(tag.id)}
                      className="rounded border-gray-300 text-teal-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">{tag.name}</span>
                  </label>
                ))}
                {filteredTags.length === 0 && <p className="text-sm text-gray-500">No tags found</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Content Blocks */}
        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Content</h2>
            <div className="flex space-x-2">
              <button type="button" onClick={() => addContentBlock('text')} className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Add Text</button>
              <button type="button" onClick={() => addContentBlock('image')} className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">Add Image</button>
              <button type="button" onClick={() => addContentBlock('ul')} className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">Add Bullet List</button>
              <button type="button" onClick={() => addContentBlock('ol')} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700">Add Numbered List</button>
            </div>
          </div>

          <div className="space-y-4">
            {contentBlocks.map((block, index) => (
              <div key={block.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {block.type === 'text' ? 'Text' : block.type === 'image' ? 'Image' : block.type === 'ul' ? 'Bullet List' : 'Numbered List'} #{index + 1}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button type="button" onClick={() => moveContentBlock(block.id, 'up')} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50">Up</button>
                    <button type="button" onClick={() => moveContentBlock(block.id, 'down')} disabled={index === contentBlocks.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50">Down</button>
                    <button type="button" onClick={() => removeContentBlock(block.id)} className="p-1 text-red-400 hover:text-red-600">×</button>
                  </div>
                </div>

                {/* Block Content */}
                {block.type === 'text' ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <label className="text-sm text-gray-600">Type:</label>
                      <select
                        value={block.metadata?.level || 0}
                        onChange={(e) => updateContentBlock(block.id, { metadata: { ...block.metadata, level: Number(e.target.value) } })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm text-black"
                      >
                        <option value={1}>H1</option>
                        <option value={2}>H2</option>
                        <option value={3}>H3</option>
                        <option value={0}>Paragraph</option>
                      </select>
                    </div>
                    </div>
                    <textarea
                      value={block.content}
                      onChange={(e) => updateContentBlock(block.id, { content: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-black placeholder-gray-500"
                      placeholder="Enter text..."
                    />
                  </div>
                ) : block.type === 'image' ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <label className="text-sm text-gray-600">Size:</label>
                      <select
                        value={block.metadata?.size || 'medium'}
                        onChange={(e) => updateContentBlock(block.id, { metadata: { ...block.metadata, size: e.target.value as any } })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                    {block.metadata?.size === 'custom' && (
                      <div className="flex space-x-3">
                        <input type="number" placeholder="Width" value={block.metadata?.width || ''} onChange={(e) => updateContentBlock(block.id, { metadata: { ...block.metadata, width: Number(e.target.value) } })} className="px-2 py-1 border border-gray-300 rounded text-sm w-20" />
                        <input type="number" placeholder="Height" value={block.metadata?.height || ''} onChange={(e) => updateContentBlock(block.id, { metadata: { ...block.metadata, height: Number(e.target.value) } })} className="px-2 py-1 border border-gray-300 rounded text-sm w-20" />
                      </div>
                    )}
                    <input
                      type="text"
                      value={block.metadata?.alt || ''}
                      onChange={(e) => updateContentBlock(block.id, { metadata: { ...block.metadata, alt: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-black placeholder-gray-500"
                      placeholder="Alt text..."
                    />
                    <ImageUploadManager
                      onImageUpload={(file, url) => updateContentBlock(block.id, { content: url })}
                      maxFileSize={10 * 1024 * 1024}
                      multiple={false}
                      existingImages={block.content ? [block.content] : []}
                      uploadEndpoint="/image-upload"
                      showPreview={true}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        {block.type === 'ul' ? 'Bullet List' : 'Numbered List'}
                      </label>
                      <button type="button" onClick={() => addListItem(block.id)} className="px-2 py-1 bg-teal-600 text-white rounded text-xs hover:bg-teal-700">
                        Add Item
                      </button>
                    </div>

                    <div className="space-y-2 pl-2 border-l-2 border-gray-200">
                      {(block.listItems || []).map((item, itemIdx) => (
                        <div key={item.id} className="space-y-2 border border-gray-200 rounded p-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500">Item #{itemIdx + 1}</span>
                            <div className="flex space-x-1">
                              {item.type === 'text' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nestedType = block.type === 'ul' ? 'ul' : 'ol';
                                    updateListItem(block.id, item.id, {
                                      nestedList: item.nestedList || { type: nestedType, items: [] }
                                    });
                                    if (!item.nestedList?.items.length) addListItem(block.id, item.id);
                                  }}
                                  className="px-1 py-0.5 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                                >
                                  {item.nestedList ? 'Edit Nested' : 'Add Nested'}
                                </button>
                              )}
                              <button type="button" onClick={() => removeListItem(block.id, item.id)} className="px-1 py-0.5 bg-red-600 text-white rounded text-xs hover:bg-red-700">
                                Remove
                              </button>
                            </div>
                          </div>

                          <select
                            value={item.type}
                            onChange={(e) => updateListItem(block.id, item.id, { type: e.target.value as 'text' | 'image' })}
                            className="px-2 py-1 border border-gray-300 rounded text-sm w-full"
                          >
                            <option value="text">Text</option>
                            <option value="image">Image</option>
                          </select>

                          {item.type === 'text' ? (
                            <textarea
                              value={item.content}
                              onChange={(e) => updateListItem(block.id, item.id, { content: e.target.value })}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-black placeholder-gray-500"
                              placeholder="List item text..."
                            />
                          ) : (
                            <div className="space-y-2">
                              <ImageUploadManager
                                onImageUpload={(file, url) => updateListItem(block.id, item.id, { content: url })}
                                maxFileSize={5 * 1024 * 1024}
                                multiple={false}
                                existingImages={item.content ? [item.content] : []}
                                uploadEndpoint="/image-upload"
                                showPreview={true}
                              />
                              <input
                                type="text"
                                value={item.imageMetadata?.alt || ''}
                                onChange={(e) => updateListItem(block.id, item.id, { imageMetadata: { ...(item.imageMetadata || {}), alt: e.target.value } })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-black placeholder-gray-500"
                                placeholder="Alt text..."
                              />
                            </div>
                          )}

                          {/* Nested List */}
                          {item.nestedList && item.nestedList.items.length > 0 && (
                            <div className="pl-4 mt-2 border-l-2 border-gray-200">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-500">Nested List</span>
                                <button type="button" onClick={() => addListItem(block.id, item.id)} className="px-1 py-0.5 bg-teal-600 text-white rounded text-xs hover:bg-teal-700">
                                  Add
                                </button>
                              </div>
                              {item.nestedList.items.map((nested, nIdx) => (
                                <div key={nested.id} className="border border-gray-200 rounded p-2 mt-1">
                                  <div className="flex justify-between text-xs">
                                    <span>Nested #{nIdx + 1}</span>
                                    <button type="button" onClick={() => removeListItem(block.id, nested.id, item.id)} className="text-red-600">×</button>
                                  </div>
                                  <textarea
                                    value={nested.content}
                                    onChange={(e) => updateListItem(block.id, nested.id, { content: e.target.value }, item.id)}
                                    rows={1}
                                    className="w-full text-sm mt-1 px-2 py-1 border rounded text-black placeholder-gray-500"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Affiliate Link */}
                <div className="border-t pt-3 mt-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Affiliate Link (Optional)</h4>
                  <div className="flex space-x-4 mb-2">
                    <label className="flex items-center">
                      <input type="radio" name={`aff-${block.id}`} value="custom" checked={block.affiliateLink?.type === 'custom'} onChange={() => updateContentBlock(block.id, { affiliateLink: { type: 'custom', name: '', url: '' } })} className="text-black placeholder-gray-500" />
                      <span className="ml-1 text-sm text-black placeholder-gray-500">Custom</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name={`aff-${block.id}`} value="none" checked={!block.affiliateLink?.type} onChange={() => updateContentBlock(block.id, { affiliateLink: { type: null } })} className="text-black placeholder-gray-500" />
                      <span className="ml-1 text-sm text-black placeholder-gray-500">None</span>
                    </label>
                  </div>

                  {block.affiliateLink?.type === 'custom' && (
                    <div className="space-y-2">
                      <input type="text" placeholder="Button text" value={block.affiliateLink?.name || ''} onChange={(e) => updateContentBlock(block.id, { affiliateLink: { ...block.affiliateLink, name: e.target.value, type: block.affiliateLink?.type ?? null } })} className="w-full text-sm border rounded p-1 text-black placeholder-gray-500" />
                      <input type="url" placeholder="https://..." value={block.affiliateLink?.url || ''} onChange={(e) => updateContentBlock(block.id, { affiliateLink: { ...block.affiliateLink, url: e.target.value, type: block.affiliateLink?.type || 'custom' } })} className="w-full text-sm border rounded p-1 text-black placeholder-gray-500" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">SEO Settings</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="seoTitle" className="block text-sm font-medium text-black mb-2">SEO Title</label>
              <div className="relative">
                <input
                  id="seoTitle"
                  type="text"
                  value={seoTitle}
                  onChange={(e) => {
                    setSeoTitle(e.target.value);
                    seoTitleSuggestionsHook.triggerSuggestions(e.target.value);
                  }}
                  placeholder="SEO Title"
                  className="w-full px-3 py-2 border rounded-md text-black placeholder-gray-500"
                />
                {seoTitleSuggestionsHook.showSuggestions && seoTitleSuggestionsHook.suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-b-md shadow-lg max-h-40 overflow-y-auto">
                    {seoTitleSuggestionsHook.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSeoTitle(suggestion)}
                        className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-none rounded-none border-b border-gray-100 last:border-b-0"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="seoDesc" className="block text-sm font-medium text-gray-700 mb-2">SEO Description</label>
              <div className="relative">
                <textarea
                  id="seoDesc"
                  value={seoDescription}
                  onChange={(e) => {
                    setSeoDescription(e.target.value);
                    seoDescriptionSuggestionsHook.triggerSuggestions(e.target.value);
                  }}
                  rows={3}
                  placeholder="SEO Description"
                  className="w-full px-3 py-2 border rounded-md text-black placeholder-gray-500"
                />
                {seoDescriptionSuggestionsHook.showSuggestions && seoDescriptionSuggestionsHook.suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-b-md shadow-lg max-h-40 overflow-y-auto">
                    {seoDescriptionSuggestionsHook.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSeoDescription(suggestion)}
                        className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-none rounded-none border-b border-gray-100 last:border-b-0"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="seoKeywords" className="block text-sm font-medium text-gray-700 mb-2">SEO Keywords</label>
              <div className="relative">
                <input
                  id="seoKeywords"
                  type="text"
                  value={seoKeywords}
                  onChange={(e) => {
                    setSeoKeywords(e.target.value);
                    seoKeywordSuggestionsHook.triggerSuggestions(e.target.value);
                  }}
                  placeholder="keyword1, keyword2"
                  className="w-full px-3 py-2 border rounded-md text-black placeholder-gray-500"
                />
                {seoKeywordSuggestionsHook.showSuggestions && seoKeywordSuggestionsHook.suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-b-md shadow-lg max-h-40 overflow-y-auto">
                    {seoKeywordSuggestionsHook.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSeoKeywords(suggestion)}
                        className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-none rounded-none border-b border-gray-100 last:border-b-0"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button type="button" onClick={() => router.push('/admin/dashboard')} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
          <button type="button" onClick={() => setShowPreview(true)} className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Preview</button>
          <button
            type="submit"
            disabled={loading || Object.keys(errors).length > 0}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            <span>{loading ? 'Creating...' : 'Create Post'}</span>
          </button>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Post Preview</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-400 hover:text-gray-600 text-xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6">
                {/* Preview Hero */}
                <div className="relative h-64 bg-gradient-to-b from-[#f7fdff] to-[#eefdfa] flex items-center justify-center rounded-lg overflow-hidden mb-6">
                  {titleImagePreview ? (
                    <img src={titleImagePreview} alt={title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <div className="text-6xl mb-2">🖼️</div>
                      <p>No title image</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                  <div className="relative z-10 text-center text-white p-6">
                    {selectedCategoryId && (
                      <div className="mb-4">
                        <span className="bg-[#0f766e] text-white px-4 py-2 rounded-full text-sm font-medium">
                          {categories.find(c => c.id === selectedCategoryId)?.name || 'Category'}
                        </span>
                      </div>
                    )}
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ fontFamily: `"Playfair Display", serif` }}>
                      {title || 'Untitled Post'}
                    </h1>
                    {excerpt && (
                      <p className="text-lg text-white/90 max-w-2xl mx-auto">
                        {excerpt}
                      </p>
                    )}
                  </div>
                </div>

                {/* Preview Content */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#f0fdfa] rounded-full flex items-center justify-center">
                        <span className="text-[#0f766e] font-semibold text-lg">
                          {(author || 'A').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-[#0f766e]">{author || 'Author'}</p>
                        <p className="text-sm text-slate-500">Health & Hygiene Expert</p>
                      </div>
                    </div>
                  </div>

                  {/* Render Content Blocks */}
                  <div className="prose prose-slate max-w-none">
                    {contentBlocks.length > 0 ? contentBlocks.map((block) => {
                      const { type, content: blockContent, metadata, listItems, affiliateLink } = block;

                      const renderContentElement = (element: React.ReactElement) => {
                        if (affiliateLink?.url) {
                          return (
                            <a
                              key={block.id}
                              href={affiliateLink.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {element}
                            </a>
                          );
                        }
                        return element;
                      };

                      switch (type) {
                        case 'text':
                          const level = metadata?.level || 0;
                          let contentClass = "";
                          if (metadata?.bold) contentClass += " font-bold";
                          if (metadata?.italic) contentClass += " italic";
                          if (metadata?.underline) contentClass += " underline";

            if (level === 0) {
              return renderContentElement(
                <p className={`mb-6 leading-relaxed text-gray-800 text-base${contentClass}`}>
                  {blockContent || 'Empty paragraph'}
                </p>
              );
            } else {
              const baseClass = `font-bold text-[#0f766e]${contentClass}`;
              if (level === 1) {
                return renderContentElement(
                  <h1 className={`${baseClass} text-4xl md:text-5xl mt-12 mb-6 leading-tight`} style={{ fontFamily: '"Playfair Display", serif' }}>
                    {blockContent || 'Empty heading'}
                  </h1>
                );
              } else if (level === 2) {
                return renderContentElement(
                  <h2 className={`${baseClass} text-3xl md:text-4xl mt-10 mb-5 leading-tight`} style={{ fontFamily: '"Playfair Display", serif' }}>
                    {blockContent || 'Empty heading'}
                  </h2>
                );
              } else if (level === 3) {
                return renderContentElement(
                  <h3 className={`${baseClass} text-2xl md:text-3xl mt-8 mb-4 leading-tight`} style={{ fontFamily: '"Playfair Display", serif' }}>
                    {blockContent || 'Empty heading'}
                  </h3>
                );
              }
            }
                          break;

                        case 'image':
                          const imageElement = (
                            blockContent ? (
                              <img
                                src={blockContent}
                                alt={metadata?.alt || ''}
                                className={`rounded-lg ${metadata?.size === 'small' ? 'max-w-sm' : metadata?.size === 'large' ? 'w-full' : 'max-w-2xl'} mx-auto`}
                              />
                            ) : (
                              <div className="text-gray-400 text-center py-8">
                                <div className="text-4xl mb-2">🖼️</div>
                                <p>Image placeholder</p>
                              </div>
                            )
                          );

                          return (
                            <div key={block.id} className="mb-8">
                              {affiliateLink?.url ? (
                                <a href={affiliateLink.url} target="_blank" rel="noopener noreferrer">
                                  {imageElement}
                                </a>
                              ) : (
                                imageElement
                              )}
                            </div>
                          );

                        case 'ul':
                        case 'ol':
                          const ListTag = type;
                          return (
                            <ListTag key={block.id} className="mb-8 pl-6 list-disc">
                              {(listItems || []).map((item) => (
                                <li key={item.id} className="mb-2">
                                  {item.type === 'text' ? (item.content || 'Empty item') : (
                                    item.content ? (
                                      <img src={item.content} alt={item.imageMetadata?.alt || ''} className="rounded max-w-sm" />
                                    ) : (
                                      <div className="text-gray-400">Image item</div>
                                    )
                                  )}
                                </li>
                              ))}
                            </ListTag>
                          );

                        default:
                          return null;
                      }
                    }) : (
                      <p className="text-gray-500 italic">No content added yet</p>
                    )}

                    {/* Tags */}
                    {selectedTagIds.length > 0 && (
                      <div className="mt-16 pt-8 border-t border-slate-200">
                        <div className="flex flex-wrap gap-2">
                          {selectedTagIds.map(tagId => {
                            const tag = tags.find(t => t.id === tagId);
                            return tag ? (
                              <span key={tagId} className="bg-[#f0fdfa] text-[#0f766e] px-3 py-1 rounded-full text-sm">
                                #{tag.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
