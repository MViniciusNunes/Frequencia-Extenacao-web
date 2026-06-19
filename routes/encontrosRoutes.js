const express = require('express');
const router = express.Router();
const Encontro = require('../models/Encontro'); 
const Frequencia = require('../models/frequencias'); 
const { verificarToken, verificarAdmin } = require('../middlewares/auth'); 

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

router.delete('/encontros/:id', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const idDoEncontro = req.params.id;
        
        await Frequencia.deleteMany({ encontroId: idDoEncontro });
        
        await Encontro.findByIdAndDelete(idDoEncontro);
        
        res.status(200).json({ mensagem: "Encontro e histórico excluídos com sucesso!" });
    } catch (err) {
        res.status(500).json({ erro: "Erro ao excluir: " + err.message });
    }
});

module.exports = router;