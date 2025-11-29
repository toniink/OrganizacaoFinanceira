import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, RefreshControl, 
  ActivityIndicator, TouchableOpacity, Platform, FlatList, Modal, TextInput, Image 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';

// Contextos e Componentes
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../constants/theme'; 
import { PETS } from '../constants/pets';
import api from '../services/api';
import ScreenWrapper from '../components/ScreenWrapper';
import AppHeader from '../components/AppHeader';
import InfoCard from '../components/InfoCard';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const { colors, selectedPet } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  // Dados
  const [pieData, setPieData] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [cards, setCards] = useState([]);
  const [cardTab, setCardTab] = useState('open');
  const [recentTransactions, setRecentTransactions] = useState([]);
  
  // Controles
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAccountForQuickAdd, setSelectedAccountForQuickAdd] = useState(null);
  const [quickAddValue, setQuickAddValue] = useState('');
  const [showBalance, setShowBalance] = useState(true);
  
  const [loadingList, setLoadingList] = useState(false);

  const isWeb = Platform.OS === 'web';
  const formatCurrency = (val) => `R$${val ? val.toFixed(2).replace('.', ',') : '0,00'}`;
  const GRAPH_COLORS = ['#4ade80', '#60a5fa', '#f472b6', '#fbbf24', '#a78bfa', '#2dd4bf'];

  // --- Helpers de Tema (Pet) ---
  const currentPetObj = PETS.find(p => p.id === selectedPet) || PETS[0];
  
  const getPetImageSource = (status) => {
    switch(status) {
      case 'happy': return currentPetObj.imageHappy;
      case 'worried': return currentPetObj.imageWorried;
      case 'sad': return currentPetObj.imageSad;
      default: return currentPetObj.imageHappy;
    }
  };

  // Cor da Moldura Dinâmica
  const getMoodColor = (status) => {
    switch(status) {
      case 'happy': return '#22c55e';   // Verde (Feliz)
      case 'worried': return '#f59e0b'; // Laranja (Preocupado)
      case 'sad': return '#ef4444';     // Vermelho (Chorando)
      default: return '#22c55e';
    }
  };

  const getPetMessage = (status) => {
    const name = currentPetObj.name;
    if(status === 'sad') return `O ${name} está triste! Economize!`;
    if(status === 'worried') return `O ${name} está preocupado...`;
    return `O ${name} está feliz!`;
  };

  // --- API ---
  const fetchAllData = async () => {
    try {
      const date = new Date();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const dashRes = await api.get(`/dashboard/${user.id}`, { params: { month, year } });
      setDashboardData(dashRes.data);
      
      const { categoryExpenses, expense } = dashRes.data;
      if (categoryExpenses && expense > 0) {
        setPieData(categoryExpenses.map((cat, idx) => ({ 
            value: cat.total, 
            color: GRAPH_COLORS[idx % GRAPH_COLORS.length],
            text: `${((cat.total / expense) * 100).toFixed(0)}%`,
            textColor: '#000',
            shiftTextX: -1,
        })));
        setCategoryList(categoryExpenses.slice(0, 2).map((cat, idx) => ({ 
            ...cat, 
            color: GRAPH_COLORS[idx % GRAPH_COLORS.length],
            percent: ((cat.total / expense) * 100).toFixed(0)
        })));
      } else { setPieData([]); setCategoryList([]); }

      const accRes = await api.get(`/accounts/${user.id}`);
      setAccounts(accRes.data);
      setTotalBalance(accRes.data.reduce((acc, item) => acc + item.balance, 0));

      const cardRes = await api.get(`/cards/${user.id}`, { params: { month, year } });
      setCards(cardRes.data);

      fetchRecentTransactions(1, true);

    } catch (error) { console.log(error); } finally { setLoading(false); setRefreshing(false); }
  };

  const fetchRecentTransactions = async (pageNumber = 1, shouldRefresh = false) => {
    if (loadingList) return;
    setLoadingList(true);
    try {
      const date = new Date();
      const res = await api.get(`/transactions/${user.id}`, { params: { month: date.getMonth() + 1, year: date.getFullYear(), page: pageNumber, limit: 5 } });
      if (shouldRefresh) setRecentTransactions(res.data);
      else setRecentTransactions(prev => [...prev, ...res.data]);
    } catch (error) { console.log(error); } finally { setLoadingList(false); }
  };

  useFocusEffect(useCallback(() => { fetchAllData(); }, []));
  const onRefresh = () => { setRefreshing(true); fetchAllData(); };

  const filteredCards = cards.filter(c => c.invoiceStatus === cardTab);
  const filteredCardsTotal = filteredCards.reduce((acc, item) => acc + item.invoiceAmount, 0);

  const handleQuickAdd = async () => {
    if (!quickAddValue || !selectedAccountForQuickAdd) return;
    try {
        const val = parseFloat(quickAddValue.replace(',', '.'));
        await api.put(`/accounts/${selectedAccountForQuickAdd.id}`, { balance: selectedAccountForQuickAdd.balance + val });
        await api.post('/transactions', { user_id: user.id, description: 'Ajuste Rápido', amount: val, type: 'income', date: new Date().toISOString().split('T')[0], origin_type: 'account', origin_id: selectedAccountForQuickAdd.id, is_fixed: 0 });
        setModalVisible(false); fetchAllData();
    } catch (e) { alert('Erro'); }
  };

  // --- Renders ---
  const SafeList = ({ data, renderItem }) => {
    if (isWeb) {
        return (
            <View style={{ height: 220, overflowY: 'auto', width: '100%' }}>
                {data.map((item) => renderItem({ item }))}
            </View>
        );
    }
    return (
        <View style={{ height: 220 }}>
            <FlatList 
                data={data} 
                renderItem={renderItem} 
                keyExtractor={i => i.id.toString()} 
                nestedScrollEnabled={true}
            />
        </View>
    );
  };

  const renderRow = (icon, title, subtitle, value, color, onPress, onAdd) => (
    <View key={title + value + Math.random()} style={styles.rowItem}>
        <TouchableOpacity style={styles.rowClickable} onPress={onPress}>
            <Ionicons name={icon} size={24} color={colors.text} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={1}>{title}</Text>
                {subtitle && <Text style={{ fontSize: 10, color: colors.subText }}>{subtitle}</Text>}
            </View>
            <Text style={[styles.rowValue, { color }]}>{formatCurrency(value)}</Text>
        </TouchableOpacity>
        {onAdd && (
            <TouchableOpacity onPress={onAdd} style={styles.plusBtn}>
                <Ionicons name="add-circle-outline" size={28} color={colors.text} />
            </TouchableOpacity>
        )}
    </View>
  );

  return (
    <ScreenWrapper refreshing={refreshing} onRefresh={onRefresh}>
      <AppHeader 
        title="Visão Geral" 
        subtitle={`Olá, ${user?.name}`} 
        showMenu 
        rightAction={
            <TouchableOpacity style={[styles.extractBtn, { borderColor: colors.primary }]} onPress={() => navigation.navigate('TransactionList')}>
                <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 12 }}>Extrato</Text>
                <Ionicons name="list" size={16} color={colors.primary} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
        }
      />

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <>
          {/* 1. GATINHO COM MOLDURA COLORIDA */}
          <View style={{ alignItems: 'center', marginBottom: 30 }}>
            {/* Moldura Dinâmica */}
            <View style={[styles.petFrame, { borderColor: getMoodColor(dashboardData?.catStatus) }]}>
                {/* Imagem Centralizada e com Cover */}
                <Image 
                    source={getPetImageSource(dashboardData?.catStatus)} 
                    style={styles.petImage} 
                    resizeMode="cover" 
                />
            </View>
            
            <TouchableOpacity onPress={() => setShowBalance(!showBalance)} style={styles.balanceRow}>
                <Text style={{ fontSize: 16, color: colors.subText, marginRight: 8 }}>Saldo Atual</Text>
                <Ionicons name={showBalance ? "eye-outline" : "eye-off-outline"} size={20} color={colors.text} />
            </TouchableOpacity>
            
            <Text style={[styles.mainBalance, { color: colors.text }]}>
                {showBalance ? formatCurrency(dashboardData?.balance) : 'R$ •••••'}
            </Text>
            
            <Text style={{ color: getMoodColor(dashboardData?.catStatus), fontWeight: 'bold', fontSize: 14, marginTop: 5 }}>
                {getPetMessage(dashboardData?.catStatus)}
            </Text>
          </View>

          {/* 2. RESUMO FINANCEIRO (CORRIGIDO) */}
          <View style={styles.summaryContainer}>
            {/* Card Entradas */}
            <View style={[styles.summaryCardFixed, { backgroundColor: colors.card, shadowColor: colors.border }]}>
                <View style={[styles.summaryBar, { backgroundColor: COLORS.primary }]} />
                <View style={styles.summaryContent}>
                    <Text style={[styles.summaryLabel, { color: COLORS.primary }]}>Entradas</Text>
                    <Text style={[styles.summaryValue, { color: COLORS.primary }]}>{formatCurrency(dashboardData?.income)}</Text>
                </View>
            </View>
            
            {/* Espaçamento */}
            <View style={{ width: 15 }} />
            
            {/* Card Saídas */}
            <View style={[styles.summaryCardFixed, { backgroundColor: colors.card, shadowColor: colors.border }]}>
                <View style={[styles.summaryBar, { backgroundColor: COLORS.error }]} />
                <View style={styles.summaryContent}>
                    <Text style={[styles.summaryLabel, { color: COLORS.error }]}>Saídas</Text>
                    <Text style={[styles.summaryValue, { color: COLORS.error }]}>{formatCurrency(dashboardData?.expense)}</Text>
                </View>
            </View>
          </View>

          {/* 3. GRÁFICO */}
          {pieData.length > 0 && (
            <>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>Resumo</Text>
                <InfoCard>
                    <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 10 }}>
                        <PieChart 
                            data={pieData} 
                            donut 
                            radius={70} 
                            innerRadius={45} 
                            showText={true} 
                            textColor="black" 
                            textSize={12}
                            fontWeight="bold"
                            centerLabelComponent={() => (
                                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.text }}>{dashboardData?.percentageConsumed}%</Text>
                                    <Text style={{ fontSize: 8, color: colors.subText }}>do Saldo</Text>
                                </View>
                            )}
                        />
                    </View>
                    {categoryList.map((cat, idx) => (
                        <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: cat.color, marginRight: 8 }} />
                                <Text style={{ color: colors.text }}>
                                    {cat.name} <Text style={{fontSize: 10, color: colors.subText}}>({cat.percent}%)</Text>
                                </Text>
                            </View>
                            <Text style={{ fontWeight: 'bold', color: COLORS.error }}>{formatCurrency(cat.total)}</Text>
                        </View>
                    ))}
                    <TouchableOpacity style={[styles.fullWidthBtn, { backgroundColor: colors.secondary }]} onPress={() => navigation.navigate('ChartScreen')}>
                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Ver Gráficos</Text>
                    </TouchableOpacity>
                </InfoCard>
            </>
          )}

          {/* 4. Contas */}
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Contas</Text>
          <InfoCard>
            <SafeList 
                data={accounts} 
                renderItem={({item}) => renderRow(
                    item.is_fixed ? 'wallet-outline' : 'business-outline', 
                    item.name, 
                    null, 
                    item.balance, 
                    item.balance >= 0 ? colors.primary : colors.error, 
                    () => navigation.navigate('AccountForm', { account: item }), 
                    () => { setSelectedAccountForQuickAdd(item); setQuickAddValue(''); setModalVisible(true); }
                )}
            />
            <TouchableOpacity style={[styles.fullWidthBtn, { backgroundColor: colors.secondary }]} onPress={() => navigation.navigate('AccountForm')}><Text style={{ color: '#FFF', fontWeight: 'bold' }}>Adicionar Banco</Text></TouchableOpacity>
            <View style={styles.footerRow}><Text style={{ color: colors.text, fontWeight: 'bold' }}>Total:</Text><Text style={{ color: colors.text, fontWeight: 'bold' }}>{formatCurrency(totalBalance)}</Text></View>
          </InfoCard>

          {/* 5. Cartões */}
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Cartões de Crédito</Text>
          <InfoCard>
            <View style={styles.tabs}>
                <TouchableOpacity onPress={() => setCardTab('open')} style={[styles.tab, cardTab === 'open' && { backgroundColor: '#e0f2fe' }]}><Text style={{ fontWeight: 'bold', color: cardTab === 'open' ? colors.primary : colors.subText }}>Abertas</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setCardTab('closed')} style={[styles.tab, cardTab === 'closed' && { backgroundColor: '#ede9fe' }]}><Text style={{ fontWeight: 'bold', color: cardTab === 'closed' ? colors.secondary : colors.subText }}>Fechadas</Text></TouchableOpacity>
            </View>
            <SafeList 
                data={filteredCards} 
                renderItem={({item}) => renderRow('card-outline', item.name, `Fecha dia ${item.closing_day}`, item.invoiceAmount, COLORS.error, () => navigation.navigate('CardForm', { card: item }), () => navigation.navigate('Transaction', { preSelectedCard: item.id }))}
            />
            <TouchableOpacity style={[styles.fullWidthBtn, { backgroundColor: colors.secondary }]} onPress={() => navigation.navigate('CardForm')}><Text style={{ color: '#FFF', fontWeight: 'bold' }}>Adicionar Cartão</Text></TouchableOpacity>
            <View style={styles.footerRow}><Text style={{ color: colors.text, fontWeight: 'bold' }}>Total:</Text><Text style={{ color: colors.text, fontWeight: 'bold' }}>{formatCurrency(filteredCardsTotal)}</Text></View>
          </InfoCard>

          {/* 6. Transações */}
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Últimos Lançamentos</Text>
          <InfoCard>
            <SafeList 
                data={recentTransactions} 
                renderItem={({item}) => renderRow(item.type === 'expense' ? 'arrow-up-circle' : 'arrow-down-circle', item.description, `${item.category_name} / ${item.account_name}`, item.amount, item.type === 'expense' ? COLORS.error : colors.primary, () => navigation.navigate('Transaction', { transaction: item }), null)}
            />
            <TouchableOpacity style={[styles.fullWidthBtn, { backgroundColor: colors.secondary }]} onPress={() => navigation.navigate('TransactionList')}><Text style={{ color: '#FFF', fontWeight: 'bold' }}>Ver Lançamentos</Text></TouchableOpacity>
          </InfoCard>

          {/* 7. Ferramentas */}
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Ferramentas</Text>
          <TouchableOpacity style={[styles.toolBtn, { backgroundColor: '#e0f2fe', borderColor: '#bae6fd' }]} onPress={() => navigation.navigate('ChatScreen')}>
            <Ionicons name="chatbubbles-outline" size={24} color="#0284c7" />
            <View style={{ flex: 1, marginLeft: 15 }}><Text style={{ color: "#0369a1", fontWeight: 'bold' }}>Assistente IA</Text><Text style={{ fontSize: 12, color: "#0c4a6e" }}>Converse para lançar gastos</Text></View>
            <Ionicons name="chevron-forward" size={20} color="#0369a1" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.toolBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => navigation.navigate('ReportScreen')}>
            <Ionicons name="document-text-outline" size={24} color={colors.text} />
            <View style={{ flex: 1, marginLeft: 15 }}><Text style={{ color: colors.text, fontWeight: 'bold' }}>Relatórios</Text><Text style={{ fontSize: 12, color: colors.subText }}>Balanço detalhado</Text></View>
            <Ionicons name="chevron-forward" size={20} color={colors.subText} />
          </TouchableOpacity>
        </>
      )}

      {/* FAB */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('Transaction')}>
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: colors.text }}>Adicionar Saldo</Text>
                <Text style={{ color: colors.subText, marginBottom: 15 }}>{selectedAccountForQuickAdd?.name}</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} placeholder="Valor (Ex: 50.00)" placeholderTextColor={colors.subText} keyboardType="numeric" autoFocus value={quickAddValue} onChangeText={setQuickAddValue} />
                <TouchableOpacity style={[styles.fullWidthBtn, { backgroundColor: colors.primary, marginTop: 10 }]} onPress={handleQuickAdd}><Text style={{ color: '#FFF', fontWeight: 'bold' }}>Confirmar</Text></TouchableOpacity>
            </View>
        </TouchableOpacity>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  extractBtn: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 20, borderWidth: 1 },
  
  // Moldura do Pet (CORRIGIDA PARA CIRCULAR E CENTRALIZADA)
  petFrame: { 
    width: 150, 
    height: 150, 
    borderRadius: 75, // Metade exata da largura
    borderWidth: 5, 
    alignItems: 'center', 
    justifyContent: 'center', 
    overflow: 'hidden', // Corta o que passar do círculo
    backgroundColor: '#fff', 
    elevation: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 
  },
  petImage: { 
    width: '100%', 
    height: '100%' 
  },
  
  balanceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  mainBalance: { fontSize: 28, fontWeight: 'bold', marginTop: 5 },
  
  // Summary Cards (CORRIGIDO PARA SOBREPOR O INFOCARD)
  summaryContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 20 
  },
  summaryCardFixed: { 
    width: '48%', // Força largura fixa para caber 2 na linha
    height: 70, 
    flexDirection: 'row', 
    overflow: 'hidden',
    borderRadius: 16,
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

  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  fullWidthBtn: { padding: 12, borderRadius: 25, alignItems: 'center', marginTop: 10 },
  rowItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  rowClickable: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rowTitle: { fontSize: 14, fontWeight: '600' },
  rowValue: { fontSize: 14, fontWeight: 'bold' },
  plusBtn: { paddingLeft: 10 },
  tabs: { flexDirection: 'row', marginBottom: 10 },
  tab: { flex: 1, padding: 8, alignItems: 'center', borderRadius: 20, marginHorizontal: 5 },
  miniItemContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  miniItemTitle: { fontSize: 14, fontWeight: 'bold' },
  miniItemSubtitle: { fontSize: 10 },
  miniItemValue: { fontSize: 14, fontWeight: 'bold' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  toolBtn: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 10, zIndex: 100 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', padding: 20, borderRadius: 16, alignItems: 'center', elevation: 5 },
  input: { width: '100%', borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 18, textAlign: 'center' }
});