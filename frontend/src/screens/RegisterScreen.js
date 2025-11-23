import React, { useState, useRef } from 'react';
import { 
  View, Text, TextInput, StyleSheet, Alert, 
  TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { registerUser } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { SIZING } from '../constants/theme';
import StyledButton from '../components/StyledButton';

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
      Alert.alert('Erro', 'Todos os campos são obrigatórios.');
      return;
    }
    
    setLoading(true);
    try {
      // Converte a renda para float e substitui vírgula por ponto
      await registerUser({ 
        username, 
        email, 
        password,
        monthlyIncome: parseFloat(monthlyIncome.replace(',', '.')) 
      });
      
      Alert.alert('Sucesso', 'Conta criada! O gatinho já está esperando.', [
          { text: 'Fazer Login', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao registrar';
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = [
      styles.input, 
      { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }
  ];

  // Estilo do card dinâmico corrigido para Web e Mobile
  const cardStyle = [
    styles.card,
    { backgroundColor: colors.card },
    Platform.OS !== 'web' ? { shadowColor: colors.border } : {}
  ];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={cardStyle}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Nova Conta</Text>
                <Text style={[styles.subtitle, { color: colors.subText }]}>Comece a controlar suas finanças.</Text>
            </View>

            <Text style={[styles.label, { color: colors.text }]}>Nome Completo</Text>
            <TextInput
                style={inputStyle}
                placeholder="Ex: Ana Souza"
                placeholderTextColor={colors.subText}
                value={username}
                onChangeText={setUsername}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current.focus()}
            />
            
            <Text style={[styles.label, { color: colors.text }]}>E-mail</Text>
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

            <Text style={[styles.label, { color: colors.text }]}>Renda Mensal (R$)</Text>
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
            
            <Text style={[styles.label, { color: colors.text }]}>Senha</Text>
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
                title={loading ? "Criando..." : "CRIAR CONTA"} 
                onPress={handleRegister} 
                loading={loading}
                style={{ marginTop: 10 }}
            />

            <View style={styles.footer}>
                <Text style={{ color: colors.subText }}>Já tem conta? </Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Fazer Login</Text>
                </TouchableOpacity>
            </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { 
      flexGrow: 1, 
      justifyContent: 'center', 
      padding: SIZING.padding 
  },
  card: {
      borderRadius: 24,
      padding: 30,
      width: '100%',
      maxWidth: 450,
      alignSelf: 'center',
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.05)',
      ...Platform.select({
        ios: {
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
        },
        android: {
            elevation: 5,
        },
        web: {
            boxShadow: '0px 10px 25px rgba(0,0,0,0.05)',
        }
      })
  },
  header: { marginBottom: 25, alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 14 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginLeft: 2 },
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
  }
});