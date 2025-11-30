import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  // --- Cabeçalho ---
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  welcome: { 
    fontSize: 16 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold' 
  },
  extractBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 8, 
    borderRadius: 20, 
    borderWidth: 1 
  },

  // --- Seção do Pet (Gatinho) ---
  petFrame: { 
    width: 160, 
    height: 160, 
    borderRadius: 80, 
    borderWidth: 6, 
    alignItems: 'center', 
    justifyContent: 'center', 
    overflow: 'hidden', 
    backgroundColor: '#fff', 
    elevation: 5, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 5 
  },
  petImage: { 
    width: '100%', 
    height: '100%' 
  },
  balanceRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 10 
  },
  mainBalance: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginTop: 5 
  },

  // --- Cards de Resumo (Entradas/Saídas) ---
  summaryRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 20 
  },
  summaryCard: { 
    flex: 1, 
    height: 70, 
    flexDirection: 'row', 
    overflow: 'hidden' 
  },
  summaryBar: { 
    width: 6, 
    height: '100%' 
  },
  summaryContent: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  summaryLabel: { 
    fontSize: 12, 
    fontWeight: 'bold' 
  },
  summaryValue: { 
    fontSize: 16, 
    fontWeight: 'bold' 
  },

  // --- Seções Gerais ---
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  
  // --- Botões e Rodapés de Cards ---
  fullWidthBtn: { 
    padding: 12, 
    borderRadius: 25, 
    alignItems: 'center', 
    marginTop: 10 
  },
  footerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 15, 
    paddingTop: 10, 
    borderTopWidth: 1, 
    borderTopColor: '#f1f5f9' 
  },

  // --- Abas (Cartões) ---
  tabs: { 
    flexDirection: 'row', 
    marginBottom: 10 
  },
  tab: { 
    flex: 1, 
    padding: 8, 
    alignItems: 'center', 
    borderRadius: 20, 
    marginHorizontal: 5 
  },

  // --- Botões de Ferramentas (Links) ---
  toolBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 15, 
    borderRadius: 16, 
    borderWidth: 1, 
    marginBottom: 10,
    ...Platform.select({ 
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }, 
      default: {} 
    })
  },

  // --- FAB (Botão Flutuante) ---
  fab: { 
    position: 'absolute', 
    bottom: 30, 
    right: 30, 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    alignItems: 'center', 
    justifyContent: 'center', 
    elevation: 10, 
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4
  },
  fabText: { // Caso use texto em vez de ícone
    fontSize: 32, 
    color: '#FFF', 
    fontWeight: 'bold', 
    marginTop: -2 
  },
  
  // Nota: Estilos de Modal foram removidos daqui pois agora pertencem ao componente QuickAddModal
});