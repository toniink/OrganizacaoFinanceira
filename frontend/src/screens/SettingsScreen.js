import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen({ navigation }) {
  const { colors } = useTheme();
  const { logout } = useAuth();

  // Estados para os Switches (Simulação)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hideValues, setHideValues] = useState(false);

  // Função auxiliar para renderizar uma linha de opção
  const renderOption = (label, onPress, showArrow = true) => (
    <TouchableOpacity style={styles.optionRow} onPress={onPress}>
      <Text style={styles.optionText}>{label}</Text>
      {showArrow && <Ionicons name="chevron-forward" size={20} color="#666" />}
    </TouchableOpacity>
  );

  // Função auxiliar para renderizar uma linha com Switch
  const renderSwitch = (label, value, onValueChange) => (
    <View style={styles.optionRow}>
      <Text style={styles.optionText}>{label}</Text>
      <Switch 
        value={value} 
        onValueChange={onValueChange} 
        trackColor={{ false: "#767577", true: "#3b82f6" }}
        thumbColor={value ? "#fff" : "#f4f3f4"}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Cabeçalho Azul (Igual à imagem) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* SEÇÃO: CONTA */}
        <Text style={styles.sectionTitle}>Conta</Text>
        <View style={styles.sectionBlock}>
            {renderOption("Editar Perfil / Alterar Senha", () => navigation.navigate('Profile'))}
            {renderOption("Idioma (Português)", () => Alert.alert("Idioma", "Apenas Português disponível no MVP."))}
            {/* Funcionalidade principal futura */}
            {renderOption("Temas (Funcionalidade)", () => navigation.navigate('Themes'))} 
        </View>

        {/* SEÇÃO: OPÇÕES DE VISUALIZAÇÃO (Sugestão MVP) */}
        <Text style={styles.sectionTitle}>Visualização</Text>
        <View style={styles.sectionBlock}>
            {renderSwitch("Ocultar valores no início", hideValues, setHideValues)}
            {renderSwitch("Modo Escuro (Em breve)", false, () => Alert.alert("Aviso", "Tema escuro será implementado na v2."))}
        </View>

        {/* SEÇÃO: NOTIFICAÇÕES */}
        <Text style={styles.sectionTitle}>Notificações</Text>
        <View style={styles.sectionBlock}>
            {renderSwitch("Receber notificações", notificationsEnabled, setNotificationsEnabled)}
            {renderSwitch("Alertas de contas a pagar", true, () => {})}
        </View>

        {/* SEÇÃO: SEGURANÇA */}
        <Text style={styles.sectionTitle}>Segurança</Text>
        <View style={styles.sectionBlock}>
            {renderOption("Dispositivos conectados", () => Alert.alert("Info", "Apenas este dispositivo."))}
        </View>

        {/* SEÇÃO: GERAL */}
        <Text style={styles.sectionTitle}>Geral</Text>
        <View style={styles.sectionBlock}>
            {renderOption("Ajuda / Suporte", () => navigation.navigate('Help'))}
            {renderOption("Sobre a equipe", () => navigation.navigate('About'))}
            {/* Botão Sair com cor diferente */}
            <TouchableOpacity style={styles.optionRow} onPress={logout}>
                <Text style={[styles.optionText, { color: '#ef4444', fontWeight: 'bold' }]}>Sair do Aplicativo</Text>
                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' }, // Fundo cinza claro geral
  header: {
    backgroundColor: '#2a3b96', // Azul escuro da imagem
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2,
  },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  content: { paddingBottom: 40 },
  
  // Títulos das Seções (Fundo Branco no layout da imagem, mas aqui usei texto solto para ficar mais clean)
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  
  // Bloco Cinza/Branco onde ficam os itens
  sectionBlock: {
    backgroundColor: '#e5e7eb', // Cinza claro parecido com a imagem
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#d1d5db',
  },
  
  // Linha de Opção
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db', // Divisória sutil
    backgroundColor: '#e5e7eb' // Garante a cor do bloco
  },
  optionText: {
    fontSize: 16,
    color: '#1f2937',
  }
});