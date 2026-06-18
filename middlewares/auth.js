const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
    const tokenHeader = req.headers['authorization'];
    
    if (!tokenHeader) {
        return res.status(403).json({ erro: "Acesso negado. Você precisa estar logado." });
    }

    const token = tokenHeader.split(' ')[1];

    try {
        const decodificado = jwt.verify(token, process.env.JWT_SECRET || 'senha_provisoria_agape');
        req.usuarioId = decodificado.id;
        req.isAdmin = decodificado.isAdmin;
        next();
    } catch (err) {
        return res.status(401).json({ erro: "Sessão expirada ou Token inválido." });
    }
}

function verificarAdmin(req, res, next) {
    if (!req.isAdmin) {
        return res.status(403).json({ erro: "Acesso negado. Apenas coordenadores podem fazer isso." });
    }
    next();
}

module.exports = { verificarToken, verificarAdmin };