import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { COLORS, SIZING } from '../constants/theme';

export default function AboutScreen({ navigation }) {
  const { colors } = useTheme();

  const openLink = (url) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sobre</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* CARD DO APP */}
        <View style={styles.appCard}>
            <View style={styles.appIconContainer}>
                {/* Gatinho do App */}
                <Ionicons name="paw" size={50} color={COLORS.primary} />
            </View>
            
            <View style={{ flex: 1, paddingHorizontal: 15 }}>
                <Text style={styles.appName}>Miau Financeiro</Text>
                <Text style={styles.appVersion}>Versão MVP 1.0.0</Text>
            </View>

            <TouchableOpacity onPress={() => openLink('https://github.com/SeuUsuario/RepositorioDoProjeto')}>
                <Ionicons name="logo-github" size={40} color="#333" />
            </TouchableOpacity>
        </View>

        {/* SEÇÃO INTEGRANTES */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Integrantes</Text>

        {/* Antonio */}
        <View style={styles.memberCard}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: '#60a5fa' }]}>
                <Text style={styles.avatarText}>AT</Text>
            </View>
            <Text style={styles.memberName}>Antonio Tavares</Text>
            <TouchableOpacity onPress={() => openLink('https://github.com/AntonioTavares')}>
                <Ionicons name="logo-github" size={32} color="#2a3b96" />
            </TouchableOpacity>
        </View>

        {/* Marcele */}
        <View style={styles.memberCard}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: '#f472b6' }]}>
                <Text style={styles.avatarText}>MR</Text>
            </View>
            <Text style={styles.memberName}>Marcele Rodrigues</Text>
            <TouchableOpacity onPress={() => openLink('https://github.com/MarceleRodrigues')}>
                <Ionicons name="logo-github" size={32} color="#2a3b96" />
            </TouchableOpacity>
        </View>

        {/* SEÇÃO JUSTIFICATIVA */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>Justificativa do tema</Text>
        
        <View style={styles.textCard}>
            <Text style={styles.descriptionText}>
                O <Text style={{ fontWeight: 'bold' }}>Miau Financeiro</Text> é um MVP desenvolvido para a disciplina de Programação para Dispositivos Móveis, utilizando React Native.
                {'\n\n'}
                O objetivo é oferecer uma ferramenta simples, portátil e intuitiva de gerenciamento financeiro.
                {'\n\n'}
                <Text style={{ fontWeight: 'bold' }}>Público-alvo:</Text> Universitários que precisam equilibrar orçamentos apertados, recebendo muitas vezes menos do que o limite do cartão proporciona, o que facilita o acúmulo de dívidas.
            </Text>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: '#2a3b96', // Azul escuro do topo
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    elevation: 4,
  },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  content: { padding: 20 },
  
  // Card Principal do App
  appCard: {
    backgroundColor: '#e5e7eb', // Cinza claro
    borderRadius: 0, // Quadrado como na imagem ou levemente arredondado
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  appIconContainer: {
    width: 70,
    height: 70,
    backgroundColor: '#93c5fd', // Azul claro placeholder
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  appName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  appVersion: { fontSize: 14, color: '#666', marginTop: 4 },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 5
  },

  // Cards dos Membros
  memberCard: {
    backgroundColor: '#e5e7eb',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 4, // Quadrado na imagem, mas pode ser redondo
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  memberName: { flex: 1, fontSize: 16, fontWeight: '600', color: '#333' },

  // Card de Texto
  textCard: {
    backgroundColor: '#e5e7eb',
    padding: 20,
  },
  descriptionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    textAlign: 'justify'
  }
});