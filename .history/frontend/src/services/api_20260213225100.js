import axios from 'axios';

export const API_BASE_URL = 'http://localhost:8000';

export const getImageUrl = (path) => {
    if (!path) return null;
    return `${API_BASE_URL}${path}`;
};

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const authService = {
    register: (userData) => api.post('/api/register', userData),
    login: (credentials) => api.post('/api/login', credentials),
    forgotPassword: (email) => api.post('/api/forgotpassword', { email }),
    resetPassword: (data) => api.post('/api/resetpassword', data),
    loadProfile: () => api.get('/api/loadprofile'),
    updateProfile: (formData) => {
        return api.put('/api/update-profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    uploadPost: (postData) => {
        return api.post('/api/posts', postData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    getPosts: () => api.get('/api/posts'),
    reportPost: (postId) => api.post(`/api/posts/${postId}/report`),      // NEW
    subscribePost: (postId) => api.post(`/api/posts/${postId}/subscribe`), // NEW
};

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;