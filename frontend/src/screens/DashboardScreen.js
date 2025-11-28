import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, RefreshControl, 
  ActivityIndicator, TouchableOpacity, Platform, FlatList, Modal, TextInput 
} from 'react-native';
import { useFocusEffect, DrawerActions } from '@react-navigation/native';
import { PieChart } from 'react-native-gifted-charts';
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

  // Dados dos Widgets
  const [pieData, setPieData] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [cards, setCards] = useState([]);
  const [cardTab, setCardTab] = useState('open');
  const [cardsTotal, setCardsTotal] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  
  // Controle de Interface
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAccountForQuickAdd, setSelectedAccountForQuickAdd] = useState(null);
  const [quickAddValue, setQuickAddValue] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingList, setLoadingList] = useState(false);

  const formatCurrency = (value) => `R$${value ? value.toFixed(2).replace('.', ',') : '0,00'}`;
  const GRAPH_COLORS = ['#4ade80', '#60a5fa', '#f472b6', '#fbbf24', '#a78bfa', '#2dd4bf'];

  // --- API Calls ---
  const fetchAllData = async () => {
    try {
      const date = new Date();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      // 1. Dashboard + Gráfico
      const dashRes = await api.get(`/dashboard/${user.id}`, { params: { month, year } });
      setDashboardData(dashRes.data);
      
      const { categoryExpenses, expense } = dashRes.data;
      if (categoryExpenses && expense > 0) {
        const formattedPie = categoryExpenses.map((cat, index) => ({
            value: cat.total,
            color: GRAPH_COLORS[index % GRAPH_COLORS.length],
            text: `${((cat.total / expense) * 100).toFixed(0)}%`,
        }));
        setPieData(formattedPie);
        const formattedList = categoryExpenses.slice(0, 2).map((cat, index) => ({
            ...cat, color: GRAPH_COLORS[index % GRAPH_COLORS.length]
        }));
        setCategoryList(formattedList);
      } else {
        setPieData([]);
        setCategoryList([]);
      }

      // 2. Contas
      const accRes = await api.get(`/accounts/${user.id}`);
      setAccounts(accRes.data);
      const totalAcc = accRes.data.reduce((acc, item) => acc + item.balance, 0);
      setTotalBalance(totalAcc);

      // 3. Cartões
      const cardRes = await api.get(`/cards/${user.id}`, { params: { month, year } });
      setCards(cardRes.data);

      // 4. Transações
      setPage(1);
      setHasMore(true);
      fetchRecentTransactions(1, true);

    } catch (error) { console.log(error); } finally { setLoading(false); setRefreshing(false); }
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

  useFocusEffect(useCallback(() => { fetchAllData(); }, []));
  const onRefresh = () => { setRefreshing(true); fetchAllData(); };

  // --- Handlers ---
  const handleQuickAdd = async () => {
    if (!quickAddValue || !selectedAccountForQuickAdd) return;
    try {
      const valueToAdd = parseFloat(quickAddValue.replace(',', '.'));
      const newBalance = selectedAccountForQuickAdd.balance + valueToAdd;
      await api.put(`/accounts/${selectedAccountForQuickAdd.id}`, { balance: newBalance });
      await api.post('/transactions', { 
        user_id: user.id, description: 'Ajuste Rápido / Entrada', amount: valueToAdd, type: 'income', date: new Date().toISOString().split('T')[0], origin_type: 'account', origin_id: selectedAccountForQuickAdd.id, is_fixed: 0 
      });
      setModalVisible(false); fetchAllData();
    } catch (error) { alert('Erro ao atualizar saldo.'); }
  };

  const loadMoreTransactions = () => { if (hasMore && !loadingList) { const nextPage = page + 1; setPage(nextPage); fetchRecentTransactions(nextPage); }};

  // --- Renders Auxiliares ---
  const getCatIcon = (status) => {
    switch(status) { case 'happy': return '😺'; case 'worried': return '😿'; case 'sad': return '😭'; default: return '😺'; }
  };
  const getCatMessage = (status) => {
    switch(status) { case 'happy': return 'O gatinho está feliz!'; case 'worried': return 'O gatinho está preocupado.'; case 'sad': return 'O gatinho está chorando!'; default: return 'Cuide do seu dinheiro!'; }
  };

  // Filtros
  const filteredCards = cards.filter(c => c.invoiceStatus === cardTab);
  const filteredCardsTotal = filteredCards.reduce((acc, item) => acc + item.invoiceAmount, 0);
  const isWeb = Platform.OS === 'web';

  // Componentes de Renderização de Lista (Simplificados para leitura)
  const renderCardItem = (item) => (
    <View key={item.id} style={styles.accountRow}>
        <TouchableOpacity style={styles.accountInfoClickable} onPress={() => navigation.navigate('CardForm', { card: item })}>
            <Ionicons name="card-outline" size={24} color={colors.text} style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
                <Text style={[styles.accountName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                <Text style={{ fontSize: 10, color: colors.subText }}>Fecha dia {item.closing_day}</Text>
            </View>
            <Text style={[styles.accountValue, { color: COLORS.error }]}>{formatCurrency(item.invoiceAmount)}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Transaction', { preSelectedCard: item.id })} style={styles.plusButton}>
            <Ionicons name="add-circle-outline" size={28} color={colors.text} />
        </TouchableOpacity>
    </View>
  );

  const renderAccountItem = (item) => {
    const isPositive = item.balance >= 0;
    const iconName = item.is_fixed === 1 ? 'wallet-outline' : 'business-outline';
    return (
        <View key={item.id} style={styles.accountRow}>
            <TouchableOpacity style={styles.accountInfoClickable} onPress={() => navigation.navigate('AccountForm', { account: item })}>
                <Ionicons name={iconName} size={24} color={colors.text} style={{ marginRight: 10 }} />
                <Text style={[styles.accountName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.accountValue, { color: isPositive ? colors.primary : colors.error }]}>{formatCurrency(item.balance)}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setSelectedAccountForQuickAdd(item); setQuickAddValue(''); setModalVisible(true); }} style={styles.plusButton}>
                <Ionicons name="add-circle-outline" size={28} color={colors.text} />
            </TouchableOpacity>
        </View>
    );
  };

  const renderTransactionItem = (item) => {
    const isExpense = item.type === 'expense';
    const color = isExpense ? COLORS.error : COLORS.primary;
    const iconName = isExpense ? 'arrow-up-circle' : 'arrow-down-circle';
    return (
      <TouchableOpacity key={item.id} style={styles.miniItemContainer} onPress={() => navigation.navigate('Transaction', { transaction: item })}>
        <Ionicons name={iconName} size={24} color={color} style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
            <Text style={[styles.miniItemTitle, { color: colors.text }]} numberOfLines={1}>{item.description}</Text>
            <Text style={[styles.miniItemSubtitle, { color: colors.subText }]} numberOfLines={1}>{item.category_name} / {item.account_name}</Text>
        </View>
        <Text style={[styles.miniItemValue, { color }]}>{formatCurrency(item.amount)}</Text>
      </TouchableOpacity>
    );
  };

  // Lista Segura para Web/Mobile
  const SafeList = ({ data, renderItem, ...props }) => {
    if (isWeb) return <View>{data.map(item => renderItem(item))}</View>;
    return <FlatList data={data} keyExtractor={(item) => item.id.toString()} renderItem={({item}) => renderItem(item)} nestedScrollEnabled={true} {...props} />;
  };

  const cardStyle = [styles.card, { backgroundColor: colors.card }, Platform.select({ ios: { shadowColor: colors.border }, android: { shadowColor: colors.border }, web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' } })];
  const fabStyle = [styles.fab, { backgroundColor: colors.primary }, Platform.select({ ios: { shadowColor: colors.primary }, android: { shadowColor: colors.primary }, web: { boxShadow: '0px 4px 12px rgba(74, 222, 128, 0.4)' } })];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ padding: 20, paddingTop: 50, paddingBottom: 100, flexGrow: 1 }} 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.headerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={{ marginRight: 15 }}>
                    <Ionicons name="menu" size={32} color={colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.welcome, { color: colors.subText }]}>Olá, {user?.name}</Text>
                    <Text style={[styles.title, { color: colors.text }]}>Visão Geral</Text>
                </View>
            </View>
            <TouchableOpacity style={[styles.extractButton, { borderColor: colors.primary }]} onPress={() => navigation.navigate('TransactionList')}><Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 12 }}>Ver Extrato</Text><Ionicons name="list" size={16} color={colors.primary} style={{ marginLeft: 4 }} /></TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
        ) : (
          <>
            {/* 1. GATINHO */}
            <View style={cardStyle}>
              <View style={styles.catContainer}>
                <Text style={styles.catIcon}>{getCatIcon(dashboardData?.catStatus)}</Text>
                <Text style={[styles.catMessage, { color: colors.text }]}>{getCatMessage(dashboardData?.catStatus)}</Text>
                <Text style={{ color: colors.subText, marginTop: 5 }}>{dashboardData?.percentageConsumed || 0}% da renda consumida</Text>
              </View>
            </View>

            {/* 2. RESUMO FINANCEIRO (ENTRADAS / SAÍDAS) - ESTILO CARDS */}
            <View style={styles.summaryContainer}>
                <View style={[styles.summaryCard, { backgroundColor: colors.card, shadowColor: colors.border }]}>
                    <View style={[styles.summaryBar, { backgroundColor: COLORS.primary }]} />
                    <View style={styles.summaryContent}>
                        <Text style={[styles.summaryLabel, { color: COLORS.primary }]}>Entradas</Text>
                        <Text style={[styles.summaryValue, { color: COLORS.primary }]}>{formatCurrency(dashboardData?.income)}</Text>
                    </View>
                </View>
                <View style={[styles.summaryCard, { backgroundColor: colors.card, shadowColor: colors.border }]}>
                    <View style={[styles.summaryBar, { backgroundColor: COLORS.error }]} />
                    <View style={styles.summaryContent}>
                        <Text style={[styles.summaryLabel, { color: COLORS.error }]}>Saídas</Text>
                        <Text style={[styles.summaryValue, { color: COLORS.error }]}>{formatCurrency(dashboardData?.expense)}</Text>
                    </View>
                </View>
            </View>

            {/* 3. GRÁFICO (RESUMO) */}
            {pieData.length > 0 && (
                <>
                    <Text style={[styles.sectionTitle, { color: '#2a3b96', marginBottom: 10, marginTop: 20 }]}>Resumo:</Text>
                    <View style={[styles.recentCard, { backgroundColor: colors.card, shadowColor: colors.border }]}>
                        <View style={{ alignItems: 'center', marginBottom: 20, marginTop: 10 }}>
                            <PieChart data={pieData} donut radius={80} innerRadius={50} textSize={10} showText textColor="white" fontWeight="bold" centerLabelComponent={() => ( <View style={{ justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.text }}>{dashboardData?.percentageConsumed}%</Text><Text style={{ fontSize: 8, color: colors.subText }}>do Saldo</Text></View> )} />
                        </View>
                        {categoryList.map((cat, idx) => ( <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}><View style={{ flexDirection: 'row', alignItems: 'center' }}><View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: cat.color, marginRight: 8 }} /><Text style={{ color: colors.text, fontSize: 14 }}>{cat.name}</Text></View><Text style={{ color: COLORS.error, fontWeight: 'bold' }}>{formatCurrency(cat.total)}</Text></View> ))}
                        <TouchableOpacity style={[styles.seeAllButton, { backgroundColor: '#2a3b96' }]} onPress={() => navigation.navigate('ChartScreen')}><Text style={{ color: '#FFF', fontWeight: 'bold' }}>Ver Gráficos</Text></TouchableOpacity>
                    </View>
                </>
            )}

            {/* 4. CONTAS */}
            <Text style={[styles.sectionTitle, { color: '#2a3b96', marginBottom: 10, marginTop: 20 }]}>Contas:</Text>
            <View style={[styles.recentCard, { backgroundColor: colors.card, shadowColor: colors.border }]}>
                <View style={!isWeb ? { maxHeight: 200 } : {}}>
                    <SafeList data={accounts} renderItem={renderAccountItem} ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 8 }} />} />
                </View>
                <TouchableOpacity style={[styles.seeAllButton, { backgroundColor: '#2a3b96' }]} onPress={() => navigation.navigate('AccountForm')}><Text style={{ color: '#FFF', fontWeight: 'bold' }}>Adicionar Banco</Text></TouchableOpacity>
                <View style={styles.footerRow}><Text style={{ color: colors.text, fontWeight: 'bold' }}>Total:</Text><Text style={{ color: colors.text, fontWeight: 'bold' }}>{formatCurrency(totalBalance)}</Text></View>
            </View>

            {/* 5. CARTÕES */}
            <Text style={[styles.sectionTitle, { color: '#2a3b96', marginTop: 25, marginBottom: 10 }]}>Cartões de Crédito:</Text>
            <View style={[styles.recentCard, { backgroundColor: colors.card, shadowColor: colors.border }]}>
                <View style={styles.tabContainer}>
                    <TouchableOpacity onPress={() => setCardTab('open')} style={[styles.tabButton, cardTab === 'open' && { backgroundColor: '#60a5fa' }]}><Text style={[styles.tabText, cardTab === 'open' ? { color: '#FFF' } : { color: colors.subText }]}>Abertas</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => setCardTab('closed')} style={[styles.tabButton, cardTab === 'closed' && { backgroundColor: '#a78bfa' }]}><Text style={[styles.tabText, cardTab === 'closed' ? { color: '#FFF' } : { color: colors.subText }]}>Fechadas</Text></TouchableOpacity>
                </View>
                <View style={!isWeb ? { maxHeight: 200 } : {}}>
                    <SafeList data={filteredCards} renderItem={renderCardItem} ListEmptyComponent={<Text style={{ textAlign: 'center', color: colors.subText, marginTop: 10 }}>Vazio.</Text>} ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 8 }} />} />
                </View>
                <TouchableOpacity style={[styles.seeAllButton, { backgroundColor: '#2a3b96' }]} onPress={() => navigation.navigate('CardForm')}><Text style={{ color: '#FFF', fontWeight: 'bold' }}>Adicionar Cartão</Text></TouchableOpacity>
                <View style={styles.footerRow}><Text style={{ color: colors.text, fontWeight: 'bold' }}>Total:</Text><Text style={{ color: colors.text, fontWeight: 'bold' }}>{formatCurrency(filteredCardsTotal)}</Text></View>
            </View>

            {/* 6. TRANSAÇÕES */}
            <Text style={[styles.sectionTitle, { color: '#2a3b96', marginTop: 25, marginBottom: 10 }]}>Últimos lançamentos:</Text>
            <View style={[styles.recentCard, { backgroundColor: colors.card, shadowColor: colors.border }]}>
                <View style={!isWeb ? { height: 220 } : {}}> 
                    <SafeList data={recentTransactions} renderItem={renderTransactionItem} onEndReached={loadMoreTransactions} onEndReachedThreshold={0.1} ListEmptyComponent={<Text style={{ textAlign: 'center', color: colors.subText, marginTop: 20 }}>Sem lançamentos.</Text>} />
                </View>
                <TouchableOpacity style={[styles.seeAllButton, { backgroundColor: '#2a3b96', marginTop: 10 }]} onPress={() => navigation.navigate('TransactionList')}><Text style={{ color: '#FFF', fontWeight: 'bold' }}>Ver lançamentos</Text></TouchableOpacity>
            </View>
            
            

            <View style={{ height: 100 }} />

            <TouchableOpacity 
                style={[styles.reportButton, { backgroundColor: colors.card, borderColor: colors.border }]} 
                onPress={() => navigation.navigate('ReportScreen')}
            >
                <Ionicons name="document-text-outline" size={24} color={colors.text} />
                <View style={{ marginLeft: 15, flex: 1 }}>
                    <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>Relatórios Mensais</Text>
                    <Text style={{ color: colors.subText, fontSize: 12 }}>Consulte o balanço detalhado</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.subText} />
            </TouchableOpacity>

            <View style={{ height: 100 }} />

            {/* Botão Assistente IA */}
            <TouchableOpacity 
                style={[styles.toolButton, { backgroundColor: '#e0f2fe', borderColor: '#bae6fd' }]} 
                onPress={() => navigation.navigate('ChatScreen')}
            >
                <Ionicons name="chatbubbles-outline" size={24} color="#0284c7" />
                <View style={{ marginLeft: 15, flex: 1 }}>
                    <Text style={{ color: "#0369a1", fontWeight: 'bold', fontSize: 16 }}>Assistente IA</Text>
                    <Text style={{ color: "#0c4a6e", fontSize: 12 }}>Converse para lançar gastos</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#0369a1" />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* FAB (BOTÃO FLUTUANTE) */}
      <TouchableOpacity 
        style={fabStyle} 
        onPress={() => navigation.navigate('Transaction')} 
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal Quick Add */}
      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Adicionar Saldo</Text>
                <Text style={{ color: colors.subText, marginBottom: 15 }}>{selectedAccountForQuickAdd?.name}</Text>
                <TextInput style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]} placeholder="Valor" placeholderTextColor={colors.subText} keyboardType="numeric" autoFocus value={quickAddValue} onChangeText={setQuickAddValue} />
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.primary }]} onPress={handleQuickAdd}><Text style={{ color: '#FFF', fontWeight: 'bold' }}>Confirmar</Text></TouchableOpacity>
            </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh', overflow: 'hidden' } }) },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  welcome: { fontSize: 16 },
  title: { fontSize: 28, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  card: { padding: 20, borderRadius: 16, marginBottom: 20, alignItems: 'center', elevation: 2 },
  recentCard: { borderRadius: 16, padding: 15, elevation: 3, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  
  // Resumo Entradas/Saídas (Estilizados)
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  summaryCard: { width: '48%', height: 60, borderRadius: 15, flexDirection: 'row', overflow: 'hidden', elevation: 3, ...Platform.select({ ios: { shadowOpacity: 0.1, shadowRadius: 3, shadowOffset: { width: 0, height: 2 } }, web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.05)' } }) },
  summaryBar: { width: 8, height: '100%' },
  summaryContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  summaryLabel: { fontSize: 12, fontWeight: 'bold' },
  summaryValue: { fontSize: 14, fontWeight: 'bold' },

  // Outros estilos
  accountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5 },
  accountInfoClickable: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  accountName: { fontSize: 14, fontWeight: '600', flex: 1, marginRight: 10 },
  accountValue: { fontSize: 14, fontWeight: 'bold' },
  plusButton: { paddingLeft: 10 },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  tabButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 20, marginHorizontal: 5, backgroundColor: '#f1f5f9' },
  tabText: { fontSize: 12, fontWeight: 'bold' },
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
  
  // FAB (Botão Flutuante)
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 10, zIndex: 100, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 },
  fabText: { fontSize: 32, color: '#FFF', fontWeight: 'bold', marginTop: -2 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', padding: 20, borderRadius: 16, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalInput: { width: '100%', borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 18, textAlign: 'center', marginBottom: 20 },
  modalButton: { width: '100%', padding: 12, borderRadius: 8, alignItems: 'center' }
});