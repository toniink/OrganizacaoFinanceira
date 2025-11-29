import React, { createContext, useContext, useState } from 'react';
import { theme } from '../constants/theme';

const ThemeContext = createContext({});

export const ThemeProvider = ({ children }) => {
  // Estado para armazenar qual bicho está selecionado (padrão 'cat')
  // Opções: 'cat', 'dog', 'duck' (IDs definidos em constants/pets.js)
  const [selectedPet, setSelectedPet] = useState('cat');

  return (
    <ThemeContext.Provider value={{ ...theme, selectedPet, setSelectedPet }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);