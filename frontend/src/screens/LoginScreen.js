import React, { useState, useRef } from 'react';
import { 
  View, Text, TextInput, StyleSheet, Alert, 
  TouchableOpacity, Platform 
} from 'react-native';
import { useAuth } from '../context/AuthContext'; 
import { useTheme } from '../context/ThemeContext';
import { SIZING, COLORS } from '../constants/theme';

// Componentes Padronizados
import ScreenWrapper from '../components/ScreenWrapper';
import StyledButton from '../components/StyledButton';
import InfoCard from '../components/InfoCard';

export default function LoginScreen({ navigation }) {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth(); 

  const passwordRef = useRef(null);

  const handleLogin = async () => {
    if (!email || !password) {
      const msg = 'Por favor, preencha e-mail e senha.';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Atenção', msg);
      return;
    }

    try {
      await login(email, password);
      // Sucesso: O AuthContext redireciona automaticamente via estado 'signed'
    } catch (error) {
      // Tratamento de erros específicos vindos do Backend
      const errorMessage = error.response?.data?.error || 'Erro de conexão com o servidor.';
      
      if (Platform.OS === 'web') {
        alert(`Falha no Login: ${errorMessage}`);
      } else {
        Alert.alert('Falha no Login', errorMessage);
      }
    }
  };

  // Estilos Locais para Inputs
  const inputStyle = [
      styles.input, 
      { 
          backgroundColor: colors.inputBg, 
          color: colors.text, 
          borderColor: colors.border 
      }
  ];
  const labelStyle = [styles.label, { color: colors.text }];

  return (
    // ScreenWrapper lida com o teclado e scroll automaticamente
    <ScreenWrapper style={{ justifyContent: 'center' }}>
        
        {/* Cabeçalho / Logo */}
        <View style={styles.header}>
            <Text style={{fontSize: 50, marginBottom: 10}}>🐱</Text>
            <Text style={[styles.title, { color: colors.text }]}>Miau Financeiro</Text>
            <Text style={[styles.subtitle, { color: colors.subText }]}>Entre para cuidar do seu gatinho.</Text>
        </View>

        {/* Formulário dentro do Card */}
        <InfoCard>
            <Text style={labelStyle}>E-mail</Text>
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

            <Text style={labelStyle}>Senha</Text>
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
                title={isLoading ? "ENTRANDO..." : "ENTRAR"} 
                onPress={handleLogin} 
                loading={isLoading}
                style={{ marginTop: 10 }}
            />
        </InfoCard>

        {/* Rodapé */}
        <View style={styles.footer}>
            <Text style={{ color: colors.subText }}>Ainda não tem conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Cadastre-se</Text>
            </TouchableOpacity>
        </View>

    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { 
    marginBottom: 30, 
    alignItems: 'center',
    marginTop: 20 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 5 
  },
  subtitle: { 
    fontSize: 14 
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
      marginBottom: 20,
      fontSize: 16
  },
  footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 20,
      marginBottom: 20
  }
});