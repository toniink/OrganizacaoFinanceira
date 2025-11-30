const express = require('express');
const routes = express.Router();
const upload = require('../config/upload'); // Middleware do Multer

// --- IMPORTAÇÃO DOS CONTROLLERS ---
const AuthController = require('../controllers/AuthController');
const UserController = require('../controllers/UserController');
const TransactionController = require('../controllers/TransactionController');
const CreditCardController = require('../controllers/CreditCardController');
const CategoryController = require('../controllers/CategoryController');
const AccountController = require('../controllers/AccountController');
const ReportController = require('../controllers/ReportController');
const ChatController = require('../controllers/ChatController');

// --- IMPORTAÇÃO DO MIDDLEWARE DE AUTENTICAÇÃO ---
const authMiddleware = require('../middlewares/auth');

// ==================================================
// 🔓 ROTAS PÚBLICAS (Não precisam de token)
// ==================================================

routes.post('/register', AuthController.register);
routes.post('/login', AuthController.login);

// ==================================================
// 🔒 ROTAS PROTEGIDAS (Precisam de token JWT)
// ==================================================

// Aplica o middleware em todas as rotas abaixo desta linha
routes.use(authMiddleware);

// --- PERFIL ---
routes.get('/profile/:id', UserController.show);
routes.put('/profile/:id', UserController.update);

// --- CATEGORIAS ---
routes.get('/categories/:userId', CategoryController.index);
routes.post('/categories', CategoryController.create);
routes.delete('/categories/:id', CategoryController.delete);

// --- CONTAS BANCÁRIAS ---
routes.get('/accounts/:userId', AccountController.index);
routes.post('/accounts', AccountController.create);
routes.put('/accounts/:id', AccountController.update);
routes.delete('/accounts/:id', AccountController.delete);

// --- CARTÕES DE CRÉDITO ---
routes.post('/cards', CreditCardController.create);
routes.get('/cards/:userId', CreditCardController.list);
routes.get('/cards/:cardId/invoice', CreditCardController.getInvoice);
routes.put('/cards/:id', CreditCardController.update);
routes.delete('/cards/:id', CreditCardController.delete);

// --- TRANSAÇÕES ---
routes.post('/transactions', upload.single('comprovante'), TransactionController.create);
routes.get('/dashboard/:userId', TransactionController.getDashboard);
routes.get('/transactions/:userId', TransactionController.index);
routes.put('/transactions/:id', TransactionController.update);
routes.delete('/transactions/:id', TransactionController.delete);

// --- RELATÓRIOS ---
routes.get('/reports/:userId', ReportController.getMonthlyReport);

// --- ASSISTENTE IA ---
routes.post('/chat', ChatController.processMessage);

module.exports = routes;