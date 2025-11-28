const db = require('../config/database');

module.exports = {
    // Buscar dados atualizados do usuário
    show(req, res) {
        const { id } = req.params;
        db.get(`SELECT id, name, email, monthly_income FROM users WHERE id = ?`, [id], (err, user) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
            return res.json(user);
        });
    },

    // Atualizar perfil
    update(req, res) {
        const { id } = req.params;
        const { name, password, monthly_income } = req.body;

        // Monta query dinâmica baseada no que foi enviado
        let updates = [];
        let values = [];

        if (name) { updates.push('name = ?'); values.push(name); }
        if (monthly_income) { updates.push('monthly_income = ?'); values.push(monthly_income); }
        if (password) { updates.push('password = ?'); values.push(password); }

        if (updates.length === 0) return res.status(400).json({ error: "Nada para atualizar" });

        values.push(id);

        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

        db.run(query, values, function(err) {
            if (err) return res.status(500).json({ error: err.message });
            return res.json({ message: "Perfil atualizado com sucesso!" });
        });
    }
};