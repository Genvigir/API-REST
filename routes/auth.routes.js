const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Para verificar a senha criptografada

const router = express.Router();

// Caminho para o arquivo de usuários
const usersFilePath = path.join(__dirname, '../data/users.json');

// Função para verificar se o arquivo existe
const fileExists = (filePath) => fs.existsSync(filePath);

// Middleware para garantir que o corpo da requisição contenha as propriedades necessárias
const validateLoginRequest = (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Campos "username" e "password" são obrigatórios' });
    }
    next();
};

// Rota de login (POST /auth/login)
router.post('/login', validateLoginRequest, (req, res) => {
    const { username, password } = req.body;

    // Verifica se o arquivo de usuários existe
    if (!fileExists(usersFilePath)) {
        return res.status(404).json({ message: 'Nenhum usuário cadastrado' });
    }

    // Lê os usuários do arquivo JSON
    let users;
    try {
        users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
    } catch (err) {
        return res.status(500).json({ message: 'Erro ao ler o arquivo de usuários' });
    }

    // Encontra o usuário pelo nome de usuário
    const user = users.find((user) => user.username === username);

    if (!user) {
        return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    // Verifica se a senha está correta (usando bcrypt para comparar)
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Senha incorreta' });
    }

    // Cria o token JWT
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
        message: 'Login bem-sucedido',
        token,
    });
});

module.exports = router;
