import React, { useState } from 'react';
import { 
  View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, 
  ActivityIndicator, Platform 
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import StyledButton from '../components/StyledButton';
import api from '../services/api';

export default function CardFormScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const cardToEdit = route.params?.card;
  const isEditing = !!cardToEdit;

  const [name, setName] = useState(cardToEdit?.name || '');
  const [closingDay, setClosingDay] = useState(cardToEdit ? String(cardToEdit.closing_day) : '');
  // Valor inicial só é usado na CRIAÇÃO
  const [initialAmount, setInitialAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !closingDay) {
      const msg = 'Preencha nome e dia de fechamento.';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Atenção', msg);
      return;
    }

    const day = parseInt(closingDay);
    if (day < 1 || day > 31) {
        const msg = 'Dia de fechamento inválido (1-31).';
        Platform.OS === 'web' ? alert(msg) : Alert.alert('Erro', msg);
        return;
    }

    setLoading(true);
    try {
      const payload = {
        user_id: user.id,
        name,
        closing_day: day,
        // Envia o valor inicial apenas se não estiver editando
        initial_amount: !isEditing ? parseFloat(initialAmount.replace(',', '.') || 0) : 0
      };

      if (isEditing) {
        await api.put(`/cards/${cardToEdit.id}`, payload);
        const msg = 'Cartão atualizado!';
        Platform.OS === 'web' ? alert(msg) : Alert.alert('Sucesso', msg);
      } else {
        await api.post('/cards', payload);
        const msg = 'Cartão criado!';
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
    const confirmDelete = async () => {
      setLoading(true);
      try {
        await api.delete(`/cards/${cardToEdit.id}`);
        navigation.goBack();
      } catch (error) {
        console.error(error);
        Platform.OS === 'web' ? alert('Erro') : Alert.alert('Erro', 'Não foi possível excluir.');
      } finally {
        setLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm('Deseja excluir este cartão?')) confirmDelete();
    } else {
      Alert.alert('Excluir Cartão', 'Tem certeza?', [
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
          {isEditing ? 'Editar Cartão' : 'Novo Cartão'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.label, { color: colors.text }]}>Apelido do Cartão</Text>
        <TextInput
          style={inputStyle}
          placeholder="Ex: Nubank Roxinho"
          placeholderTextColor={colors.subText}
          value={name}
          onChangeText={setName}
        />

        <Text style={[styles.label, { color: colors.text }]}>Dia de Fechamento</Text>
        <TextInput
          style={inputStyle}
          placeholder="Dia (ex: 5)"
          placeholderTextColor={colors.subText}
          value={closingDay}
          onChangeText={setClosingDay}
          keyboardType="numeric"
          maxLength={2}
        />

        {/* CAMPO DE VALOR APENAS SE FOR NOVO CARTÃO */}
        {!isEditing && (
            <>
                <Text style={[styles.label, { color: colors.text }]}>Gastos Atuais (Fatura Aberta)</Text>
                <TextInput
                style={inputStyle}
                placeholder="0,00"
                placeholderTextColor={colors.subText}
                value={initialAmount}
                onChangeText={setInitialAmount}
                keyboardType="numeric"
                />
                <Text style={{ fontSize: 12, color: colors.subText, marginBottom: 15, marginTop: -10 }}>
                    Se já usou o cartão este mês, coloque o valor aqui para iniciar a fatura corretamente.
                </Text>
            </>
        )}

        <StyledButton 
          title="SALVAR" 
          onPress={handleSubmit} 
          loading={loading} 
          style={{ marginTop: 20 }} 
        />

        {isEditing && (
          <TouchableOpacity onPress={handleDelete} style={[styles.deleteButton, { borderColor: colors.error }]}>
            <Text style={{ color: colors.error, fontWeight: 'bold' }}>Excluir Cartão</Text>
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
  deleteButton: { marginTop: 20, padding: 15, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }
});