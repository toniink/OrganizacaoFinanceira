const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'xiu';

module.exports = (req, res, next) => {
    // O token vem no header: "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    // Separa "Bearer" do token
    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
        return res.status(401).json({ error: 'Erro no token' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).json({ error: 'Token malformatado' });
    }

    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Token inválido' });

        // Se deu certo, salva o ID do usuário na requisição para os controllers usarem
        req.userId = decoded.id;
        return next();
    });
};