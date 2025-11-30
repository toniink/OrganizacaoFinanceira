import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store'; // Armazenamento seguro para o Token
import AsyncStorage from '@react-native-async-storage/async-storage'; // Armazenamento comum para dados do usuário
import { loginUser } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Começa true para verificar se já existe login

  // Ao abrir o App, verifica se tem dados salvos
  useEffect(() => {
    async function loadStorageData() {
      try {
        // Tenta recuperar o token (Seguro) e o usuário (Texto)
        const storedToken = await SecureStore.getItemAsync('miau_token');
        const storedUser = await AsyncStorage.getItem('@MiauApp:user');

        if (storedToken && storedUser) {
          // Se ambos existirem, restaura a sessão automaticamente
          // O token será injetado automaticamente nas requisições pelo interceptor no api.js
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log("Erro ao carregar sessão salva:", error);
      } finally {
        // Finaliza o carregamento, permitindo que o Routes decida (Login ou Dashboard)
        setIsLoading(false);
      }
    }

    loadStorageData();
  }, []);

  // Função de Login
  const login = async (email, password) => {
    try {
      const response = await loginUser(email, password);
      
      // O backend retorna { user: {...}, token: "..." }
      const { user, token } = response;

      // 1. Atualiza estado da aplicação (entra na área logada)
      setUser(user);

      // 2. Salva dados para persistência
      // Token vai para o cofre seguro
      await SecureStore.setItemAsync('miau_token', token);
      // Dados não sensíveis do usuário vão para o storage comum
      await AsyncStorage.setItem('@MiauApp:user', JSON.stringify(user));

    } catch (error) {
      // Repassa o erro para a tela mostrar o alerta
      throw error;
    }
  };

  // Função de Logout
  const logout = async () => {
    setUser(null);
    // Limpa tudo do dispositivo
    await SecureStore.deleteItemAsync('miau_token');
    await AsyncStorage.removeItem('@MiauApp:user');
  };

  return (
    <AuthContext.Provider value={{ 
      signed: !!user, // Booleano simples para checagem de rota
      user, 
      login, 
      logout, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para facilitar o uso em outras telas
export const useAuth = () => useContext(AuthContext);