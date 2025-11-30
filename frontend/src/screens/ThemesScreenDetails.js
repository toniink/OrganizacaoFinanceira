import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Contextos e Constantes
import { useTheme } from '../context/ThemeContext';
import { PETS } from '../constants/pets';
import { COLORS } from '../constants/theme';

// Componentes Padronizados
import ScreenWrapper from '../components/ScreenWrapper';
import AppHeader from '../components/AppHeader';
import InfoCard from '../components/InfoCard';

const { width } = Dimensions.get('window');
const SLIDE_WIDTH = width - 40; // Largura total menos padding padrão (20+20)

export default function ThemeDetailScreen({ navigation, route }) {
  const { colors, selectedPet, setSelectedPet } = useTheme();
  const { petId } = route.params;

  const pet = PETS.find(p => p.id === petId);
  const isSelected = selectedPet === pet.id;
  
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSelect = () => {
    setSelectedPet(pet.id);
    alert(`Tema ${pet.name} aplicado com sucesso!`);
    navigation.goBack();
  };

  // Atualiza a bolinha ativa ao rolar
  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setActiveIndex(roundIndex);
  };

  return (
    <ScreenWrapper>
      <AppHeader title={`Tema ${pet.name}`} showBack />

      {/* 1. CABEÇALHO DO TEMA */}
      <InfoCard style={styles.headerCard} noPadding>
          <View style={[styles.iconContainer, { backgroundColor: pet.color }]}>
              <Text style={{ fontSize: 40 }}>{pet.icon}</Text>
          </View>
          <Text style={[styles.petTitle, { color: colors.text }]}>{pet.name}</Text>
          <Text style={{ color: colors.subText, marginBottom: 15 }}>{pet.price}</Text>

          {/* Botão Selecionar */}
          <TouchableOpacity
            style={[
                styles.selectButton,
                isSelected ? { backgroundColor: '#22c55e' } : { backgroundColor: COLORS.secondary }
            ]}
            onPress={handleSelect}
            disabled={isSelected}
          >
            <Text style={styles.selectButtonText}>
                {isSelected ? 'SELECIONADO' : 'SELECIONAR'}
            </Text>
            {isSelected && <Ionicons name="checkmark-circle" size={20} color="#FFF" style={{ marginLeft: 5 }} />}
          </TouchableOpacity>
      </InfoCard>

      {/* 2. CARROSSEL DE PREVIEW */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Pré-visualização</Text>
      
      <View style={styles.carouselWrapper}>
        <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ alignItems: 'center' }}
        >
            {/* Slide 1: Feliz */}
            <View style={[styles.slide, { backgroundColor: '#f0fdf4' }]}>
                <Image source={pet.imageHappy} style={styles.petImage} resizeMode="contain" />
                <Text style={[styles.moodText, { color: '#166534' }]}>Gastos &lt; 30% (Feliz)</Text>
            </View>
            {/* Slide 2: Preocupado */}
            <View style={[styles.slide, { backgroundColor: '#fff7ed' }]}>
                <Image source={pet.imageWorried} style={styles.petImage} resizeMode="contain" />
                <Text style={[styles.moodText, { color: '#9a3412' }]}>Gastos &lt; 60% (Preocupado)</Text>
            </View>
            {/* Slide 3: Triste */}
            <View style={[styles.slide, { backgroundColor: '#fef2f2' }]}>
                <Image source={pet.imageSad} style={styles.petImage} resizeMode="contain" />
                <Text style={[styles.moodText, { color: '#991b1b' }]}>Gastos &gt; 60% (Triste)</Text>
            </View>
        </ScrollView>

        {/* Indicadores (Bolinhas) */}
        <View style={styles.dotsContainer}>
            {[0, 1, 2].map((idx) => (
                <View 
                    key={idx} 
                    style={[
                        styles.dot, 
                        { backgroundColor: idx === activeIndex ? COLORS.secondary : '#cbd5e1' }
                    ]} 
                />
            ))}
        </View>
      </View>

      {/* 3. DESCRIÇÃO */}
      <InfoCard>
          <Text style={[styles.descriptionTitle, { color: colors.text }]}>Sobre este companheiro</Text>
          <Text style={[styles.descriptionText, { color: colors.text }]}>
            {pet.description}
            {'\n\n'}
            Este tema altera o personagem principal na tela de Visão Geral. Ele reage em tempo real conforme você gasta seu orçamento mensal.
            {'\n\n'}
            <Text style={{ fontStyle: 'italic', color: colors.subText }}>
                "Não deixe o {pet.name.toLowerCase()} chorar!"
            </Text>
          </Text>
      </InfoCard>

    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  // Card Topo
  headerCard: {
      alignItems: 'center',
      padding: 20,
      marginBottom: 20
  },
  iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
  },
  petTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 2 },
  
  selectButton: {
      flexDirection: 'row',
      paddingVertical: 12,
      paddingHorizontal: 40,
      borderRadius: 25,
      alignItems: 'center',
      marginTop: 10,
      width: '100%',
      justifyContent: 'center'
  },
  selectButtonText: { color: '#FFF', fontWeight: 'bold', letterSpacing: 1 },

  // Carrossel
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginLeft: 5 },
  carouselWrapper: { marginBottom: 25 },
  slide: {
      width: SLIDE_WIDTH, // Ocupa a largura disponível do container pai (ScreenWrapper padding)
      height: 250,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.05)',
  },
  petImage: { width: 150, height: 150, marginBottom: 15 },
  moodText: { fontSize: 16, fontWeight: 'bold' },

  dotsContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 15 },
  dot: { width: 10, height: 10, borderRadius: 5, marginHorizontal: 6 },

  // Descrição
  descriptionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  descriptionText: { fontSize: 14, lineHeight: 22, textAlign: 'justify' }
});