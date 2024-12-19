const jwt = require('jsonwebtoken');

// Middleware para verificar se o token é válido
const authenticateToken = (req, res, next) => {
    // Verifica se o token foi enviado no cabeçalho da requisição
    const token = req.headers['authorization']?.split(' ')[1]; // O token vem após 'Bearer '

    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }

    // Verifica a validade do token usando a chave secreta
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido' });
        }

        req.user = user; // Adiciona as informações do usuário ao objeto da requisição
        next(); // Chama a próxima função/middleware
    });
};

module.exports = authenticateToken;
