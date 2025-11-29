import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// Telas
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import TransactionScreen from '../screens/TransactionScreen';
import TransactionListScreen from '../screens/TransactionListScreen';
import AccountFormScreen from '../screens/AccountFormScreen'; 
import CardFormScreen from '../screens/CardFormScreen';
import ChartScreen from '../screens/ChartScreen';
import ChatScreen from '../screens/ChatScreen';
import ReportScreen from '../screens/ReportScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HelpScreen from '../screens/HelpScreen';
import AboutScreen from '../screens/AboutScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ThemesScreen from '../screens/ThemesScreen';
import ThemesScreenDetails from '../screens/ThemesScreenDetails';

// Componente Customizado do Menu
import CustomDrawer from '../components/CustomDrawer';

const AuthStack = createStackNavigator();
const AppStack = createStackNavigator();
const Drawer = createDrawerNavigator();

// --- NAVEGADOR DO MENU LATERAL (DRAWER) ---
function DrawerRoutes() {
  return (
    <Drawer.Navigator 
      drawerContent={(props) => <CustomDrawer {...props} />} 
      screenOptions={{ headerShown: false, drawerStyle: { width: '80%' } }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="ChatScreen" component={ChatScreen} />
      <Drawer.Screen name="Themes" component={ThemesScreen} />
      <Drawer.Screen name="About" component={AboutScreen} />
      <Drawer.Screen name="Help" component={HelpScreen} />
    </Drawer.Navigator>
  );
}

export default function Routes() {
  const { signed, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  if (signed) {
    return (
      <AppStack.Navigator screenOptions={{ headerShown: false }}>
        {/* A Tela Principal agora é o Drawer, que contém o Dashboard */}
        <AppStack.Screen name="MainDrawer" component={DrawerRoutes} />
        
        {/* Telas que abrem POR CIMA do menu (com botão voltar) */}
        <AppStack.Screen name="Transaction" component={TransactionScreen} />
        <AppStack.Screen name="TransactionList" component={TransactionListScreen} />
        <AppStack.Screen name="AccountForm" component={AccountFormScreen} /> 
        <AppStack.Screen name="ReportScreen" component={ReportScreen} /> 
        <AppStack.Screen name="CardForm" component={CardFormScreen} />
        <AppStack.Screen name="ChartScreen" component={ChartScreen} />
        <AppStack.Screen name="SettingsScreen" component={SettingsScreen}/>
        <AppStack.Screen name="HelpScreen" component={HelpScreen}/>
        <AppStack.Screen name="AboutScreen" component={AboutScreen}/>
        <AppStack.Screen name="ThemesScreen" component={ThemesScreen}/>
        <AppStack.Screen name="ThemeDetail" component={ThemesScreenDetails}/>
        
        

       
      </AppStack.Navigator>
    );
  }

  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}