const express = require('express');
const authenticateToken = require('../middlewares/authMiddleware');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

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
 * /categories:
 *   get:
 *     summary: Lista todas as categorias
 *     tags:
 *       - Categorias
 *     responses:
 *       200:
 *         description: Lista de categorias
 */
router.get('/', (req, res) => {
    const categories = loadData(categoriesFilePath);
    res.status(200).json(categories);
});

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Cria uma nova categoria
 *     tags:
 *       - Categorias
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', authenticateToken, (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'O campo "name" é obrigatório.' });
    }

    const categories = loadData(categoriesFilePath);
    const newCategory = {
        id: uuidv4(),
        name,
        createdAt: new Date()
    };

    categories.push(newCategory);
    saveData(categoriesFilePath, categories);

    res.status(201).json({ message: 'Categoria criada com sucesso!', category: newCategory });
});

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Atualiza os dados de uma categoria
 *     tags:
 *       - Categorias
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da categoria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso
 *       404:
 *         description: Categoria não encontrada
 */
router.put('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    const categories = loadData(categoriesFilePath);
    const categoryIndex = categories.findIndex(category => category.id === id);

    if (categoryIndex === -1) {
        return res.status(404).json({ error: 'Categoria não encontrada.' });
    }

    if (name) categories[categoryIndex].name = name;

    saveData(categoriesFilePath, categories);

    res.status(200).json({ message: 'Categoria atualizada com sucesso.', category: categories[categoryIndex] });
});

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Remove uma categoria
 *     tags:
 *       - Categorias
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da categoria
 *     responses:
 *       200:
 *         description: Categoria removida com sucesso
 *       404:
 *         description: Categoria não encontrada
 */
router.delete('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const categories = loadData(categoriesFilePath);
    const categoryIndex = categories.findIndex(category => category.id === id);

    if (categoryIndex === -1) {
        return res.status(404).json({ error: 'Categoria não encontrada.' });
    }

    categories.splice(categoryIndex, 1);
    saveData(categoriesFilePath, categories);

    res.status(200).json({ message: 'Categoria removida com sucesso.' });
});

module.exports = router;
