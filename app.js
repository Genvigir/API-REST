require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const usersRoutes = require('./routes/users.routes');
const installRoutes = require('./routes/install.routes');

app.use('/users', usersRoutes);
app.use('/install', installRoutes);
app.get('/', (req, res) => {
    res.status(200).send('API funcionando!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
