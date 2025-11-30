import React from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  Platform, 
  RefreshControl, 
  KeyboardAvoidingView, 
  TouchableWithoutFeedback, 
  Keyboard 
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ScreenWrapper({ 
  children, 
  scroll = true, 
  refreshing = false, 
  onRefresh = null,
  style,
  contentContainerStyle 
}) {
  const { colors, sizing } = useTheme();

  // Estilo do Container Principal
  const containerStyle = [
    styles.container, 
    { backgroundColor: colors.background },
    // Fix para Web Desktop ocupar a tela toda
    Platform.OS === 'web' ? { height: '100vh', overflow: 'hidden' } : { flex: 1 },
    style
  ];

  // Configuração do Comportamento do Teclado
  const keyboardBehavior = Platform.OS === 'ios' ? 'padding' : 'height';

  // Conteúdo Interno (Com ou Sem Scroll)
  const renderContent = () => {
    if (!scroll) {
      return (
        <View style={[{ flex: 1, padding: sizing.padding }, contentContainerStyle]}>
          {children}
        </View>
      );
    }

    return (
      <ScrollView
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={[
            styles.scrollContent, 
            { padding: sizing.padding, paddingBottom: 100 }, 
            contentContainerStyle
        ]}
        showsVerticalScrollIndicator={true}
        refreshControl={
          onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : null
        }
        nestedScrollEnabled={true}
        {...(Platform.OS === 'web' ? { scrollEventThrottle: 16 } : {})}
      >
        {children}
      </ScrollView>
    );
  };

  return (
    <View style={containerStyle}>
      {/* KeyboardAvoidingView empurra o conteúdo para cima quando o teclado abre */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={keyboardBehavior}
        // keyboardVerticalOffset pode precisar de ajuste se você tiver Headers muito altos
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* TouchableWithoutFeedback fecha o teclado ao clicar fora (opcional, mas bom para UX) */}
        {Platform.OS !== 'web' ? (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ flex: 1 }}>
                    {renderContent()}
                </View>
            </TouchableWithoutFeedback>
        ) : (
            renderContent()
        )}
      </KeyboardAvoidingView>
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