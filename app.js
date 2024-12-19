require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json()); // Suporte para JSON
app.use(express.urlencoded({ extended: true })); // Suporte para URL-encoded

// Rota inicial para testar
app.get('/', (req, res) => {
    res.status(200).send('API funcionando!');
});

// Importando a rota de autenticação
const authRoutes = require('./routes/auth.routes');
app.use('/auth', authRoutes);

// Porta do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

