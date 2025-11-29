import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    ...Platform.select({ web: { height: '100vh', overflow: 'hidden' } }) 
  },
  content: { 
    padding: 20, 
    paddingTop: 50, 
    paddingBottom: 100, 
    flexGrow: 1 
  },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  welcome: { fontSize: 16 },
  title: { fontSize: 28, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  
  card: { 
    padding: 20, 
    borderRadius: 16, 
    marginBottom: 20, 
    alignItems: 'center', 
    elevation: 2 
  },
  recentCard: { 
    borderRadius: 16, 
    padding: 15, 
    elevation: 3, 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4 
  },
  
  accountRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 5 
  },
  accountInfoClickable: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  accountName: { fontSize: 14, fontWeight: '600', flex: 1, marginRight: 10 },
  accountValue: { fontSize: 14, fontWeight: 'bold' },
  plusButton: { paddingLeft: 10 },
  
  tabContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  tabButton: { 
    flex: 1, 
    paddingVertical: 8, 
    alignItems: 'center', 
    borderRadius: 20, 
    marginHorizontal: 5, 
    backgroundColor: '#f1f5f9' 
  },
  tabText: { fontSize: 12, fontWeight: 'bold' },
  
  miniItemContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f5f9' 
  },
  miniItemTitle: { fontSize: 14, fontWeight: 'bold' },
  miniItemSubtitle: { fontSize: 10 },
  miniItemValue: { fontSize: 14, fontWeight: 'bold' },
  
  seeAllButton: { 
    marginTop: 15, 
    paddingVertical: 12, 
    borderRadius: 25, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  footerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 15, 
    paddingTop: 10, 
    borderTopWidth: 1, 
    borderTopColor: '#f1f5f9' 
  },
  
  extractButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 20, 
    borderWidth: 1 
  },
  
  catContainer: { alignItems: 'center' },
  catIcon: { fontSize: 80, marginBottom: 10 },
  catMessage: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  
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
  petImage: { width: '100%', height: '100%' },
  balanceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  mainBalance: { fontSize: 28, fontWeight: 'bold', marginTop: 5 },
  
  summaryContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 20 
  },
  summaryCard: { 
    flex: 1, 
    height: 70, 
    flexDirection: 'row', 
    overflow: 'hidden',
    elevation: 3,
    ...Platform.select({
        ios: { shadowOpacity: 0.1, shadowRadius: 3, shadowOffset: { width: 0, height: 2 } },
        web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.05)' }
    })
  },
  summaryBar: { width: 6, height: '100%' },
  summaryContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  summaryLabel: { fontSize: 12, fontWeight: 'bold' },
  summaryValue: { fontSize: 16, fontWeight: 'bold' },
  
  rowItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f5f9' 
  },
  rowClickable: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rowTitle: { fontSize: 14, fontWeight: '600' },
  rowValue: { fontSize: 14, fontWeight: 'bold' },
  plusBtn: { paddingLeft: 10 },
  
  toolBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 15, 
    borderRadius: 16, 
    borderWidth: 1, 
    marginBottom: 10,
    ...Platform.select({ web: { boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }, default: {} })
  },
  
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
  fabText: { fontSize: 32, color: '#FFF', fontWeight: 'bold', marginTop: -2 },
  
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    width: '80%', 
    padding: 20, 
    borderRadius: 16, 
    alignItems: 'center', 
    elevation: 5 
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalInput: { 
    width: '100%', 
    borderWidth: 1, 
    borderRadius: 8, 
    padding: 10, 
    fontSize: 18, 
    textAlign: 'center', 
    marginBottom: 20 
  },
  modalButton: { 
    width: '100%', 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  fullWidthBtn: { 
    padding: 12, 
    borderRadius: 25, 
    alignItems: 'center', 
    marginTop: 10 
  },
});