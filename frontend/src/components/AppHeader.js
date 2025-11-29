import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

export default function AppHeader({ 
  title, 
  subtitle, 
  showBack = false, 
  showMenu = false, 
  rightAction 
}) {
  const navigation = useNavigation();
  const { colors, sizing } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        {showBack && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={28} color={colors.text} />
          </TouchableOpacity>
        )}
        
        {showMenu && (
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconBtn}>
            <Ionicons name="menu" size={30} color={colors.text} />
          </TouchableOpacity>
        )}

        <View>
          {subtitle && <Text style={[styles.subtitle, { color: colors.subText }]}>{subtitle}</Text>}
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        </View>
      </View>

      {rightAction && (
        <View style={styles.rightContainer}>
          {rightAction}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 10, // ScreenWrapper já dá padding
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBtn: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});