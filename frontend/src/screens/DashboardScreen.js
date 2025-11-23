import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Alert, TouchableOpacity, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // Para o ícone do botão
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- Lógica do Gatinho ---
  const getCatIcon = (status) => {
    switch(status) {
      case 'happy': return '😺';
      case 'worried': return '😿';
      case 'sad': return '😭';
      default: return '😺';
    }
  };

  const getCatMessage = (status) => {
    switch(status) {
      case 'happy': return 'O gatinho está feliz com suas economias!';
      case 'worried': return 'Cuidado! O gatinho está ficando preocupado.';
      case 'sad': return 'O gatinho está chorando... Você gastou demais!';
      default: return 'Cuide bem do seu dinheiro!';
    }
  };

  const fetchDashboard = async () => {
    try {
      const date = new Date();
      const response = await api.get(`/dashboard/${user.id}`, {
        params: { month: date.getMonth() + 1, year: date.getFullYear() }
      });
      setDashboardData(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Recarrega os dados sempre que a tela ganha foco (ao voltar de um lançamento)
  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  // Estilos dinâmicos para sombras (Web/iOS/Android)
  const cardStyle = [
    styles.card, { backgroundColor: colors.card },
    Platform.select({ ios: { shadowColor: colors.border }, android: { shadowColor: colors.border }, web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' } })
  ];

  const fabStyle = [
    styles.fab, { backgroundColor: colors.primary },
    Platform.select({ ios: { shadowColor: colors.primary }, android: { shadowColor: colors.primary }, web: { boxShadow: '0px 4px 12px rgba(74, 222, 128, 0.4)' } })
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* CABEÇALHO E BOTÃO DE EXTRATO */}
        <View style={styles.headerRow}>
            <View>
                <Text style={[styles.welcome, { color: colors.subText }]}>Olá, {user?.name}</Text>
                <Text style={[styles.title, { color: colors.text }]}>Visão Geral</Text>
            </View>
            
            {/* BOTÃO "VER EXTRATO" */}
            <TouchableOpacity 
                style={[styles.extractButton, { borderColor: colors.primary }]}
                onPress={() => navigation.navigate('TransactionList')}
            >
                <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 12 }}>Ver Extrato</Text>
                <Ionicons name="list" size={16} color={colors.primary} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
        ) : (
          <>
            {/* CARD DO GATINHO */}
            <View style={cardStyle}>
              <View style={styles.catContainer}>
                <Text style={styles.catIcon}>{getCatIcon(dashboardData?.catStatus)}</Text>
                <Text style={[styles.catMessage, { color: colors.text }]}>{getCatMessage(dashboardData?.catStatus)}</Text>
                <Text style={{ color: colors.subText, marginTop: 5 }}>{dashboardData?.percentageConsumed || 0}% da renda consumida</Text>
              </View>
            </View>

            {/* CARD DE RESUMO FINANCEIRO */}
            <View style={styles.row}>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={{ color: colors.subText }}>Entradas</Text>
                <Text style={[styles.amount, { color: colors.primary }]}>R$ {dashboardData?.income?.toFixed(2) || '0.00'}</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={{ color: colors.subText }}>Saídas</Text>
                <Text style={[styles.amount, { color: colors.error }]}>R$ {dashboardData?.expense?.toFixed(2) || '0.00'}</Text>
              </View>
            </View>
            <View style={{ height: 100 }} />
          </>
        )}
      </ScrollView>

      {/* BOTÃO FLUTUANTE (FAB) - ADICIONAR */}
      <TouchableOpacity style={fabStyle} onPress={() => navigation.navigate('Transaction')} activeOpacity={0.8}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 50 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  welcome: { fontSize: 16 },
  title: { fontSize: 28, fontWeight: 'bold' },
  
  // Estilo do Botão de Extrato
  extractButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  
  card: {
    padding: 20, borderRadius: 16, marginBottom: 20, alignItems: 'center',
    elevation: 2, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  catContainer: { alignItems: 'center' },
  catIcon: { fontSize: 80, marginBottom: 10 },
  catMessage: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: {
    width: '48%', padding: 15, borderRadius: 12, borderWidth: 1,
    elevation: 1, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
  },
  amount: { fontSize: 18, fontWeight: 'bold', marginTop: 5 },
  fab: {
    position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center', elevation: 5,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
  fabText: { fontSize: 32, color: '#FFF', fontWeight: 'bold', marginTop: -2 }
});