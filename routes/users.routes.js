const express = require('express');
const fs = require('fs');
const path = require('path');
const { readJsonFile, writeJsonFile } = require('../utils/fileUtils');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const usersFile = path.join(__dirname, '../users.json');

// Rota para criar o administrador inicial
router.get('/install', (req, res) => {
    const adminUser = {
        id: 1,
        username: 'admin',
        password: 'admin123',
        role: 'admin'
    };

    if (!fs.existsSync(usersFile)) {
        writeJsonFile(usersFile, [adminUser]);
        res.status(201).send('Usuário administrador criado com sucesso!');
    } else {
        res.status(400).send('O sistema já foi instalado.');
    }
});

// Rota para listar todos os usuários
router.get('/all', (req, res) => {
    const users = readJsonFile(usersFile);
    res.status(200).json(users);
});

// Rota para cadastrar um novo usuário
router.post('/register', (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
    }

    const users = readJsonFile(usersFile);
    if (users.find(user => user.username === username)) {
        return res.status(400).json({ error: 'Usuário já existe.' });
    }

    const newUser = {
        id: uuidv4(),
        username,
        password,
        role: role || 'user'
    };

    users.push(newUser);
    writeJsonFile(usersFile, users);

    res.status(201).json({ message: 'Usuário cadastrado com sucesso.', user: newUser });
});

module.exports = router;
