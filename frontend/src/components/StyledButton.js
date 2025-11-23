import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { COLORS, SIZING } from '../constants/theme';

export default function StyledButton({ title, onPress, loading, style, testID }) {
  return (
    <TouchableOpacity 
      testID={testID}
      style={[styles.button, style, loading && styles.disabled]} 
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#FFF" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: SIZING.radius,
    alignItems: 'center',
    justifyContent: 'center',
    
    // Sombra compatível com Web, iOS e Android
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 4,
        shadowColor: COLORS.primary,
      },
      web: {
        boxShadow: '0px 4px 10px rgba(74, 222, 128, 0.4)', // CSS padrão
      }
    })
  },
  disabled: {
    opacity: 0.7,
  },
  text: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  }
});