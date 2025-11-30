import React, { useState, useRef } from 'react';
import { 
  View, Text, TextInput, StyleSheet, Alert, 
  KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity
} from 'react-native';
import { useAuth } from '../context/AuthContext'; 
import { useTheme } from '../context/ThemeContext';
import { SIZING } from '../constants/theme';
import StyledButton from '../components/StyledButton';

export default function LoginScreen({ navigation }) {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth(); 

  const passwordRef = useRef(null);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Atenção', 'Por favor, preencha e-mail e senha.');
      return;
    }
    try {
      await login(email, password);
    } catch (error) {
      console.log(error);
      const errorMessage = error.response?.data?.error || 'Verifique suas credenciais.';
      Alert.alert('Erro no Login', errorMessage);
    }
  };

  const inputStyle = [
      styles.input, 
      { 
          backgroundColor: colors.inputBg, 
          color: colors.text, 
          borderColor: colors.border 
      }
  ];

  // Estilo do card dinâmico para evitar aviso de shadow na Web
  const cardStyle = [
    styles.card,
    { backgroundColor: colors.card },
    Platform.OS !== 'web' ? { shadowColor: colors.border } : {} // Só aplica shadowColor nativo no mobile
  ];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={cardStyle}>
            <View style={styles.header}>
                <Text style={{fontSize: 40, marginBottom: 10}}>🐱</Text>
                <Text style={[styles.title, { color: colors.text }]}>Gastto</Text>
                <Text style={[styles.subtitle, { color: colors.subText }]}>Cuide do seu dinheiro (e do gato).</Text>
            </View>

            <Text style={[styles.label, { color: colors.text }]}>E-mail</Text>
            <TextInput
                style={inputStyle}
                placeholder="seu@email.com"
                placeholderTextColor={colors.subText}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current.focus()}
            />

            <Text style={[styles.label, { color: colors.text }]}>Senha</Text>
            <TextInput
                ref={passwordRef}
                style={inputStyle}
                placeholder="Sua senha secreta"
                placeholderTextColor={colors.subText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                returnKeyType="go"
                onSubmitEditing={handleLogin}
            />

            <StyledButton 
                title={isLoading ? "Entrando..." : "ENTRAR"} 
                onPress={handleLogin} 
                loading={isLoading}
                style={{ marginTop: 10 }}
            />

            <View style={styles.footer}>
                <Text style={{ color: colors.subText }}>Ainda não cuida do gatinho? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Cadastre-se</Text>
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
      // Sombras Cross-Platform
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
  header: { marginBottom: 30, alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 14 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginLeft: 2 },
  input: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 15,
      marginBottom: 20,
      fontSize: 16
  },
  footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 20,
  }
});