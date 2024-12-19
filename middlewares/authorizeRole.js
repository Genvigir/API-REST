const authorizeRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para acessar essa rota.' });
        }
        next();
    };
};

module.exports = authorizeRole;
