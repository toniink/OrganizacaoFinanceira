import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function InfoCard({ children, style, noPadding }) {
  const { colors, sizing } = useTheme();

  const dynamicStyles = [
    styles.card,
    { 
      backgroundColor: colors.card, 
      borderRadius: sizing.radius,
      shadowColor: colors.border,
      padding: noPadding ? 0 : sizing.padding 
    },
    Platform.select({
      web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' },
      default: { shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 }
    }),
    style
  ];

  return (
    <View style={dynamicStyles}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    marginBottom: 20,
  }
});