import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZING } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function ChartScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalMoney, setTotalMoney] = useState(0);
  
  // Controle de Data (Mês/Ano)
  const [currentDate, setCurrentDate] = useState(new Date());

  const GRAPH_COLORS = ['#4ade80', '#60a5fa', '#f472b6', '#fbbf24', '#a78bfa', '#2dd4bf'];

  // Carrega dados sempre que a data mudar
  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        const response = await api.get(`/dashboard/${user.id}`, {
            params: { month, year }
        });
        
        const { categoryExpenses, expense, totalMoney } = response.data;
        setTotalExpense(expense);
        setTotalMoney(totalMoney);

        // Formata dados para o gráfico
        if (categoryExpenses && categoryExpenses.length > 0) {
            const formatted = categoryExpenses.map((cat, index) => ({
                value: cat.total,
                color: GRAPH_COLORS[index % GRAPH_COLORS.length],
                text: expense > 0 ? `${((cat.total / expense) * 100).toFixed(0)}%` : '0%',
                categoryName: cat.name,
                categoryId: cat.id, 
                amount: cat.total
            }));
            setChartData(formatted);
        } else {
            setChartData([]); // Limpa se não tiver dados
        }

    } catch (error) {
        console.log(error);
    } finally {
        setLoading(false);
    }
  };

  // --- Funções de Data ---
  const getMonthName = (date) => {
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    return months[date.getMonth()];
  };

  const goToPrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const formatCurrency = (value) => `R$${value.toFixed(2).replace('.', ',')}`;

  // Porcentagem do Saldo Total Consumido
  const percentOfTotalBalance = totalMoney > 0 ? ((totalExpense / totalMoney) * 100).toFixed(0) : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={30} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Detalhamento</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Seletor de Mês (NOVO) */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={goToPrevMonth} style={styles.arrowButton}>
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.monthLabelContainer}>
            <Text style={[styles.monthText, { color: colors.primary }]}>
                {getMonthName(currentDate)}
            </Text>
            <Text style={[styles.yearText, { color: colors.subText }]}>
                {currentDate.getFullYear()}
            </Text>
        </View>

        <TouchableOpacity onPress={goToNextMonth} style={styles.arrowButton}>
            <Ionicons name="chevron-forward" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
        ) : (
            <>
                <View style={[styles.chartCard, { backgroundColor: colors.card, shadowColor: colors.border }]}>
                    {chartData.length > 0 ? (
                        <View style={{ alignItems: 'center', marginVertical: 20 }}>
                            <PieChart
                                data={chartData}
                                donut
                                showText
                                textColor="white"
                                radius={120}
                                innerRadius={80}
                                textSize={14}
                                fontWeight="bold"
                                centerLabelComponent={() => (
                                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                        <Ionicons name="pie-chart-outline" size={24} color={colors.subText} />
                                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>{percentOfTotalBalance}%</Text>
                                        <Text style={{ fontSize: 10, color: colors.subText }}>do Saldo Total</Text>
                                    </View>
                                )}
                            />
                        </View>
                    ) : (
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <Ionicons name="stats-chart-outline" size={50} color={colors.border} />
                            <Text style={{ color: colors.subText, marginTop: 10 }}>Sem dados neste mês</Text>
                        </View>
                    )}
                </View>

                {chartData.length > 0 && (
                    <>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Categorias:</Text>

                        {chartData.map((item, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
                                onPress={() => navigation.navigate('TransactionList', { 
                                    filterCategory: item.categoryId, 
                                    filterName: item.categoryName 
                                })}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={[styles.dot, { backgroundColor: item.color }]} />
                                    <Text style={[styles.catName, { color: colors.text }]}>{item.categoryName}</Text>
                                </View>
                                <Text style={[styles.amount, { color: COLORS.error }]}>{formatCurrency(item.amount)}</Text>
                            </TouchableOpacity>
                        ))}
                    </>
                )}
            </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingTop: Platform.OS === 'ios' ? 50 : 20, // Ajuste seguro para topo
    paddingHorizontal: 20, 
    paddingBottom: 10 
  },
  title: { fontSize: 20, fontWeight: 'bold' },
  
  // Estilos do Seletor de Mês
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginBottom: 10,
  },
  arrowButton: {
    padding: 10,
  },
  monthLabelContainer: {
    alignItems: 'center',
    width: 120, // Largura fixa para não pular layout
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  yearText: {
    fontSize: 12,
  },

  content: { padding: 20, paddingBottom: 50 },
  chartCard: { padding: 20, borderRadius: 20, alignItems: 'center', marginBottom: 30, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  catName: { fontSize: 16, fontWeight: '600' },
  amount: { fontSize: 16, fontWeight: 'bold' }
});