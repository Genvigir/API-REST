const express = require('express');
const fs = require('fs');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/authorizeRole');
require('dotenv').config();

// Caminho para o arquivo JSON dos usuários
const usersFilePath = './data/users.json';

// Função para carregar usuários
const loadUsers = () => {
    if (fs.existsSync(usersFilePath)) {
        return JSON.parse(fs.readFileSync(usersFilePath));
    }
    return [];
};

// Função para salvar usuários
const saveUsers = (users) => {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

// Rota para cadastrar um novo usuário
router.post('/users', async (req, res) => {
    const { username, password, email, role } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ error: 'Todos os campos (username, password, email) são obrigatórios.' });
    }

    const users = loadUsers();

    if (users.some(user => user.username === username)) {
        return res.status(409).json({ error: 'O nome de usuário já está em uso.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        id: uuidv4(),
        username,
        email,
        password: hashedPassword,
        role: role || 'user',
        createdAt: new Date()
    };

    users.push(newUser);
    saveUsers(users);

    res.status(201).json({ message: 'Usuário criado com sucesso!', user: { id: newUser.id, username: newUser.username, email: newUser.email } });
});

// Rota para criar um novo administrador
router.post('/users/admin', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ error: 'Todos os campos (username, password, email) são obrigatórios.' });
    }

    const users = loadUsers();

    if (users.some(user => user.username === username)) {
        return res.status(409).json({ error: 'O nome de usuário já está em uso.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = {
        id: uuidv4(),
        username,
        email,
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date()
    };

    users.push(newAdmin);
    saveUsers(users);

    res.status(201).json({ message: 'Administrador criado com sucesso!', admin: { id: newAdmin.id, username: newAdmin.username, email: newAdmin.email } });
});

// Rota para excluir um usuário não administrador
router.delete('/users/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
    const { id } = req.params;

    let users = loadUsers();

    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    if (users[userIndex].role === 'admin') {
        return res.status(403).json({ error: 'Não é permitido excluir administradores.' });
    }

    users.splice(userIndex, 1);
    saveUsers(users);

    res.status(200).json({ message: 'Usuário excluído com sucesso.' });
});

// Rota para login e geração de token JWT
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
    }

    const users = loadUsers();
    const user = users.find(u => u.username === username);

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login bem-sucedido.', token });
});

// Rota para alterar dados pessoais
router.put('/users/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { username, email, password } = req.body;
    const users = loadUsers();
    const userIndex = users.findIndex(user => user.id === id);

    if (userIndex === -1) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const currentUser = users[userIndex];

    if (req.user.id !== id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Você não tem permissão para alterar este usuário.' });
    }

    if (username) currentUser.username = username;
    if (email) currentUser.email = email;
    if (password) currentUser.password = bcrypt.hashSync(password, 10);

    users[userIndex] = currentUser;
    saveUsers(users);

    res.status(200).json({ message: 'Dados atualizados com sucesso.', user: { id: currentUser.id, username: currentUser.username, email: currentUser.email } });
});

// Rota para instalação do sistema
router.get('/install', (req, res) => {
    const users = loadUsers();

    if (users.some(user => user.role === 'admin')) {
        return res.status(400).json({ error: 'Já existe um administrador no sistema.' });
    }

    const defaultAdmin = {
        id: uuidv4(),
        username: 'admin',
        email: 'admin@example.com',
        password: bcrypt.hashSync('admin123', 10),
        role: 'admin',
        createdAt: new Date()
    };

    users.push(defaultAdmin);
    saveUsers(users);

    res.status(201).json({ message: 'Administrador padrão criado com sucesso.', admin: { id: defaultAdmin.id, username: defaultAdmin.username, email: defaultAdmin.email } });
});

module.exports = router;