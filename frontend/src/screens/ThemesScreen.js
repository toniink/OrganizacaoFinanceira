import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { PETS } from '../constants/pets';

export default function ThemesScreen({ navigation }) {
  const { colors, selectedPet, setSelectedPet } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={30} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Temas</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.subtitle, { color: colors.subText }]}>Escolha seu companheiro financeiro</Text>

        {PETS.map((pet) => {
            const isSelected = selectedPet === pet.id;

            return (
                <View key={pet.id} style={styles.petCardContainer}>
                    {/* Botão Visual do Cartão */}
                    <TouchableOpacity 
                        style={[styles.petCard, { backgroundColor: pet.color }]}
                        onPress={() => navigation.navigate('ThemeDetail', { petId: pet.id })}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.petName}>{pet.name} {pet.icon}</Text>
                    </TouchableOpacity>

                    {/* Botão de Ação (Selecionar/Selecionado/Preço) */}
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            isSelected ? { backgroundColor: '#16a34a' } : { backgroundColor: '#2a3b96' } // Verde se selecionado, Azul se não
                        ]}
                        onPress={() => {
                            // No MVP, todos "compram" direto. Numa loja real, verificaria compra.
                            if (isSelected) return;
                            
                            // Se for para selecionar, vamos para detalhes primeiro ou selecionamos direto?
                            // Pela imagem, o clique no preço leva para detalhes/compra
                            navigation.navigate('ThemeDetail', { petId: pet.id });
                        }}
                    >
                        <Text style={styles.actionText}>
                            {isSelected ? 'Selecionado' : (pet.id === 'cat' ? 'Selecionar' : `Valor: ${pet.price}`)}
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        })}
        
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 15 },
  title: { fontSize: 20, fontWeight: 'bold' },
  content: { padding: 20 },
  subtitle: { fontSize: 14, marginBottom: 20, textAlign: 'center' },
  
  petCardContainer: { alignItems: 'center', marginBottom: 25 },
  petCard: {
    width: '100%',
    height: 120,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -15, // Sobreposição visual com o botão
    zIndex: 1,
    elevation: 3
  },
  petName: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    minWidth: 150,
    alignItems: 'center',
    zIndex: 2,
    elevation: 5
  },
  actionText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 }
});