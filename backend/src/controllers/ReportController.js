const db = require('../config/database');

module.exports = {
    getMonthlyReport(req, res) {
        const { userId } = req.params;
        const { month, year } = req.query;

        if (!month || !year) return res.status(400).json({ error: "Data obrigatória" });

        const dateFilter = `${year}-${month.toString().padStart(2, '0')}-%`;

        // 1. Totais Gerais
        const queryTotals = `
            SELECT 
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
            FROM transactions 
            WHERE user_id = ? AND date LIKE ?
        `;

        db.get(queryTotals, [userId, dateFilter], (err, totals) => {
            if (err) return res.status(500).json({ error: err.message });

            const income = totals.total_income || 0;
            const expense = totals.total_expense || 0;
            const balance = income - expense;

            // 2. Agrupamento por Categoria (Para o gráfico/resumo)
            const queryCategories = `
                SELECT 
                    c.name as category_name, 
                    c.icon,
                    SUM(t.amount) as total_amount,
                    COUNT(t.id) as transaction_count
                FROM transactions t
                JOIN categories c ON t.category_id = c.id
                WHERE t.user_id = ? AND t.date LIKE ? AND t.type = 'expense'
                GROUP BY c.id
                ORDER BY total_amount DESC
            `;

            db.all(queryCategories, [userId, dateFilter], (err, categories) => {
                if (err) return res.status(500).json({ error: err.message });

                // 3. Lista Detalhada de Transações (O QUE FALTAVA)
                const queryTransactions = `
                    SELECT 
                        t.id, t.description, t.amount, t.type, t.date,
                        c.name as category_name
                    FROM transactions t
                    LEFT JOIN categories c ON t.category_id = c.id
                    WHERE t.user_id = ? AND t.date LIKE ?
                    ORDER BY t.date DESC
                `;

                db.all(queryTransactions, [userId, dateFilter], (err, transactions) => {
                    if (err) return res.status(500).json({ error: err.message });

                    // Calcula porcentagens para as categorias
                    const categoriesWithPercent = categories.map(cat => ({
                        ...cat,
                        percent: expense > 0 ? ((cat.total_amount / expense) * 100).toFixed(1) : 0
                    }));

                    return res.json({
                        month,
                        year,
                        summary: { income, expense, balance },
                        categories: categoriesWithPercent,
                        transactions // Enviando a lista detalhada
                    });
                });
            });
        });
    }
};