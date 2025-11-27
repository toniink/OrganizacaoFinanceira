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
import AccountFormScreen from '../screens/AccountFormScreen'; 
import CardFormScreen from '../screens/CardFormScreen';
import ChartScreen from '../screens/ChartScreen'; 
import ReportScreen from '../screens/ReportScreen';
import ChatScreen from '../screens/ChatScreen';

const AuthStack = createStackNavigator();
const AppStack = createStackNavigator();

export default function Routes() {
  const { signed, isLoading } = useAuth();

  // Mostra um loading enquanto verifica se o usuário já está logado
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
        
        {/* Telas de Transação */}
        <AppStack.Screen name="Transaction" component={TransactionScreen} />
        <AppStack.Screen name="TransactionList" component={TransactionListScreen} />

        {/* Telas de Formulários */}
        <AppStack.Screen name="AccountForm" component={AccountFormScreen} /> 
        <AppStack.Screen name="CardForm" component={CardFormScreen} />
        
        {/* Tela de Gráficos */}
        <AppStack.Screen name="ChartScreen" component={ChartScreen} /> 

        {/*Tela de Relatorio*/}
        <AppStack.Screen name="ReportScreen" component={ReportScreen}/>

        <AppStack.Screen name="ChatScreen" component={ChatScreen} />
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