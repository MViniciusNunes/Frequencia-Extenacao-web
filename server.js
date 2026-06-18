require('dotenv').config();
const express = require("express");
const conectarDB = require("./db");

const app = express();

app.use(express.json());
app.use(express.static("public"));

conectarDB();

app.get("/", (req, res) => {
  res.send("<h1>Página Inicial</h1><p>O servidor está funcionando!</p>");
});

const usuariosRoutes = require('./routes/usuariosRoutes');
const encontrosRoutes = require('./routes/encontrosRoutes');
const frequenciasRoutes = require('./routes/frequenciasRoutes');

app.use('/api', usuariosRoutes);
app.use('/api', encontrosRoutes);
app.use('/api', frequenciasRoutes);

// Depois
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});