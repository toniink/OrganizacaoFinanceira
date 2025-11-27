const express = require('express');
const routes = express.Router();
const upload = require('../config/upload'); // Middleware do Multer para uploads de imagem

// --- IMPORTAÇÃO DOS CONTROLLERS ---
const AuthController = require('../controllers/AuthController');
const TransactionController = require('../controllers/TransactionController');
const CreditCardController = require('../controllers/CreditCardController');
const CategoryController = require('../controllers/CategoryController');
const AccountController = require('../controllers/AccountController');
const ReportController = require('../controllers/ReportController'); // Controlador de Relatórios
const ChatController = require('../controllers/ChatController');

// --- ROTAS DE AUTENTICAÇÃO ---
routes.post('/register', AuthController.register);
routes.post('/login', AuthController.login);

// --- ROTAS DE CATEGORIAS ---
routes.get('/categories/:userId', CategoryController.index);
routes.post('/categories', CategoryController.create);
routes.delete('/categories/:id', CategoryController.delete);

// --- ROTAS DE CONTAS BANCÁRIAS (Carteira/Bancos) ---
routes.get('/accounts/:userId', AccountController.index); // Listar contas
routes.post('/accounts', AccountController.create);       // Criar conta
routes.put('/accounts/:id', AccountController.update);    // Editar conta (saldo/nome)
routes.delete('/accounts/:id', AccountController.delete); // Deletar conta

// --- ROTAS DE CARTÕES DE CRÉDITO ---
routes.post('/cards', CreditCardController.create);       // Criar cartão
routes.get('/cards/:userId', CreditCardController.list);  // Listar com totais da fatura
routes.get('/cards/:cardId/invoice', CreditCardController.getInvoice); // Detalhes da fatura
routes.put('/cards/:id', CreditCardController.update);    // Editar cartão
routes.delete('/cards/:id', CreditCardController.delete); // Deletar cartão

// --- ROTAS DE TRANSAÇÕES (Lançamentos) ---
// 1. Criar (POST) - com upload opcional
routes.post('/transactions', upload.single('comprovante'), TransactionController.create);

// 2. Dashboard (GET) - dados do gatinho e saldo total
routes.get('/dashboard/:userId', TransactionController.getDashboard);

// 3. Listagem/Extrato (GET) - com paginação e filtros
routes.get('/transactions/:userId', TransactionController.index);

// 4. Atualizar (PUT)
routes.put('/transactions/:id', TransactionController.update);

// 5. Deletar (DELETE)
routes.delete('/transactions/:id', TransactionController.delete);

// --- ROTA DE RELATÓRIOS (NOVO) ---
// Retorna o resumo consolidado do mês e gastos por categoria
routes.get('/reports/:userId', ReportController.getMonthlyReport);

// --- ROTA DO CHATBOT ---
routes.post('/chat', ChatController.processMessage);

module.exports = routes;