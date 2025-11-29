import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { PETS } from '../constants/pets';

const { width } = Dimensions.get('window');

export default function ThemeDetailScreen({ navigation, route }) {
  const { colors, selectedPet, setSelectedPet } = useTheme();
  const { petId } = route.params;

  const pet = PETS.find(p => p.id === petId);
  const isSelected = selectedPet === pet.id;

  const handleSelect = () => {
    setSelectedPet(pet.id);
    // Poderia salvar no AsyncStorage aqui
    alert(`Tema ${pet.name} aplicado com sucesso!`);
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tema {pet.name}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Card Topo */}
        <View style={[styles.previewCard, { backgroundColor: pet.color }]}>
            <Text style={styles.petName}>{pet.name} {pet.icon}</Text>
        </View>

        {/* Botão Ação */}
        <TouchableOpacity
            style={[
                styles.actionButton,
                isSelected ? { backgroundColor: '#16a34a' } : { backgroundColor: '#16a34a' } // Verde para "Selecionar" aqui também
            ]}
            onPress={handleSelect}
            disabled={isSelected}
        >
            <Text style={styles.actionText}>{isSelected ? 'Selecionado' : 'Selecionar'}</Text>
        </TouchableOpacity>

        {/* Carrossel de Imagens (ScrollView Horizontal) */}
        <View style={styles.carouselContainer}>
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
                {/* 1. Feliz */}
                <View style={styles.slide}>
                    <Image source={pet.imageHappy} style={styles.petImage} resizeMode="contain" />
                    <Text style={styles.moodText}>Gastos &lt; 30% (Feliz)</Text>
                </View>
                {/* 2. Preocupado */}
                <View style={styles.slide}>
                    <Image source={pet.imageWorried} style={styles.petImage} resizeMode="contain" />
                    <Text style={styles.moodText}>Gastos &lt; 60% (Preocupado)</Text>
                </View>
                {/* 3. Triste */}
                <View style={styles.slide}>
                    <Image source={pet.imageSad} style={styles.petImage} resizeMode="contain" />
                    <Text style={styles.moodText}>Gastos &gt; 60% (Triste)</Text>
                </View>
            </ScrollView>
            
            {/* Indicadores de bolinha */}
            <View style={styles.dotsContainer}>
                <View style={styles.dot} />
                <View style={[styles.dot, { opacity: 0.3 }]} />
                <View style={[styles.dot, { opacity: 0.3 }]} />
            </View>
        </View>

        {/* Texto de Marketing */}
        <Text style={[styles.description, { color: colors.text }]}>
            {pet.description}
            {'\n\n'}
            Tente não decepcionar seu {pet.name.toLowerCase()} ao fim do mês hein, olha lá.
        </Text>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: '#2a3b96',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20, alignItems: 'center' },
  
  previewCard: {
    width: '100%',
    height: 100,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -15,
    zIndex: 1,
  },
  petName: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginBottom: 30,
    zIndex: 2,
    elevation: 5
  },
  actionText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  carouselContainer: {
    height: 250,
    marginBottom: 20,
  },
  slide: {
    width: width - 40, // Largura da tela menos padding
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3e8ff', // Fundo lilás suave das imagens
    borderRadius: 20,
    marginRight: 0,
  },
  petImage: {
    width: 150,
    height: 150,
    marginBottom: 10
  },
  moodText: { fontWeight: 'bold', color: '#555' },
  
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000',
    marginHorizontal: 5
  },
  
  description: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    marginTop: 10,
    paddingHorizontal: 10
  }
});