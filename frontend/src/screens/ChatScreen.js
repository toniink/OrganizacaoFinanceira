import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, TextInput, FlatList, 
  TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../constants/theme';
import api from '../services/api';

export default function ChatScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  
  const [messages, setMessages] = useState([
    { id: 1, text: 'Olá! Sou seu assistente financeiro. Me diga o que você gastou ou ganhou.', sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  
  const flatListRef = useRef();

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg = { id: Date.now(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      // Chama o Backend
      const response = await api.post('/chat', {
        user_id: user.id,
        message: userMsg.text
      });

      const botMsg = { 
        id: Date.now() + 1, 
        text: response.data.reply, 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      const errorMsg = { id: Date.now() + 1, text: 'Erro de conexão com o cérebro do robô.', sender: 'bot' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[
        styles.bubble, 
        isUser ? { alignSelf: 'flex-end', backgroundColor: COLORS.primary } 
               : { alignSelf: 'flex-start', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }
      ]}>
        <Text style={[styles.text, isUser ? { color: '#FFF' } : { color: colors.text }]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Assistente IA 🤖</Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 20, paddingBottom: 20 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {loading && (
        <View style={{ padding: 10, alignItems: 'center' }}>
            <Text style={{ color: colors.subText, fontSize: 12 }}>O gatinho está pensando...</Text>
            <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      )}

      <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
          placeholder="Ex: Almoço 30 reais no pix"
          placeholderTextColor={colors.subText}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={[styles.sendButton, { backgroundColor: COLORS.primary }]} onPress={sendMessage}>
          <Ionicons name="send" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 18, fontWeight: 'bold' },
  bubble: { padding: 12, borderRadius: 16, marginBottom: 10, maxWidth: '80%' },
  text: { fontSize: 16 },
  inputContainer: { flexDirection: 'row', padding: 10, alignItems: 'center', borderTopWidth: 1 },
  input: { flex: 1, height: 45, borderRadius: 22, paddingHorizontal: 15, fontSize: 16 },
  sendButton: { width: 45, height: 45, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginLeft: 10 }
});