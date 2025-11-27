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

    // 2. Dashboard (LÓGICA DO GATINHO ATUALIZADA)
     getDashboard(req, res) {
        const { userId } = req.params;
        const { month, year } = req.query; 

        if(!month || !year) return res.status(400).json({error: "Dados incompletos"});

        // 1. Saldo Total
        db.get(`SELECT SUM(balance) as total_balance FROM accounts WHERE user_id = ?`, [userId], (err, accRow) => {
            if (err) return res.status(500).json({ error: "Erro saldo" });
            const currentTotalMoney = accRow.total_balance || 0;

            const dateFilter = `${year}-${month.toString().padStart(2, '0')}-%`;

            // 2. Totais Gerais
            const queryTotals = `
                SELECT 
                    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
                    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
                FROM transactions WHERE user_id = ? AND date LIKE ?
            `;

            db.get(queryTotals, [userId, dateFilter], (err, row) => {
                if (err) return res.status(500).json({ error: err.message });
                const transactionalIncome = row.total_income || 0;
                const totalExpense = row.total_expense || 0;
                
                // 3. Gastos por Categoria (PARA O GRÁFICO)
                const queryCategories = `
                    SELECT c.id, c.name, c.icon, SUM(t.amount) as total
                    FROM transactions t
                    JOIN categories c ON t.category_id = c.id
                    WHERE t.user_id = ? AND t.date LIKE ? AND t.type = 'expense'
                    GROUP BY c.id
                    ORDER BY total DESC
                `;

                db.all(queryCategories, [userId, dateFilter], (err, categoryRows) => {
                    if (err) return res.status(500).json({ error: err.message });

                    // Cálculo do Gatinho
                    let percentage = 0;
                    if (currentTotalMoney > 0) percentage = (totalExpense / currentTotalMoney) * 100;
                    else if (totalExpense > 0) percentage = 100;

                    let catStatus = 'happy';
                    if (percentage >= 30 && percentage < 60) catStatus = 'worried';
                    if (percentage >= 60) catStatus = 'sad';

                    return res.json({
                        totalMoney: currentTotalMoney,
                        income: transactionalIncome,
                        expense: totalExpense,
                        balance: currentTotalMoney,
                        percentageConsumed: percentage.toFixed(1),
                        catStatus,
                        categoryExpenses: categoryRows // ARRAY PARA O GRÁFICO
                    });
                });
            });
        });
    },

    // 3. Listagem (ATUALIZADO COM FILTRO DE CATEGORIA)
    index(req, res) {
        const { userId } = req.params;
        const { month, year, page, limit, category_id } = req.query; // Novo param category_id

        if (!month || !year) return res.status(400).json({ error: "Mês/Ano obrigatórios" });

        const dateFilter = `${year}-${month.toString().padStart(2, '0')}-%`;

        let query = `
            SELECT 
                t.id, t.description, t.amount, t.type, t.date, t.is_fixed,
                t.category_id, t.origin_id,
                c.name as category_name,
                a.name as account_name
            FROM transactions t
            LEFT JOIN categories c ON t.category_id = c.id
            LEFT JOIN accounts a ON t.origin_id = a.id
            WHERE t.user_id = ? AND t.date LIKE ?
        `;

        const params = [userId, dateFilter];

        // Filtro Opcional por Categoria
        if (category_id) {
            query += ` AND t.category_id = ?`;
            params.push(category_id);
        }

        query += ` ORDER BY t.date DESC`;

        if (page && limit) {
            const limitVal = parseInt(limit);
            const offsetVal = (parseInt(page) - 1) * limitVal;
            query += ` LIMIT ? OFFSET ?`;
            params.push(limitVal, offsetVal);
        }

        db.all(query, params, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            return res.json(rows);
        });
    },

    // 4. Atualizar
    update(req, res) {
        const { id } = req.params;
        const { description, amount, type, date, category_id, origin_id, is_fixed } = req.body;
        const query = `UPDATE transactions SET description = ?, amount = ?, type = ?, date = ?, category_id = ?, origin_id = ?, is_fixed = ? WHERE id = ?`;
        db.run(query, [description, amount, type, date, category_id, origin_id, is_fixed, id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            return res.json({ message: "Lançamento atualizado!" });
        });
    },

    // 5. Deletar
    delete(req, res) {
        const { id } = req.params;
        db.run(`DELETE FROM transactions WHERE id = ?`, [id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            return res.status(204).send();
        });
    }
};