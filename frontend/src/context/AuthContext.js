import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Começa carregando para verificar storage

  useEffect(() => {
    // Ao iniciar o app, verifica se tem usuário e token salvos
    async function loadStorageData() {
      try {
        // Recupera os dados do armazenamento local do celular
        const storedUser = await AsyncStorage.getItem('@MiauApp:user');
        const storedToken = await AsyncStorage.getItem('@MiauApp:token');

        if (storedUser && storedToken) {
          // Se tiver dados, restaura a sessão automaticamente
          // O token será pego automaticamente pelo interceptor do axios no api.js
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log("Erro ao carregar dados do storage:", error);
      } finally {
        // Finaliza o carregamento, permitindo que as Rotas decidam qual tela mostrar
        setIsLoading(false); 
      }
    }

    loadStorageData();
  }, []);

  const login = async (email, password) => {
    // O loading aqui é controlado pela tela de Login, mas podemos setar true se quisermos bloquear tudo
    try {
      const response = await loginUser(email, password);
      
      // O backend retorna { user: {...}, token: "..." }
      const { user, token } = response;

      // 1. Define o estado (faz o app entrar na área logada imediatamente)
      setUser(user);

      // 2. Salva no armazenamento do celular para persistência
      await AsyncStorage.setItem('@MiauApp:user', JSON.stringify(user));
      await AsyncStorage.setItem('@MiauApp:token', token);

    } catch (error) {
      // Repassa o erro para a tela de Login tratar (exibir o alert)
      throw error;
    }
  };

  const logout = async () => {
    setUser(null);
    // Limpa o armazenamento ao sair
    await AsyncStorage.removeItem('@MiauApp:user');
    await AsyncStorage.removeItem('@MiauApp:token');
  };

  return (
    <AuthContext.Provider value={{ 
      signed: !!user, // Booleano para as rotas saberem se está logado
      user, 
      login, 
      logout, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para facilitar o uso
export const useAuth = () => useContext(AuthContext);