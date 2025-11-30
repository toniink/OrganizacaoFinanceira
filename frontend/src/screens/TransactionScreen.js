import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Image, Alert, Platform, ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { SIZING, COLORS } from '../constants/theme';
import StyledButton from '../components/StyledButton';
import api from '../services/api';

// Importação Condicional do DatePicker
let DateTimePicker;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

export default function TransactionScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // 1. Verifica Parâmetros (Edição ou Pré-seleção)
  const transactionToEdit = route.params?.transaction;
  const preSelectedCardId = route.params?.preSelectedCard;
  const isEditing = !!transactionToEdit;

  // Estados do Formulário
  const [type, setType] = useState(transactionToEdit?.type || 'expense'); 
  const [amount, setAmount] = useState(transactionToEdit ? String(transactionToEdit.amount) : '');
  const [description, setDescription] = useState(transactionToEdit?.description || '');
  const [date, setDate] = useState(transactionToEdit ? new Date(transactionToEdit.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Listas
  const [categories, setCategories] = useState([]);
  
  // Lista Unificada (Contas + Cartões)
  const [origins, setOrigins] = useState([]); 
  // O valor selecionado será uma string combinada "tipo|id" (ex: "account|1" ou "credit_card|5")
  const [selectedOrigin, setSelectedOrigin] = useState(""); 
  const [selectedCategory, setSelectedCategory] = useState(""); 
  
  const [attachment, setAttachment] = useState(null);

  // Opções Extras
  const [showExtraOptions, setShowExtraOptions] = useState(isEditing ? true : false);
  const [isFixed, setIsFixed] = useState(transactionToEdit?.is_fixed === 1);
  const [repeat, setRepeat] = useState(false);
  const [observation, setObservation] = useState(''); 

  useEffect(() => {
    async function loadData() {
      try {
        // Busca Categorias, Contas e Cartões
        const [catsRes, accountsRes, cardsRes] = await Promise.all([
          api.get(`/categories/${user.id}?type=${type}`),
          api.get(`/accounts/${user.id}`),
          api.get(`/cards/${user.id}?month=${date.getMonth()+1}&year=${date.getFullYear()}`) // Mês atual para listar cards
        ]);

        setCategories(catsRes.data);

        // --- MÁGICA DA LISTA UNIFICADA ---
        // Juntamos contas e cartões em um array só, identificando o tipo
        const accountOptions = accountsRes.data.map(acc => ({
            label: `💰 ${acc.name} (R$ ${acc.balance.toFixed(2)})`,
            value: `account|${acc.id}`,
            type: 'account',
            id: acc.id,
            is_fixed: acc.is_fixed
        }));

        const cardOptions = cardsRes.data.map(card => ({
            label: `💳 ${card.name}`,
            value: `credit_card|${card.id}`,
            type: 'credit_card',
            id: card.id
        }));

        const allOrigins = [...accountOptions, ...cardOptions];
        setOrigins(allOrigins);

        // --- LÓGICA DE SELEÇÃO AUTOMÁTICA ---
        if (isEditing) {
            // Caso 1: Edição
            setSelectedCategory(transactionToEdit.category_id);
            setSelectedOrigin(`${transactionToEdit.origin_type}|${transactionToEdit.origin_id}`);
        } else if (preSelectedCardId) {
            // Caso 2: Veio do botão (+) do Cartão no Dashboard
            const cardTarget = `credit_card|${preSelectedCardId}`;
            setSelectedOrigin(cardTarget);
        } else {
            // Caso 3: Novo Lançamento (Default = Carteira)
            const wallet = accountOptions.find(opt => opt.is_fixed === 1);
            if (wallet) setSelectedOrigin(wallet.value);
            else if (allOrigins.length > 0) setSelectedOrigin(allOrigins[0].value);
            else setSelectedOrigin("");
        }

        // Seleciona categoria padrão se não estiver editando
        if (!isEditing && catsRes.data.length > 0) {
            setSelectedCategory(catsRes.data[0].id);
        }

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
    loadData();
  }, [type]); // Recarrega se mudar de Receita <-> Despesa

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.5 });
    if (!result.canceled) setAttachment(result.assets[0]);
  };

  const handleSubmit = async () => {
    if (!amount || !description || !selectedCategory || !selectedOrigin) {
      const msg = 'Preencha valor, descrição, categoria e origem.';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Atenção', msg);
      return;
    }

    setLoading(true);

    // Separa o valor combinado "tipo|id"
    const [originType, originId] = selectedOrigin.split('|');

    const payload = {
        description: description + (observation ? `\nObs: ${observation}` : ''),
        amount: parseFloat(amount.replace(',', '.')),
        type,
        date: date.toISOString().split('T')[0],
        category_id: selectedCategory,
        origin_type: originType, // 'account' ou 'credit_card'
        origin_id: parseInt(originId),
        is_fixed: isFixed ? 1 : 0
    };

    try {
      if (isEditing) {
        await api.put(`/transactions/${transactionToEdit.id}`, payload);
        const msg = 'Lançamento atualizado!';
        Platform.OS === 'web' ? alert(msg) : Alert.alert('Sucesso', msg);
      } else {
        const formData = new FormData();
        formData.append('user_id', user.id);
        Object.keys(payload).forEach(key => formData.append(key, payload[key]));
        
        if (attachment) {
            const uriParts = attachment.uri.split('.');
            const fileType = uriParts[uriParts.length - 1] || 'jpg';
            formData.append('comprovante', {
                uri: Platform.OS === 'ios' ? attachment.uri.replace('file://', '') : attachment.uri,
                type: `image/${fileType}`,
                name: `comprovante.${fileType}`,
            });
        }
        await api.post('/transactions', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        const msg = 'Lançamento salvo!';
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
            await api.delete(`/transactions/${transactionToEdit.id}`);
            const msg = 'Lançamento excluído.';
            Platform.OS === 'web' ? alert(msg) : Alert.alert('Sucesso', msg);
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Platform.OS === 'web' ? alert('Erro ao excluir') : Alert.alert('Erro', 'Não foi possível excluir.');
        } finally {
            setLoading(false);
        }
    };

    if (Platform.OS === 'web') {
        if (confirm('Tem certeza que deseja excluir este lançamento?')) confirmDelete();
    } else {
        Alert.alert('Confirmar Exclusão', 'Tem certeza?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Excluir', style: 'destructive', onPress: confirmDelete }
        ]);
    }
  };

  const inputStyle = [styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }];
  const labelStyle = [styles.label, { color: colors.text }];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={{ fontSize: 24, color: colors.text }}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
            {isEditing ? 'Editar Transação' : 'Nova Transação'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.typeSelector, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
          <TouchableOpacity style={[styles.typeButton, type === 'expense' && { backgroundColor: colors.error }]} onPress={() => setType('expense')}>
            <Text style={[styles.typeText, type === 'expense' && { color: '#FFF' }]}>Despesa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.typeButton, type === 'income' && { backgroundColor: colors.primary }]} onPress={() => setType('income')}>
            <Text style={[styles.typeText, type === 'income' && { color: '#FFF' }]}>Receita</Text>
          </TouchableOpacity>
        </View>

        <Text style={labelStyle}>Valor (R$)</Text>
        <TextInput style={[inputStyle, styles.amountInput, { color: type === 'expense' ? colors.error : colors.primary }]} placeholder="0,00" placeholderTextColor={colors.subText} value={amount} onChangeText={setAmount} keyboardType="numeric" />

        <Text style={labelStyle}>Descrição</Text>
        <TextInput style={inputStyle} placeholder="Ex: Almoço" placeholderTextColor={colors.subText} value={description} onChangeText={setDescription} />

        {/* PICKER DE CATEGORIA */}
        <Text style={labelStyle}>Categoria</Text>
        <View style={[styles.pickerContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
          <Picker selectedValue={selectedCategory} onValueChange={(itemValue) => setSelectedCategory(itemValue)} style={{ color: colors.text, height: Platform.OS === 'web' ? 40 : undefined }}>
            <Picker.Item label="Selecione..." value="" color={colors.subText} />
            {categories.map(cat => (<Picker.Item key={cat.id} label={cat.name} value={cat.id} />))}
          </Picker>
        </View>

        <Text style={labelStyle}>Data</Text>
        {Platform.OS === 'web' ? (
            <TextInput style={inputStyle} value={date.toISOString().split('T')[0]} onChangeText={(text) => { const newDate = new Date(text); if(!isNaN(newDate)) setDate(newDate); }} placeholder="YYYY-MM-DD" />
        ) : (
            <>
                <TouchableOpacity style={[inputStyle, { justifyContent: 'center' }]} onPress={() => setShowDatePicker(true)}>
                  <Text style={{ color: colors.text }}>{date.toLocaleDateString('pt-BR')}</Text>
                </TouchableOpacity>
                {showDatePicker && DateTimePicker && (<DateTimePicker value={date} mode="date" display="default" onChange={onChangeDate} />)}
            </>
        )}

        {/* PICKER DE ORIGEM (CONTA OU CARTÃO) */}
        <Text style={labelStyle}>Origem (Conta ou Cartão)</Text>
        <View style={[styles.pickerContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
          <Picker 
            selectedValue={selectedOrigin} 
            onValueChange={(itemValue) => setSelectedOrigin(itemValue)} 
            style={{ color: colors.text, height: Platform.OS === 'web' ? 40 : undefined }}
            enabled={!preSelectedCardId} // Se veio pré-selecionado do dashboard, trava a escolha (opcional)
          >
            <Picker.Item label="Selecione a origem..." value="" color={colors.subText} />
            {origins.map((opt, index) => (
                <Picker.Item key={index} label={opt.label} value={opt.value} />
            ))}
          </Picker>
        </View>

        {!isEditing && (
            <>
                <Text style={labelStyle}>Anexo (Opcional)</Text>
                <TouchableOpacity style={[inputStyle, styles.attachmentButton]} onPress={pickImage}>
                {attachment ? (<Image source={{ uri: attachment.uri }} style={styles.attachmentImage} />) : (<Text style={{ color: colors.subText }}>📎 Toque para anexar imagem</Text>)}
                </TouchableOpacity>
            </>
        )}

        <TouchableOpacity onPress={() => setShowExtraOptions(!showExtraOptions)} style={{ marginTop: 20, marginBottom: 10 }}>
          <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{showExtraOptions ? 'Ocultar Opções Extras' : 'Mostrar Opções Extras'}</Text>
        </TouchableOpacity>

        {showExtraOptions && (
          <View style={[styles.extraOptionsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.switchRow}>
              <Text style={{ color: colors.text }}>Lançamento Fixo</Text>
              <Switch trackColor={{ false: colors.border, true: colors.primary }} thumbColor={'#FFF'} onValueChange={setIsFixed} value={isFixed} />
            </View>
            <Text style={[labelStyle, { marginTop: 10 }]}>Observação</Text>
            <TextInput style={[inputStyle, { height: 80, textAlignVertical: 'top' }]} placeholder="Detalhes..." placeholderTextColor={colors.subText} value={observation} onChangeText={setObservation} multiline />
          </View>
        )}

        <StyledButton title={isEditing ? "ATUALIZAR LANÇAMENTO" : "SALVAR LANÇAMENTO"} onPress={handleSubmit} loading={loading} style={{ marginTop: 30 }} />

        {isEditing && (
            <TouchableOpacity onPress={handleDelete} style={[styles.deleteButton, { borderColor: colors.error }]}>
                <Text style={{ color: colors.error, fontWeight: 'bold' }}>🗑️ Excluir Lançamento</Text>
            </TouchableOpacity>
        )}

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 50 : 20, paddingHorizontal: SIZING.padding, paddingBottom: 15, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: SIZING.padding },
  typeSelector: { flexDirection: 'row', borderWidth: 1, borderRadius: SIZING.radius, marginBottom: 20, overflow: 'hidden' },
  typeButton: { flex: 1, padding: 12, alignItems: 'center' },
  typeText: { fontWeight: 'bold' },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginLeft: 2, marginTop: 15 },
  input: { borderWidth: 1, borderRadius: 12, padding: 15, fontSize: 16 },
  amountInput: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  pickerContainer: { borderWidth: 1, borderRadius: 12, overflow: 'hidden', justifyContent: 'center', marginBottom: 5 },
  attachmentButton: { alignItems: 'center', justifyContent: 'center', height: 150 },
  attachmentImage: { width: '100%', height: '100%', borderRadius: 12, resizeMode: 'cover' },
  extraOptionsCard: { padding: 15, borderWidth: 1, borderRadius: SIZING.radius, marginBottom: 10 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  deleteButton: { marginTop: 20, padding: 15, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }
});