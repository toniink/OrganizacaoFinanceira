import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function CustomDrawer(props) {
  const { user, logout } = useAuth();

  return (
    <View style={{ flex: 1, backgroundColor: '#1e3a8a' }}> 
      {/* DrawerContentScrollView lida com a rolagem do menu */}
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        
        {/* Cabeçalho do Menu */}
        <View style={styles.header}>
            {/* Botão Fechar (X) */}
            <TouchableOpacity onPress={() => props.navigation.closeDrawer()} style={styles.closeBtn}>
                <Ionicons name="close" size={30} color="#FFF" />
            </TouchableOpacity>

            {/* ÁREA DE PERFIL CLICÁVEL (AGORA REDIRECIONA) */}
            <TouchableOpacity 
                style={styles.profileSection} 
                onPress={() => props.navigation.navigate('Profile')}
                activeOpacity={0.7}
            >
                <View style={styles.avatarContainer}>
                    <Ionicons name="person-circle-outline" size={60} color="#FFF" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.userName} numberOfLines={1}>{user?.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.userLabel}>Editar perfil</Text>
                        <Ionicons name="chevron-forward" size={14} color="#ccc" style={{ marginLeft: 4 }} />
                    </View>
                </View>
            </TouchableOpacity>
            
            <View style={styles.separator} />
        </View>

        {/* Itens do Menu */}
        <View style={styles.itemsContainer}>
            <DrawerItem 
                label="Página Inicial"
                icon={({color, size}) => <Ionicons name="home-outline" color="#FFF" size={22} />}
                labelStyle={styles.labelStyle}
                onPress={() => props.navigation.navigate('Dashboard')}
            />
            <DrawerItem 
                label="Configurações"
                icon={({color, size}) => <Ionicons name="settings-outline" color="#FFF" size={22} />}
                labelStyle={styles.labelStyle}
                onPress={() => props.navigation.navigate('Settings')}
            />
            <DrawerItem 
                label="Assistente IA"
                icon={({color, size}) => <Ionicons name="chatbubbles-outline" color="#FFF" size={22} />}
                labelStyle={styles.labelStyle}
                onPress={() => props.navigation.navigate('ChatScreen')}
            />
            <DrawerItem 
                label="Temas"
                icon={({color, size}) => <Ionicons name="color-palette-outline" color="#FFF" size={22} />}
                labelStyle={styles.labelStyle}
                onPress={() => props.navigation.navigate('Themes')}
            />
            <DrawerItem 
                label="Sobre a equipe"
                icon={({color, size}) => <Ionicons name="information-circle-outline" color="#FFF" size={22} />}
                labelStyle={styles.labelStyle}
                onPress={() => props.navigation.navigate('About')}
            />
            <DrawerItem 
                label="Ajuda"
                icon={({color, size}) => <Ionicons name="help-circle-outline" color="#FFF" size={22} />}
                labelStyle={styles.labelStyle}
                onPress={() => props.navigation.navigate('Help')}
            />
        </View>

      </DrawerContentScrollView>

      {/* Rodapé (Sair) */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={24} color="#FFF" />
            <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 50,
  },
  closeBtn: {
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    // Adicionando um feedback visual de área clicável (opcional)
    paddingVertical: 5,
  },
  avatarContainer: {
    marginRight: 15,
  },
  userName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userLabel: {
    color: '#ccc',
    fontSize: 14,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginTop: 10,
    marginBottom: 10
  },
  itemsContainer: {
    paddingHorizontal: 10,
  },
  labelStyle: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: -10 
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    marginBottom: 20
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 10,
    textDecorationLine: 'underline'
  }
});