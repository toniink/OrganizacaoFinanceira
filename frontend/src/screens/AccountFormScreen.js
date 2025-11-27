import React, { useState } from 'react';
import { 
  View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, 
  ActivityIndicator, Platform 
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import StyledButton from '../components/StyledButton';
import api from '../services/api';

export default function AccountFormScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  // Verifica se é edição
  const accountToEdit = route.params?.account;
  const isEditing = !!accountToEdit;
  // Verifica se é a carteira fixa (não pode mudar nome nem deletar)
  const isFixed = accountToEdit?.is_fixed === 1;

  const [name, setName] = useState(accountToEdit?.name || '');
  const [balance, setBalance] = useState(accountToEdit ? String(accountToEdit.balance) : '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !balance) {
      const msg = 'Preencha nome e saldo atual.';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Atenção', msg);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        user_id: user.id,
        name,
        balance: parseFloat(balance.replace(',', '.'))
      };

      if (isEditing) {
        await api.put(`/accounts/${accountToEdit.id}`, payload);
        const msg = 'Conta atualizada!';
        Platform.OS === 'web' ? alert(msg) : Alert.alert('Sucesso', msg);
      } else {
        await api.post('/accounts', payload);
        const msg = 'Conta criada!';
        Platform.OS === 'web' ? alert(msg) : Alert.alert('Sucesso', msg);
      }
      navigation.goBack();
    } catch (error) {
      console.error(error);
      const msg = 'Erro ao salvar.';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (isFixed) return; // Segurança extra

    const confirmDelete = async () => {
      setLoading(true);
      try {
        await api.delete(`/accounts/${accountToEdit.id}`);
        navigation.goBack();
      } catch (error) {
        console.error(error);
        Platform.OS === 'web' ? alert('Erro ao excluir') : Alert.alert('Erro', 'Não foi possível excluir.');
      } finally {
        setLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm('Deseja excluir esta conta?')) confirmDelete();
    } else {
      Alert.alert('Excluir Conta', 'Tem certeza?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: confirmDelete }
      ]);
    }
  };

  const inputStyle = [styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 24, color: colors.text }}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          {isEditing ? 'Editar Conta' : 'Nova Conta'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.label, { color: colors.text }]}>Nome da Conta</Text>
        <TextInput
          style={[inputStyle, isFixed && styles.disabledInput]}
          placeholder="Ex: Nubank, Inter..."
          placeholderTextColor={colors.subText}
          value={name}
          onChangeText={setName}
          editable={!isFixed} // Bloqueia edição se for Carteira Fixa
        />
        {isFixed && <Text style={{ fontSize: 12, color: colors.subText, marginBottom: 15 }}>O nome da carteira padrão não pode ser alterado.</Text>}

        <Text style={[styles.label, { color: colors.text }]}>Saldo Atual (R$)</Text>
        <TextInput
          style={inputStyle}
          placeholder="0,00"
          placeholderTextColor={colors.subText}
          value={balance}
          onChangeText={setBalance}
          keyboardType="numeric"
        />

        <StyledButton 
          title="SALVAR" 
          onPress={handleSubmit} 
          loading={loading} 
          style={{ marginTop: 20 }} 
        />

        {isEditing && !isFixed && (
          <TouchableOpacity onPress={handleDelete} style={[styles.deleteButton, { borderColor: colors.error }]}>
            <Text style={{ color: colors.error, fontWeight: 'bold' }}>Excluir Conta</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 15 },
  title: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginLeft: 2 },
  input: { borderWidth: 1, borderRadius: 12, padding: 15, fontSize: 16, marginBottom: 15 },
  disabledInput: { opacity: 0.6 },
  deleteButton: { marginTop: 20, padding: 15, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }
});