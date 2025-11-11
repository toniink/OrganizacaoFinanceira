import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

// Um componente de placeholder simples
const CadastroScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.title}>Tela de Cadastro</Text>
        <Text onPress={() => navigation.goBack()}>Voltar para Login</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default CadastroScreen;