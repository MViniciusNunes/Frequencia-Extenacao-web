// routes/api.js
const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const Encontro = require('../models/Encontro');

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

// ===== Rota de login =====
router.post('/login', async (req, res) => {
    try {
        const { usuario, senha } = req.body;

        // O Mongoose busca um documento que tenha exatamente esse usuário e senha
        const user = await Usuario.findOne({ usuario: usuario, senha: senha });

        if (user) {
            // Retorna os dados do usuário se encontrar
            return res.status(200).json({ id: user._id, nome: user.nome, usuario: user.usuario });
        } else {
            return res.status(401).json({ error: "Usuário ou senha incorretos" });
        }
    } catch (err) {
        return res.status(500).json({ error: "Erro interno no servidor: " + err.message });
    }
});

// ===== Rota para Criar Encontro (Frequência) =====
router.post('/encontros', async (req, res) => {
    try {
        const { codigo, nome, tipo, data, descricao } = req.body;
        
        // Cria o evento e deixa a lista de participantes vazia no início
        const novoEncontro = new Encontro({
            codigo,
            nome,
            tipo,
            data,
            descricao,
            participantes: [] 
        });
        
        await novoEncontro.save();
        res.status(201).json({ mensagem: "Encontro criado com sucesso!", encontro: novoEncontro });
    } catch (err) {
        res.status(500).json({ error: "Erro ao criar encontro: " + err.message });
    }
});

module.exports = router;