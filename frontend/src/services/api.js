import axios from 'axios';

// ATENÇÃO: Se estiver no Android Emulator use '10.0.2.2'.
// Se estiver no iPhone físico ou Android físico, use o IP da sua máquina (ex: 192.168.1.X)
// 'localhost' só funciona no iOS Simulator.
export const API_URL = 'http://localhost:3333'; 

const api = axios.create({
  baseURL: API_URL,
});

export const registerUser = async (userData) => {
  // userData recebido do form: { username, email, password, monthlyIncome }
  
  const payload = {
    name: userData.username, 
    email: userData.email,
    password: userData.password,
    // Backend espera 'monthly_income' (snake_case), Front envia 'monthlyIncome' (camelCase)
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