const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Caminho para o arquivo JSON
const usersFilePath = path.join(__dirname, '../data/users.json');

// Função para verificar se o arquivo existe
const fileExists = (filePath) => fs.existsSync(filePath);

// Rota GET /install
router.get('/', (req, res) => {
    // Verifica se o arquivo users.json já existe
    if (fileExists(usersFilePath)) {
        // Lê os dados do arquivo
        const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));

        // Verifica se já existe um administrador
        const adminExists = users.some((user) => user.role === 'admin');
        if (adminExists) {
            return res.status(400).json({ message: 'Um administrador já existe no sistema.' });
        }
    }

    // Cria o usuário administrador padrão
    const adminUser = {
        id: uuidv4(),
        username: 'admin',
        password: 'admin123', // Em projetos reais, nunca armazene senhas em texto puro
        role: 'admin'
    };

    let users = [];
    if (fileExists(usersFilePath)) {
        // Lê os usuários existentes
        users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
    }

    // Adiciona o administrador à lista de usuários
    users.push(adminUser);

    // Salva no arquivo JSON
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');

    res.status(201).json({ message: 'Administrador criado com sucesso!', adminUser });
});

module.exports = router;
