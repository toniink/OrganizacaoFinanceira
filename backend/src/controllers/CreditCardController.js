const db = require('../config/database');

module.exports = {
    // 1. Criar Cartão (COM CORREÇÃO DE DATA PARA FATURA FECHADA)
    create(req, res) {
        const { user_id, name, closing_day, initial_amount } = req.body;

        if (!closing_day || closing_day < 1 || closing_day > 31) {
            return res.status(400).json({ error: "Dia de fechamento inválido (1-31)" });
        }

        db.run(`INSERT INTO credit_cards (user_id, name, closing_day) VALUES (?, ?, ?)`,
            [user_id, name, closing_day],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                
                const cardId = this.lastID;

                // SE TIVER VALOR INICIAL:
                if (initial_amount && parseFloat(initial_amount) > 0) {
                    const amount = parseFloat(initial_amount);
                    
                    // --- LÓGICA INTELIGENTE DE DATA ---
                    const today = new Date();
                    const closingDayInt = parseInt(closing_day);
                    
                    // Data de fechamento deste mês atual
                    const currentMonthClosingDate = new Date(today.getFullYear(), today.getMonth(), closingDayInt);
                    
                    let transactionDate = today;

                    // SE HOJE JÁ PASSOU DO FECHAMENTO (Ex: Hoje 26, Fechou dia 05)
                    // Significa que a fatura atual já fechou. 
                    // Se o usuário inseriu um valor, ele quer ver esse valor nessa fatura fechada.
                    // Então, forçamos a data para 1 dia antes do fechamento.
                    if (today > currentMonthClosingDate) {
                        // Define data para: Data de Fechamento - 1 dia
                        transactionDate = new Date(currentMonthClosingDate);
                        transactionDate.setDate(transactionDate.getDate() - 1);
                    }

                    const finalDateStr = transactionDate.toISOString().split('T')[0];
                    
                    db.run(`INSERT INTO transactions (user_id, description, amount, type, date, origin_type, origin_id, is_fixed) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [user_id, 'Fatura Inicial / Ajuste', amount, 'expense', finalDateStr, 'credit_card', cardId, 0]
                    );
                }

                return res.json({ id: cardId, message: "Cartão criado com sucesso!" });
            }
        );
    },

    // 2. Atualizar Cartão
    update(req, res) {
        const { id } = req.params;
        const { name, closing_day } = req.body;

        db.run(`UPDATE credit_cards SET name = ?, closing_day = ? WHERE id = ?`, 
            [name, closing_day, id],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                return res.json({ message: "Cartão atualizado!" });
            }
        );
    },

    // 3. Deletar Cartão
    delete(req, res) {
        const { id } = req.params;
        db.run(`DELETE FROM credit_cards WHERE id = ?`, [id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            return res.status(204).send();
        });
    },

    // 4. Listar Cartões (Mantido igual, pois a lógica de leitura estava correta)
    list(req, res) {
        const { userId } = req.params;
        const { month, year } = req.query;

        if (!month || !year) return res.status(400).json({ error: "Dados de data obrigatórios" });

        const targetMonth = parseInt(month) - 1;
        const targetYear = parseInt(year);
        const today = new Date();
        today.setHours(0,0,0,0);

        db.all(`SELECT * FROM credit_cards WHERE user_id = ?`, [userId], async (err, cards) => {
            if (err) return res.status(500).json({ error: err.message });

            const cardsWithTotals = [];

            for (const card of cards) {
                const closingDay = card.closing_day;

                // Datas da Fatura
                const endDateObj = new Date(targetYear, targetMonth, closingDay - 1);
                const startDateObj = new Date(targetYear, targetMonth - 1, closingDay);

                const startDate = startDateObj.toISOString().split('T')[0];
                const endDate = endDateObj.toISOString().split('T')[0];

                // Status
                let status = 'open';
                if (today > endDateObj) {
                    status = 'closed';
                }

                // Total
                const query = `
                    SELECT SUM(amount) as total 
                    FROM transactions 
                    WHERE origin_type = 'credit_card' 
                    AND origin_id = ? 
                    AND date >= ? AND date <= ?
                `;

                const total = await new Promise((resolve) => {
                    db.get(query, [card.id, startDate, endDate], (err, row) => {
                        resolve(row?.total || 0);
                    });
                });

                cardsWithTotals.push({
                    ...card,
                    invoiceAmount: total,
                    invoiceStatus: status,
                    period: { start: startDate, end: endDate }
                });
            }

            return res.json(cardsWithTotals);
        });
    },

    getInvoice(req, res) {
        return res.status(200).json({ message: "Use a rota de listagem" });
    }
};