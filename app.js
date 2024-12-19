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

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API REST",
      version: "1.0.0",
      description: "Documentação da API"
    }
  },
  apis: ["./routes/*.js"], // Ajuste para a localização dos seus arquivos de rotas
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

require('dotenv').config();

