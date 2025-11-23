const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes/index'); // Importa as rotas que criamos acima

const app = express();

// Middlewares Globais
app.use(cors());
app.use(express.json());

// Rota para servir os arquivos estáticos (fotos dos comprovantes)
// Ex: http://localhost:3333/uploads/nome-do-arquivo.jpg
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Usar as rotas
app.use(routes);

// Iniciar servidor
const PORT = 3333;
app.listen(PORT, () => {
    console.log(`Server rodando na porta ${PORT} 🚀`);
});