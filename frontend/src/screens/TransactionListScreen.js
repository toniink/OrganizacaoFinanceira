import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; 

// Contextos e API
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { COLORS, SIZING } from '../constants/theme';
import api from '../services/api';

// Componentes Padronizados
import ScreenWrapper from '../components/ScreenWrapper';
import AppHeader from '../components/AppHeader';
import InfoCard from '../components/InfoCard';

export default function TransactionListScreen({ navigation, route }) {
  const { user } = useAuth();
  const { colors } = useTheme();

  const filterCategory = route.params?.filterCategory;
  const filterName = route.params?.filterName;

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({ income: 0, expense: 0 });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const isWeb = Platform.OS === 'web';

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const params = { month, year };
      if (filterCategory) params.category_id = filterCategory;

      const response = await api.get(`/transactions/${user.id}`, { params });
      const list = response.data;
      setTransactions(list);

      let inc = 0; let exp = 0;
      list.forEach(item => {
        if (item.type === 'income') inc += item.amount;
        else exp += item.amount;
      });
      setTotals({ income: inc, expense: exp });

    } catch (error) { console.error(error); } finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [currentDate, filterCategory])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  // --- Helpers ---
  const formatCurrency = (value) => `R$${value.toFixed(2).replace('.', ',')}`;
  const getMonthName = (date) => ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"][date.getMonth()];
  
  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  // --- Render Item ---
  const renderItem = ({ item }) => {
    const isExpense = item.type === 'expense';
    const color = isExpense ? COLORS.error : COLORS.primary;
    const iconName = isExpense ? 'arrow-up-circle' : 'arrow-down-circle';

    return (
      <View key={item.id} style={styles.itemWrapper}>
        <TouchableOpacity 
            style={styles.itemContainer}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Transaction', { transaction: item })}
        >
            <View style={{ marginRight: 15 }}>
                <Ionicons name={iconName} size={32} color={color} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>{item.description}</Text>
                <Text style={[styles.itemSubtitle, { color: colors.subText }]} numberOfLines={1}>
                    {item.category_name || 'Sem Categoria'} / {item.account_name || 'Conta'}
                </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.itemValue, { color }]}>{isExpense ? '-' : ''}{formatCurrency(item.amount)}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.border} style={{ marginTop: 4 }} />
            </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Lista que funciona bem na Web e Mobile
  const ListContent = () => {
    if (loading && !refreshing) {
        return <ActivityIndicator color={colors.primary} style={{ marginTop: 50 }} />;
    }

    if (transactions.length === 0) {
        return <Text style={{ textAlign: 'center', color: colors.subText, marginTop: 20 }}>Nenhum lançamento encontrado.</Text>;
    }

    if (isWeb) {
        return <View>{transactions.map(item => renderItem({ item }))}</View>;
    }

    return (
        <FlatList
            data={transactions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            scrollEnabled={false} // O ScreenWrapper já rola
        />
    );
  };

  // Estilos do FAB
  const fabStyle = [
    styles.fab, 
    { backgroundColor: colors.primary }, 
    Platform.select({ ios: { shadowColor: colors.primary }, android: { shadowColor: colors.primary }, web: { boxShadow: '0px 4px 12px rgba(74, 222, 128, 0.4)' } })
  ];

  return (
    <View style={{ flex: 1 }}>
      <ScreenWrapper refreshing={refreshing} onRefresh={onRefresh}>
        
        {/* 1. Cabeçalho com Botão Voltar Corrigido (showBack usa navigation.goBack()) */}
        <AppHeader 
            title={filterName ? `Gastos: ${filterName}` : 'Lançamentos'} 
            showBack 
        />

        {/* 2. Seletor de Mês */}
        {!filterCategory && (
            <View style={styles.monthSelector}>
                <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowBtn}>
                    <Ionicons name="chevron-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <View style={{ alignItems: 'center', width: 140 }}>
                    <Text style={[styles.monthText, { color: colors.primary }]}>{getMonthName(currentDate)}</Text>
                    <Text style={{ fontSize: 12, color: colors.subText }}>{currentDate.getFullYear()}</Text>
                </View>
                <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrowBtn}>
                    <Ionicons name="chevron-forward" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>
        )}

        {/* 3. Cards de Resumo */}
        <View style={styles.summaryContainer}>
            <InfoCard style={styles.summaryCard} noPadding>
                <View style={[styles.summaryBar, { backgroundColor: COLORS.primary }]} />
                <View style={styles.summaryContent}>
                    <Text style={[styles.summaryLabel, { color: COLORS.primary }]}>Entradas</Text>
                    <Text style={[styles.summaryValue, { color: COLORS.primary }]}>{formatCurrency(totals.income)}</Text>
                </View>
            </InfoCard>
            <View style={{ width: 15 }} />
            <InfoCard style={styles.summaryCard} noPadding>
                <View style={[styles.summaryBar, { backgroundColor: COLORS.error }]} />
                <View style={styles.summaryContent}>
                    <Text style={[styles.summaryLabel, { color: COLORS.error }]}>Saídas</Text>
                    <Text style={[styles.summaryValue, { color: COLORS.error }]}>{formatCurrency(totals.expense)}</Text>
                </View>
            </InfoCard>
        </View>

        {/* 4. Lista Principal */}
        <InfoCard noPadding>
            <View style={styles.listHeaderActions}>
                <TouchableOpacity style={{ marginRight: 15 }}><Ionicons name="filter-outline" size={20} color={colors.text} /></TouchableOpacity>
                <TouchableOpacity><Ionicons name="ellipsis-vertical" size={20} color={colors.text} /></TouchableOpacity>
            </View>
            <ListContent />
        </InfoCard>

      </ScreenWrapper>

      {/* FAB - Irmão do ScreenWrapper */}
      <TouchableOpacity 
        style={fabStyle} 
        onPress={() => navigation.navigate('Transaction')} 
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  monthSelector: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  arrowBtn: { padding: 10 },
  monthText: { fontSize: 18, fontWeight: 'bold' },
  
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  summaryCard: { flex: 1, height: 70, flexDirection: 'row', overflow: 'hidden' },
  summaryBar: { width: 6, height: '100%' },
  summaryContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  summaryLabel: { fontSize: 12, fontWeight: 'bold' },
  summaryValue: { fontSize: 16, fontWeight: 'bold' },

  listHeaderActions: { flexDirection: 'row', justifyContent: 'flex-end', padding: 15, paddingBottom: 5 },
  
  // Item da Lista
  itemWrapper: { paddingHorizontal: 15 },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  itemTitle: { fontSize: 16, fontWeight: '600' },
  itemSubtitle: { fontSize: 12 },
  itemValue: { fontSize: 16, fontWeight: 'bold', marginRight: 5 },

  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 10, zIndex: 100 },
  fabText: { fontSize: 32, color: '#FFF', fontWeight: 'bold', marginTop: -2 }
});