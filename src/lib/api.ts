// export const API_URL = typeof window !== 'undefined'
//   ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.'))
//     ? 'http://localhost:5000'
//     : 'https://api.nammaorrufoods.com'sss
//   : 'https://api.nammaorrufoods.com';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.'))
    ? 'http://localhost:5000'
    : 'https://api.nammaorrufoods.com'
);
// export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 1500): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                ...(options.headers || {})
            }
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

// Global tracking for active network requests (for monitoring/loading bars)
let activeRequestsCount = 0;

const notifyActivityChange = () => {
    if (typeof window !== 'undefined') {
        const event = new CustomEvent('api-activity', {
            detail: { activeRequests: activeRequestsCount }
        });
        window.dispatchEvent(event);
    }
};

// Custom API Error class
export class ApiError extends Error {
    status: number;
    statusText: string;
    data: any;

    constructor(status: number, statusText: string, data: any) {
        super(`API Error: ${status} ${statusText}`);
        this.name = 'ApiError';
        this.status = status;
        this.statusText = statusText;
        this.data = data;
    }
}

// Client-side initialization: Monkey-patch window.fetch
if (typeof window !== 'undefined' && !(window as any).__api_patched) {
    const originalFetch = window.fetch;
    (window as any).__api_patched = true;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const urlString = typeof input === 'string'
            ? input
            : input instanceof URL
                ? input.toString()
                : input.url;

        const isBackendApi = urlString.startsWith(API_URL);

        // If it's not a backend API request, bypass all custom interceptors/logging
        if (!isBackendApi) {
            return originalFetch(input, init);
        }

        // --- REQUEST INTERCEPTOR ---
        const method = init?.method || 'GET';
        const startTime = performance.now();
        const requestId = Math.random().toString(36).substring(2, 7).toUpperCase();

        // Clone request options to inject custom headers safely
        const requestOptions: RequestInit = { ...init };
        const headers = new Headers(requestOptions.headers || {});

        // Automatically append Authorization Token if logged in
        const token = localStorage.getItem('namma_orru_token');
        if (token && !headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        // Set standard Content-Type if sending JSON and not already set (like FormData)
        if (init?.body && typeof init.body === 'string' && !headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }

        requestOptions.headers = headers;

        // Timeout configurations (Default 10s timeout)
        const timeoutDuration = 10000;

        // Styled Console Logging (Request)
        if (process.env.NODE_ENV !== 'production' || localStorage.getItem('api_debug') === 'true') {
            console.groupCollapsed(
                `%c⚡ [API Request] [ID: ${requestId}] ${method} ➔ ${urlString.replace(API_URL, '')}`,
                'color: #0ea5e9; font-weight: bold;'
            );
            console.log('Full URL:', urlString);
            console.log('Headers:', Object.fromEntries(headers.entries()));
            if (init?.body) {
                try {
                    console.log('Payload:', typeof init.body === 'string' ? JSON.parse(init.body) : init.body);
                } catch {
                    console.log('Payload (Raw):', init.body);
                }
            }
            console.groupEnd();
        }

        activeRequestsCount++;
        notifyActivityChange();

        let attempt = 0;
        const maxRetries = method === 'GET' ? 2 : 0; // Retry idempotent GET requests only
        let lastError: any = null;

        while (attempt <= maxRetries) {
            let timeoutId: NodeJS.Timeout | null = null;
            const controller = new AbortController();
            let userAbortHandler: (() => void) | null = null;
            const originalSignal = init?.signal;

            if (originalSignal) {
                if (originalSignal.aborted) {
                    controller.abort();
                } else {
                    userAbortHandler = () => controller.abort();
                    originalSignal.addEventListener('abort', userAbortHandler);
                }
            }
            requestOptions.signal = controller.signal;

            try {
                if (attempt > 0) {
                    if (process.env.NODE_ENV !== 'production') {
                        console.warn(
                            `%c🔄 [API Retry] [ID: ${requestId}] Attempt ${attempt}/${maxRetries} for ${method} ${urlString.replace(API_URL, '')}`,
                            'color: #f59e0b; font-weight: bold;'
                        );
                    }
                    // Slight backoff delay before retrying
                    await new Promise(resolve => setTimeout(resolve, attempt * 500));
                }

                // Set the timer for the timeout
                timeoutId = setTimeout(() => {
                    controller.abort();
                }, timeoutDuration);

                const response = await originalFetch(urlString, requestOptions);

                if (timeoutId) clearTimeout(timeoutId);
                if (originalSignal && userAbortHandler) {
                    originalSignal.removeEventListener('abort', userAbortHandler);
                }

                const endTime = performance.now();
                const duration = Math.round(endTime - startTime);

                // --- RESPONSE INTERCEPTOR ---
                activeRequestsCount--;
                notifyActivityChange();

                // Styled Console Logging (Response)
                if (process.env.NODE_ENV !== 'production' || localStorage.getItem('api_debug') === 'true') {
                    const statusColor = response.ok ? '#10b981' : '#ef4444';
                    console.groupCollapsed(
                        `%c🟢 [API Response] [ID: ${requestId}] ${response.status} ${response.statusText} (${duration}ms) ➔ ${method} ${urlString.replace(API_URL, '')}`,
                        `color: ${statusColor}; font-weight: bold;`
                    );
                    console.log('Status Code:', response.status);
                    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
                    console.groupEnd();
                }

                // Global 401 Unauthorized handling (token expired/invalid)
                if (response.status === 401) {
                    console.warn('%c⚠️ [API Auth] Token expired or invalid (401). Clearing session...', 'color: #f59e0b; font-weight: bold;');
                    localStorage.removeItem('namma_orru_token');
                    // Dispatch a global auth failure event to notify AuthContext or page
                    window.dispatchEvent(new CustomEvent('auth-session-expired'));
                }

                return response;

            } catch (err: any) {
                if (timeoutId) clearTimeout(timeoutId);
                if (originalSignal && userAbortHandler) {
                    originalSignal.removeEventListener('abort', userAbortHandler);
                }
                attempt++;
                lastError = err;

                const isUserAbort = err.name === 'AbortError' && init?.signal?.aborted;
                const isTimeout = err.name === 'AbortError' && !isUserAbort;
                const errorMessage = isTimeout
                    ? `Request Timeout after ${timeoutDuration}ms`
                    : isUserAbort
                        ? 'Request aborted by caller'
                        : err.message || 'Network connection failed';

                if (process.env.NODE_ENV !== 'production') {
                    if (isUserAbort) {
                        console.debug(
                            `%c⚪ [API Aborted] [ID: ${requestId}] ${errorMessage} ➔ ${method} ${urlString.replace(API_URL, '')}`,
                            'color: #94a3b8; font-weight: bold;'
                        );
                    } else {
                        console.error(
                            `%c🔴 [API Error] [ID: ${requestId}] ${errorMessage} ➔ ${method} ${urlString.replace(API_URL, '')}`,
                            'color: #ef4444; font-weight: bold;',
                            err
                        );
                    }
                }

                if (!isUserAbort) {
                    // Dispatch api error event for global alert monitors
                    window.dispatchEvent(new CustomEvent('api-error', {
                        detail: { method, url: urlString, error: errorMessage }
                    }));
                }

                if (attempt > maxRetries) {
                    activeRequestsCount--;
                    notifyActivityChange();
                    throw err;
                }
            }
        }

        activeRequestsCount--;
        notifyActivityChange();
        throw lastError;
    };
}

// Helper: safe JSON response parsing
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        let errorData = null;
        try {
            errorData = await response.json();
        } catch {
            try {
                errorData = { message: await response.text() };
            } catch {
                errorData = { error: 'Unknown response format' };
            }
        }
        throw new ApiError(response.status, response.statusText, errorData);
    }

    const contentType = response.headers.get('Content-Type') || '';
    if (contentType.includes('application/json')) {
        return response.json();
    }
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch {
        return { message: text };
    }
};

// Centralized API Client Service (Axios-like interface)
export const apiClient = {
    get: async <T = any>(endpoint: string, options?: RequestInit): Promise<T> => {
        const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
        const res = await fetch(url, { ...options, method: 'GET' });
        return handleResponse(res);
    },

    post: async <T = any>(endpoint: string, body?: any, options?: RequestInit): Promise<T> => {
        const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
        const config: RequestInit = {
            ...options,
            method: 'POST',
        };
        if (body) {
            config.body = body instanceof FormData ? body : JSON.stringify(body);
        }
        const res = await fetch(url, config);
        return handleResponse(res);
    },

    put: async <T = any>(endpoint: string, body?: any, options?: RequestInit): Promise<T> => {
        const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
        const config: RequestInit = {
            ...options,
            method: 'PUT',
        };
        if (body) {
            config.body = body instanceof FormData ? body : JSON.stringify(body);
        }
        const res = await fetch(url, config);
        return handleResponse(res);
    },

    patch: async <T = any>(endpoint: string, body?: any, options?: RequestInit): Promise<T> => {
        const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
        const config: RequestInit = {
            ...options,
            method: 'PATCH',
        };
        if (body) {
            config.body = body instanceof FormData ? body : JSON.stringify(body);
        }
        const res = await fetch(url, config);
        return handleResponse(res);
    },

    delete: async <T = any>(endpoint: string, options?: RequestInit): Promise<T> => {
        const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
        const res = await fetch(url, { ...options, method: 'DELETE' });
        return handleResponse(res);
    }
};
