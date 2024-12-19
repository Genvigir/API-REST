const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');

// Caminho para o arquivo de dados de usuários
const usersFilePath = path.join(__dirname, '../data/users.json');

// Função para ler o arquivo de usuários com tratamento de erro
const readUsersFile = () => {
    try {
        return JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
    } catch (error) {
        throw new Error('Erro ao ler o arquivo de usuários.');
    }
};

// Função para escrever no arquivo de usuários com tratamento de erro
const writeUsersFile = (users) => {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    } catch (error) {
        throw new Error('Erro ao salvar os dados de usuários.');
    }
};

// Rota para listar usuários (qualquer usuário autenticado pode acessar)
router.get('/', authenticateToken, (req, res) => {
    try {
        const users = readUsersFile();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Rota para criar um novo usuário (somente administrador pode criar)
router.post('/', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem criar usuários.' });
        }

        const { username, password, role } = req.body;
        const users = readUsersFile();

        // Verifica se o nome de usuário já está em uso
        const existingUser = users.find((user) => user.username === username);
        if (existingUser) {
            return res.status(400).json({ message: 'Usuário já existe' });
        }

        // Criptografa a senha
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: users.length + 1,
            username,
            password: hashedPassword,
            role: role || 'user', // Define o papel do usuário, podendo ser 'user' ou 'admin'
        };

        users.push(newUser);
        writeUsersFile(users);

        res.status(201).json({ message: 'Usuário criado com sucesso', user: { ...newUser, password: undefined } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Rota para editar dados de um usuário (somente o próprio usuário ou administrador pode editar)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password, role } = req.body;

        const users = readUsersFile();
        const userIndex = users.findIndex((user) => user.id === parseInt(id));

        if (userIndex === -1) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const user = users[userIndex];

        // Verifica se o usuário pode editar
        if (user.id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Acesso negado. Você só pode editar seus próprios dados.' });
        }

        // Atualiza os dados do usuário
        user.username = username || user.username;
        user.password = password ? await bcrypt.hash(password, 10) : user.password; // Se a senha for alterada, criptografa a nova
        user.role = role || user.role;

        users[userIndex] = user;
        writeUsersFile(users);

        res.status(200).json({ message: 'Usuário atualizado com sucesso', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Rota para excluir um usuário (somente administrador pode excluir)
router.delete('/:id', authenticateToken, (req, res) => {
    try {
        const { id } = req.params;

        const users = readUsersFile();
        const userIndex = users.findIndex((user) => user.id === parseInt(id));

        if (userIndex === -1) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const user = users[userIndex];

        // Verifica se o usuário tem permissão para excluir
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Acesso negado. Somente administradores podem excluir usuários.' });
        }

        users.splice(userIndex, 1); // Remove o usuário do array
        writeUsersFile(users);

        res.status(200).json({ message: 'Usuário excluído com sucesso', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const { check, validationResult } = require('express-validator');

// Validação de entrada no cadastro
router.post(
  "/register",
  [
    check("name").notEmpty().withMessage("O nome é obrigatório."),
    check("email").isEmail().withMessage("E-mail inválido."),
    check("password").isLength({ min: 6 }).withMessage("A senha deve ter pelo menos 6 caracteres."),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Lógica de cadastro
    const user = req.body;
    // Restante da lógica para salvar o usuário
  }
);

const fs = require('fs');
const bcrypt = require('bcryptjs');

router.get("/install", async (req, res) => {
  try {
    const admin = {
      id: "admin-id",
      name: "Admin",
      email: "admin@example.com",
      password: await bcrypt.hash("admin123", 10),
      role: "admin"
    };

    const usersFile = './data/users.json';
    let users = [];
    
    if (fs.existsSync(usersFile)) {
      const data = fs.readFileSync(usersFile);
      users = JSON.parse(data);
    }

    const adminExists = users.find((u) => u.role === "admin");
    if (adminExists) {
      return res.status(400).json({ message: "Administrador já existe." });
    }

    users.push(admin);
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    res.status(201).json({ message: "Administrador criado com sucesso!" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao criar administrador." });
  }
});

router.get("/report", (req, res) => {
    const data = JSON.parse(fs.readFileSync('./data/users.json'));
    const totalUsers = data.length;
    const adminCount = data.filter(user => user.role === 'admin').length;
    const commonUsers = totalUsers - adminCount;
  
    res.json({
      totalUsers,
      adminCount,
      commonUsers,
    });
  });
  
  router.get("/users", (req, res) => {
  const { limite = 5, pagina = 1 } = req.query;
  const data = JSON.parse(fs.readFileSync('./data/users.json'));

  const startIndex = (pagina - 1) * limite;
  const paginatedData = data.slice(startIndex, startIndex + Number(limite));

  res.json(paginatedData);
});

module.exports = router;
