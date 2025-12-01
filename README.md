# 🐱 Gastto (MVP)
Aplicativo de Controle Financeiro com Gamificação
---
## 📄 Descrição do Projeto

Este projeto consiste no desenvolvimento de um aplicativo mobile de organização financeira, voltado para estudantes universitários e trabalhadores com renda limitada que desejam melhor controle sobre suas finanças pessoais de forma leve e intuitiva.

A implementação foi baseada na estrutura, fluxo de telas e lógica definidos na prototipagem do Figma. O diferencial da aplicação é o feedback visual e emocional: um "bichinho virtual" (Gato, Cachorro ou Pato) reage ao saldo do usuário. Se o saldo está positivo, o pet fica feliz; se o orçamento aperta, ele fica preocupado ou triste.

---
## 🚀 Funcionalidades Principais

O núcleo do MVP contempla:

### 1. 🔐 Autenticação e Segurança

- Cadastro e Login: Acesso seguro via e-mail e senha.

- JWT (JSON Web Token): Controle de sessão do usuário.

- Criptografia: Senhas salvas no banco com hash (bcrypt).

- Persistência: O usuário permanece logado ao fechar o app (uso de AsyncStorage).

### 2. 💳 Gestão de Contas e Cartões

- Contas (Estoque): Cadastro de saldo em contas bancárias ou dinheiro físico.

- Cartões de Crédito (Fluxo): Controle inteligente de faturas. O sistema identifica automaticamente se uma compra entra na fatura Aberta ou Fechada com base no dia de vencimento.

### 3. 💸 Lançamentos Financeiros

- Registro de Receitas e Despesas.

- Categorização (Alimentação, Transporte, Lazer, etc.) com ícones.

- Anexo de comprovantes (imagens).

- Chatbot com IA: Inserção rápida de gastos via conversa natural (ex: "Comprei um café de 10 reais no pix"), processado pela API Groq AI (Llama 3).

### 4. 📈 Dashboard e Visualização

- Cálculo Automático: O saldo atual é atualizado em tempo real conforme lançamentos são criados ou excluídos.

- Feedback Emocional: O avatar do app reage à porcentagem da renda consumida.

- Gráficos: Gráfico de rosca (Donut Chart) detalhando a distribuição dos gastos por categoria.

- Extrato: Listagem cronológica com filtros por mês e categoria.
---
## 🛠 Tecnologias Utilizadas

### Frontend (Mobile)

- Framework: React Native com Expo (Managed Workflow).

- Linguagem: JavaScript (ES6+).

- Navegação: React Navigation (Stack & Drawer).

- HTTP Client: Axios.

- Gráficos: react-native-gifted-charts.

- Armazenamento Local: AsyncStorage.

- Design: Componentização customizada e ícones Ionicons.
 
### Backend (API)

- Runtime: Node.js.

- Framework: Express.

- Banco de Dados: SQLite (Arquivo local financeiro.db).

- IA: Integração com Groq SDK (LLM Llama 3) para processamento de linguagem natural.

- Segurança: bcryptjs (hash de senha) e jsonwebtoken (autenticação).

- Uploads: multer (gerenciamento de imagens/comprovantes).
---
### 📂 Arquitetura do Projeto
```
/  
├── backend/  
│   ├── src/  
│   │   ├── config/         # Configuração do SQLite  
│   │   ├── controllers/    # Lógica (Auth, Transaction, Chat, Report...)  
│   │   ├── middlewares/    # Autenticação JWT  
│   │   ├── routes/         # Definição das rotas da API  
│   │   └── server.js       # Entry point do servidor  
│   ├── uploads/            # Armazenamento de comprovantes  
│   ├── .env                # Chaves de API (Groq, JWT)  
│   └── financeiro.db       # Banco de dados  
│  
├── frontend/  
│   ├── src/  
│   │   ├── components/     # Componentes UI (ScreenWrapper, InfoCard, ListItem...)  
│   │   ├── constants/      # Cores, Temas e Configurações estáticas  
│   │   ├── context/        # Context API (Auth, Theme)  
│   │   ├── screens/        # Telas (Dashboard, Login, Transaction...)  
│   │   ├── services/       # Configuração do Axios (api.js)  
│   │   └── styles/         # Estilos globais  
│   └── App.js              # Entry point do Expo  
```
---
## ⚡ Como Rodar o Projeto

### Pré-requisitos

- Node.js instalado.

- Dispositivo físico (Android/iOS) com o app Expo Go instalado OU Emulador.

### 1. Configurando o Backend
```
cd backend
npm install
# Crie um arquivo .env na raiz do backend com:
# JWT_SECRET=sua_senha_secreta
# GROQ_API_KEY=sua_chave_da_groq
node src/server.js
```

O servidor rodará na porta 3333.

### 2. Configurando o Frontend

1. Descubra o IP da sua máquina (No Windows: ipconfig, procure por IPv4).

2. Abra o arquivo frontend/src/services/api.js.

3. Atualize a constante API_URL com o seu IP:

`const API_URL = '[http://192.168.](http://192.168.)X.X:3333';`


4. Inicie o projeto:
```
cd frontend
npm install
npx expo start -c
```
5. Escaneie o QR Code com o app Expo Go.

---

## ✅ Status do Desenvolvimento
- [x] Autenticação: Login e Registro funcionais com JWT.

- [x] Dashboard: Feedback visual do Pet e Resumo financeiro.

- [x] Lançamentos: CRUD completo de receitas e despesas.

- [x] Bancos e Cartões: Lógica de saldo e faturas implementada.

- [x] Relatórios: Extrato detalhado e Gráficos de categorias.

- [x] IA: Chatbot para inserção rápida implementado.

- [x] Temas: Sistema de troca de skins (Gato, Cachorro, Pato).

- [ ] Exportação: Gerar PDF/Excel (Planejado para v2).
---
## 👥 Integrantes
- Antonio Tavares: Designer, Desenvolvedor Fullstack, QA, Documentação.  
- Marcele Rodrigues: Designer, Documentação, QA.  

Projeto desenvolvido para a disciplina de Programação para Dispositivos Móveis.  
