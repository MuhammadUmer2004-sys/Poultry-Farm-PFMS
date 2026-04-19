export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
    async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        };

        const response = await fetch(`${BASE_URL}/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
            throw new Error('Session expired. Please login again.');
        }

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(errorBody.message || 'API request failed');
        }

        return response.json();
    },

    get(endpoint: string) {
        return this.fetchWithAuth(endpoint, { method: 'GET' });
    },

    post(endpoint: string, data: any) {
        return this.fetchWithAuth(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    put(endpoint: string, data: any) {
        return this.fetchWithAuth(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    delete(endpoint: string) {
        return this.fetchWithAuth(endpoint, { method: 'DELETE' });
    }
};
