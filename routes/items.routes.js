const express = require('express');
const authenticateToken = require('../middlewares/authMiddleware');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const itemsFilePath = './data/items.json';
const categoriesFilePath = './data/categories.json';

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
 * /items:
 *   get:
 *     summary: Lista todos os itens com paginação
 *     tags:
 *       - Itens
 *     parameters:
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           enum: [5, 10, 30]
 *         description: Número máximo de itens a serem retornados
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *         description: Número da página a ser retornada
 *     responses:
 *       200:
 *         description: Lista de itens
 */
router.get('/', (req, res) => {
    const { limite = 10, pagina = 1 } = req.query;
    const items = loadData(itemsFilePath);
    const startIndex = (pagina - 1) * limite;
    const paginatedItems = items.slice(startIndex, startIndex + limite);
    res.status(200).json({ total: items.length, items: paginatedItems });
});

/**
 * Lógica de Negócio: Estatísticas sobre os itens
 */
/**
 * @swagger
 * /items/statistics:
 *   get:
 *     summary: Estatísticas gerais dos itens
 *     tags:
 *       - Itens
 *     responses:
 *       200:
 *         description: Estatísticas sobre os itens cadastrados
 */
router.get('/statistics', authenticateToken, (req, res) => {
    const items = loadData(itemsFilePath);
    const categories = loadData(categoriesFilePath);

    const totalItems = items.length;
    const itemsByCategory = categories.map(category => {
        return {
            category: category.name,
            count: items.filter(item => item.categoryId === category.id).length
        };
    });

    const sortedItemsByDate = [...items].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const oldestItem = sortedItemsByDate[0] || null;
    const newestItem = sortedItemsByDate[sortedItemsByDate.length - 1] || null;

    res.status(200).json({
        totalItems,
        itemsByCategory,
        oldestItem,
        newestItem
    });
});

/**
 * @swagger
 * /items:
 *   post:
 *     summary: Cria um novo item
 *     tags:
 *       - Itens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               categoryId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', authenticateToken, (req, res) => {
    const { name, categoryId } = req.body;

    if (!name || !categoryId) {
        return res.status(400).json({ error: 'Os campos "name" e "categoryId" são obrigatórios.' });
    }

    const categories = loadData(categoriesFilePath);
    const categoryExists = categories.some(category => category.id === categoryId);

    if (!categoryExists) {
        return res.status(400).json({ error: 'Categoria inválida.' });
    }

    const items = loadData(itemsFilePath);
    const newItem = {
        id: uuidv4(),
        name,
        categoryId,
        createdAt: new Date()
    };

    items.push(newItem);
    saveData(itemsFilePath, items);

    res.status(201).json({ message: 'Item criado com sucesso!', item: newItem });
});

/**
 * @swagger
 * /items/{id}:
 *   put:
 *     summary: Atualiza os dados de um item
 *     tags:
 *       - Itens
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               categoryId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item atualizado com sucesso
 *       404:
 *         description: Item não encontrado
 */
router.put('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { name, categoryId } = req.body;

    const items = loadData(itemsFilePath);
    const itemIndex = items.findIndex(item => item.id === id);

    if (itemIndex === -1) {
        return res.status(404).json({ error: 'Item não encontrado.' });
    }

    if (name) items[itemIndex].name = name;
    if (categoryId) {
        const categories = loadData(categoriesFilePath);
        const categoryExists = categories.some(category => category.id === categoryId);

        if (!categoryExists) {
            return res.status(400).json({ error: 'Categoria inválida.' });
        }

        items[itemIndex].categoryId = categoryId;
    }

    saveData(itemsFilePath, items);

    res.status(200).json({ message: 'Item atualizado com sucesso.', item: items[itemIndex] });
});

/**
 * @swagger
 * /items/{id}:
 *   delete:
 *     summary: Remove um item
 *     tags:
 *       - Itens
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do item
 *     responses:
 *       200:
 *         description: Item removido com sucesso
 *       404:
 *         description: Item não encontrado
 */
router.delete('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const items = loadData(itemsFilePath);
    const itemIndex = items.findIndex(item => item.id === id);

    if (itemIndex === -1) {
        return res.status(404).json({ error: 'Item não encontrado.' });
    }

    items.splice(itemIndex, 1);
    saveData(itemsFilePath, items);

    res.status(200).json({ message: 'Item removido com sucesso.' });
});

module.exports = router;
