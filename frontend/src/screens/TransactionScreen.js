import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, RefreshControl, 
  ActivityIndicator, TouchableOpacity, Platform, FlatList, Modal, TextInput 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../constants/theme'; 
import api from '../services/api';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- Estados do Widget de Contas ---
  const [accounts, setAccounts] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAccountForQuickAdd, setSelectedAccountForQuickAdd] = useState(null);
  const [quickAddValue, setQuickAddValue] = useState('');

  // --- Estados do Widget de Transações ---
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingList, setLoadingList] = useState(false);

  // --- Helpers ---
  const formatCurrency = (value) => `R$${value ? value.toFixed(2).replace('.', ',') : '0,00'}`;

  const getCatIcon = (status) => {
    switch(status) {
      case 'happy': return '😺'; case 'worried': return '😿'; case 'sad': return '😭'; default: return '😺';
    }
  };
  const getCatMessage = (status) => {
    switch(status) {
      case 'happy': return 'O gatinho está feliz!'; case 'worried': return 'O gatinho está preocupado.'; case 'sad': return 'O gatinho está chorando!'; default: return 'Cuide do seu dinheiro!';
    }
  };

  // --- API Calls ---
  const fetchAllData = async () => {
    try {
      const date = new Date();
      // 1. Dashboard Info
      const dashRes = await api.get(`/dashboard/${user.id}`, {
        params: { month: date.getMonth() + 1, year: date.getFullYear() }
      });
      setDashboardData(dashRes.data);

      // 2. Contas (Accounts)
      const accRes = await api.get(`/accounts/${user.id}`);
      setAccounts(accRes.data);
      const total = accRes.data.reduce((acc, item) => acc + item.balance, 0);
      setTotalBalance(total);

      // 3. Transações Recentes
      setPage(1);
      setHasMore(true);
      fetchRecentTransactions(1, true);

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchRecentTransactions = async (pageNumber = 1, shouldRefresh = false) => {
    if (loadingList) return;
    setLoadingList(true);
    try {
      const date = new Date();
      const response = await api.get(`/transactions/${user.id}`, {
        params: { month: date.getMonth() + 1, year: date.getFullYear(), page: pageNumber, limit: 5 }
      });
      const newItems = response.data;
      
      if (shouldRefresh) setRecentTransactions(newItems);
      else setRecentTransactions(prev => [...prev, ...newItems]);

      if (newItems.length < 5) setHasMore(false);
      else setHasMore(true);
    } catch (error) { console.log(error); } finally { setLoadingList(false); }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  const loadMoreTransactions = () => {
    if (hasMore && !loadingList) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchRecentTransactions(nextPage);
    }
  };

  // --- Lógica do Modal de Adição Rápida (+) ---
  const openQuickAddModal = (account) => {
    setSelectedAccountForQuickAdd(account);
    setQuickAddValue('');
    setModalVisible(true);
  };

  const handleQuickAdd = async () => {
    if (!quickAddValue || !selectedAccountForQuickAdd) return;

    try {
      const valueToAdd = parseFloat(quickAddValue.replace(',', '.'));
      const newBalance = selectedAccountForQuickAdd.balance + valueToAdd;

      // 1. Atualiza o saldo da Conta
      await api.put(`/accounts/${selectedAccountForQuickAdd.id}`, {
        balance: newBalance
      });

      // 2. CRIA UM LANÇAMENTO AUTOMÁTICO (Para ficar no histórico)
      // Isso resolve a sua dúvida: agora fica registrado que entrou dinheiro.
      await api.post('/transactions', {
        user_id: user.id,
        description: 'Ajuste Rápido / Entrada', // Nome genérico para identificar
        amount: valueToAdd,
        type: 'income',
        date: new Date().toISOString().split('T')[0],
        origin_type: 'account',
        origin_id: selectedAccountForQuickAdd.id,
        is_fixed: 0
      });

      setModalVisible(false);
      fetchAllData(); // Recarrega dashboard e listas
    } catch (error) {
      alert('Erro ao atualizar saldo.');
      console.log(error);
    }
  };

  // --- Renders ---
  const renderTransactionItem = ({ item }) => {
    const isExpense = item.type === 'expense';
    const color = isExpense ? COLORS.error : COLORS.primary;
    const iconName = isExpense ? 'arrow-up-circle' : 'arrow-down-circle';
    return (
      <TouchableOpacity style={styles.miniItemContainer} onPress={() => navigation.navigate('Transaction', { transaction: item })}>
        <Ionicons name={iconName} size={24} color={color} style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
            <Text style={[styles.miniItemTitle, { color: colors.text }]} numberOfLines={1}>{item.description}</Text>
            <Text style={[styles.miniItemSubtitle, { color: colors.subText }]} numberOfLines={1}>{item.category_name || 'Geral'} / {item.account_name || 'Conta'}</Text>
        </View>
        <Text style={[styles.miniItemValue, { color }]}>{formatCurrency(item.amount)}</Text>
      </TouchableOpacity>
    );
  };

  const renderAccountItem = ({ item }) => {
    const isPositive = item.balance >= 0;
    const iconName = item.is_fixed === 1 ? 'wallet-outline' : 'business-outline';

    return (
        <View style={styles.accountRow}>
            <TouchableOpacity 
                style={styles.accountInfoClickable}
                onPress={() => navigation.navigate('AccountForm', { account: item })}
            >
                <Ionicons name={iconName} size={24} color={colors.text} style={{ marginRight: 10 }} />
                <Text style={[styles.accountName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                
                <Text style={[styles.accountValue, { color: isPositive ? colors.primary : colors.error }]}>
                    {formatCurrency(item.balance)}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => openQuickAddModal(item)} style={styles.plusButton}>
                <Ionicons name="add-circle-outline" size={28} color={colors.text} />
            </TouchableOpacity>
        </View>
    );
  };

  const cardStyle = [styles.card, { backgroundColor: colors.card }, Platform.select({ ios: { shadowColor: colors.border }, android: { shadowColor: colors.border }, web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' } })];
  const fabStyle = [styles.fab, { backgroundColor: colors.primary }, Platform.select({ ios: { shadowColor: colors.primary }, android: { shadowColor: colors.primary }, web: { boxShadow: '0px 4px 12px rgba(74, 222, 128, 0.4)' } })];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        nestedScrollEnabled={true}
      >
        <View style={styles.headerRow}>
            <View>
                <Text style={[styles.welcome, { color: colors.subText }]}>Olá, {user?.name}</Text>
                <Text style={[styles.title, { color: colors.text }]}>Visão Geral</Text>
            </View>
            <TouchableOpacity style={[styles.extractButton, { borderColor: colors.primary }]} onPress={() => navigation.navigate('TransactionList')}>
                <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 12 }}>Ver Extrato</Text>
                <Ionicons name="list" size={16} color={colors.primary} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
        ) : (
          <>
            {/* GATINHO */}
            <View style={cardStyle}>
              <View style={styles.catContainer}>
                <Text style={styles.catIcon}>{getCatIcon(dashboardData?.catStatus)}</Text>
                <Text style={[styles.catMessage, { color: colors.text }]}>{getCatMessage(dashboardData?.catStatus)}</Text>
                <Text style={{ color: colors.subText, marginTop: 5 }}>{dashboardData?.percentageConsumed || 0}% da renda consumida</Text>
              </View>
            </View>

            {/* WIDGET CONTAS */}
            <Text style={[styles.sectionTitle, { color: '#2a3b96', marginBottom: 10 }]}>Contas:</Text>
            <View style={[styles.recentCard, { backgroundColor: colors.card, shadowColor: colors.border }]}>
                <View style={{ maxHeight: 250 }}>
                    <FlatList
                        data={accounts}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderAccountItem}
                        scrollEnabled={true}
                        nestedScrollEnabled={true}
                        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 8 }} />}
                    />
                </View>
                <TouchableOpacity 
                    style={[styles.seeAllButton, { backgroundColor: '#2a3b96' }]}
                    onPress={() => navigation.navigate('AccountForm')}
                >
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Adicionar Banco</Text>
                </TouchableOpacity>
                <View style={styles.footerRow}>
                    <Text style={{ color: colors.text, fontWeight: 'bold' }}>Total:</Text>
                    <Text style={{ color: colors.text, fontWeight: 'bold' }}>{formatCurrency(totalBalance)}</Text>
                </View>
            </View>

            {/* WIDGET TRANSAÇÕES */}
            <Text style={[styles.sectionTitle, { color: '#2a3b96', marginTop: 25, marginBottom: 10 }]}>Últimos lançamentos:</Text>
            <View style={[styles.recentCard, { backgroundColor: colors.card, shadowColor: colors.border }]}>
                <Text style={{ color: colors.subText, fontSize: 12, marginBottom: 5 }}>Esse Mês</Text>
                <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 10 }} />
                <View style={{ height: 220 }}> 
                    <FlatList
                        data={recentTransactions}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderTransactionItem}
                        onEndReached={loadMoreTransactions}
                        onEndReachedThreshold={0.1}
                        nestedScrollEnabled={true}
                        ListFooterComponent={loadingList ? <ActivityIndicator size="small" color={colors.primary} /> : null}
                        ListEmptyComponent={<Text style={{ textAlign: 'center', color: colors.subText, marginTop: 20 }}>Sem lançamentos.</Text>}
                    />
                </View>
                <TouchableOpacity 
                    style={[styles.seeAllButton, { backgroundColor: '#2a3b96', marginTop: 10 }]}
                    onPress={() => navigation.navigate('TransactionList')}
                >
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Ver lançamentos</Text>
                </TouchableOpacity>
                <View style={styles.footerRow}>
                    <Text style={{ color: colors.text, fontWeight: 'bold' }}>Total:</Text>
                    {/* Total agora reflete apenas a soma dos lançamentos do mês, não o saldo global */}
                    <Text style={{ color: colors.text, fontWeight: 'bold' }}>{formatCurrency(dashboardData?.income - dashboardData?.expense)}</Text>
                </View>
            </View>

            <View style={{ height: 100 }} />
          </>
        )}
      </ScrollView>

      <TouchableOpacity style={fabStyle} onPress={() => navigation.navigate('Transaction')} activeOpacity={0.8}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* MODAL DE ADIÇÃO RÁPIDA */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Adicionar Saldo</Text>
                <Text style={{ color: colors.subText, marginBottom: 15 }}>
                    Adicionando em: {selectedAccountForQuickAdd?.name}
                </Text>
                <TextInput 
                    style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
                    placeholder="Valor (Ex: 50.00)"
                    placeholderTextColor={colors.subText}
                    keyboardType="numeric"
                    autoFocus
                    value={quickAddValue}
                    onChangeText={setQuickAddValue}
                />
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.primary }]} onPress={handleQuickAdd}>
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Confirmar</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 50 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  welcome: { fontSize: 16 },
  title: { fontSize: 28, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  card: { padding: 20, borderRadius: 16, marginBottom: 20, alignItems: 'center', elevation: 2 },
  recentCard: { borderRadius: 16, padding: 15, elevation: 3, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  accountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5 },
  accountInfoClickable: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  accountName: { fontSize: 14, fontWeight: '600', flex: 1, marginRight: 10 },
  accountValue: { fontSize: 14, fontWeight: 'bold' },
  plusButton: { paddingLeft: 10 },
  miniItemContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  miniItemTitle: { fontSize: 14, fontWeight: 'bold' },
  miniItemSubtitle: { fontSize: 10 },
  miniItemValue: { fontSize: 14, fontWeight: 'bold' },
  seeAllButton: { marginTop: 15, paddingVertical: 12, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, paddingTop: 10 },
  extractButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1 },
  catContainer: { alignItems: 'center' },
  catIcon: { fontSize: 80, marginBottom: 10 },
  catMessage: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: { width: '48%', padding: 15, borderRadius: 12, borderWidth: 1, elevation: 1 },
  amount: { fontSize: 18, fontWeight: 'bold', marginTop: 5 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  fabText: { fontSize: 32, color: '#FFF', fontWeight: 'bold', marginTop: -2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', padding: 20, borderRadius: 16, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalInput: { width: '100%', borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 18, textAlign: 'center', marginBottom: 20 },
  modalButton: { width: '100%', padding: 12, borderRadius: 8, alignItems: 'center' }
});