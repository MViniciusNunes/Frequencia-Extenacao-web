const express = require('express');
const router = express.Router();
const Frequencia = require('../models/frequencias');
const Usuario = require('../models/Usuario');
const Encontro = require('../models/Encontro'); 

router.get('/frequencias-completas', async (req, res) => {
    try {
        const encontros = await Encontro.find();
        const frequencias = await Frequencia.find().populate('usuarioId', 'nome').populate('encontroId');

        const formatado = {};
        encontros.forEach(enc => {
            const idStr = enc._id.toString();
            formatado[idStr] = { info: { data: enc.data, nome: enc.nome }, alunos: {} };
        });

        frequencias.forEach(doc => {
            if (doc.encontroId && doc.usuarioId) {
                const idStr = doc.encontroId._id ? doc.encontroId._id.toString() : doc.encontroId.toString();
                const nome = doc.usuarioId.nome;
                if (formatado[idStr]) formatado[idStr].alunos[nome] = doc.status;
            }
        });
        res.json(formatado);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

router.put('/atualizar-frequencia', async (req, res) => {
    try {
        const { nome, encontroId, status } = req.body;
        const usuario = await Usuario.findOne({ nome: nome });
        const encontro = await Encontro.findById(encontroId);
        if (!usuario || !encontro) return res.status(404).json({ erro: "Usuário ou Encontro não encontrado." });

        const registro = await Frequencia.findOneAndUpdate(
            { encontroId: encontro._id, usuarioId: usuario._id },
            { status: status },
            { new: true, upsert: true }
        );
        res.status(200).json(registro);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

router.post('/marcar-presenca', async (req, res) => {
    try {
        const { usuarioId, codigo } = req.body;
        const encontro = await Encontro.findOne({ codigo: codigo });
        if (!encontro) return res.status(404).json({ erro: "Código inválido ou encontro não encontrado." });
        
        await Frequencia.findOneAndUpdate(
            { encontroId: encontro._id, usuarioId: usuarioId },
            { status: 'P' },
            { upsert: true, new: true } 
        );
        res.status(200).json({ mensagem: "Presença confirmada com sucesso!" });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

router.get('/minha-frequencia/:id', async (req, res) => {
    try {
        const usuarioId = req.params.id;
        const historico = await Frequencia.find({ usuarioId: usuarioId }).populate('encontroId', 'nome data'); 
        res.status(200).json(historico);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

module.exports = router;