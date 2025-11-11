import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// 1. Importe suas telas
import LoginScreen from './screens/LoginScreen';
import CadastroScreen from './screens/CadastroScreen';
// (Importe outras telas aqui, ex: ForgotPasswordScreen)

// 2. Crie o "Stack"
const Stack = createStackNavigator();

export default function App() {
  return (
    // 3. O NavigationContainer envolve tudo
    <NavigationContainer>
      {/* 4. O Stack.Navigator gerencia as telas */}
      
      {/* initialRouteName="Login" é o comando chave!
        Ele diz ao app para começar nesta tela.
      */}
      <Stack.Navigator initialRouteName="Login">

        {/* 5. Defina suas telas */}
        
        {/* Tela de Login - vamos esconder o cabeçalho nela */}
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} // Esconde o "header" (barra de título)
        />
        
        {/* Tela de Cadastro - ela vai mostrar o cabeçalho por padrão */}
        <Stack.Screen 
          name="Cadastro" 
          component={CadastroScreen}
          options={{ title: 'Criar Conta' }} // Customiza o título do header
        />
        
        {/* <Stack.Screen 
          name="ForgotPassword" 
          component={ForgotPasswordScreen} 
          options={{ title: 'Recuperar Senha' }}
        /> 
        */}

      </Stack.Navigator>
    </NavigationContainer>
  );
}