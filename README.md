# Projeto API REST - Gerenciamento de Livros

Este projeto é uma API REST desenvolvida para gerenciar usuários, livros e categorias, permitindo operações de CRUD completas com autenticação e controle de permissões.

## Tecnologias Utilizadas
- Node.js
- Express
- JSON como banco de dados
- JWT para autenticação
- Swagger para documentação

## Funcionalidades

### Usuários
- Cadastro de usuários comuns e administradores.
- Login com geração de token JWT.
- Permissões diferenciadas para usuários e administradores.

### Livros
- Cadastro, listagem, atualização e exclusão de livros.
- Relacionamento com categorias.

### Categorias
- CRUD completo para categorias.

### Funcionalidades Adicionais
- Estatísticas sobre livros cadastrados.

## Rotas

### Instalação
**`GET /install`**  
Cria um usuário administrador padrão com as seguintes credenciais:
- **Usuário:** admin
- **Senha:** admin123

### Autenticação
- **`POST /login`**: Login e geração de token JWT.

### Usuários
- **`POST /users`**: Cadastro de usuário.
- **`PUT /users/:id`**: Atualização de dados do usuário (próprio ou por administradores).
- **`DELETE /users/:id`**: Exclusão de usuários não administradores (apenas por administradores).

### Livros
- **`GET /books`**: Listagem de livros com paginação.
- **`POST /books`**: Cadastro de livro.
- **`PUT /books/:id`**: Atualização de livro.
- **`DELETE /books/:id`**: Exclusão de livro.
- **`GET /books/statistics`**: Estatísticas sobre livros cadastrados.

### Categorias
- **`GET /categories`**: Listagem de categorias.
- **`POST /categories`**: Cadastro de categoria.
- **`PUT /categories/:id`**: Atualização de categoria.
- **`DELETE /categories/:id`**: Exclusão de categoria.

## Configuração

### Pré-requisitos
- Node.js instalado.
- Ferramenta de testes como Insomnia ou Postman.

### Passos para executar
1. Clone o repositório:
   git clone <URL_DO_REPOSITORIO>

2. Instale as dependências:
   npm install
 
3. Configure o arquivo `.env`:
   PORT=3000
   JWT_SECRET=sua_chave_secreta
   
4. Inicialize o projeto:
   npm start

5. Acesse a documentação Swagger em:
http://localhost:3000/docs


## Estrutura do Projeto
```
├── data/              # Arquivos JSON para persistência de dados
├── routes/            # Definição de rotas
├── middlewares/       # Middlewares personalizados
├── .env               # Configurações do projeto
├── README.md          # Documentação
└── app.js             # Ponto de entrada da aplicação
```



