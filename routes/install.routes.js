const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const router = express.Router();

const usersFilePath = './data/users.json';

const loadData = (filePath) => {
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath));
    }
    return [];
};

const saveData = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

/**
 * @swagger
 * /install:
 *   get:
 *     summary: Inicializa o sistema criando um usuário administrador padrão
 *     tags:
 *       - Instalação
 *     responses:
 *       200:
 *         description: Usuário administrador criado com sucesso
 *       400:
 *         description: Usuário administrador já existente
 */
router.get('/install', (req, res) => {
    const users = loadData(usersFilePath);

    // Verifica se já existe um administrador
    const adminExists = users.some(user => user.role === 'admin');

    if (adminExists) {
        return res.status(400).json({ error: 'Usuário administrador já existe no sistema.' });
    }

    // Cria o administrador padrão
    const defaultAdmin = {
        id: uuidv4(),
        username: 'admin',
        password: bcrypt.hashSync('admin123', 10), // Senha padrão
        role: 'admin',
        createdAt: new Date()
    };

    users.push(defaultAdmin);
    saveData(usersFilePath, users);

    res.status(200).json({ message: 'Usuário administrador criado com sucesso.', user: { username: defaultAdmin.username } });
});

module.exports = router;
