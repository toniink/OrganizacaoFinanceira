import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; 

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { COLORS, SIZING } from '../constants/theme';
import api from '../services/api';

export default function TransactionListScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({ income: 0, expense: 0 });
  
  // Controle de Data (Mês/Ano)
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      const response = await api.get(`/transactions/${user.id}`, {
        params: { month, year }
      });

      const list = response.data;
      setTransactions(list);

      // Calcular totais localmente para os cards superiores
      let inc = 0;
      let exp = 0;
      list.forEach(item => {
        if (item.type === 'income') inc += item.amount;
        else exp += item.amount;
      });
      setTotals({ income: inc, expense: exp });

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [currentDate])
  );

  // Funções auxiliares
  const formatCurrency = (value) => {
    return `R$${value.toFixed(2).replace('.', ',')}`;
  };

  const getMonthName = (date) => {
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    return months[date.getMonth()];
  };

  // Renderização de cada item (Clicável para Edição)
  const renderItem = ({ item }) => {
    const isExpense = item.type === 'expense';
    const color = isExpense ? COLORS.error : COLORS.primary;
    const iconName = isExpense ? 'arrow-up-circle' : 'arrow-down-circle';

    return (
      <TouchableOpacity 
        style={styles.itemContainer}
        activeOpacity={0.7}
        // Ao clicar, envia o objeto 'item' inteiro para a tela Transaction
        onPress={() => navigation.navigate('Transaction', { transaction: item })}
      >
        {/* Ícone Esquerda */}
        <View style={{ marginRight: 15 }}>
            <Ionicons name={iconName} size={32} color={color} />
        </View>

        {/* Textos Centrais */}
        <View style={{ flex: 1 }}>
            <Text style={[styles.itemTitle, { color: colors.text }]}>{item.description}</Text>
            <Text style={[styles.itemSubtitle, { color: colors.subText }]}>
                {item.category_name || 'Sem Categoria'} / {item.account_name || 'Conta'}
            </Text>
        </View>

        {/* Valor Direita */}
        <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.itemValue, { color }]}>
                {isExpense ? '-' : ''}{formatCurrency(item.amount)}
            </Text>
            {/* Indicador visual de que é clicável */}
            <Ionicons name="chevron-forward" size={16} color={colors.border} style={{ marginTop: 4 }} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
            <Ionicons name="arrow-back" size={30} color={colors.subText} /> 
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Lançamentos</Text>
        <View style={{ width: 30 }} /> 
      </View>

      {/* SELETOR DE MÊS */}
      <View style={styles.monthSelector}>
        <Text style={[styles.monthText, { color: colors.primary }]}>
            {getMonthName(currentDate)}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.primary} style={{ marginLeft: 5 }} />
      </View>

      {/* CARDS DE RESUMO (Entradas / Saídas) */}
      <View style={styles.summaryContainer}>
        {/* Card Entradas */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, shadowColor: colors.border }]}>
            <View style={[styles.summaryBar, { backgroundColor: COLORS.primary }]} />
            <View style={styles.summaryContent}>
                <Text style={[styles.summaryLabel, { color: COLORS.primary }]}>Entradas</Text>
                <Text style={[styles.summaryValue, { color: COLORS.primary }]}>{formatCurrency(totals.income)}</Text>
            </View>
        </View>

        {/* Card Saídas */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, shadowColor: colors.border }]}>
            <View style={[styles.summaryBar, { backgroundColor: COLORS.error }]} />
            <View style={styles.summaryContent}>
                <Text style={[styles.summaryLabel, { color: COLORS.error }]}>Saídas</Text>
                <Text style={[styles.summaryValue, { color: COLORS.error }]}>{formatCurrency(totals.expense)}</Text>
            </View>
        </View>
      </View>

      {/* LISTA PRINCIPAL */}
      <View style={[styles.listCard, { backgroundColor: colors.card, shadowColor: colors.border }]}>
        {/* Filtros e Opções do Card */}
        <View style={styles.listHeaderActions}>
            <TouchableOpacity style={{ marginRight: 15 }}>
                <Ionicons name="filter-outline" size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity>
                <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
            </TouchableOpacity>
        </View>

        {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
            <FlatList
                data={transactions}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 80 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <Text style={{ textAlign: 'center', color: colors.subText, marginTop: 20 }}>
                        Nenhum lançamento neste mês.
                    </Text>
                }
            />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: SIZING.padding,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Cards de Resumo
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZING.padding,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    width: '48%',
    height: 60,
    borderRadius: 15,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 3,
    ...Platform.select({
        ios: { shadowOpacity: 0.1, shadowRadius: 3, shadowOffset: { width: 0, height: 2 } },
        web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.05)' }
    })
  },
  summaryBar: {
    width: 8,
    height: '100%',
  },
  summaryContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Lista Grande Branca
  listCard: {
    flex: 1,
    marginHorizontal: SIZING.padding,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    elevation: 4,
    ...Platform.select({
        ios: { shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 4 } },
        web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.08)' }
    })
  },
  listHeaderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  
  // Item da Lista
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemSubtitle: {
    fontSize: 12,
  },
  itemValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5
  }
});