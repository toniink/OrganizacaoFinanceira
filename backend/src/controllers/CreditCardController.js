const db = require('../config/database');

module.exports = {
    // 1. Criar Cartão
    create(req, res) {
        const { user_id, name, closing_day } = req.body;

        if (!closing_day || closing_day < 1 || closing_day > 31) {
            return res.status(400).json({ error: "Dia de fechamento inválido" });
        }

        db.run(`INSERT INTO credit_cards (user_id, name, closing_day) VALUES (?, ?, ?)`,
            [user_id, name, closing_day],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                return res.json({ id: this.lastID, message: "Cartão criado!" });
            }
        );
    },

    // 2. Listar Cartões do Usuário
    list(req, res) {
        const { userId } = req.params;
        db.all(`SELECT * FROM credit_cards WHERE user_id = ?`, [userId], (err, cards) => {
            if (err) return res.status(500).json({ error: err.message });
            return res.json(cards);
        });
    },

    // 3. Obter Fatura (Lógica de Aberta/Fechada e Cálculo)
    getInvoice(req, res) {
        const { cardId } = req.params;
        const { month, year } = req.query; // Mês e ano de REFERÊNCIA da fatura (ex: fatura de Novembro)

        if (!month || !year) return res.status(400).json({ error: "Mês e Ano são obrigatórios" });

        // Primeiro, pegamos o dia de fechamento do cartão
        db.get(`SELECT closing_day FROM credit_cards WHERE id = ?`, [cardId], (err, card) => {
            if (err || !card) return res.status(404).json({ error: "Cartão não encontrado" });

            const closingDay = card.closing_day;
            const targetMonth = parseInt(month) - 1; // JS usa meses 0-11
            const targetYear = parseInt(year);

            // --- LÓGICA DE DATA ---
            // Data final da fatura: Dia (fechamento - 1) do mês alvo
            // Ex: Se fecha dia 10 de Nov, compras até dia 09 entram.
            const endDateObj = new Date(targetYear, targetMonth, closingDay - 1);
            
            // Data inicial da fatura: Dia (fechamento) do mês anterior
            const startDateObj = new Date(targetYear, targetMonth - 1, closingDay);

            // Converter para formato YYYY-MM-DD para o SQLite
            const startDate = startDateObj.toISOString().split('T')[0];
            const endDate = endDateObj.toISOString().split('T')[0];

            // --- LÓGICA DE STATUS (ABERTA/FECHADA) ---
            const today = new Date();
            // Zeramos as horas para comparar apenas datas
            today.setHours(0,0,0,0);
            
            let status = 'closed'; // Padrão: fechada
            
            // Se a data de hoje estiver DENTRO do intervalo ou ANTES do intervalo acabar => Aberta
            // Se hoje já passou da data final => Fechada
            if (today <= endDateObj) {
                status = 'open';
            }

            // --- CONSULTA AO BANCO ---
            const query = `
                SELECT * FROM transactions 
                WHERE origin_type = 'credit_card' 
                AND origin_id = ? 
                AND date >= ? 
                AND date <= ?
                ORDER BY date DESC
            `;

            db.all(query, [cardId, startDate, endDate], (err, transactions) => {
                if (err) return res.status(500).json({ error: err.message });

                // Somar o total
                const total = transactions.reduce((acc, item) => acc + item.amount, 0);

                return res.json({
                    cardId,
                    invoiceMonth: month,
                    invoiceYear: year,
                    period: {
                        from: startDate,
                        to: endDate
                    },
                    status, // 'open' ou 'closed'
                    total,
                    transactions // Lista de compras desta fatura
                });
            });
        });
    }
};