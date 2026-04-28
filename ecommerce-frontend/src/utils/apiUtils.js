const DEFAULT_API_BASE_URL = 'http://localhost:8081';

export const API_BASE_URL = (process.env.REACT_APP_API_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');

export function buildApiUrl(path = '') {
    if (!path) return API_BASE_URL;
    if (/^https?:\/\//i.test(path)) return path;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
}

export async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(buildApiUrl(url), {
        ...options,
        headers,
    });

    if (response.status === 401 || response.status === 403) {
    }

    if (!response.ok) {
        let errorMessage = 'An error occurred';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
        }
        throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return await response.json();
    }
    
    return response;
}
