import axios from 'axios';

const api = axios.create({
    baseURL: 'https://ws-repo.onrender.com/',
});

export default api;