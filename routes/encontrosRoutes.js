const express = require('express');
const router = express.Router();
const Encontro = require('../models/Encontro'); 

router.post('/encontros', async (req, res) => {
    try {
        const { codigo, nome, tipo, data, descricao } = req.body;
        const novoEncontro = new Encontro({ codigo, nome, tipo, data, descricao, participantes: [] });
        await novoEncontro.save();
        res.status(201).json({ mensagem: "Encontro criado com sucesso!", encontro: novoEncontro });
    } catch (err) {
        res.status(500).json({ error: "Erro ao criar encontro: " + err.message });
    }
});

module.exports = router;