import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../constants/theme';

export default function ListItem({ 
  icon, 
  title, 
  subtitle, 
  value, 
  valueColor, 
  onPress, 
  onAddPress, // Botão opcional de (+) na direita
  iconColor,
  iconBackgroundColor, // Para o caso da tela de Temas (círculo colorido)
  showChevron = false // Seta para a direita opcional
}) {
  const { colors } = useTheme();

  // Define a cor do ícone (se não passada, usa texto padrão)
  const finalIconColor = iconColor || colors.text;

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.mainClickable} 
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
        disabled={!onPress}
      >
        {/* Ícone ou Container de Ícone */}
        {icon && (
          <View style={[
            styles.iconContainer, 
            iconBackgroundColor && { backgroundColor: iconBackgroundColor, borderRadius: 20, padding: 8 }
          ]}>
            {typeof icon === 'string' && icon.length > 2 ? (
               // Se for nome de ícone do Ionicons
               <Ionicons name={icon} size={24} color={finalIconColor} />
            ) : (
               // Se for emoji ou texto curto
               <Text style={{ fontSize: 24 }}>{icon}</Text>
            )}
          </View>
        )}

        {/* Textos Centrais */}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.subText }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Valor ou Ação na Direita */}
        <View style={{ alignItems: 'flex-end' }}>
          {value && (
            <Text style={[styles.value, { color: valueColor || colors.text }]}>
              {value}
            </Text>
          )}
          {showChevron && (
             <Ionicons name="chevron-forward" size={16} color={colors.border} style={{ marginTop: 4 }} />
          )}
        </View>
      </TouchableOpacity>

      {/* Botão Adicional (+) se existir */}
      {onAddPress && (
        <TouchableOpacity onPress={onAddPress} style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={28} color={colors.text} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  mainClickable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  textContainer: {
    flex: 1,
    paddingRight: 10
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 10,
    marginTop: 2
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  addButton: {
    paddingLeft: 10,
    paddingVertical: 5
  }
});