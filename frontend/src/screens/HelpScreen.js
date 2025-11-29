import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  TextInput, LayoutAnimation, Platform, UIManager, Linking 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { COLORS, SIZING } from '../constants/theme';

// Ativa animações de layout no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Dados Fictícios do FAQ
const FAQ_DATA = [
  { id: 1, category: 'Geral', question: 'O app é gratuito?', answer: 'Sim, o Organizanceiros é gratuito para uso pessoal com as funcionalidades essenciais.' },
  { id: 2, category: 'Lançamentos', question: 'Como faço lançamentos?', answer: 'Vá até a tela inicial e clique no botão "+" azul no canto inferior direito. Escolha "Nova Transação".' },
  { id: 3, category: 'Lançamentos', question: 'Posso editar um lançamento?', answer: 'Sim! Na tela de Extrato, toque sobre qualquer lançamento para abrir a edição.' },
  { id: 4, category: 'Temas', question: 'Como uso os temas?', answer: 'No menu lateral, vá em "Temas". Lá você poderá desbloquear novas cores conforme usa o app.' },
  { id: 5, category: 'Contas', question: 'Como adicionar um banco?', answer: 'No Dashboard, na seção de Contas, clique em "Adicionar Banco" para registrar uma nova conta ou carteira.' },
  { id: 6, category: 'Segurança', question: 'Meus dados estão seguros?', answer: 'Seus dados são salvos localmente no seu dispositivo e sincronizados apenas com seu login seguro.' },
];

const FILTERS = ['Geral', 'Lançamentos', 'Temas', 'Contas', 'Segurança'];

export default function HelpScreen({ navigation }) {
  const { colors } = useTheme();
  
  // Estados de Controle
  const [activeTab, setActiveTab] = useState('faq'); // 'faq' ou 'contact'
  const [activeFilter, setActiveFilter] = useState('Geral');
  const [searchText, setSearchText] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Função de Pesquisa Inteligente (Remove acentos e case sensitive)
  const normalizeText = (text) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  // Filtragem dos dados
  const filteredFaq = FAQ_DATA.filter(item => {
    // 1. Filtra por Categoria (se não estiver pesquisando)
    const matchesCategory = searchText ? true : item.category === activeFilter;
    
    // 2. Filtra por Texto (se houver pesquisa)
    const normalizedSearch = normalizeText(searchText);
    const normalizedQuestion = normalizeText(item.question);
    const normalizedAnswer = normalizeText(item.answer);
    
    const matchesSearch = normalizedQuestion.includes(normalizedSearch) || normalizedAnswer.includes(normalizedSearch);

    return matchesCategory && matchesSearch;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ padding: 5 }}>
            <Ionicons name="menu" size={30} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{activeTab === 'faq' ? 'Ajuda' : 'Contate-nos'}</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Abas Superiores */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'faq' && styles.activeTabBorder]} 
            onPress={() => setActiveTab('faq')}
        >
            <Text style={[styles.tabText, { color: activeTab === 'faq' ? COLORS.primary : colors.subText }]}>FAQ</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'contact' && styles.activeTabBorder]} 
            onPress={() => setActiveTab('contact')}
        >
            <Text style={[styles.tabText, { color: activeTab === 'contact' ? COLORS.primary : colors.subText }]}>Contate-nos</Text>
        </TouchableOpacity>
      </View>

      {/* CONTEÚDO DA ABA FAQ */}
      {activeTab === 'faq' ? (
        <View style={{ flex: 1 }}>
            {/* Filtros de Categoria */}
            {!searchText && (
                <View style={{ height: 50 }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                        {FILTERS.map((filter) => (
                            <TouchableOpacity 
                                key={filter} 
                                style={[
                                    styles.filterChip, 
                                    activeFilter === filter ? { backgroundColor: '#2a3b96', borderColor: '#2a3b96' } : { borderColor: colors.border }
                                ]}
                                onPress={() => setActiveFilter(filter)}
                            >
                                <Text style={[styles.filterText, { color: activeFilter === filter ? '#FFF' : colors.text }]}>
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Barra de Pesquisa */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
                    <Ionicons name="search" size={20} color={colors.subText} />
                    <TextInput 
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Digite sua dúvida..."
                        placeholderTextColor={colors.subText}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <Ionicons name="close-circle" size={18} color={colors.subText} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Lista de Perguntas (Accordion) */}
            <ScrollView contentContainerStyle={styles.content}>
                {filteredFaq.length === 0 ? (
                    <Text style={{ textAlign: 'center', color: colors.subText, marginTop: 20 }}>Nenhuma dúvida encontrada.</Text>
                ) : (
                    filteredFaq.map((item) => (
                        <View key={item.id} style={[styles.accordionItem, { backgroundColor: colors.card }]}>
                            <TouchableOpacity 
                                style={styles.accordionHeader} 
                                onPress={() => toggleExpand(item.id)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.questionText, { color: colors.text }]}>{item.question}</Text>
                                <Ionicons 
                                    name={expandedId === item.id ? "chevron-up" : "chevron-down"} 
                                    size={20} 
                                    color={colors.text} 
                                />
                            </TouchableOpacity>
                            
                            {expandedId === item.id && (
                                <View style={styles.accordionBody}>
                                    <Text style={[styles.answerText, { color: colors.subText }]}>{item.answer}</Text>
                                </View>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
      ) : (
        /* CONTEÚDO DA ABA CONTATE-NOS */
        <ScrollView contentContainerStyle={styles.content}>
            <View style={[styles.contactCard, { backgroundColor: colors.card }]}>
                <View style={styles.contactRow}>
                    <View style={[styles.iconCircle, { backgroundColor: '#2a3b96' }]}>
                        <Ionicons name="mail" size={20} color="#FFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.contactLabel, { color: colors.subText }]}>E-mail:</Text>
                        <Text style={[styles.contactValue, { color: colors.text }]} selectable>organizanceiros@gmail.com</Text>
                    </View>
                </View>
            </View>

            <View style={[styles.contactCard, { backgroundColor: colors.card }]}>
                <TouchableOpacity 
                    style={styles.contactRow}
                    onPress={() => Linking.openURL('https://github.com/SeuUsuario/SeuRepo')} // Link Placeholder
                >
                    <View style={[styles.iconCircle, { backgroundColor: '#2a3b96' }]}>
                        <Ionicons name="logo-github" size={20} color="#FFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.contactLabel, { color: colors.subText }]}>Github:</Text>
                        <Text style={[styles.contactValue, { color: colors.text }]}>github.com/organizanceiros</Text>
                    </View>
                    <Ionicons name="open-outline" size={20} color={colors.subText} />
                </TouchableOpacity>
            </View>

            <View style={[styles.contactCard, { backgroundColor: colors.card }]}>
                <TouchableOpacity 
                    style={styles.contactRow}
                    onPress={() => Linking.openURL('https://google.com')} // Link Placeholder
                >
                    <View style={[styles.iconCircle, { backgroundColor: '#2a3b96' }]}>
                        <Ionicons name="globe-outline" size={20} color="#FFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.contactLabel, { color: colors.subText }]}>Website:</Text>
                        <Text style={[styles.contactValue, { color: colors.text }]}>www.organizanceiros.com.br</Text>
                    </View>
                    <Ionicons name="open-outline" size={20} color={colors.subText} />
                </TouchableOpacity>
            </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  title: { fontSize: 20, fontWeight: 'bold' },
  
  // Abas
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabBorder: {
    borderBottomColor: '#2a3b96', // Cor azul da imagem
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Filtros
  filterScroll: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Pesquisa
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },

  // Conteúdo e Cards
  content: {
    padding: 20,
    paddingBottom: 50,
  },
  
  // Accordion FAQ
  accordionItem: {
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    // Sombra leve
    ...Platform.select({
        ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: {width:0, height:2} },
        android: { elevation: 2 },
        web: { boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }
    })
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.02)' // Fundo cinza bem claro
  },
  questionText: {
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  accordionBody: {
    padding: 15,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)'
  },
  answerText: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Cards Contate-nos
  contactCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    ...Platform.select({
        ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: {width:0, height:2} },
        android: { elevation: 2 },
        web: { boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }
    })
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: 'bold',
  }
});