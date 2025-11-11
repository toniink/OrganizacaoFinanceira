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
// Importando o ícone de seta
import { Ionicons } from '@expo/vector-icons';

// Reutilizando as cores que definimos no Login
const COLORS = {
  primary: '#2962FF', // Azul vibrante
  primaryDark: '#303F9F',
  purple: '#8A2BE2', // Roxo/Violeta para o botão Google
  white: '#FFFFFF',
  text: '#333',
  grey: '#888',
  lightGrey: '#DDDDDD',
  border: '#CCCCCC',
};

const CadastroScreen = ({ navigation }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const handleRegister = () => {
    console.log('Registrando:', nome, email, senha);
    // Lógica de registro aqui
  };

  const handleGoogleLogin = () => {
    console.log('Iniciando login com Google...');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* 1. Botão de Voltar Customizado */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* 2. Título */}
          <Text style={styles.title}>Criar nova conta</Text>
          {/* 3. Subtítulo */}
          <Text style={styles.subtitle}>
            Preencha os campos abaixo para se registrar no app.
          </Text>

          {/* 4. Formulário */}
          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu Nome Completo"
            placeholderTextColor={COLORS.grey}
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
          />

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu E-mail"
            placeholderTextColor={COLORS.grey}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            placeholderTextColor={COLORS.grey}
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />

          <Text style={styles.label}>Confirme a senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite novamente a senha"
            placeholderTextColor={COLORS.grey}
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            secureTextEntry
          />

          {/* 5. Botão Registrar */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
          >
            <Text style={styles.registerButtonText}>Registrar no app</Text>
          </TouchableOpacity>

          {/* 6. Divisores */}
          <Text style={styles.orText}>OU</Text>
          <Text style={styles.orTextSmall}>Entrar com</Text>

          {/* 7. Botão Google (Roxo) */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
          >
            <Text style={styles.googleButtonText}>Google</Text>
          </TouchableOpacity>

          {/* 8. Link de Login */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Ja tem uma conta?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Logue aqui</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 15, // Espaçamento do topo
  },
  backButton: {
    backgroundColor: '#f0f0f0', // Círculo cinza
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.grey,
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    borderRadius: 8,
    width: '100%',
    marginBottom: 15,
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: COLORS.primary, // Azul
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  orText: {
    color: COLORS.grey,
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 14,
    fontWeight: 'bold',
  },
  orTextSmall: {
    color: COLORS.grey,
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: COLORS.purple, // Roxo
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  googleButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: COLORS.text,
  },
  loginLink: {
    color: COLORS.primary, // Azul
    marginLeft: 5,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default CadastroScreen;