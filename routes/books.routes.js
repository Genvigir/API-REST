const express = require('express');
const { authenticateToken } = require('../middlewares/auth');
const { readJSONFile, writeJSONFile } = require('../utils/jsonUtils');
const router = express.Router();

const filePath = './data/books.json';

// Middleware de autenticação para todas as rotas de livros
router.use(authenticateToken);

// Criar um novo livro
router.post('/', (req, res) => {
    const { title, author, genre, price } = req.body;

    if (!title || !author || !genre || !price) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const books = readJSONFile(filePath) || [];
    const newBook = {
        id: require('uuid').v4(),
        title,
        author,
        genre,
        price,
    };

    books.push(newBook);
    writeJSONFile(filePath, books);

    res.status(201).json(newBook);
});

// Listar livros com paginação
router.get('/', (req, res) => {
    const { limite = 5, pagina = 1 } = req.query;

    const books = readJSONFile(filePath) || [];
    const pageLimit = [5, 10, 30].includes(Number(limite)) ? Number(limite) : 5;
    const currentPage = Number(pagina) > 0 ? Number(pagina) : 1;

    const startIndex = (currentPage - 1) * pageLimit;
    const paginatedBooks = books.slice(startIndex, startIndex + pageLimit);

    res.json({
        total: books.length,
        limite: pageLimit,
        pagina: currentPage,
        data: paginatedBooks,
    });
});

// Buscar um livro pelo ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const books = readJSONFile(filePath) || [];

    const book = books.find(b => b.id === id);
    if (!book) {
        return res.status(404).json({ error: 'Livro não encontrado.' });
    }

    res.json(book);
});

// Atualizar um livro
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { title, author, genre, price } = req.body;

    if (!title || !author || !genre || !price) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const books = readJSONFile(filePath) || [];
    const bookIndex = books.findIndex(b => b.id === id);

    if (bookIndex === -1) {
        return res.status(404).json({ error: 'Livro não encontrado.' });
    }

    books[bookIndex] = { id, title, author, genre, price };
    writeJSONFile(filePath, books);

    res.json(books[bookIndex]);
});

// Excluir um livro
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const books = readJSONFile(filePath) || [];

    const newBooks = books.filter(b => b.id !== id);
    if (books.length === newBooks.length) {
        return res.status(404).json({ error: 'Livro não encontrado.' });
    }

    writeJSONFile(filePath, newBooks);
    res.status(204).send();
});

module.exports = router;
