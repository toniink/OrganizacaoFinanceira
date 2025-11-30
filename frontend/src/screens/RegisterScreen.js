import React, { useState, useRef } from 'react';
import { 
  View, Text, TextInput, StyleSheet, Alert, 
  TouchableOpacity, Platform 
} from 'react-native';
import { registerUser } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../constants/theme';

// Componentes Padronizados
import ScreenWrapper from '../components/ScreenWrapper';
import StyledButton from '../components/StyledButton';
import InfoCard from '../components/InfoCard';

export default function RegisterScreen({ navigation }) {
  const { colors } = useTheme();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState(''); 
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const emailRef = useRef(null);
  const incomeRef = useRef(null); 
  const passwordRef = useRef(null);

  const handleRegister = async () => {
    if (!username || !email || !password || !monthlyIncome) {
      const msg = 'Por favor, preencha todos os campos.';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Campos vazios', msg);
      return;
    }
    
    setLoading(true);
    try {
      // Envia para a API (convertendo renda para float)
      await registerUser({ 
        username, 
        email, 
        password,
        monthlyIncome: parseFloat(monthlyIncome.replace(',', '.')) 
      });
      
      const successTitle = 'Cadastro realizado! 🎉';
      const successMsg = 'Sua conta foi criada. Agora faça login para acessar.';

      if (Platform.OS === 'web') {
        alert(`${successTitle}\n${successMsg}`);
        navigation.navigate('Login');
      } else {
        Alert.alert(
          successTitle, 
          successMsg, 
          [{ text: 'IR PARA LOGIN', onPress: () => navigation.navigate('Login') }],
          { cancelable: false }
        );
      }

    } catch (error) {
      // Tratamento de erro específico
      const errorMessage = error.response?.data?.error || 'Ocorreu um erro ao registrar.';
      
      if (Platform.OS === 'web') {
        alert(errorMessage);
      } else {
        if (errorMessage.includes('já está em uso') || errorMessage.includes('cadastrado')) {
           Alert.alert('Atenção', errorMessage); 
        } else {
           Alert.alert('Erro', errorMessage);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = [
      styles.input, 
      { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }
  ];

  const labelStyle = [styles.label, { color: colors.text }];

  return (
    <ScreenWrapper style={{ justifyContent: 'center' }}>
      
        <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Nova Conta</Text>
            <Text style={[styles.subtitle, { color: colors.subText }]}>Preencha os dados abaixo para começar.</Text>
        </View>

        <InfoCard>
            <Text style={labelStyle}>Nome Completo</Text>
            <TextInput
                style={inputStyle}
                placeholder="Ex: Ana Souza"
                placeholderTextColor={colors.subText}
                value={username}
                onChangeText={setUsername}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current.focus()}
            />
            
            <Text style={labelStyle}>E-mail</Text>
            <TextInput
                ref={emailRef}
                style={inputStyle}
                placeholder="seu@email.com"
                placeholderTextColor={colors.subText}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => incomeRef.current.focus()}
            />

            <Text style={labelStyle}>Renda Mensal (R$)</Text>
            <TextInput
                ref={incomeRef}
                style={inputStyle}
                placeholder="Ex: 2500.00"
                placeholderTextColor={colors.subText}
                value={monthlyIncome}
                onChangeText={setMonthlyIncome}
                keyboardType="numeric"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current.focus()}
            />
            
            <Text style={labelStyle}>Senha</Text>
            <TextInput
                ref={passwordRef}
                style={inputStyle}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={colors.subText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
            />

            <StyledButton 
                title={loading ? "CRIANDO..." : "CRIAR CONTA"} 
                onPress={handleRegister} 
                loading={loading}
                style={{ marginTop: 10 }}
            />
        </InfoCard>

        <View style={styles.footer}>
            <Text style={{ color: colors.subText }}>Já tem conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Fazer Login</Text>
            </TouchableOpacity>
        </View>

    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { 
    marginBottom: 25, 
    alignItems: 'center' 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 5 
  },
  subtitle: { 
    fontSize: 16 
  },
  label: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    marginBottom: 8, 
    marginLeft: 2 
  },
  input: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 15,
      marginBottom: 15,
      fontSize: 16
  },
  footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 20,
      marginBottom: 20
  }
});