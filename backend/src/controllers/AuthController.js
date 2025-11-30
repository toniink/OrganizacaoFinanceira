const db = require('../config/database');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Garante que lê o arquivo .env

// Usa a chave do .env ou uma chave padrão para desenvolvimento
const SECRET = process.env.JWT_SECRET || 'miau_financeiro_secret_key_123';

module.exports = {
    // --- REGISTRO DE USUÁRIO ---
    register(req, res) {
        const { name, email, password, monthly_income } = req.body;
        
        console.log('Tentativa de cadastro:', { name, email, monthly_income });

        // Validação básica
        if (monthly_income === undefined || monthly_income === null || monthly_income === '') {
            return res.status(400).json({ error: "Renda mensal é obrigatória." });
        }

        // 1. Inserir Usuário
        db.run(`INSERT INTO users (name, email, password, monthly_income) VALUES (?, ?, ?, ?)`, 
            [name, email, password, monthly_income], 
            function(err) {
                if (err) {
                    console.error('Erro no Banco:', err.message);
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: "Este e-mail já está cadastrado." });
                    }
                    return res.status(400).json({ error: "Erro ao cadastrar usuário." });
                }
                
                const userId = this.lastID;

                // 2. Criar Carteira Fixa (Obrigatório)
                db.run(`INSERT INTO accounts (user_id, name, balance, is_fixed) VALUES (?, ?, ?, ?)`,
                    [userId, 'Carteira/Bolso', 0, 1],
                    (err) => {
                        if (err) console.error("Erro ao criar carteira:", err.message);
                    }
                );

                // 3. Popular Categorias Padrão
                const defaultCategories = [
                    { name: 'Alimentação', icon: 'fast-food', type: 'expense' },
                    { name: 'Transporte', icon: 'bus', type: 'expense' },
                    { name: 'Lazer', icon: 'game-controller', type: 'expense' },
                    { name: 'Mercado', icon: 'cart', type: 'expense' },
                    { name: 'Saúde', icon: 'medkit', type: 'expense' },
                    { name: 'Educação', icon: 'school', type: 'expense' },
                    { name: 'Salário', icon: 'cash', type: 'income' },
                    { name: 'Extra', icon: 'add-circle', type: 'income' }
                ];

                const stmt = db.prepare(`INSERT INTO categories (user_id, name, icon, type) VALUES (?, ?, ?, ?)`);
                defaultCategories.forEach(cat => {
                    stmt.run(userId, cat.name, cat.icon, cat.type);
                });
                stmt.finalize();

                // 4. GERAR TOKEN JWT (Para login automático após cadastro)
                const token = jwt.sign({ id: userId }, SECRET, { expiresIn: '30d' });

                console.log(`Usuário ${userId} criado e logado com sucesso.`);

                return res.json({ 
                    id: userId, 
                    token, 
                    user: { id: userId, name, email, monthly_income },
                    message: "Usuário criado com sucesso!" 
                });
            }
        );
    },

    // --- LOGIN ---
    login(req, res) {
        const { email, password } = req.body;
        console.log('Tentativa de login:', email);

        db.get(`SELECT id, name, email, monthly_income FROM users WHERE email = ? AND password = ?`, 
            [email, password], 
            (err, user) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: "Erro interno no servidor" });
                }
                if (!user) {
                    return res.status(401).json({ error: "E-mail ou senha incorretos" });
                }

                // 1. GERAR TOKEN JWT
                const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '30d' });

                // 2. Retornar Usuário e Token
                return res.json({ user, token });
            }
        );
    }
};