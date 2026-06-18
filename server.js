require('dotenv').config();
const express = require("express");
const conectarDB = require("./db");

const app = express();

app.use(express.json());
app.use(express.static("public"));

// Inicializa o banco de dados
conectarDB();

app.get("/", (req, res) => {
  res.send("<h1>Página Inicial</h1><p>O servidor está funcionando!</p>");
});

const apiRoutes = require('./routes/api'); 
app.use('/api', apiRoutes);

// Depois
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});