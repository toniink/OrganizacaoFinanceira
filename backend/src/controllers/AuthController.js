const db = require('../config/database');

module.exports = {
    register(req, res) {
        const { name, email, password, monthly_income } = req.body;
        
        console.log('Tentativa de cadastro recebida:', { name, email, monthly_income }); // LOG PARA DEBUG

        // Validação: Verifica se monthly_income é indefinido (aceita 0, mas rejeita null/undefined)
        if (monthly_income === undefined || monthly_income === null || monthly_income === '') {
            console.log('Erro: Renda mensal ausente no corpo da requisição');
            return res.status(400).json({ error: "Renda mensal é obrigatória e deve ser um número." });
        }

        db.run(`INSERT INTO users (name, email, password, monthly_income) VALUES (?, ?, ?, ?)`, 
            [name, email, password, monthly_income], 
            function(err) {
                if (err) {
                    console.error('Erro no Banco de Dados:', err.message); // Mostra o erro real no terminal
                    
                    // Verifica se o erro é de e-mail duplicado (Constraint UNIQUE)
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: "Este e-mail já está cadastrado." });
                    }
                    
                    return res.status(400).json({ error: "Erro ao salvar no banco de dados: " + err.message });
                }
                
                const userId = this.lastID;
                console.log(`Usuário criado com ID: ${userId}`);

                // 1. Cria Carteira Fixa
                db.run(`INSERT INTO accounts (user_id, name, balance, is_fixed) VALUES (?, ?, ?, ?)`,
                    [userId, 'Carteira/Bolso', 0, 1]);

                // 2. Popula Categorias Padrão
                const defaultCategories = [
                    { name: 'Alimentação', icon: 'fast-food', type: 'expense' },
                    { name: 'Transporte', icon: 'bus', type: 'expense' },
                    { name: 'Lazer', icon: 'game-controller', type: 'expense' },
                    { name: 'Mercado', icon: 'cart', type: 'expense' },
                    { name: 'Saúde', icon: 'medkit', type: 'expense' },
                    { name: 'Salário', icon: 'cash', type: 'income' },
                    { name: 'Extra', icon: 'add-circle', type: 'income' }
                ];

                const stmt = db.prepare(`INSERT INTO categories (user_id, name, icon, type) VALUES (?, ?, ?, ?)`);
                defaultCategories.forEach(cat => {
                    stmt.run(userId, cat.name, cat.icon, cat.type);
                });
                stmt.finalize();

                return res.json({ id: userId, message: "Usuário criado com sucesso!" });
            }
        );
    },

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
                return res.json({ user });
            }
        );
    }
};