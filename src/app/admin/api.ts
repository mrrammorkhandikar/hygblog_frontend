// frontend/src/app/admin/api.ts
export const API_BASE = process.env.NEXT_PUBLIC_ADMIN_API || 'http://localhost:8080';

// JWT decode utility
export function decodeJWT(token: string) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (e) {
    return null;
  }
}

// Get current user from token
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('adminToken');
  if (!token) return null;

  const decoded = decodeJWT(token);
  if (!decoded) return null;

  // Check if token is expired
  const currentTime = Math.floor(Date.now() / 1000);
  if (decoded.exp && decoded.exp < currentTime) {
    // Token is expired, clear it
    localStorage.removeItem('adminToken');
    return null;
  }

  return decoded;
}

type FetchMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// Enhanced error types for better error handling
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

class ApiException extends Error implements ApiError {
  status: number;
  code?: string;
  details?: any;
  constructor({ message, status, code, details }: ApiError) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const validateSlug = (slug: string): void => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(slug)) {
    throw new Error('Slug must contain only lowercase letters, numbers, and hyphens');
  }
};

async function request<T>(path: string, token?: string | null, method: FetchMethod = 'GET', body?: any): Promise<T> {
  try {
    // Check if token is provided and not expired
    if (token) {
      const decoded = decodeJWT(token);
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded && decoded.exp && decoded.exp < currentTime) {
        // Token is expired, clear it
        if (typeof window !== 'undefined') {
          localStorage.removeItem('adminToken');
        }
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/login';
        }
        throw new ApiException({
          message: 'Session expired. Please log in again.',
          status: 401,
          code: 'TOKEN_EXPIRED'
        });
      }
    }

    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    if (body) headers['Content-Type'] = 'application/json';

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      // No credentials to avoid CORS issues with wildcard origins
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      let errorMessage = `API ${method} ${path} failed: ${res.status}`;
      let errorDetails: any = null;
      let responseText: string = '';

      try {
        responseText = await res.text(); // Read body once as text
        const errorData = JSON.parse(responseText); // Attempt to parse as JSON
        errorMessage = errorData.message || errorData.error || errorMessage;
        errorDetails = errorData.details || errorData;
      } catch (e) {
        // If JSON parsing fails, use the raw text
        errorMessage = responseText || errorMessage;
      }

      throw new ApiException({
        message: errorMessage,
        status: res.status,
        code: res.status === 401 ? 'UNAUTHORIZED' : res.status === 403 ? 'FORBIDDEN' : 'API_ERROR',
        details: errorDetails
      });
    }

    // If no content
    if (res.status === 204) return null as unknown as T;
    const responseText = await res.text(); // Read body once as text for successful responses
    return responseText ? JSON.parse(responseText) as T : null as unknown as T;
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiException({
      message: error instanceof Error ? error.message : 'Network error occurred',
      status: 0,
      code: 'NETWORK_ERROR'
    });
  }
}

// Enhanced API functions with better error handling
export async function apiGet<T>(path: string, token?: string | null): Promise<T> {
  return request<T>(path, token, 'GET');
}

export async function apiPost<T>(path: string, token?: string | null, body?: any): Promise<T> {
  return request<T>(path, token, 'POST', body);
}

export async function apiPut<T>(path: string, token?: string | null, body?: any): Promise<T> {
  return request<T>(path, token, 'PUT', body);
}

export async function apiDelete<T>(path: string, token?: string | null): Promise<T> {
  return request<T>(path, token, 'DELETE');
}

// LLM Suggestions API
export interface LLMSuggestionContext {
  category?: string;
  tags?: string[];
  title?: string;
  excerpt?: string;
  author?: string;
  content?: string;
}

export interface LLMSuggestionResponse {
  suggestions: string[];
  placeholder: string;
}

export async function apiGetLLMSuggestions(
  fieldType: string,
  context: LLMSuggestionContext,
  currentValue: string = '',
  token?: string | null
): Promise<LLMSuggestionResponse> {
  return apiPost<LLMSuggestionResponse>('/llm/suggestions', token, {
    fieldType,
    context,
    currentValue
  });
}

// File upload utility with validation
export async function uploadFile(file: File, endpoint: string, token?: string | null): Promise<any> {
  // Basic image file validation
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    throw new ApiException({
      message: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
      status: 400,
      code: 'INVALID_FILE_TYPE'
    });
  }

  if (file.size > maxSize) {
    throw new ApiException({
      message: 'File size exceeds 5MB limit',
      status: 400,
      code: 'FILE_TOO_LARGE'
    });
  }
  
  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!res.ok) {
      let errorMessage = `File upload failed: ${res.status}`;
      let responseText: string = '';

      try {
        responseText = await res.text(); // Read body once as text
        const errorData = JSON.parse(responseText); // Attempt to parse as JSON
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If JSON parsing fails, use the raw text
        errorMessage = responseText || errorMessage;
      }

      throw new ApiException({
        message: errorMessage,
        status: res.status,
        code: 'UPLOAD_ERROR'
      });
    }

    return await res.json();
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    
    throw new ApiException({
      message: error instanceof Error ? error.message : 'Upload failed',
      status: 0,
      code: 'UPLOAD_ERROR'
    });
  }
}
