import axios from 'axios';
import * as SecureStore from 'expo-secure-store'; // <--- MUDOU AQUI

// SE TIVER RODANDO LOCAL: Use seu IP
// SE JÁ SUBIU NO RENDER: Use o link do Render (ex: https://miau-financeiro.onrender.com)
const API_URL = 'http://192.168.1.15:3333'; 

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interceptador com SecureStore
api.interceptors.request.use(async (config) => {
  try {
    // getItemAsync é a função segura
    const token = await SecureStore.getItemAsync('miau_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Erro ao pegar token:", error);
  }
  return config;
});

// ... (Mantenha as funções registerUser e loginUser iguais)
export const registerUser = async (userData) => {
    // ... (código igual ao anterior)
    const payload = {
        name: userData.username, 
        email: userData.email,
        password: userData.password,
        monthly_income: userData.monthlyIncome 
    };
    const response = await api.post('/register', payload);
    return response.data;
};

export const loginUser = async (email, password) => {
    const response = await api.post('/login', { email, password });
    return response.data;
};

export default api;