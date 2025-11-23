import React, { createContext, useContext } from 'react';
import { theme } from '../constants/theme';

const ThemeContext = createContext({});

export const ThemeProvider = ({ children }) => {
  // Por enquanto retornamos o tema estático, mas aqui entraria a lógica Dark Mode
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);