import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PlaceholderScreen = ({ navigation, title }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
    <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ position: 'absolute', top: 50, left: 20 }}>
        <Ionicons name="menu" size={30} color="#333" />
    </TouchableOpacity>
    <Ionicons name="construct-outline" size={80} color="#cbd5e1" />
    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 20 }}>{title}</Text>
    <Text style={{ color: '#64748b', marginTop: 10 }}>Em construção...</Text>
  </View>
);

export const SettingsScreen = (props) => <PlaceholderScreen {...props} title="Configurações" />;
export const ThemesScreen = (props) => <PlaceholderScreen {...props} title="Temas" />;
export const AboutScreen = (props) => <PlaceholderScreen {...props} title="Sobre a Equipe" />;
export const HelpScreen = (props) => <PlaceholderScreen {...props} title="Ajuda" />;