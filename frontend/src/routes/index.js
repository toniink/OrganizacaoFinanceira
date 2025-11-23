import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// --- Importação das Telas ---
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import TransactionScreen from '../screens/TransactionScreen';
import TransactionListScreen from '../screens/TransactionListScreen';

const AuthStack = createStackNavigator();
const AppStack = createStackNavigator();

export default function Routes() {
  const { signed, isLoading } = useAuth();

  // Mostra um loading enquanto verifica se o usuário já está logado no storage
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  // Se o usuário estiver logado (signed = true), mostra as telas do App
  if (signed) {
    return (
      <AppStack.Navigator screenOptions={{ headerShown: false }}>
        {/* Tela Principal */}
        <AppStack.Screen name="Dashboard" component={DashboardScreen} />
        
        {/* Tela de Inserir Nova Transação */}
        <AppStack.Screen 
          name="Transaction" 
          component={TransactionScreen} 
        />

        {/* Tela de Listagem (Extrato) */}
        <AppStack.Screen 
          name="TransactionList" 
          component={TransactionListScreen} 
        />
      </AppStack.Navigator>
    );
  }

  // Se não estiver logado, mostra as telas de Autenticação
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}