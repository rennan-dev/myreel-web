import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

//interceptor de Requisição: Injeta o token antes de enviar
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // quando enviar FormData (upload), deixa o browser definir o boundary do multipart
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

//interceptor de Resposta: Trata tokens expirados globalmente
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if(error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            //redireciona para o login de forma forçada se o token for invalidado
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;