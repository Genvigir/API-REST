const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');

const usersFilePath = path.join(__dirname, '../data/users.json');

const fileExists = (filePath) => fs.existsSync(filePath);

router.get('/', authenticateToken, (req, res) => {
    if (!fileExists(usersFilePath)) {
        return res.status(500).json({ message: 'Arquivo de usuários não encontrado.' });
    }

    const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
    res.status(200).json(users);
});

router.post('/', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem criar usuários.' });
    }

    const { username, password, role } = req.body;

    if (!fileExists(usersFilePath)) {
        return res.status(500).json({ message: 'Arquivo de usuários não encontrado.' });
    }

    const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));

    const existingUser = users.find((user) => user.username === username);
    if (existingUser) {
        return res.status(400).json({ message: 'Usuário já existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: users.length + 1, username, password: hashedPassword, role: role || 'user' };

    users.push(newUser);
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

    res.status(201).json({ message: 'Usuário criado com sucesso', user: { ...newUser, password: undefined } });
});

// Outras rotas (PUT e DELETE) podem seguir a mesma lógica.

module.exports = router;
