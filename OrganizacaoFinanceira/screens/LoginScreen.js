import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
// Importando o ícone do Google
import { AntDesign } from '@expo/vector-icons';

// Definindo as cores do seu protótipo
const COLORS = {
  primary: '#2962FF', // Azul vibrante para botões e links
  primaryDark: '#303F9F', // Azul/Roxo escuro para logo e footer
  white: '#FFFFFF',
  text: '#333',
  grey: '#888',
  lightGrey: '#DDDDDD',
  border: '#CCCCCC',
};

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleGoogleLogin = () => {
    console.log('Iniciando login com Google...');
  };

  const handleLogin = () => {
    console.log('Email:', email, 'Senha:', senha);
  };

  const handleForgotPassword = () => {
    navigation.navigate('Cadastro'); // Placeholder
  };

  const handleSignUp = () => {
    navigation.navigate('Cadastro');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled" // Faz o teclado fechar ao tocar fora
        >
          {/* 1. Logo (Placeholder) */}
          <View style={styles.logoPlaceholder} />

          {/* 2. Botão Google */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
          >
            <AntDesign name="google" size={20} color="#DB4437" />
            <Text style={styles.googleButtonText}>Continuar com o Google</Text>
          </TouchableOpacity>

          {/* 3. "ou" */}
          <Text style={styles.orText}>ou</Text>

          {/* 4. Label E-mail */}
          <Text style={styles.label}>E-mail:</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu E-mail"
            placeholderTextColor={COLORS.grey}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* 5. Label Senha */}
          <Text style={styles.label}>Senha:</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua senha" // Corrigido
            placeholderTextColor={COLORS.grey}
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />

          {/* 6. Esqueci minha senha */}
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotPassword}>Esqueci a Senha</Text>
          </TouchableOpacity>

          {/* 7. Botão Login */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          {/* 8. Criar conta */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Nao tem conta?</Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={styles.signupLink}>Criar conta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* 9. Footer Curvado */}
        {/* Este View fica FORA do ScrollView mas DENTRO do KeyboardAvoidingView */}
        <View style={styles.footerContainer}>
          <View style={styles.footerWave}>
            <Text style={styles.footerText}>@2025</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    // flexGrow: 1 não é mais necessário aqui, o footer é separado
    paddingHorizontal: 25,
    paddingTop: 15, // Respiro do logo
    paddingBottom: 40, // Espaço extra no fim do scroll
  },
  logoPlaceholder: {
    width: 150, // Ajustado para ser um retângulo
    height: 100,
    backgroundColor: COLORS.primaryDark, // Cor do protótipo
    alignSelf: 'center',
    borderRadius: 10,
    marginTop: 15, // Padding de 15px
    marginBottom: 40,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGrey, // Borda cinza clara
    padding: 14,
    borderRadius: 8,
    width: '100%',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginLeft: 10,
  },
  orText: {
    color: COLORS.grey,
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 14,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold', // Label em negrito
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white, // Fundo branco
    borderWidth: 1,
    borderColor: COLORS.border, // Borda cinza
    padding: 12,
    borderRadius: 8,
    width: '100%',
    marginBottom: 15,
    fontSize: 16,
  },
  forgotPassword: {
    color: COLORS.primary, // Azul do protótipo
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 25,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: COLORS.primary, // Azul do protótipo
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: COLORS.text, // "Nao tem conta?" é escuro
  },
  signupLink: {
    color: COLORS.primary, // "Criar conta" é azul
    marginLeft: 5,
    fontSize: 14,
    fontWeight: 'bold',
  },
  // --- Estilos do Footer Curvado ---
  footerContainer: {
    // Este container ajuda a posicionar a onda
    alignItems: 'center',
    width: '100%',
  },
  footerWave: {
    // A "onda" é um View mais largo que a tela, com bordas arredondadas
    width: '150%', // Mais largo para a curva ficar suave
    height: 120,
    backgroundColor: COLORS.primaryDark,
    borderTopLeftRadius: 200, // Raio da borda bem grande
    borderTopRightRadius: 200,
    alignItems: 'center',
    overflow: 'hidden', // Esconde as partes que saem da tela
  },
  footerText: {
    color: COLORS.white,
    fontSize: 12,
    marginTop: 40, // Posiciona o texto dentro da área visível da curva
  },
});

export default LoginScreen;