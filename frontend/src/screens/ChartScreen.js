import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';

// Contextos e API
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../constants/theme';
import api from '../services/api';

// Componentes Padronizados
import ScreenWrapper from '../components/ScreenWrapper';
import AppHeader from '../components/AppHeader';
import InfoCard from '../components/InfoCard';

export default function ChartScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalMoney, setTotalMoney] = useState(0);
  
  // Controle de Mês
  const [currentDate, setCurrentDate] = useState(new Date());

  const GRAPH_COLORS = ['#4ade80', '#60a5fa', '#f472b6', '#fbbf24', '#a78bfa', '#2dd4bf'];

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        const response = await api.get(`/dashboard/${user.id}`, { params: { month, year } });
        
        const { categoryExpenses, expense, totalMoney } = response.data;
        setTotalExpense(expense);
        setTotalMoney(totalMoney);

        if (categoryExpenses && categoryExpenses.length > 0) {
            const formatted = categoryExpenses.map((cat, index) => ({
                value: cat.total,
                color: GRAPH_COLORS[index % GRAPH_COLORS.length],
                text: expense > 0 ? `${((cat.total / expense) * 100).toFixed(0)}%` : '0%',
                textColor: '#333', // Texto escuro para leitura dentro do gráfico
                shiftTextX: -1, 
                categoryName: cat.name,
                categoryId: cat.id, 
                amount: cat.total
            }));
            setChartData(formatted);
        } else {
            setChartData([]);
        }

    } catch (error) { console.log(error); } finally { setLoading(false); }
  };

  // --- Helpers ---
  const getMonthName = (date) => ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"][date.getMonth()];
  
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
  const percentOfTotalBalance = totalMoney > 0 ? ((totalExpense / totalMoney) * 100).toFixed(0) : 0;

  return (
    <ScreenWrapper>
      <AppHeader title="Detalhamento" showBack />

      {/* Seletor de Mês */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={goToPrevMonth} style={styles.arrowBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.monthLabelContainer}>
            <Text style={[styles.monthText, { color: colors.primary }]}>{getMonthName(currentDate)}</Text>
            <Text style={[styles.yearText, { color: colors.subText }]}>{currentDate.getFullYear()}</Text>
        </View>

        <TouchableOpacity onPress={goToNextMonth} style={styles.arrowBtn}>
            <Ionicons name="chevron-forward" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
          <>
              {/* Gráfico */}
              <InfoCard style={{ alignItems: 'center', paddingVertical: 30 }}>
                  {chartData.length > 0 ? (
                      <PieChart
                          data={chartData}
                          donut
                          showText
                          textColor="#333"
                          radius={120}
                          innerRadius={80}
                          textSize={12}
                          fontWeight="bold"
                          centerLabelComponent={() => (
                              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                  <Ionicons name="pie-chart-outline" size={24} color={colors.subText} />
                                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>{percentOfTotalBalance}%</Text>
                                  <Text style={{ fontSize: 10, color: colors.subText }}>do Saldo Total</Text>
                              </View>
                          )}
                      />
                  ) : (
                      <View style={{ padding: 20, alignItems: 'center' }}>
                          <Ionicons name="stats-chart-outline" size={50} color={colors.border} />
                          <Text style={{ color: colors.subText, marginTop: 10 }}>Sem dados neste mês</Text>
                      </View>
                  )}
              </InfoCard>

              {/* Lista de Categorias */}
              {chartData.length > 0 && (
                  <>
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>Categorias:</Text>
                      
                      {chartData.map((item, index) => (
                          <InfoCard key={index} style={{ marginBottom: 10, padding: 15 }} noPadding>
                              <TouchableOpacity 
                                  style={styles.rowClickable}
                                  onPress={() => navigation.navigate('TransactionList', { 
                                      filterCategory: item.categoryId, 
                                      filterName: item.categoryName 
                                  })}
                              >
                                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                      <View style={[styles.dot, { backgroundColor: item.color }]} />
                                      <Text style={[styles.catName, { color: colors.text }]}>{item.categoryName}</Text>
                                  </View>
                                  
                                  <View style={{ alignItems: 'flex-end' }}>
                                      <Text style={[styles.amount, { color: COLORS.error }]}>{formatCurrency(item.amount)}</Text>
                                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 10, color: colors.subText, marginRight: 2 }}>Ver detalhes</Text>
                                        <Ionicons name="chevron-forward" size={10} color={colors.subText} />
                                      </View>
                                  </View>
                              </TouchableOpacity>
                          </InfoCard>
                      ))}
                  </>
              )}
          </>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  monthSelector: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 10, 
    marginBottom: 10 
  },
  arrowBtn: { padding: 10 },
  monthLabelContainer: { alignItems: 'center', width: 140 },
  monthText: { fontSize: 18, fontWeight: 'bold' },
  yearText: { fontSize: 12 },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginLeft: 5 },
  
  rowClickable: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 15 // Padding aplicado dentro do TouchableOpacity
  },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  catName: { fontSize: 16, fontWeight: '600' },
  amount: { fontSize: 16, fontWeight: 'bold' }
});