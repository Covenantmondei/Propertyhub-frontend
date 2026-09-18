const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://propertyhub-backend.fastapicloud.dev';

// Token refresh state
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

export function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function refreshAccessToken(): Promise<string> {
  if (typeof window === 'undefined') throw new Error('No window');
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) throw new Error('Token refresh failed');

    const data = await response.json();
    localStorage.setItem('authToken', data.access_token);
    if (data.refresh_token) {
      localStorage.setItem('refreshToken', data.refresh_token);
    }
    return data.access_token;
  } catch (error) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
    throw error;
  }
}

export async function apiCall<T = any>(
  endpoint: string,
  optionsOrMethod?: RequestInit | string,
  body?: any,
  retryCount = 0
): Promise<any> {
  try {
    let options: RequestInit = {};

    if (typeof optionsOrMethod === 'string') {
      options.method = optionsOrMethod;
      if (body) {
        options.body = body instanceof FormData ? body : JSON.stringify(body);
      }
    } else if (optionsOrMethod && typeof optionsOrMethod === 'object') {
      options = { ...optionsOrMethod };
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const isFormData = options.body instanceof FormData;
    
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 401 — token expired
    if (response.status === 401 && retryCount === 0) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            apiCall<T>(endpoint, options, body, 1).then(resolve).catch(reject);
          });
        });
      }

      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        onTokenRefreshed(newToken);
        return await apiCall<T>(endpoint, options, body, 1);
      } catch (refreshError) {
        isRefreshing = false;
        throw refreshError;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = (errorData as any).detail || `HTTP error! status: ${response.status}`;
      return { success: false, error: msg, detail: msg };
    }

    const json = await response.json().catch(() => ({}));
    if (Array.isArray(json)) {
      const arrRes: any = [...json];
      arrRes.success = true;
      arrRes.data = json;
      return arrRes;
    }

    if (typeof json === 'object' && json !== null) {
      return {
        success: true,
        data: json,
        ...json,
      };
    }

    return { success: true, data: json };
  } catch (error: any) {
    console.error('API call failed:', error);
    return { success: false, error: error.message || 'Network error' };
  }
}

// Make apiCall accessible globally for inline scripts if needed
if (typeof window !== 'undefined') {
  (window as any).apiCall = apiCall;
  (window as any).API_BASE_URL = API_BASE_URL;
}

export { API_BASE_URL };
