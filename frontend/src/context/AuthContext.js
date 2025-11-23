import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser } from '../services/api';
// import AsyncStorage from '@react-native-async-storage/async-storage'; // Instalar depois para persistir

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await loginUser(email, password);
      // O Backend retorna { user: { id, name, email } }
      setUser(data.user);
      // await AsyncStorage.setItem('@App:user', JSON.stringify(data.user));
    } catch (error) {
      throw error; // Joga o erro para a tela tratar
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    // await AsyncStorage.removeItem('@App:user');
  };

  return (
    <AuthContext.Provider value={{ user, signed: !!user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);