import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';
import api from '../services/api';

// Componentes Padronizados
import ScreenWrapper from '../components/ScreenWrapper';
import AppHeader from '../components/AppHeader';
import InfoCard from '../components/InfoCard';
import StyledButton from '../components/StyledButton';

export default function CardFormScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const cardToEdit = route.params?.card;
  const isEditing = !!cardToEdit;

  const [name, setName] = useState(cardToEdit?.name || '');
  const [closingDay, setClosingDay] = useState(cardToEdit ? String(cardToEdit.closing_day) : '');
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

  // Estilos locais para inputs
  const inputStyle = [styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }];
  const labelStyle = [styles.label, { color: colors.text }];

  return (
    <ScreenWrapper>
      {/* Cabeçalho Padronizado */}
      <AppHeader 
        title={isEditing ? 'Editar Cartão' : 'Novo Cartão'} 
        showBack 
      />

      {/* Conteúdo em Cartão */}
      <InfoCard>
        <Text style={labelStyle}>Apelido do Cartão</Text>
        <TextInput
          style={inputStyle}
          placeholder="Ex: Nubank Roxinho"
          placeholderTextColor={colors.subText}
          value={name}
          onChangeText={setName}
        />

        <Text style={labelStyle}>Dia de Fechamento</Text>
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
                <Text style={labelStyle}>Gastos Atuais (Fatura Aberta)</Text>
                <TextInput
                    style={inputStyle}
                    placeholder="0,00"
                    placeholderTextColor={colors.subText}
                    value={initialAmount}
                    onChangeText={setInitialAmount}
                    keyboardType="numeric"
                />
                <Text style={{ fontSize: 12, color: colors.subText, marginBottom: 15, marginTop: -10 }}>
                    Se já usou o cartão este mês, coloque o valor aqui.
                </Text>
            </>
        )}

        <StyledButton 
          title={isEditing ? "ATUALIZAR" : "SALVAR"} 
          onPress={handleSubmit} 
          loading={loading} 
          style={{ marginTop: 20 }} 
        />

        {isEditing && (
          <TouchableOpacity onPress={handleDelete} style={[styles.deleteButton, { borderColor: COLORS.error }]}>
            <Text style={{ color: COLORS.error, fontWeight: 'bold' }}>Excluir Cartão</Text>
          </TouchableOpacity>
        )}
      </InfoCard>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginLeft: 2 },
  input: { borderWidth: 1, borderRadius: 12, padding: 15, fontSize: 16, marginBottom: 15 },
  deleteButton: { marginTop: 20, padding: 15, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }
});