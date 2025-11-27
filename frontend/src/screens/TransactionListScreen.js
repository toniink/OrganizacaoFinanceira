import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; 
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { COLORS, SIZING } from '../constants/theme';
import api from '../services/api';

export default function TransactionListScreen({ navigation, route }) {
  const { user } = useAuth();
  const { colors } = useTheme();

  // Parametros de Filtro (Se vierem da tela de Gráfico ou Dashboard)
  const filterCategory = route.params?.filterCategory;
  const filterName = route.params?.filterName;

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

      // Monta os parâmetros da requisição
      const params = { month, year };
      // Se houver filtro de categoria vindo da navegação, adiciona-o
      if (filterCategory) params.category_id = filterCategory;

      const response = await api.get(`/transactions/${user.id}`, { params });
      const list = response.data;
      setTransactions(list);

      // Calcula totais locais baseados na lista retornada
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

  // Recarrega os dados sempre que a tela ganha foco ou a data/filtro muda
  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [currentDate, filterCategory])
  );

  // --- Funções Auxiliares ---
  const formatCurrency = (value) => {
    return `R$${value.toFixed(2).replace('.', ',')}`;
  };

  const getMonthName = (date) => {
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    return months[date.getMonth()];
  };

  // --- Renderização do Item ---
  const renderItem = ({ item }) => {
    const isExpense = item.type === 'expense';
    const color = isExpense ? COLORS.error : COLORS.primary;
    const iconName = isExpense ? 'arrow-up-circle' : 'arrow-down-circle';

    return (
      <TouchableOpacity 
        style={styles.itemContainer}
        activeOpacity={0.7}
        // Navega para edição enviando o objeto transação
        onPress={() => navigation.navigate('Transaction', { transaction: item })}
      >
        {/* Ícone Esquerda */}
        <View style={{ marginRight: 15 }}>
            <Ionicons name={iconName} size={32} color={color} />
        </View>

        {/* Textos Centrais */}
        <View style={{ flex: 1 }}>
            <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
                {item.description}
            </Text>
            <Text style={[styles.itemSubtitle, { color: colors.subText }]} numberOfLines={1}>
                {item.category_name || 'Sem Categoria'} / {item.account_name || 'Conta'}
            </Text>
        </View>

        {/* Valor Direita */}
        <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.itemValue, { color }]}>
                {isExpense ? '-' : ''}{formatCurrency(item.amount)}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.border} style={{ marginTop: 4 }} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={30} color={colors.subText} /> 
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>
            {filterName ? `Gastos: ${filterName}` : 'Lançamentos'}
        </Text>
        <View style={{ width: 30 }} /> 
      </View>

      {/* SELETOR DE MÊS (Oculto se estiver filtrando por categoria específica) */}
      {!filterCategory && (
        <View style={styles.monthSelector}>
            <Text style={[styles.monthText, { color: colors.primary }]}>
                {getMonthName(currentDate)}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.primary} style={{ marginLeft: 5 }} />
        </View>
      )}

      {/* CARDS DE RESUMO (Entradas / Saídas) */}
      <View style={[styles.summaryContainer, filterCategory && { marginTop: 20 }]}>
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
        {/* Cabeçalho da Lista (Filtros visuais) */}
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
                        Nenhum lançamento encontrado.
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