export const COLORS = {
  primary: '#4ade80',    // Verde Financeiro (Sucesso/Dinheiro)
  primaryDark: '#16a34a',
  secondary: '#60a5fa',  // Azul (Informativo)
  background: '#f8fafc', // Fundo claro (off-white)
  card: '#ffffff',       // Fundo dos cartões
  text: '#1e293b',       // Texto principal (quase preto)
  subText: '#64748b',    // Texto secundário (cinza)
  border: '#e2e8f0',     // Bordas sutis
  inputBg: '#f1f5f9',    // Fundo dos inputs
  error: '#ef4444',      // Vermelho erro
  
  // Cores do Gatinho (Moods)
  catHappy: '#22c55e',
  catWorried: '#f59e0b',
  catSad: '#ef4444',
};

export const SIZING = {
  padding: 20,
  radius: 12,
  title: 24,
};

export const FONTS = {
  regular: 'System', // Ou sua fonte customizada
  bold: 'System',    // No Android isso muda para 'Roboto' auto
};

// Tema padrão para o Contexto
export const theme = {
  colors: COLORS,
  sizing: SIZING,
  fonts: FONTS,
};