import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/',
});

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
    response => response,
    error => {
        // If the error response is unauthorized (401) or forbidden (403)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Clear the auth state from localStorage
            localStorage.removeItem('@Auth:token');
            localStorage.removeItem('@Auth:user');
            
            // Redirect to login page
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

export default api;