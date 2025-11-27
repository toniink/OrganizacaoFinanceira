import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../constants/theme';
import api from '../services/api';

export default function ReportScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const getMonthName = (date) => ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"][date.getMonth()];
  const formatCurrency = (value) => `R$ ${value.toFixed(2).replace('.', ',')}`;
  
  // Formata data de YYYY-MM-DD para DD/MM
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
    }
  };

  useEffect(() => {
    fetchReport();
  }, [currentDate]);

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Relatório Mensal</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Seletor de Data */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.monthText, { color: colors.text }]}>
            {getMonthName(currentDate)} {currentDate.getFullYear()}
        </Text>
        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrowBtn}>
            <Ionicons name="chevron-forward" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
        ) : (
            <>
                {/* 1. Resumo Consolidado (Tabela) */}
                <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.border }]}>
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
                </View>

                {/* 2. Detalhamento por Categoria */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Gastos por Categoria</Text>
                <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.border, paddingVertical: 5 }]}>
                    {reportData?.categories.length === 0 ? (
                        <Text style={{ padding: 20, textAlign: 'center', color: colors.subText }}>Nenhum gasto neste mês.</Text>
                    ) : (
                        reportData?.categories.map((cat, index) => (
                            <View key={index}>
                                <View style={styles.categoryRow}>
                                    <View style={styles.catInfo}>
                                        {/* Barra de progresso visual simples */}
                                        <View style={[styles.catBar, { width: `${cat.percent}%`, backgroundColor: COLORS.error + '40' }]} />
                                        <Text style={[styles.catName, { color: colors.text }]}>{cat.category_name}</Text>
                                        <Text style={[styles.catPercent, { color: colors.subText }]}>{cat.percent}%</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={[styles.catAmount, { color: colors.text }]}>{formatCurrency(cat.total_amount)}</Text>
                                        <Text style={{ fontSize: 10, color: colors.subText }}>{cat.transaction_count} lançamentos</Text>
                                    </View>
                                </View>
                                {index < reportData.categories.length - 1 && <View style={styles.divider} />}
                            </View>
                        ))
                    )}
                </View>

                {/* 3. LISTA DETALHADA DE LANÇAMENTOS (Histórico) */}
                <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 10 }]}>Histórico Detalhado</Text>
                <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.border }]}>
                    {(!reportData?.transactions || reportData?.transactions.length === 0) ? (
                        <Text style={{ padding: 20, textAlign: 'center', color: colors.subText }}>Sem movimentações.</Text>
                    ) : (
                        reportData?.transactions.map((item, index) => {
                            const isExpense = item.type === 'expense';
                            const color = isExpense ? COLORS.error : COLORS.primary;
                            return (
                                <View key={item.id}>
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
                </View>

                <View style={{ height: 50 }} />
            </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 50 : 20, paddingHorizontal: 20, paddingBottom: 15 },
  title: { fontSize: 20, fontWeight: 'bold' },
  monthSelector: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 10 },
  arrowBtn: { padding: 10 },
  monthText: { fontSize: 16, fontWeight: '600' },
  content: { padding: 20 },
  card: { borderRadius: 16, padding: 15, marginBottom: 25, elevation: 2, ...Platform.select({ web: { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } }) },
  cardTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  
  // Estilos da Tabela de Categorias
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 5 },
  catInfo: { flex: 1, position: 'relative', justifyContent: 'center', paddingVertical: 4 },
  catBar: { position: 'absolute', height: '100%', borderRadius: 4, left: -5 }, 
  catName: { fontSize: 15, fontWeight: '600', marginLeft: 5 },
  catPercent: { fontSize: 10, marginLeft: 5 },
  catAmount: { fontSize: 15, fontWeight: 'bold' },

  // Estilos da Tabela Detalhada
  transactionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  dateBox: { backgroundColor: '#e2e8f0', padding: 5, borderRadius: 6, width: 45, alignItems: 'center', justifyContent: 'center' },
  dateText: { fontSize: 12, fontWeight: 'bold' },
  transDesc: { fontSize: 14, fontWeight: '600' },
  transAmount: { fontSize: 14, fontWeight: 'bold' }
});