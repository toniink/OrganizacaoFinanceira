const express = require('express');
const routes = express.Router();
const upload = require('../config/upload'); // Middleware do Multer para uploads

// --- IMPORTAÇÃO DOS CONTROLLERS ---
const AuthController = require('../controllers/AuthController');
const UserController = require('../controllers/UserController'); // Perfil
const TransactionController = require('../controllers/TransactionController');
const CreditCardController = require('../controllers/CreditCardController');
const CategoryController = require('../controllers/CategoryController');
const AccountController = require('../controllers/AccountController');
const ReportController = require('../controllers/ReportController'); // Relatórios
const ChatController = require('../controllers/ChatController'); // IA

// --- 1. AUTENTICAÇÃO ---
routes.post('/register', AuthController.register);
routes.post('/login', AuthController.login);

// --- 2. PERFIL DO USUÁRIO ---
routes.get('/profile/:id', UserController.show);   // Buscar dados para edição
routes.put('/profile/:id', UserController.update); // Atualizar nome/senha/renda

// --- 3. CATEGORIAS ---
routes.get('/categories/:userId', CategoryController.index);
routes.post('/categories', CategoryController.create);
routes.delete('/categories/:id', CategoryController.delete);

// --- 4. CONTAS BANCÁRIAS (Carteira/Bancos) ---
routes.get('/accounts/:userId', AccountController.index); // Listar contas
routes.post('/accounts', AccountController.create);       // Criar conta
routes.put('/accounts/:id', AccountController.update);    // Editar conta (saldo/nome)
routes.delete('/accounts/:id', AccountController.delete); // Deletar conta

// --- 5. CARTÕES DE CRÉDITO ---
routes.post('/cards', CreditCardController.create);       // Criar cartão
routes.get('/cards/:userId', CreditCardController.list);  // Listar com totais da fatura
routes.get('/cards/:cardId/invoice', CreditCardController.getInvoice); // Detalhes da fatura
routes.put('/cards/:id', CreditCardController.update);    // Editar cartão
routes.delete('/cards/:id', CreditCardController.delete); // Deletar cartão

// --- 6. TRANSAÇÕES (Lançamentos) ---
// Criar (POST) - com upload opcional de comprovante
routes.post('/transactions', upload.single('comprovante'), TransactionController.create);

// Dashboard (GET) - dados do gatinho, saldo total e resumo gráfico
routes.get('/dashboard/:userId', TransactionController.getDashboard);

// Listagem/Extrato (GET) - com paginação e filtros
routes.get('/transactions/:userId', TransactionController.index);

// Atualizar (PUT)
routes.put('/transactions/:id', TransactionController.update);

// Deletar (DELETE)
routes.delete('/transactions/:id', TransactionController.delete);

// --- 7. RELATÓRIOS ---
routes.get('/reports/:userId', ReportController.getMonthlyReport);

// --- 8. ASSISTENTE IA (CHATBOT) ---
routes.post('/chat', ChatController.processMessage);

module.exports = routes;