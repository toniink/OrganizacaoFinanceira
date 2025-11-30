const db = require('../config/database');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET || 'miaukey123';

module.exports = {
    // --- REGISTRO ---
    register(req, res) {
        const { name, email, password, monthly_income } = req.body;
        
        if (!monthly_income) {
            return res.status(400).json({ error: "Renda mensal é obrigatória." });
        }

        // Tenta inserir
        db.run(`INSERT INTO users (name, email, password, monthly_income) VALUES (?, ?, ?, ?)`, 
            [name, email, password, monthly_income], 
            function(err) {
                if (err) {
                    // Erro específico do SQLite para chave única duplicada
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(409).json({ error: "Este e-mail já está em uso. Tente fazer login." });
                    }
                    return res.status(400).json({ error: "Erro ao cadastrar usuário." });
                }
                
                const userId = this.lastID;

                // Cria carteira e categorias...
                db.run(`INSERT INTO accounts (user_id, name, balance, is_fixed) VALUES (?, ?, ?, ?)`, [userId, 'Carteira/Bolso', 0, 1]);
                
                const defaultCategories = [
                    { name: 'Alimentação', icon: 'fast-food', type: 'expense' },
                    { name: 'Transporte', icon: 'bus', type: 'expense' },
                    { name: 'Lazer', icon: 'game-controller', type: 'expense' },
                    { name: 'Mercado', icon: 'cart', type: 'expense' },
                    { name: 'Saúde', icon: 'medkit', type: 'expense' },
                    { name: 'Salário', icon: 'cash', type: 'income' }
                ];
                const stmt = db.prepare(`INSERT INTO categories (user_id, name, icon, type) VALUES (?, ?, ?, ?)`);
                defaultCategories.forEach(cat => stmt.run(userId, cat.name, cat.icon, cat.type));
                stmt.finalize();

                // NÃO LOGA AUTOMATICAMENTE. Retorna sucesso para o front redirecionar.
                return res.json({ message: "Cadastro realizado com sucesso!" });
            }
        );
    },

    // --- LOGIN ---
    login(req, res) {
        const { email, password } = req.body;

        // 1. Verifica se o email existe primeiro
        db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
            if (err) return res.status(500).json({ error: "Erro interno no servidor." });
            
            // Se não achou usuário com esse email
            if (!user) {
                return res.status(404).json({ error: "E-mail não encontrado. Faça seu cadastro." });
            }

            // 2. Se achou, verifica a senha (comparação simples para MVP)
            if (user.password !== password) {
                return res.status(401).json({ error: "Senha incorreta." });
            }

            // 3. Tudo certo, gera token
            const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '30d' });

            return res.json({ user, token });
        });
    }
};