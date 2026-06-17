// routes/api.js
const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');

// Criar novo usuário (Cadastro)
router.post('/users', async (req, res) => {
    try {
        const { nome, email, usuario, senha } = req.body;
        const novoUsuario = await Usuario.create({ nome, email, usuario, senha });
        res.status(201).json(novoUsuario);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// Listar todos os usuários
router.get('/users', async (req, res) => {
    try {
        const usuarios = await Usuario.find().select('-senha'); // Retorna tudo, exceto as senhas
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// Atualizar usuário
router.put('/:id', async (req, res) => {
    try {
        const { nome, email } = req.body;
        const usuarioAtualizado = await Usuario.findByIdAndUpdate(
            req.params.id, 
            { nome, email }, 
            { new: true }
        );
        res.json(usuarioAtualizado);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// Deletar usuário
router.delete('/:id', async (req, res) => {
    try {
        await Usuario.findByIdAndDelete(req.params.id);
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ===== Rota de login

router.post('/login', (req, res) => {
    const { usuario, senha } = req.body;

    const query = 'SELECT id, nome, usuario FROM users WHERE usuario = ? AND senha = ?';

    db.query(query, [usuario, senha], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Erro interno no servidor" });
        }

        if (results.length > 0) {
            return res.status(200).json(results[0]);
        } else {
            return res.status(401).json({ error: "Usuário ou senha incorretos" });
        }
    });
});


module.exports = router;