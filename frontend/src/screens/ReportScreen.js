import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Contextos e API
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../constants/theme';
import api from '../services/api';

// Componentes
import AppHeader from '../components/AppHeader';
import InfoCard from '../components/InfoCard';
import ScreenWrapper from '../components/ScreenWrapper';

export default function ReportScreen({ navigation }) {
  const { user } = useAuth();
  const { colors, sizing } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // Helpers
  const getMonthName = (date) => ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"][date.getMonth()];
  const formatCurrency = (value) => `R$ ${value.toFixed(2).replace('.', ',')}`;
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}`;
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/reports/${user.id}`, {
        params: { 
            month: currentDate.getMonth() + 1, 
            year: currentDate.getFullYear() 
        }
      });
      setReportData(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [currentDate]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReport();
  };

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const totalExpense = reportData?.summary?.expense || 1;

  return (
    <ScreenWrapper 
      refreshing={refreshing} 
      onRefresh={onRefresh}
      contentContainerStyle={styles.screenContent}
    >
      {/* CABEÇALHO */}
      <AppHeader title="Relatório Mensal" showBack />

      {/* SELETOR DE DATA */}
      <View style={styles.monthSelector}>
          <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowBtn}>
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          
          <View style={styles.monthLabelContainer}>
              <Text style={[styles.monthText, { color: colors.text }]}>
                  {getMonthName(currentDate)}
              </Text>
              <Text style={{ fontSize: 12, color: colors.subText }}>
                  {currentDate.getFullYear()}
              </Text>
          </View>

          <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrowBtn}>
              <Ionicons name="chevron-forward" size={24} color={colors.primary} />
          </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <View style={styles.content}>
          {/* 1. BALANÇO GERAL */}
          <InfoCard>
              <Text style={[styles.cardTitle, { color: colors.subText }]}>BALANÇO GERAL</Text>
              
              <View style={styles.summaryRow}>
                  <Text style={{ color: colors.text }}>Entradas Totais</Text>
                  <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>
                      {formatCurrency(reportData?.summary.income || 0)}
                  </Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.summaryRow}>
                  <Text style={{ color: colors.text }}>Saídas Totais</Text>
                  <Text style={{ color: COLORS.error, fontWeight: 'bold' }}>
                      {formatCurrency(reportData?.summary.expense || 0)}
                  </Text>
              </View>

              <View style={[styles.divider, { height: 2 }]} />

              <View style={styles.summaryRow}>
                  <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>Resultado</Text>
                  <Text style={{ 
                      color: (reportData?.summary.balance || 0) >= 0 ? COLORS.primary : COLORS.error, 
                      fontWeight: 'bold', 
                      fontSize: 16 
                  }}>
                      {formatCurrency(reportData?.summary.balance || 0)}
                  </Text>
              </View>
          </InfoCard>

          {/* 2. GASTOS POR CATEGORIA */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Gastos por Categoria</Text>
          
          <InfoCard noPadding style={{ paddingVertical: 5 }}>
              {(!reportData?.categories || reportData?.categories.length === 0) ? (
                  <Text style={{ padding: 20, textAlign: 'center', color: colors.subText }}>Nenhum gasto neste mês.</Text>
              ) : (
                  reportData?.categories.map((cat, index) => {
                      const percent = totalExpense > 0 
                        ? ((cat.total_amount / totalExpense) * 100).toFixed(1) 
                        : 0;

                      return (
                        <View key={index} style={{ paddingHorizontal: 15 }}>
                            <View style={styles.categoryRow}>
                                <View style={styles.catInfo}>
                                    <View style={[styles.catBar, { width: `${percent}%`, backgroundColor: COLORS.error + '20' }]} />
                                    <Text style={[styles.catName, { color: colors.text }]}>{cat.category_name}</Text>
                                    <Text style={[styles.catPercent, { color: colors.subText }]}>({percent}%)</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={[styles.catAmount, { color: colors.text }]}>{formatCurrency(cat.total_amount)}</Text>
                                    <Text style={{ fontSize: 10, color: colors.subText }}>{cat.transaction_count} lançamentos</Text>
                                </View>
                            </View>
                            {index < reportData.categories.length - 1 && <View style={styles.divider} />}
                        </View>
                      );
                  })
              )}
          </InfoCard>

          {/* 3. HISTÓRICO DETALHADO */}
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 10 }]}>Histórico Detalhado</Text>
          
          <InfoCard noPadding>
              {(!reportData?.transactions || reportData?.transactions.length === 0) ? (
                  <Text style={{ padding: 20, textAlign: 'center', color: colors.subText }}>Sem movimentações.</Text>
              ) : (
                  reportData?.transactions.map((item, index) => {
                      const isExpense = item.type === 'expense';
                      const color = isExpense ? COLORS.error : COLORS.primary;
                      return (
                          <View key={item.id} style={{ paddingHorizontal: 15 }}>
                              <View style={styles.transactionRow}>
                                  <View style={styles.dateBox}>
                                      <Text style={[styles.dateText, { color: '#555' }]}>{formatDate(item.date)}</Text>
                                  </View>
                                  <View style={{ flex: 1, paddingHorizontal: 10 }}>
                                      <Text style={[styles.transDesc, { color: colors.text }]} numberOfLines={1}>{item.description}</Text>
                                      <Text style={{ fontSize: 10, color: colors.subText }}>
                                          {item.category_name || (isExpense ? 'Despesa' : 'Receita')}
                                      </Text>
                                  </View>
                                  <Text style={[styles.transAmount, { color }]}>
                                      {isExpense ? '-' : '+'}{formatCurrency(item.amount)}
                                  </Text>
                              </View>
                              {index < reportData.transactions.length - 1 && <View style={styles.divider} />}
                          </View>
                      );
                  })
              )}
          </InfoCard>
          
          {/* Espaço final FIXO - não use valores muito grandes */}
          <View style={{ height: 50 }} />
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    // Estilos específicos para o contentContainer
    paddingBottom: 80,
  },
  content: {
    flex: 1,
    width: '100%',
  },
  
  monthSelector: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingBottom: 20,
    marginBottom: 10
  },
  arrowBtn: { padding: 10 },
  monthLabelContainer: { alignItems: 'center', width: 140 },
  monthText: { fontSize: 18, fontWeight: 'bold' },
  
  cardTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginLeft: 5 },
  
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  catInfo: { flex: 1, position: 'relative', justifyContent: 'center', paddingVertical: 4 },
  catBar: { position: 'absolute', height: '100%', borderRadius: 4, left: -5 }, 
  catName: { fontSize: 15, fontWeight: '600', marginLeft: 5 },
  catPercent: { fontSize: 12, marginLeft: 5 },
  catAmount: { fontSize: 15, fontWeight: 'bold' },

  transactionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  dateBox: { backgroundColor: '#e2e8f0', padding: 5, borderRadius: 6, width: 45, alignItems: 'center', justifyContent: 'center' },
  dateText: { fontSize: 12, fontWeight: 'bold' },
  transDesc: { fontSize: 14, fontWeight: '600' },
  transAmount: { fontSize: 14, fontWeight: 'bold' }
});