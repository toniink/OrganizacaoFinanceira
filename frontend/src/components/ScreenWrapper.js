import React from 'react';
import { View, ScrollView, StyleSheet, Platform, RefreshControl } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ScreenWrapper({ 
  children, 
  scroll = true, 
  refreshing = false, 
  onRefresh = null,
  style 
}) {
  const { colors, sizing } = useTheme();

  const containerStyle = [
    styles.container, 
    { backgroundColor: colors.background },
    Platform.OS === 'web' ? { height: '100vh', overflow: 'hidden' } : { flex: 1 }
  ];

  if (!scroll) {
    return (
      <View style={[containerStyle, { padding: sizing.padding }, style]}>
        {children}
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
            styles.scrollContent, 
            { padding: sizing.padding, paddingBottom: 100 } // Espaço extra no final
        ]}
        showsVerticalScrollIndicator={true}
        refreshControl={
          onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : null
        }
        nestedScrollEnabled={true}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  }
});