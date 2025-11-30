import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- CONFIGURAÇÃO DE CONEXÃO ---
// 1. Emulador Android: 'http://10.0.2.2:3333'
// 2. Emulador iOS: 'http://localhost:3333'
// 3. Celular Físico: Use o IP do seu computador (ex: 192.168.1.15)

// ATENÇÃO: TROQUE PELO SEU IP LOCAL
const SEU_IP = '10.0.0.167'; 

export const API_URL = `http://${SEU_IP}:3333`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 segundos
});

// --- INTERCEPTOR (O segredo do JWT) ---
// Antes de cada requisição sair do celular, este código roda.
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('@MiauApp:token');
    
    if (token) {
      // Se tiver token, cola no cabeçalho
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Erro ao pegar token no storage:", error);
  }
  return config;
});

// --- FUNÇÕES DE AUXÍLIO ---

export const registerUser = async (userData) => {
  // userData = { name, email, password, monthlyIncome }
  const payload = {
    name: userData.username, 
    email: userData.email,
    password: userData.password,
    monthly_income: userData.monthlyIncome 
  };

  try {
    const response = await api.post('/register', payload);
    return response.data;
  } catch (error) {
    console.error("Erro no Registro:", error.response?.data || error.message);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/login', { email, password });
    return response.data; 
    // O Backend retorna { user: {...}, token: "..." }
  } catch (error) {
    console.error("Erro no Login:", error.response?.data || error.message);
    throw error;
  }
};

export default api;