const db = require('../config/database');

module.exports = {
    // Listar todas as contas do usuário
    index(req, res) {
        const { userId } = req.params;
        
        db.all(`SELECT * FROM accounts WHERE user_id = ?`, [userId], (err, accounts) => {
            if (err) return res.status(500).json({ error: err.message });
            return res.json(accounts);
        });
    },

    // Criar nova conta bancária
    create(req, res) {
        const { user_id, name, balance } = req.body;
        
        // O saldo inicial é opcional, se não vier assume 0
        const initialBalance = balance || 0;

        // is_fixed é 0 pois contas criadas manualmente podem ser deletadas
        db.run(`INSERT INTO accounts (user_id, name, balance, is_fixed) VALUES (?, ?, ?, 0)`,
            [user_id, name, initialBalance],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                return res.json({ id: this.lastID, name, balance: initialBalance });
            }
        );
    },

    // Atualizar conta (Nome ou Ajuste de Saldo manual)
    update(req, res) {
        const { id } = req.params;
        const { name, balance } = req.body;

        // Construção dinâmica da query para permitir atualizar só nome, só saldo ou ambos
        let updates = [];
        let values = [];

        if (name) {
            updates.push('name = ?');
            values.push(name);
        }
        if (balance !== undefined) {
            updates.push('balance = ?');
            values.push(balance);
        }

        if (updates.length === 0) return res.status(400).json({ error: "Nenhum dado para atualizar" });

        values.push(id); // ID vai por último no WHERE

        const query = `UPDATE accounts SET ${updates.join(', ')} WHERE id = ?`;

        db.run(query, values, function(err) {
            if (err) return res.status(500).json({ error: err.message });
            return res.json({ message: "Conta atualizada com sucesso" });
        });
    },

    // Deletar conta
    delete(req, res) {
        const { id } = req.params;

        // 1. Verificar se é a conta fixa (Carteira) ANTES de deletar
        db.get(`SELECT is_fixed FROM accounts WHERE id = ?`, [id], (err, account) => {
            if (err || !account) return res.status(404).json({ error: "Conta não encontrada" });

            if (account.is_fixed === 1) {
                return res.status(403).json({ error: "A Carteira/Bolso padrão não pode ser excluída." });
            }

            // 2. Se não for fixa, pode deletar
            db.run(`DELETE FROM accounts WHERE id = ?`, [id], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                return res.status(204).send();
            });
        });
    }
};