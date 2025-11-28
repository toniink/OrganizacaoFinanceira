import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import StyledButton from '../components/StyledButton';
import api from '../services/api';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth(); // Precisaríamos atualizar o user no contexto idealmente, mas vamos focar na edição
  const { colors } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [income, setIncome] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Carrega dados atualizados do banco ao entrar
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
        Alert.alert('Sucesso', 'Perfil atualizado! Faça login novamente para ver todas as alterações.', [
            { text: 'OK', onPress: () => logout() } // Força logout para atualizar contexto de forma simples
        ]);
    } catch (error) {
        Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    } finally {
        setLoading(false);
    }
  };

  const inputStyle = [styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={30} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Meu Perfil</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={100} color={colors.primary} />
            <Text style={{ color: colors.subText }}>{user?.email}</Text>
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Nome Completo</Text>
        <TextInput style={inputStyle} value={name} onChangeText={setName} />

        <Text style={[styles.label, { color: colors.text }]}>Renda Mensal (R$)</Text>
        <TextInput style={inputStyle} value={income} onChangeText={setIncome} keyboardType="numeric" />

        <View style={styles.divider} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Alterar Senha</Text>

        <Text style={[styles.label, { color: colors.text }]}>Nova Senha</Text>
        <TextInput style={inputStyle} value={password} onChangeText={setPassword} secureTextEntry placeholder="Deixe em branco para manter" placeholderTextColor={colors.subText} />

        <Text style={[styles.label, { color: colors.text }]}>Confirmar Nova Senha</Text>
        <TextInput style={inputStyle} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholder="Repita a senha" placeholderTextColor={colors.subText} />

        <StyledButton title="SALVAR ALTERAÇÕES" onPress={handleUpdate} loading={loading} style={{ marginTop: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50 },
  title: { fontSize: 20, fontWeight: 'bold' },
  content: { padding: 20 },
  avatarContainer: { alignItems: 'center', marginBottom: 30 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginLeft: 2 },
  input: { borderWidth: 1, borderRadius: 12, padding: 15, fontSize: 16, marginBottom: 15 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 }
});