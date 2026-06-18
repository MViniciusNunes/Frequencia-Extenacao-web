const express = require('express');
const router = express.Router();
const Frequencia = require('../models/frequencias');
const Usuario = require('../models/Usuario');
const Encontro = require('../models/Encontro'); 

// ===== Rota de Cadastro / Criar Usuário =====
router.post('/users', async (req, res) => {
    try {
        // CORRIGIDO: Agora o backend aceita o 'isAdmin' que vem do Front-end
        const { nome, email, usuario, senha, isAdmin } = req.body;
        
        const novoUsuario = new Usuario({ 
            nome, 
            email, 
            usuario, 
            senha, 
            isAdmin: isAdmin || false 
        });
        
        await novoUsuario.save();
        res.status(201).json({ mensagem: "Usuário criado com sucesso!", id: novoUsuario._id });
    } catch (err) {
        res.status(500).json({ error: "Erro ao cadastrar: " + err.message });
    }
});

// ===== Rota de Login =====
router.post('/login', async (req, res) => {
    try {
        const { usuario, senha } = req.body;
        const user = await Usuario.findOne({ usuario: usuario, senha: senha });
        
        if (user) {
            return res.status(200).json({ 
                id: user._id, 
                nome: user.nome, 
                usuario: user.usuario,
                isAdmin: user.isAdmin 
            });
        } else {
            return res.status(401).json({ error: "Usuário ou senha incorretos" });
        }
    } catch (err) {
        return res.status(500).json({ error: "Erro interno no servidor: " + err.message });
    }
});

// ===== Rota: Buscar Frequências Completas (Relatório Admin) =====
router.get('/frequencias-completas', async (req, res) => {
    try {
        const encontros = await Encontro.find();
        const frequencias = await Frequencia.find().populate('usuarioId', 'nome').populate('encontroId');

        const formatado = {};

        encontros.forEach(enc => {
            const idStr = enc._id.toString();
            // Agora a chave principal é o ID do encontro, não a data!
            formatado[idStr] = {
                info: { data: enc.data, nome: enc.nome },
                alunos: {}
            };
        });

        frequencias.forEach(doc => {
            if (doc.encontroId && doc.usuarioId) {
                const idStr = doc.encontroId._id ? doc.encontroId._id.toString() : doc.encontroId.toString();
                const nome = doc.usuarioId.nome;

                if (formatado[idStr]) {
                    formatado[idStr].alunos[nome] = doc.status;
                }
            }
        });

        res.json(formatado);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ===== Rota para Atualizar Frequência Manualmente =====
router.put('/atualizar-frequencia', async (req, res) => {
    try {
        // Recebe o encontroId ao invés da data
        const { nome, encontroId, status } = req.body;

        const usuario = await Usuario.findOne({ nome: nome });
        const encontro = await Encontro.findById(encontroId);

        if (!usuario || !encontro) {
            return res.status(404).json({ erro: "Usuário ou Encontro não encontrado." });
        }

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

// ===== Rota para Criar Encontro =====
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

// ===== Rota: Marcar Presença pelo Aluno =====
router.post('/marcar-presenca', async (req, res) => {
    try {
        const { usuarioId, codigo } = req.body;
        const encontro = await Encontro.findOne({ codigo: codigo });
        if (!encontro) {
            return res.status(404).json({ erro: "Código inválido ou encontro não encontrado." });
        }
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

// ===== Rota: Buscar Frequência do Aluno =====
router.get('/minha-frequencia/:id', async (req, res) => {
    try {
        const usuarioId = req.params.id;
        const historico = await Frequencia.find({ usuarioId: usuarioId }).populate('encontroId', 'nome data'); 
        res.status(200).json(historico);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ===== Rota para Buscar Usuários Completos (Para Tabela Admin) =====
router.get('/users-full', async (req, res) => {
    try {
        // Retorna todos os campos EXCETO a senha
        const usuarios = await Usuario.find({}, '-senha');
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ===== Rota para Atualizar Usuário =====
router.put('/users/:id', async (req, res) => {
    try {
        const { nome, email, usuario, senha, isAdmin } = req.body;
        const atualizacao = { nome, email, usuario, isAdmin };
        
        if (senha) atualizacao.senha = senha;

        const usuarioAtualizado = await Usuario.findByIdAndUpdate(
            req.params.id,
            atualizacao,
            { new: true, runValidators: true }
        );

        if (!usuarioAtualizado) return res.status(404).json({ erro: "Usuário não encontrado." });

        res.status(200).json({ mensagem: "Usuário atualizado com sucesso!", usuario: usuarioAtualizado });
    } catch (err) {
        res.status(500).json({ error: "Erro ao atualizar: " + err.message });
    }
});

// ===== Rota para Deletar Usuário (Com Exclusão em Cascata) =====
router.delete('/users/:id', async (req, res) => {
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