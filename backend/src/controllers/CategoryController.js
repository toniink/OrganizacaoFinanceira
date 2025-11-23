const db = require('../config/database');

module.exports = {
    // Listar categorias do usuário
    index(req, res) {
        const { userId } = req.params;
        const { type } = req.query; // Pode filtrar ?type=expense ou ?type=income

        let query = `SELECT * FROM categories WHERE user_id = ?`;
        let params = [userId];

        if (type) {
            query += ` AND type = ?`;
            params.push(type);
        }

        db.all(query, params, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            return res.json(rows);
        });
    },

    // Criar nova categoria personalizada
    create(req, res) {
        const { user_id, name, icon, type } = req.body;
        
        db.run(`INSERT INTO categories (user_id, name, icon, type) VALUES (?, ?, ?, ?)`,
            [user_id, name, icon, type],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                return res.json({ id: this.lastID, name, icon });
            }
        );
    },

    // Deletar categoria
    delete(req, res) {
        const { id } = req.params;
        db.run(`DELETE FROM categories WHERE id = ?`, [id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            return res.status(204).send();
        });
    }
};