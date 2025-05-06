import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/',
});

// Add a response interceptor to handle authentication errors


export default api;