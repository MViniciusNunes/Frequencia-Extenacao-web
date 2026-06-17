const express = require("express");

const app = express();

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("<h1>Página Inicial</h1><p>O servidor está funcionando!</p>");
});

app.listen(3000, () => {
console.log("Servidor iniciado");
});