import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Contextos
import { useTheme } from '../context/ThemeContext';
import { PETS } from '../constants/pets';

// Componentes Padronizados
import ScreenWrapper from '../components/ScreenWrapper';
import AppHeader from '../components/AppHeader';
import InfoCard from '../components/InfoCard';

export default function ThemesScreen({ navigation }) {
  const { colors, selectedPet } = useTheme();

  return (
    <ScreenWrapper>
      {/* Cabeçalho Padronizado */}
      <AppHeader 
        title="Loja de Temas" 
        showMenu 
        subtitle="Personalize seu companheiro"
      />

      {PETS.map((pet) => {
        const isSelected = selectedPet === pet.id;

        return (
          <InfoCard key={pet.id} style={styles.cardContainer} noPadding>
            <TouchableOpacity 
              style={styles.cardContent}
              onPress={() => navigation.navigate('ThemeDetail', { petId: pet.id })}
              activeOpacity={0.7}
            >
              {/* Ícone com a cor do tema (Círculo colorido) */}
              <View style={[styles.iconContainer, { backgroundColor: pet.color }]}>
                <Text style={styles.iconText}>{pet.icon}</Text>
              </View>

              {/* Texto */}
              <View style={styles.textContainer}>
                <Text style={[styles.petName, { color: colors.text }]}>{pet.name}</Text>
                <Text style={styles.petPrice}>{pet.price}</Text>
              </View>

              {/* Seta de Navegação */}
              <Ionicons name="chevron-forward" size={24} color={colors.subText} />
            </TouchableOpacity>

            {/* Botão de Ação (Rodapé do Card) */}
            <View style={styles.cardFooter}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  isSelected ? { backgroundColor: '#22c55e' } : { backgroundColor: colors.secondary }
                ]}
                onPress={() => {
                    // Se já selecionado, não faz nada. Se não, vai para detalhes.
                    if (!isSelected) {
                        navigation.navigate('ThemeDetail', { petId: pet.id });
                    }
                }}
              >
                <Text style={styles.actionText}>
                  {isSelected ? 'Selecionado' : 'Ver Detalhes'}
                </Text>
                {isSelected && <Ionicons name="checkmark-circle" size={18} color="#FFF" style={{ marginLeft: 5 }} />}
              </TouchableOpacity>
            </View>
          </InfoCard>
        );
      })}
      
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 20,
    overflow: 'hidden', // Para o botão do rodapé respeitar a borda
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    // Sombra interna leve
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconText: {
    fontSize: 30,
  },
  textContainer: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  petPrice: {
    fontSize: 14,
    color: '#64748b', // subText
    fontWeight: '500',
  },
  cardFooter: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  }
});