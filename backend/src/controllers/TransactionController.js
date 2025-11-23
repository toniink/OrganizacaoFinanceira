const db = require('../config/database');

module.exports = {
    // 1. Criar Lançamento
    create(req, res) {
        const { user_id, category_id, description, amount, type, date, origin_type, origin_id, is_fixed } = req.body;
        const attachment_path = req.file ? req.file.path : null;
        const finalDate = date || new Date().toISOString().split('T')[0];

        const query = `
            INSERT INTO transactions 
            (user_id, category_id, description, amount, type, date, origin_type, origin_id, is_fixed, attachment_path) 
            VALUES (?,?,?,?,?,?,?,?,?,?)
        `;

        db.run(query,
            [user_id, category_id, description, amount, type, finalDate, origin_type, origin_id, is_fixed, attachment_path],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                return res.json({ id: this.lastID, message: "Lançamento criado!" });
            }
        );
    },

    // 2. Dashboard
    getDashboard(req, res) {
        const { userId } = req.params;
        const { month, year } = req.query; 

        if(!month || !year) return res.status(400).json({error: "Dados incompletos"});

        db.get(`SELECT monthly_income FROM users WHERE id = ?`, [userId], (err, user) => {
            if (err || !user) return res.status(404).json({ error: "Usuário não encontrado" });

            const fixedIncome = user.monthly_income || 1;
            const dateFilter = `${year}-${month.toString().padStart(2, '0')}-%`;
            
            const query = `
                SELECT 
                    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
                    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
                FROM transactions 
                WHERE user_id = ? AND date LIKE ?
            `;

            db.get(query, [userId, dateFilter], (err, row) => {
                if (err) return res.status(500).json({ error: err.message });

                const transactionalIncome = row.total_income || 0;
                const totalExpense = row.total_expense || 0;
                let percentage = (totalExpense / fixedIncome) * 100;

                let catStatus = 'happy';
                if (percentage >= 30 && percentage < 60) catStatus = 'worried';
                if (percentage >= 60) catStatus = 'sad';

                return res.json({
                    fixedIncome,
                    income: transactionalIncome,
                    expense: totalExpense,
                    balance: transactionalIncome - totalExpense,
                    percentageConsumed: percentage.toFixed(1),
                    catStatus
                });
            });
        });
    },

    // 3. Listagem (Atualizada com IDs para edição)
    index(req, res) {
        const { userId } = req.params;
        const { month, year } = req.query;

        if (!month || !year) return res.status(400).json({ error: "Mês e Ano são obrigatórios" });

        const dateFilter = `${year}-${month.toString().padStart(2, '0')}-%`;

        const query = `
            SELECT 
                t.id, t.description, t.amount, t.type, t.date, t.is_fixed,
                t.category_id, t.origin_id, -- IMPORTANTE: IDs necessários para o formulário de edição
                c.name as category_name,
                a.name as account_name
            FROM transactions t
            LEFT JOIN categories c ON t.category_id = c.id
            LEFT JOIN accounts a ON t.origin_id = a.id
            WHERE t.user_id = ? AND t.date LIKE ?
            ORDER BY t.date DESC
        `;

        db.all(query, [userId, dateFilter], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            return res.json(rows);
        });
    },

    // 4. Atualizar (Novo)
    update(req, res) {
        const { id } = req.params;
        // Nota: Anexo ignorado na edição para simplificar este MVP
        const { description, amount, type, date, category_id, origin_id, is_fixed } = req.body;
        
        const query = `
            UPDATE transactions 
            SET description = ?, amount = ?, type = ?, date = ?, category_id = ?, origin_id = ?, is_fixed = ?
            WHERE id = ?
        `;

        db.run(query, 
            [description, amount, type, date, category_id, origin_id, is_fixed, id], 
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                return res.json({ message: "Lançamento atualizado!" });
            }
        );
    },

    // 5. Deletar (Novo)
    delete(req, res) {
        const { id } = req.params;
        db.run(`DELETE FROM transactions WHERE id = ?`, [id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            return res.status(204).send();
        });
    }
};