'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiGet, apiPut, apiPost, apiGetLLMSuggestions, LLMSuggestionContext, LLMSuggestionResponse, getCurrentUser } from '../../api';
import ImageUploadManager from '../../../../components/ImageUploadManager';

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
  type: 'text' | 'image' | 'ul' | 'ol';
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

// Format selected text in textarea for React controlled components
function formatSelectedText(content: string, start: number, end: number, startTag: string, endTag: string): string {
  const selectedText = content.substring(start, end);

  if (selectedText) {
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);
    return beforeText + startTag + selectedText + endTag + afterText;
  }

  return content;
}

// Parse text formatting for preview
function parseFormattedText(text: string): string {
  if (!text) return '';

  // Convert markdown-style formatting to HTML
  let formatted = text;

  // Bold: **text** -> <strong>text</strong>
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italic: *text* -> <em>text</em>
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Underline: <u>text</u> -> <u>text</u> (already HTML)
  // Note: This is already HTML so it will be rendered

  return formatted;
}

// Auto-generate SEO from content
function generateSEO(title: string, excerpt: string, category: string, tagNames: string[], contentBlocks: ContentBlock[]) {
  // Helper to extract text from content blocks
  const extractContentText = (blocks: ContentBlock[]): string => {
    return blocks.map(block => {
      if (block.type === 'text') {
        return block.content;
      }
      return '';
    }).join(' ').trim();
  };

  const contentText = extractContentText(contentBlocks);
  const fullContext = [title, excerpt, category, ...tagNames, contentText].join(' ').toLowerCase();

  // Generate SEO Title (limited to 60 chars)
  const seoTitle = title && title.trim() ? title.trim().substring(0, 60) : 'New Blog Post';

  // Generate SEO Description (based on excerpt or first content paragraph, limited to 160 chars)
  let seoDesc = '';
  if (excerpt.trim()) {
    seoDesc = excerpt.trim().substring(0, 160);
  } else if (contentText) {
    const firstPara = contentBlocks.find(b => b.type === 'text' && b.content.trim())?.content.trim();
    if (firstPara) {
      seoDesc = firstPara.substring(0, 160);
    }
  } else {
    seoDesc = `Learn about ${category} - ${seoTitle}`;
  }

  // Generate Keywords (extract from title, tags, category, and content)
  const keywords: string[] = [];

  // Add title words (important keywords)
  if (title) {
    const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'her', 'she', 'too', 'car'].includes(w));
    keywords.push(...titleWords.slice(0, 3));
  }

  // Add category
  if (category) {
    keywords.push(category.toLowerCase());
  }

  // Add tags
  keywords.push(...tagNames.map(t => t.toLowerCase()));

  // Extract additional keywords from content (basic frequency)
  if (contentText) {
    const words = contentText.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const wordFreq: { [key: string]: number } = {};
    words.forEach(word => {
      if (!['that', 'with', 'have', 'this', 'will', 'your', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'then', 'them', 'well', 'were', 'what', 'when', 'where', 'which', 'while', 'would', 'about', 'after', 'again', 'best', 'could', 'every', 'first', 'great', 'other', 'right', 'small', 'still', 'there', 'these', 'think', 'three', 'under', 'water', 'where', 'which', 'while', 'would'].includes(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    const topWords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);

    keywords.push(...topWords);
  }

  // Remove duplicates and limit to 7 keywords
  const uniqueKeywords = Array.from(new Set(keywords)).slice(0, 7);
  const seoKeywords = uniqueKeywords.join(', ');

  // Ensure at least 5 keywords if possible
  if (uniqueKeywords.length < 5 && fullContext.includes('health') && !keywords.includes('health')) {
    uniqueKeywords.push('health');
  }
  if (uniqueKeywords.length < 5 && fullContext.includes('care') && !keywords.includes('care')) {
    uniqueKeywords.push('care');
  }
  if (uniqueKeywords.length < 5 && fullContext.includes('hygiene') && !keywords.includes('hygiene')) {
    uniqueKeywords.push('hygiene');
  }
  if (uniqueKeywords.length < 6 && fullContext.includes('tips') && !keywords.includes('tips')) {
    uniqueKeywords.push('tips');
  }
  if (uniqueKeywords.length < 7 && fullContext.includes('guide') && !keywords.includes('guide')) {
    uniqueKeywords.push('guide');
  }

  return { seoTitle, seoDesc, seoKeywords: uniqueKeywords.join(', ') };
}

export default function EditPost() {
  const { id } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [author, setAuthor] = useState('');
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(false);
  const [schedulePublish, setSchedulePublish] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [isScheduleInvalid, setIsScheduleInvalid] = useState(false);
  const [sendNotification, setSendNotification] = useState(false);
  const [selectedEmailId, setSelectedEmailId] = useState('');
  const [draftEmails, setDraftEmails] = useState<{id: string, title: string}[]>([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const [titleImagePreview, setTitleImagePreview] = useState<string | null>(null);
  const [titleImageUrl, setTitleImageUrl] = useState<string | null>(null);

  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    { id: '1', type: 'text', content: '', metadata: { level: 0 }, affiliateLink: { type: null } }
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

  // LLM Suggestions state
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [excerptSuggestions, setExcerptSuggestions] = useState<string[]>([]);
  const [contentSuggestions, setContentSuggestions] = useState<string[]>([]);
  const [seoTitleSuggestions, setSeoTitleSuggestions] = useState<string[]>([]);
  const [seoDescriptionSuggestions, setSeoDescriptionSuggestions] = useState<string[]>([]);
  const [seoKeywordSuggestions, setSeoKeywordSuggestions] = useState<string[]>([]);

  const [titlePlaceholder, setTitlePlaceholder] = useState('');
  const [excerptPlaceholder, setExcerptPlaceholder] = useState('');
  const [contentPlaceholder, setContentPlaceholder] = useState('');
  const [seoTitlePlaceholder, setSeoTitlePlaceholder] = useState('');
  const [seoDescriptionPlaceholder, setSeoDescriptionPlaceholder] = useState('');
  const [seoKeywordsPlaceholder, setSeoKeywordsPlaceholder] = useState('');

  const [llmLoading, setLlmLoading] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Generate unique slug (safe for edit)
  const generateSlug = useCallback((title: string, existingSlug?: string): string => {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    if (existingSlug && existingSlug.startsWith(base)) return existingSlug;
    const suffix = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    return `${base}-${suffix}`;
  }, []);

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
    if (!isClient || !token || !id) return;

    if (!token) {
      router.push('/admin/login');
      return;
    }

    // Get current user info
    const user = getCurrentUser();
    setCurrentUser(user);

    Promise.all([
      apiGet<Category[]>('/categories', token),
      apiGet<Tag[]>('/tags', token),
      apiGet(`/posts/${id}`, token)
    ])
      .then(([categoriesData, tagsData, postData]) => {
        setCategories(categoriesData);
        setTags(tagsData);

        const post = postData as any;

        setTitle(post.title || '');
        setExcerpt(post.excerpt || '');
        setSeoTitle(post.seo_title || '');
        setSeoDescription(post.seo_description || '');
        setSeoKeywords(Array.isArray(post.seo_keywords) ? post.seo_keywords.join(', ') : '');
        setAuthor(post.author || '');
        setFeatured(post.featured || false);
        setPublished(post.published || false);

        // Load scheduling data
        if (post.shedule_publish) {
          setSchedulePublish(true);
          setScheduledDateTime(new Date(post.shedule_publish).toISOString().slice(0, 16));
        }
        if (post.notification_email_id) {
          setSelectedEmailId(post.notification_email_id);
          setSendNotification(true);
        }

        // Category
        if (post.category) {
          const cat = categoriesData.find(c => c.name === post.category);
          if (cat) setSelectedCategoryId(cat.id);
        }

        // Tags
        if (Array.isArray(post.tags)) setSelectedTagIds(post.tags);

        // Title image
        if (post.image_url) {
          setTitleImageUrl(post.image_url);
          setTitleImagePreview(post.image_url);
        }

        // Content
        if (post.content) {
          try {
            const parsed = JSON.parse(post.content);
            const blocks = Array.isArray(parsed)
              ? parsed.map((b: any, idx: number) => ({
                  ...b,
                  id: b.id || `${Date.now()}${idx}`,
                  blockNo: b.blockNo ?? idx + 1,
                  affiliateLink: b.affiliateLink ?? { type: null },
                  listItems: b.listItems ?? (b.type === 'ul' || b.type === 'ol' ? [] : undefined)
                }))
              : [];
            setContentBlocks(blocks.length ? blocks : [{ id: '1', type: 'text', content: '', metadata: { level: 1 }, affiliateLink: { type: null } }]);
          } catch (e) {
            console.error('Failed to parse content:', e);
            setError('Invalid content format.');
          }
        }
      })
      .then(() => {
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
      })
      .catch(err => {
        console.error('Failed to load data:', err);
        setError('Failed to load post.');
        if (err.message?.includes('401')) router.push('/admin/login');
      });
  }, [token, router, isClient, id, generateSlug]);

  useEffect(() => {
    validateForm();
  }, [title, validateForm]);

  // Set author name for authors and default for admins
  useEffect(() => {
    if (currentUser?.role === 'author' && currentUser.authorName) {
      setAuthor(currentUser.authorName);
    }
  }, [currentUser]);

  // Auto-generate suggestions when certain fields are filled
  useEffect(() => {
    const timer = setTimeout(() => {
      // Generate title suggestions when category/tags are ready but only offer basic help
      if (!title.trim() && (selectedCategoryId || selectedTagIds.length > 0)) {
        if (!titleSuggestions.length) getLLMSuggestions('title');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [selectedCategoryId, selectedTagIds, title, titleSuggestions]);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Generate excerpt suggestions when title is filled but no excerpt yet
      if (title.trim() && !excerpt.trim() && !excerptSuggestions.length) {
        getLLMSuggestions('excerpt');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [title, excerpt, excerptSuggestions]);

  // Auto-generate SEO when content changes
  useEffect(() => {
    const categoryName = selectedCategoryId ? categories.find(c => c.id === selectedCategoryId)?.name ?? '' : '';
    const tagNames = selectedTagIds.map(tagId => {
      const tag = tags.find(t => t.id === tagId);
      return tag ? tag.name : '';
    }).filter(name => name.length > 0);

    const { seoTitle: newSeoTitle, seoDesc: newSeoDesc, seoKeywords: newSeoKeywords } = generateSEO(
      title,
      excerpt,
      categoryName,
      tagNames,
      contentBlocks
    );

    setSeoTitle(newSeoTitle);
    setSeoDescription(newSeoDesc);
    setSeoKeywords(newSeoKeywords);
  }, [title, excerpt, selectedCategoryId, selectedTagIds, contentBlocks, categories, tags]);

  // Fetch draft blog post emails when send notification is enabled
  useEffect(() => {
    if (sendNotification && token) {
      apiGet<{data: {id: string, title: string}[]}>('/email-manager?status=Draft&type=New Post', token)
        .then(data => {
          setDraftEmails(data.data || []);
        })
        .catch(err => {
          console.error('Failed to load draft emails:', err);
        });
    } else {
      setDraftEmails([]);
      setSelectedEmailId('');
    }
  }, [sendNotification, token]);

  // Reset notification options when publish is unchecked
  useEffect(() => {
    if (!published) {
      setSendNotification(false);
      setSelectedEmailId('');
    }
  }, [published]);

  // Validate scheduled date time
  useEffect(() => {
    if (scheduledDateTime) {
      const selectedDate = new Date(scheduledDateTime);
      const now = new Date();
      setIsScheduleInvalid(selectedDate <= now);
    } else {
      setIsScheduleInvalid(false);
    }
  }, [scheduledDateTime]);

  const addContentBlock = (type: 'text' | 'image' | 'ul' | 'ol') => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: '',
      metadata: type === 'text' ? { level: 0 } : type === 'image' ? { size: 'medium', alt: '' } : undefined,
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

// LLM Suggestion Functions
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

  const getLLMSuggestions = async (fieldType: string, currentValue = '') => {
    if (!token) return;

    setLlmLoading(fieldType);
    try {
      const context = getContextFromForm();
      const response = await apiGetLLMSuggestions(fieldType, context, currentValue, token);

      // Update state based on field type
      switch (fieldType) {
        case 'title':
          setTitleSuggestions(response.suggestions);
          setTitlePlaceholder(response.placeholder);
          break;
        case 'excerpt':
          setExcerptSuggestions(response.suggestions);
          setExcerptPlaceholder(response.placeholder);
          break;
        case 'content':
          setContentSuggestions(response.suggestions);
          setContentPlaceholder(response.placeholder);
          break;
        case 'seo_title':
          setSeoTitleSuggestions(response.suggestions);
          setSeoTitlePlaceholder(response.placeholder);
          break;
        case 'seo_description':
          setSeoDescriptionSuggestions(response.suggestions);
          setSeoDescriptionPlaceholder(response.placeholder);
          break;
        case 'seo_keywords':
          setSeoKeywordSuggestions(response.suggestions);
          setSeoKeywordsPlaceholder(response.placeholder);
          break;
      }
    } catch (error) {
      console.error('LLM suggestions error:', error);
      // Silently fail - LLM is optional
    } finally {
      setLlmLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setError('Please fix form errors.');
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

      const slug = generateSlug(title.trim(), (window as any).currentSlug);

      const payload: any = {
        title: title.trim(),
        slug,
        excerpt: excerpt.trim(),
        content: JSON.stringify(jsonContentBlocks),
        category: selectedCategoryId ? categories.find(c => c.id === selectedCategoryId)?.name || '' : '',
        tags: selectedTagIds,
        image_url: titleImageUrl || null,
        seo_title: seoTitle.trim() || null,
        seo_description: seoDescription.trim() || null,
        seo_keywords: seoKeywords.trim() ? seoKeywords.split(',').map(k => k.trim()).filter(Boolean) : [],
        author: author.trim() || null,
        updated_at: new Date().toISOString()
      };

      // Only include featured/published for admins
      if (currentUser?.role === 'admin') {
        payload.featured = featured;
        payload.published = published;

        // Handle scheduled publishing
        if (schedulePublish && scheduledDateTime) {
          // Store the datetime-local input directly as selected by user
          payload.shedule_publish = scheduledDateTime;
        } else {
          // Clear scheduling if not scheduling
          payload.shedule_publish = null;
        }
      }

      await apiPut(`/posts/${id}`, token, payload);

      // Send notification email if requested and post is published
      if (sendNotification && selectedEmailId && published) {
        try {
          await apiPost(`/email-manager/${selectedEmailId}/send`, token, {});
          console.log('Notification email sent successfully');
        } catch (emailError) {
          console.error('Failed to send notification email:', emailError);
          // Don't fail the entire operation if email fails
        }
      }

      router.push('/admin/dashboard');
    } catch (err: any) {
      console.error('Update failed:', err);
      setError(err.message || 'Failed to update post.');
    } finally {
      setLoading(false);
    }
  };

  if (!isClient || !token) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
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
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors(prev => ({ ...prev, title: '' }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-black placeholder-gray-500"
                placeholder="Enter post title..."
                required
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-black placeholder-gray-500"
                placeholder="Brief description..."
              />
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
                    <option key={auth.id} value={auth.username}>
                      {auth.username}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="author"
                  type="text"
                  value={author}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-black placeholder-gray-500"
                  readOnly
                />
              )}
            </div>
            {currentUser?.role === 'admin' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded border-gray-300 text-teal-600" />
                    <span className="ml-2 text-sm text-gray-700">Featured Post</span>
                  </label>
                </div>

                {/* Publishing Options */}
                <div className="border-t pt-4 space-y-4">
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={published}
                        onChange={(e) => {
                          setPublished(e.target.checked);
                          if (e.target.checked) {
                            // When Publish Immediately is checked, hide Schedule Publish and notification options
                            setSchedulePublish(false);
                            setScheduledDateTime('');
                          }
                        }}
                        className="text-teal-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Publish Immediately</span>
                    </label>
                    {!published && (
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={schedulePublish}
                          onChange={(e) => {
                            setSchedulePublish(e.target.checked);
                            if (e.target.checked) {
                              setPublished(false);
                            }
                          }}
                          className="text-teal-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">Schedule Publish</span>
                      </label>
                    )}
                  </div>

                  {/* Schedule Publish Options */}
                  {schedulePublish && !published && (
                    <div className="ml-6 space-y-4">
                      <div>
                        <label htmlFor="scheduledDateTime" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <span>📅 Publish Date & Time</span>
                          <span className="text-xs text-gray-500">(Future dates only)</span>
                        </label>
                        <div className="relative">
                          <input
                            id="scheduledDateTime"
                            type="datetime-local"
                            value={scheduledDateTime}
                            onChange={(e) => setScheduledDateTime(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-black ${
                              isScheduleInvalid
                                ? 'border-red-300 focus:ring-red-500 bg-red-50'
                                : 'border-gray-300 focus:ring-teal-500'
                            }`}
                            required={schedulePublish}
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            🕐
                          </div>
                        </div>
                        {isScheduleInvalid && scheduledDateTime && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <span>⚠️</span> Please select a future date and time
                          </p>
                        )}
                        {!isScheduleInvalid && scheduledDateTime && (
                          <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                            <span>✅</span> Valid schedule time
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Send notification email - only show if Publish Immediately is checked */}
                  {published && (
                    <div className="ml-6 space-y-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={sendNotification}
                          onChange={(e) => setSendNotification(e.target.checked)}
                          className="rounded border-gray-300 text-teal-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">Send notification email</span>
                      </label>

                      {sendNotification && (
                        <div>
                          <label htmlFor="notificationEmail" className="block text-sm font-medium text-gray-700 mb-2">
                            Select Email Template
                          </label>
                          <select
                            id="notificationEmail"
                            value={selectedEmailId}
                            onChange={(e) => setSelectedEmailId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-black"
                          >
                            <option value="">Select a draft blog post email...</option>
                            {draftEmails.map(email => (
                              <option key={email.id} value={email.id}>
                                {email.title}
                              </option>
                            ))}
                          </select>
                          {draftEmails.length === 0 && (
                            <p className="text-sm text-gray-500 mt-1">
                              No draft blog post emails available. Create one in the Email Manager first.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Title Image */}
        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Title Image</h2>
          <ImageUploadManager
            key={titleImagePreview || 'no-image'}
            onImageUpload={(file, url) => { setTitleImagePreview(url); setTitleImageUrl(url); }}
            onImageRemove={() => { setTitleImagePreview(null); setTitleImageUrl(null); }}
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
              <label className="block text-sm font-medium  mb-2">Tags</label>
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
                      className="rounded border-gray-300 text-black placeholder-gray-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{tag.name}</span>
                  </label>
                ))}
                {filteredTags.length === 0 && <p className="text-sm text-black placeholder-gray-500">No tags found</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Content Blocks */}
        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Content</h2>

          <div className="space-y-4 relative">
            <div className="absolute bottom-4 right-4 flex space-x-2 bg-white p-2 rounded-lg shadow-md border">
              <button type="button" onClick={() => addContentBlock('text')} className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700" title="Add Text Block">📄</button>
              <button type="button" onClick={() => addContentBlock('image')} className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700" title="Add Image Block">🖼️</button>
              <button type="button" onClick={() => addContentBlock('ul')} className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700" title="Add Bullet List">•</button>
              <button type="button" onClick={() => addContentBlock('ol')} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700" title="Add Numbered List">1.</button>
            </div>

            {contentBlocks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-gray-500 mb-4">No content blocks yet. Click the buttons below to add some content.</p>
                <div className="flex justify-center space-x-2">
                  <button type="button" onClick={() => addContentBlock('text')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add Text Block</button>
                  <button type="button" onClick={() => addContentBlock('image')} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Add Image Block</button>
                  <button type="button" onClick={() => addContentBlock('ul')} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Add Bullet List</button>
                  <button type="button" onClick={() => addContentBlock('ol')} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Add Numbered List</button>
                </div>
              </div>
            ) : (
              <>
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

                    {/* Text Block */}
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
                        <div className="flex items-center space-x-1 mb-2 bg-gray-50 p-2 rounded">
                          <button type="button" onClick={() => {
                            const textarea = document.getElementById(`edit-text-block-${block.id}`) as HTMLTextAreaElement;
                            if (textarea) {
                              const start = textarea.selectionStart;
                              const end = textarea.selectionEnd;
                              const selectedText = block.content.substring(start, end);
                              if (selectedText) {
                                const newContent = formatSelectedText(block.content, start, end, '**', '**');
                                updateContentBlock(block.id, { content: newContent });
                                setTimeout(() => {
                                  textarea.focus();
                                  textarea.selectionStart = start + 2;
                                  textarea.selectionEnd = end + 2;
                                }, 0);
                              }
                            }
                          }} className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold" title="Bold">B</button>
                          <button type="button" onClick={() => {
                            const textarea = document.getElementById(`edit-text-block-${block.id}`) as HTMLTextAreaElement;
                            if (textarea) {
                              const start = textarea.selectionStart;
                              const end = textarea.selectionEnd;
                              const selectedText = block.content.substring(start, end);
                              if (selectedText) {
                                const newContent = formatSelectedText(block.content, start, end, '*', '*');
                                updateContentBlock(block.id, { content: newContent });
                                setTimeout(() => {
                                  textarea.focus();
                                  textarea.selectionStart = start + 1;
                                  textarea.selectionEnd = end + 1;
                                }, 0);
                              }
                            }
                          }} className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs italic" title="Italic">I</button>
                          <button type="button" onClick={() => {
                            const textarea = document.getElementById(`edit-text-block-${block.id}`) as HTMLTextAreaElement;
                            if (textarea) {
                              const start = textarea.selectionStart;
                              const end = textarea.selectionEnd;
                              const selectedText = block.content.substring(start, end);
                              if (selectedText) {
                                const newContent = formatSelectedText(block.content, start, end, '<u>', '</u>');
                                updateContentBlock(block.id, { content: newContent });
                                setTimeout(() => {
                                  textarea.focus();
                                  textarea.selectionStart = start + 3;
                                  textarea.selectionEnd = end + 3;
                                }, 0);
                              }
                            }
                          }} className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs underline" title="Underline">U</button>
                        </div>
                        <textarea
                          id={`edit-text-block-${block.id}`}
                          value={block.content}
                          onChange={(e) => updateContentBlock(block.id, { content: e.target.value })}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-black placeholder-gray-500"
                          placeholder={contentPlaceholder || "Enter text..."}
                        />
                        {contentSuggestions.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-gray-500 font-medium">AI Content Suggestions:</p>
                            {contentSuggestions.map((suggestion, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => updateContentBlock(block.id, { content: suggestion })}
                                className="block w-full text-left p-2 text-sm bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded text-purple-700"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : block.type === 'image' ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <label className="text-sm text-gray-600">Size:</label>
                          <select
                            value={block.metadata?.size || 'medium'}
                            onChange={(e) => updateContentBlock(block.id, { metadata: { ...block.metadata, size: e.target.value as any } })}
                            className="px-2 py-1 border border-gray-300 rounded text-sm text-black placeholder-gray-500"
                          >
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                            <option value="custom">Custom</option>
                          </select>
                        </div>
                        {block.metadata?.size === 'custom' && (
                          <div className="flex space-x-3">
                            <input type="number" placeholder="Width" value={block.metadata?.width || ''} onChange={(e) => updateContentBlock(block.id, { metadata: { ...block.metadata, width: Number(e.target.value) } })} className="px-2 py-1 border border-gray-300 rounded text-sm w-20 text-black placeholder-gray-500" />
                            <input type="number" placeholder="Height" value={block.metadata?.height || ''} onChange={(e) => updateContentBlock(block.id, { metadata: { ...block.metadata, height: Number(e.target.value) } })} className="px-2 py-1 border border-gray-300 rounded text-sm w-20 text-black placeholder-gray-500" />
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
                                <div className="flex space-x-1 ">
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
                                className="px-2 py-1 border border-gray-300 rounded text-sm w-full text-black"
                              >
                                <option value="text">Text</option>
                                <option value="image">Image</option>
                              </select>

                            {item.type === 'text' ? (
                                <textarea
                                  value={item.content}
                                  onChange={(e) => updateListItem(block.id, item.id, { content: e.target.value })}
                                  rows={2}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-black focus:ring-2 focus:ring-teal-500"
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
                                    className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    placeholder="Alt text..."
                                  />
                                </div>
                              )}

                              {/* Affiliate Link for List Item */}
                              <div className="border-t pt-2 mt-2">
                                <h4 className="text-xs font-medium text-gray-700 mb-1">Item Affiliate Link (Optional)</h4>
                                <div className="flex space-x-3 mb-1">
                                  <label className="flex items-center">
                                    <input type="radio" name={`item-aff-${item.id}`} value="custom" checked={item.affiliateLink?.type === 'custom'} onChange={() => updateListItem(block.id, item.id, { affiliateLink: { type: 'custom', name: '', url: '' } })} className="text-teal-600" />
                                    <span className="ml-1 text-xs">Custom</span>
                                  </label>
                                  <label className="flex items-center">
                                    <input type="radio" name={`item-aff-${item.id}`} value="none" checked={!item.affiliateLink?.type} onChange={() => updateListItem(block.id, item.id, { affiliateLink: { type: null } })} className="text-teal-600" />
                                    <span className="ml-1 text-xs">None</span>
                                  </label>
                                </div>

                                {item.affiliateLink?.type === 'custom' && (
                                  <div className="space-y-1">
                                    <input type="text" placeholder="Button text" value={item.affiliateLink?.name || ''} onChange={(e) => updateListItem(block.id, item.id, { affiliateLink: { ...item.affiliateLink, name: e.target.value, type: item.affiliateLink?.type ?? null } })} className="w-full text-xs border rounded p-1 text-black placeholder-gray-500" />
                                    <input type="url" placeholder="https://..." value={item.affiliateLink?.url || ''} onChange={(e) => updateListItem(block.id, item.id, { affiliateLink: { ...item.affiliateLink, url: e.target.value, type: item.affiliateLink?.type ?? null } })} className="w-full text-xs border rounded p-1 text-black placeholder-gray-500" />
                                  </div>
                                )}
                              </div>

                              {/* Nested List */}
                              {item.nestedList && item.nestedList.items.length > 0 && (
                                <div className="pl-4 mt-2 border-l-2 border-gray-200">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium F-500">Nested List</span>
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
                                        className="w-full text-sm mt-1 px-2 py-1 border rounded"
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
                          <input type="radio" name={`aff-${block.id}`} value="custom" checked={block.affiliateLink?.type === 'custom'} onChange={() => updateContentBlock(block.id, { affiliateLink: { type: 'custom', name: '', url: '' } })} className="text-teal-600" />
                          <span className="ml-1 text-sm">Custom</span>
                        </label>
                        <label className="flex items-center">
                          <input type="radio" name={`aff-${block.id}`} value="none" checked={!block.affiliateLink?.type} onChange={() => updateContentBlock(block.id, { affiliateLink: { type: null } })} className="text-teal-600" />
                          <span className="ml-1 text-sm">None</span>
                        </label>
                      </div>

                      {block.affiliateLink?.type === 'custom' && (
                        <div className="space-y-2">
                          <input type="text" placeholder="Button text" value={block.affiliateLink?.name || ''} onChange={(e) => updateContentBlock(block.id, { affiliateLink: { ...block.affiliateLink, name: e.target.value, type: block.affiliateLink?.type ?? null } })} className="w-full text-sm border rounded p-1 text-black placeholder-gray-500" />
                          <input type="url" placeholder="https://..." value={block.affiliateLink?.url || ''} onChange={(e) => updateContentBlock(block.id, { affiliateLink: { ...block.affiliateLink, url: e.target.value, type: block.affiliateLink?.type ?? null } })} className="w-full text-sm border rounded p-1 text-black placeholder-gray-500" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">SEO Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SEO Title</label>
              <input id="seoTitle" type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="SEO Title" className="w-full px-3 py-2 border text-black rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SEO Description</label>
              <textarea id="seoDesc" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={3} placeholder="SEO Description" className="w-full px-3 py-2 border text-black rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SEO Keywords</label>
              <input id="seoKeywords" type="text" value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} placeholder="keyword1, keyword2" className="w-full px-3 py-2 border text-black rounded-md" />
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
            <span>{loading ? 'Updating...' : 'Update Post'}</span>
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
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                  <div className="flex items-start gap-6">
                    {titleImagePreview ? (
                      <div className="flex-shrink-0">
                        <img src={titleImagePreview} alt={title} className="w-32 h-32 object-cover rounded-lg border" />
                      </div>
                    ) : (
                      <div className="flex-shrink-0">
                        <div className="w-32 h-32 bg-gray-100 border rounded-lg flex items-center justify-center">
                          <span className="text-gray-400">🖼️</span>
                        </div>
                      </div>
                    )}
                    <div className="flex-1">
                      {selectedCategoryId && (
                        <div className="mb-3">
                          <span className="bg-[#0f766e] text-white px-3 py-1 rounded-full text-sm font-medium">
                            {categories.find(c => c.id === selectedCategoryId)?.name || 'Category'}
                          </span>
                        </div>
                      )}
                      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2" style={{ fontFamily: `"Playfair Display", serif` }}>
                        {title || 'Untitled Post'}
                      </h1>
                    </div>
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
                                <p key={block.id} className={`mb-6 leading-relaxed text-gray-800 text-base${contentClass}`} dangerouslySetInnerHTML={{ __html: parseFormattedText(blockContent || 'Empty paragraph') }} />
                              );
                            } else {
                              const baseClass = `font-bold text-[#0f766e]${contentClass}`;
                              const formattedContent = parseFormattedText(blockContent || 'Empty heading');
                              if (level === 1) {
                                return renderContentElement(
                                  <h1 key={block.id} className={`${baseClass} text-4xl md:text-5xl mt-12 mb-6 leading-tight`} style={{ fontFamily: '"Playfair Display", serif' }} dangerouslySetInnerHTML={{ __html: formattedContent }} />
                                );
                              } else if (level === 2) {
                                return renderContentElement(
                                  <h2 key={block.id} className={`${baseClass} text-3xl md:text-4xl mt-10 mb-5 leading-tight`} style={{ fontFamily: '"Playfair Display", serif' }} dangerouslySetInnerHTML={{ __html: formattedContent }} />
                                );
                              } else if (level === 3) {
                                return renderContentElement(
                                  <h3 key={block.id} className={`${baseClass} text-2xl md:text-3xl mt-8 mb-4 leading-tight`} style={{ fontFamily: '"Playfair Display", serif' }} dangerouslySetInnerHTML={{ __html: formattedContent }} />
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
                          const renderListItem = (item: ListItem): React.ReactNode => {
                            const content = item.type === 'text' ? (item.content || 'Empty item') : (
                              item.content ? (
                                <img src={item.content} alt={item.imageMetadata?.alt || ''} className="rounded max-w-sm" />
                              ) : (
                                <div className="text-gray-400">Image item</div>
                              )
                            );

                            // Wrap content with affiliate link if available
                            // First check item-level affiliate link, then fall back to block-level
                            const itemAffiliateLink = item.affiliateLink?.url || block.affiliateLink?.url;
                            const itemContent = itemAffiliateLink ? (
                              <a href={itemAffiliateLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {content}
                              </a>
                            ) : content;

                            return (
                              <li key={item.id} className="mb-2">
                                {itemContent}
                                {item.nestedList && item.nestedList.items.length > 0 && (
                                  <ul className="ml-6 mt-2 list-disc">
                                    {item.nestedList.items.map(nestedItem => renderListItem(nestedItem))}
                                  </ul>
                                )}
                              </li>
                            );
                          };

                          const ListTag = type;
                          return (
                            <ListTag key={block.id} className="mb-8 pl-6 list-disc text-black">
                              {(listItems || []).map((item) => renderListItem(item))}
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
