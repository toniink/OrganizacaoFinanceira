import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, 
  Platform, FlatList, Modal, TextInput, Image 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';

// Contextos e Constantes
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../constants/theme'; 
import { PETS } from '../constants/pets';
import api from '../services/api';

// Componentes Padronizados
import ScreenWrapper from '../components/ScreenWrapper';
import AppHeader from '../components/AppHeader';
import InfoCard from '../components/InfoCard';
import ListItem from '../components/ListItem';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const { colors, selectedPet } = useTheme();
  
  // --- Estados ---
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [pieData, setPieData] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [cards, setCards] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  
  const [cardTab, setCardTab] = useState('open');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAccountForQuickAdd, setSelectedAccountForQuickAdd] = useState(null);
  const [quickAddValue, setQuickAddValue] = useState('');
  const [showBalance, setShowBalance] = useState(true);
  
  const [loadingList, setLoadingList] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const isWeb = Platform.OS === 'web';
  const formatCurrency = (val) => `R$${val ? val.toFixed(2).replace('.', ',') : '0,00'}`;
  const GRAPH_COLORS = ['#4ade80', '#60a5fa', '#f472b6', '#fbbf24', '#a78bfa', '#2dd4bf'];

  // --- Lógica do Pet ---
  const currentPetObj = PETS.find(p => p.id === selectedPet) || PETS[0];
  
  const getPetImageSource = (status) => {
    switch(status) {
      case 'happy': return currentPetObj.imageHappy;
      case 'worried': return currentPetObj.imageWorried;
      case 'sad': return currentPetObj.imageSad;
      default: return currentPetObj.imageHappy;
    }
  };

  const getMoodColor = (status) => {
    switch(status) {
      case 'happy': return '#84cc16';
      case 'worried': return '#f97316';
      case 'sad': return '#ef4444';
      default: return '#84cc16';
    }
  };

  const getPetMessage = (status) => {
    const name = currentPetObj.name;
    if(status === 'sad') return `O ${name} está chorando! Cuidado!`;
    if(status === 'worried') return `O ${name} está ficando preocupado...`;
    return `O ${name} está feliz! Continue assim!`;
  };

  // --- API Calls ---
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
      setHasMore(res.data.length >= 5);
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
        await api.post('/transactions', { user_id: user.id, description: 'Ajuste Rápido / Entrada', amount: val, type: 'income', date: new Date().toISOString().split('T')[0], origin_type: 'account', origin_id: selectedAccountForQuickAdd.id, is_fixed: 0 });
        setModalVisible(false); fetchAllData();
    } catch (e) { alert('Erro'); }
  };

  // --- Renders Refatorados com ListItem ---
  
  const renderCardItem = ({ item }) => (
    <ListItem
        icon="card-outline"
        title={item.name}
        subtitle={`Fecha dia ${item.closing_day}`}
        value={formatCurrency(item.invoiceAmount)}
        valueColor={COLORS.error}
        onPress={() => navigation.navigate('CardForm', { card: item })}
        onAddPress={() => navigation.navigate('Transaction', { preSelectedCard: item.id })}
    />
  );

  const renderAccountItem = ({ item }) => (
    <ListItem
        icon={item.is_fixed ? 'wallet-outline' : 'business-outline'}
        title={item.name}
        value={formatCurrency(item.balance)}
        valueColor={item.balance >= 0 ? colors.primary : colors.error}
        onPress={() => navigation.navigate('AccountForm', { account: item })}
        onAddPress={() => { 
            setSelectedAccountForQuickAdd(item); 
            setQuickAddValue(''); 
            setModalVisible(true); 
        }}
    />
  );

  const renderTransactionItem = ({ item }) => (
    <ListItem
        icon={item.type === 'expense' ? 'arrow-up-circle' : 'arrow-down-circle'}
        iconColor={item.type === 'expense' ? COLORS.error : colors.primary}
        title={item.description}
        subtitle={`${item.category_name || 'Geral'} / ${item.account_name || 'Conta'}`}
        value={formatCurrency(item.amount)}
        valueColor={item.type === 'expense' ? COLORS.error : colors.primary}
        onPress={() => navigation.navigate('Transaction', { transaction: item })}
    />
  );

  // SafeList para Web/Mobile
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
                scrollEnabled={false} // ← ADICIONE ESTA LINHA
            />
        </View>
    );
  };

  return (
    // AJUSTE DO FAB: Usamos uma View Container principal para que o FAB seja "irmão" do ScreenWrapper
    <View style={styles.container}>
      
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
            {/* Gatinho */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={[styles.petFrame, { borderColor: getMoodColor(dashboardData?.catStatus) }]}>
                  <Image source={getPetImageSource(dashboardData?.catStatus)} style={styles.petImage} resizeMode="cover" />
              </View>
              <TouchableOpacity onPress={() => setShowBalance(!showBalance)} style={styles.balanceRow}>
                  <Text style={{ fontSize: 16, color: colors.subText, marginRight: 8 }}>Saldo Atual</Text>
                  <Ionicons name={showBalance ? "eye-outline" : "eye-off-outline"} size={20} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.mainBalance, { color: colors.text }]}>{showBalance ? formatCurrency(dashboardData?.balance) : 'R$ •••••'}</Text>
              <Text style={{ color: colors.subText, fontSize: 12, marginTop: 5 }}>{getPetMessage(dashboardData?.catStatus)}</Text>
            </View>

            {/* Resumo Cards */}
            <View style={styles.summaryRow}>
              <InfoCard style={styles.summaryCard} noPadding>
                  <View style={[styles.summaryBar, { backgroundColor: COLORS.primary }]} />
                  <View style={styles.summaryContent}><Text style={[styles.summaryLabel, { color: COLORS.primary }]}>Entradas</Text><Text style={[styles.summaryValue, { color: COLORS.primary }]}>{formatCurrency(dashboardData?.income)}</Text></View>
              </InfoCard>
              <View style={{ width: 15 }} />
              <InfoCard style={styles.summaryCard} noPadding>
                  <View style={[styles.summaryBar, { backgroundColor: COLORS.error }]} />
                  <View style={styles.summaryContent}><Text style={[styles.summaryLabel, { color: COLORS.error }]}>Saídas</Text><Text style={[styles.summaryValue, { color: COLORS.error }]}>{formatCurrency(dashboardData?.expense)}</Text></View>
              </InfoCard>
            </View>

            {/* Gráfico */}
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

            {/* Contas */}
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Contas</Text>
            <InfoCard>
              <View style={!isWeb ? { maxHeight: 200 } : {}}>
                  <SafeList data={accounts} renderItem={renderAccountItem} />
              </View>
              <TouchableOpacity style={[styles.fullWidthBtn, { backgroundColor: colors.secondary }]} onPress={() => navigation.navigate('AccountForm')}><Text style={{ color: '#FFF', fontWeight: 'bold' }}>Adicionar Banco</Text></TouchableOpacity>
              <View style={styles.footerRow}><Text style={{ color: colors.text, fontWeight: 'bold' }}>Total:</Text><Text style={{ color: colors.text, fontWeight: 'bold' }}>{formatCurrency(totalBalance)}</Text></View>
            </InfoCard>

            {/* Cartões */}
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Cartões de Crédito</Text>
            <InfoCard>
              <View style={styles.tabs}>
                  <TouchableOpacity onPress={() => setCardTab('open')} style={[styles.tab, cardTab === 'open' && { backgroundColor: '#e0f2fe' }]}><Text style={{ fontWeight: 'bold', color: cardTab === 'open' ? colors.primary : colors.subText }}>Abertas</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => setCardTab('closed')} style={[styles.tab, cardTab === 'closed' && { backgroundColor: '#ede9fe' }]}><Text style={{ fontWeight: 'bold', color: cardTab === 'closed' ? colors.secondary : colors.subText }}>Fechadas</Text></TouchableOpacity>
              </View>
              <View style={!isWeb ? { maxHeight: 200 } : {}}>
                  <SafeList data={filteredCards} renderItem={renderCardItem} />
              </View>
              <TouchableOpacity style={[styles.fullWidthBtn, { backgroundColor: colors.secondary }]} onPress={() => navigation.navigate('CardForm')}><Text style={{ color: '#FFF', fontWeight: 'bold' }}>Adicionar Cartão</Text></TouchableOpacity>
              <View style={styles.footerRow}><Text style={{ color: colors.text, fontWeight: 'bold' }}>Total:</Text><Text style={{ color: colors.text, fontWeight: 'bold' }}>{formatCurrency(filteredCardsTotal)}</Text></View>
            </InfoCard>

            {/* Transações */}
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Últimos Lançamentos</Text>
            <InfoCard>
              <View style={!isWeb ? { height: 220 } : {}}> 
                  <SafeList data={recentTransactions} renderItem={renderTransactionItem} />
              </View>
              <TouchableOpacity style={[styles.fullWidthBtn, { backgroundColor: colors.secondary }]} onPress={() => navigation.navigate('TransactionList')}><Text style={{ color: '#FFF', fontWeight: 'bold' }}>Ver Lançamentos</Text></TouchableOpacity>
            </InfoCard>

            {/* Ferramentas */}
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
      </ScreenWrapper>

      {/* FAB - Agora como IRMÃO do ScreenWrapper, fora do scroll */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('Transaction')}>
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>

      {/* Modal - Também como IRMÃO */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  // Ajuste de Container para Web
  container: { flex: 1, ...Platform.select({ web: { height: '100vh', overflow: 'hidden' } }) },
  
  extractBtn: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 20, borderWidth: 1 },
  
  // Gatinho
  petFrame: { width: 160, height: 160, borderRadius: 80, borderWidth: 6, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: '#fff', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5 },
  petImage: { width: '100%', height: '100%' },
  balanceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  mainBalance: { fontSize: 28, fontWeight: 'bold', marginTop: 5 },
  
  // Cards Resumo
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  summaryCard: { flex: 1, height: 70, flexDirection: 'row', overflow: 'hidden' },
  summaryBar: { width: 6, height: '100%' },
  summaryContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  summaryLabel: { fontSize: 12, fontWeight: 'bold' },
  summaryValue: { fontSize: 16, fontWeight: 'bold' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  fullWidthBtn: { padding: 12, borderRadius: 25, alignItems: 'center', marginTop: 10 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  
  tabs: { flexDirection: 'row', marginBottom: 10 },
  tab: { flex: 1, padding: 8, alignItems: 'center', borderRadius: 20, marginHorizontal: 5 },

  toolBtn: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  
  // FAB ESTÁ AQUI E VAI FLUTUAR AGORA
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 10, zIndex: 100, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', padding: 20, borderRadius: 16, alignItems: 'center', elevation: 5 },
  input: { width: '100%', borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 18, textAlign: 'center' }
});