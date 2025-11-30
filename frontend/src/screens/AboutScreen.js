import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../constants/theme';

// --- COMPONENTES PADRONIZADOS ---
import ScreenWrapper from '../components/ScreenWrapper';
import AppHeader from '../components/AppHeader';
import InfoCard from '../components/InfoCard';

export default function AboutScreen({ navigation }) {
  const { colors } = useTheme();

  const openLink = (url) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  return (
    <ScreenWrapper>
      {/* Cabeçalho Padronizado */}
      <AppHeader title="Sobre" showBack />

      {/* 1. CARD DO APP */}
      <InfoCard style={styles.appCardContent}>
          <View style={styles.appIconContainer}>
              <Ionicons name="paw" size={40} color="#FFF" />
          </View>
          
          <View style={{ flex: 1, paddingHorizontal: 15 }}>
              <Text style={[styles.appName, { color: colors.text }]}>Gastto</Text>
              <Text style={{ fontSize: 14, color: colors.subText }}>Versão MVP 1.0.0</Text>
          </View>

          <TouchableOpacity onPress={() => openLink('https://github.com/SeuUsuario/RepositorioDoProjeto')}>
              <Ionicons name="logo-github" size={30} color={colors.text} />
          </TouchableOpacity>
      </InfoCard>

      {/* 2. SEÇÃO INTEGRANTES */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Integrantes</Text>

      {/* Card Antonio */}
      <InfoCard noPadding style={styles.memberCard}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: '#60a5fa' }]}>
              <Text style={styles.avatarText}>AT</Text>
          </View>
          <Text style={[styles.memberName, { color: colors.text }]}>Antonio Tavares</Text>
          <TouchableOpacity style={styles.githubBtn} onPress={() => openLink('https://github.com/AntonioTavares')}>
              <Ionicons name="logo-github" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
      </InfoCard>

      {/* Card Marcele */}
      <InfoCard noPadding style={styles.memberCard}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: '#f472b6' }]}>
              <Text style={styles.avatarText}>MR</Text>
          </View>
          <Text style={[styles.memberName, { color: colors.text }]}>Marcele Rodrigues</Text>
          <TouchableOpacity style={styles.githubBtn} onPress={() => openLink('https://github.com/MarceleRodrigues')}>
              <Ionicons name="logo-github" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
      </InfoCard>

      {/* 3. SEÇÃO JUSTIFICATIVA */}
      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 10 }]}>Justificativa do tema</Text>
      
      <InfoCard>
          <Text style={[styles.descriptionText, { color: colors.text }]}>
              O <Text style={{ fontWeight: 'bold', color: COLORS.primary }}>Gastto</Text> é um MVP desenvolvido para a disciplina de Programação para Dispositivos Móveis, utilizando React Native.
              {'\n\n'}
              O objetivo é oferecer uma ferramenta simples, portátil e intuitiva de gerenciamento financeiro.
              {'\n\n'}
              <Text style={{ fontWeight: 'bold' }}>Público-alvo:</Text> Universitários que precisam equilibrar orçamentos apertados, recebendo muitas vezes menos do que o limite do cartão proporciona, o que facilita o acúmulo de dívidas.
          </Text>
      </InfoCard>

      <View style={{ height: 20 }} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  // App Card
  appCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.primary, 
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  appName: { fontSize: 18, fontWeight: 'bold' },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
    marginLeft: 5
  },

  // Member Cards
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  memberName: { flex: 1, fontSize: 16, fontWeight: '600' },
  githubBtn: { padding: 5 },

  // Texto
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'justify'
  }
});