const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); 
const { verificarToken, verificarAdmin } = require('../middlewares/auth'); 

const Usuario = require('../models/Usuario');
const Frequencia = require('../models/frequencias');

router.post('/login', async (req, res) => {
    try {
        const { usuario, senha } = req.body;
        const user = await Usuario.findOne({ usuario: usuario, senha: senha }); 
        
        if (user) {
            const token = jwt.sign(
                { id: user._id, isAdmin: user.isAdmin }, 
                process.env.JWT_SECRET || 'senha_provisoria_agape', 
                { expiresIn: '12h' } 
            );

            return res.status(200).json({ 
                id: user._id, 
                nome: user.nome, 
                usuario: user.usuario, 
                isAdmin: user.isAdmin,
                token: token 
            });
        } else {
            return res.status(401).json({ error: "Usuário ou senha incorretos" });
        }
    } catch (err) {
        return res.status(500).json({ error: "Erro interno no servidor: " + err.message });
    }
});

router.get('/users-full', async (req, res) => {
    try {
        const usuarios = await Usuario.find({}, '-senha');
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

router.post('/users', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { nome, email, usuario, senha, isAdmin } = req.body;
        const novoUsuario = new Usuario({ nome, email, usuario, senha, isAdmin: isAdmin || false });
        await novoUsuario.save();
        res.status(201).json({ mensagem: "Usuário criado com sucesso!", id: novoUsuario._id });
    } catch (err) {
        res.status(500).json({ error: "Erro ao cadastrar: " + err.message });
    }
});

router.put('/users/:id', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { nome, email, usuario, senha, isAdmin } = req.body;
        const atualizacao = { nome, email, usuario, isAdmin };
        if (senha) atualizacao.senha = senha;

        const usuarioAtualizado = await Usuario.findByIdAndUpdate(req.params.id, atualizacao, { new: true, runValidators: true });
        if (!usuarioAtualizado) return res.status(404).json({ erro: "Usuário não encontrado." });
        res.status(200).json({ mensagem: "Usuário atualizado com sucesso!", usuario: usuarioAtualizado });
    } catch (err) {
        res.status(500).json({ error: "Erro ao atualizar: " + err.message });
    }
});

router.delete('/users/:id', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const idDoUsuario = req.params.id;
        await Frequencia.deleteMany({ usuarioId: idDoUsuario });
        await Usuario.findByIdAndDelete(idDoUsuario);
        res.status(200).json({ mensagem: "Usuário e histórico excluídos com sucesso!" });
    } catch (err) {
        res.status(500).json({ erro: "Erro ao excluir: " + err.message });
    }
});

module.exports = router;