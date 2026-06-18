const express = require('express');
const router = express.Router();
const Encontro = require('../models/Encontros'); // Ajuste o nome do arquivo conforme necessário
const Frequencia = require('../models/frequencias');
const Usuario = require('../models/Usuario');

// --- CRUD DE ENCONTROS ---
router.post('/encontros', async (req, res) => {
    try {
        const novoEncontro = await Encontro.create(req.body);
        res.status(201).json(novoEncontro);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// --- CRUD DE PRESENÇA (Salvar P, F, FJ) ---
router.post('/frequencia', async (req, res) => {
    try {
        const { encontroId, usuarioId, status } = req.body;
        
        // Se já existe, atualiza; se não, cria (upsert)
        const registro = await Frequencia.findOneAndUpdate(
            { encontroId, usuarioId },
            { status },
            { new: true, upsert: true }
        );
        res.status(200).json(registro);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// GET: Buscar usuários para exibir no modal
router.get('/users', async (req, res) => {
    try {
        const usuarios = await Usuario.find({}, 'nome'); // Traz apenas os nomes para a lista
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// No seu api.js (Servidor)
router.get('/frequencias-completas', async (req, res) => {
    try {
        const docs = await Frequencia.find()
            .populate('usuarioId', 'nome')
            .populate('encontroId', 'data'); 
        
        console.log("Total de documentos encontrados:", docs.length); // ADICIONE ISSO
        
        const formatado = {};
        // ... (resto do código)
        
        docs.forEach(doc => {
            if (doc.encontroId && doc.usuarioId) {
                // Converte para string YYYY-MM-DD para garantir compatibilidade
                const dataString = new Date(doc.encontroId.data).toISOString().split('T')[0];
                const nome = doc.usuarioId.nome;
                
                if (!formatado[dataString]) formatado[dataString] = {};
                formatado[dataString][nome] = doc.status;
            }
        });
        
        res.json(formatado);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});



module.exports = router;