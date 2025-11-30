import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../constants/theme';

export default function QuickAddModal({ visible, onClose, accountName, onConfirm }) {
  const { colors } = useTheme();
  const [value, setValue] = useState('');

  // Limpa o valor sempre que o modal abre
  useEffect(() => {
    if (visible) setValue('');
  }, [visible]);

  const handleConfirm = () => {
    if (!value) return;
    onConfirm(value);
    setValue(''); // Limpa após confirmar
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        {/* O evento stopPropagation não existe no RN puro, então usamos um TouchableOpacity sem ação no conteúdo para bloquear o fechar */}
        <TouchableOpacity activeOpacity={1} style={[styles.content, { backgroundColor: colors.card }]}>
          
          <Text style={[styles.title, { color: colors.text }]}>Adicionar Saldo</Text>
          
          <Text style={{ color: colors.subText, marginBottom: 15, textAlign: 'center' }}>
             {accountName ? `Adicionando em: ${accountName}` : 'Selecione uma conta'}
          </Text>

          <TextInput 
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            placeholder="Valor (Ex: 50.00)"
            placeholderTextColor={colors.subText}
            keyboardType="numeric"
            autoFocus={visible} // Foca automaticamente quando abre
            value={value}
            onChangeText={setValue}
          />

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: COLORS.primary }]} 
            onPress={handleConfirm}
          >
            <Text style={styles.buttonText}>Confirmar</Text>
          </TouchableOpacity>

        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '85%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 10,
    ...Platform.select({
        web: { boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
        ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } }
    })
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold'
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16
  }
});