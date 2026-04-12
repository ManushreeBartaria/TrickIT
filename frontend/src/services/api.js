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
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    uploadPost: (postData) => {
        return api.post('/api/posts', postData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    getPosts: () => api.get('/api/posts'),
    reportPost: (postId) => api.post(`/api/posts/${postId}/report`),
    subscribePost: (postId) => api.post(`/api/posts/${postId}/subscribe`),
    joinCommunity: (data) => api.post('/api/join-community', data),   // NEW
    communityStatus: () => api.get('/api/community-status'),          // NEW
    getSubscribedCreators: () => api.get('/api/community/creators'),
    getMySubscribers: () => api.get('/api/community/subscribers'),
    getChatHistory: (userId) => api.get(`/api/chat/${userId}`),
    sendMessage: (userId, content) => api.post(`/api/chat/${userId}`, { content }),
    // Payment
    initiatePayment: () => api.post('/api/payment/initiate'),
    verifyPayment: (data) => api.post('/api/payment/verify', data),
    paymentStatus: () => api.get('/api/payment/status'),
};

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;