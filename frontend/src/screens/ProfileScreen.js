import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Contextos e API
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

// Componentes Padronizados
import ScreenWrapper from '../components/ScreenWrapper';
import AppHeader from '../components/AppHeader';
import InfoCard from '../components/InfoCard';
import StyledButton from '../components/StyledButton';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { colors } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [income, setIncome] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
        try {
            const response = await api.get(`/profile/${user.id}`);
            setName(response.data.name);
            setIncome(String(response.data.monthly_income));
        } catch (error) {
            console.log(error);
        }
    }
    loadProfile();
  }, []);

  const handleUpdate = async () => {
    if (password && password !== confirmPassword) {
        Alert.alert('Erro', 'As senhas não conferem.');
        return;
    }

    setLoading(true);
    try {
        const payload = {
            name,
            monthly_income: parseFloat(income.replace(',', '.'))
        };
        if (password) payload.password = password;

        await api.put(`/profile/${user.id}`, payload);
        
        // Em produção, idealmente atualizamos o contexto sem deslogar, 
        // mas para o MVP, deslogar força a atualização dos dados limpos.
        Alert.alert('Sucesso', 'Perfil atualizado! Faça login novamente.', [
            { text: 'OK', onPress: () => logout() }
        ]);
    } catch (error) {
        Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    } finally {
        setLoading(false);
    }
  };

  const inputStyle = [styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }];
  const labelStyle = [styles.label, { color: colors.text }];

  return (
    <ScreenWrapper>
      
      <AppHeader title="Meu Perfil" showMenu />

      {/* Avatar e Email */}
      <View style={styles.avatarContainer}>
          <View style={[styles.avatarCircle, { backgroundColor: '#e0f2fe' }]}>
            <Ionicons name="person" size={60} color="#0284c7" />
          </View>
          <Text style={[styles.emailText, { color: colors.subText }]}>{user?.email}</Text>
      </View>

      {/* Dados Pessoais */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Dados Pessoais</Text>
      <InfoCard>
          <Text style={labelStyle}>Nome Completo</Text>
          <TextInput 
            style={inputStyle} 
            value={name} 
            onChangeText={setName} 
            placeholder="Seu nome"
            placeholderTextColor={colors.subText}
          />

          <Text style={labelStyle}>Renda Mensal (R$)</Text>
          <TextInput 
            style={inputStyle} 
            value={income} 
            onChangeText={setIncome} 
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor={colors.subText}
          />
      </InfoCard>

      {/* Segurança */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Segurança</Text>
      <InfoCard>
          <Text style={labelStyle}>Nova Senha</Text>
          <TextInput 
            style={inputStyle} 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
            placeholder="Deixe vazio para manter" 
            placeholderTextColor={colors.subText} 
          />

          <Text style={labelStyle}>Confirmar Nova Senha</Text>
          <TextInput 
            style={inputStyle} 
            value={confirmPassword} 
            onChangeText={setConfirmPassword} 
            secureTextEntry 
            placeholder="Repita a senha" 
            placeholderTextColor={colors.subText} 
          />
      </InfoCard>

      <StyledButton 
        title="SALVAR ALTERAÇÕES" 
        onPress={handleUpdate} 
        loading={loading} 
        style={{ marginTop: 10, marginBottom: 30 }} 
      />

    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  avatarContainer: { 
    alignItems: 'center', 
    marginBottom: 30 
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 4,
    borderColor: '#FFF',
    // Sombra
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5
  },
  emailText: {
    fontSize: 16,
    fontWeight: '500'
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 10,
    marginLeft: 5
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
    fontSize: 16, 
    marginBottom: 20 
  }
});