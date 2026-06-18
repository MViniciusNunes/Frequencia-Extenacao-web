const express = require('express');
const router = express.Router();
const Frequencia = require('../models/frequencias');
const Usuario = require('../models/Usuario');
const Encontro = require('../models/Encontro'); // Apenas a versão correta, no singular

// ... (Mantenha o post /encontros e /frequencia normais)
// ===== Rota de Cadastro =====
router.post('/users', async (req, res) => {
    try {
        const { nome, email, usuario, senha } = req.body;
        const novoUsuario = new Usuario({ nome, email, usuario, senha });
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
            // CONFIRME SE A LINHA ABAIXO TEM O isAdmin: user.isAdmin
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

// Rota corrigida para não "zerar" a data
// Rota corrigida: Busca a data do encontro mesmo sem frequências registradas
router.get('/frequencias-completas', async (req, res) => {
    try {
        // 1. Busca todos os encontros para listar as datas
        const encontros = await Encontro.find();
        
        // 2. Busca as frequências (se houver alguma)
        const frequencias = await Frequencia.find()
            .populate('usuarioId', 'nome')
            .populate('encontroId', 'data'); 
        
        const formatado = {};
        
        // 3. Cria as "colunas" de data baseadas nos encontros que existem
        encontros.forEach(enc => {
            const dataString = enc.data;
            if (dataString && !formatado[dataString]) {
                formatado[dataString] = {};
            }
        });
        
        // 4. Preenche quem tem falta/presença
        frequencias.forEach(doc => {
            if (doc.encontroId && doc.usuarioId) {
                const dataString = doc.encontroId.data; 
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

// ===== Nova Rota para Atualizar Frequência Manualmente (Pelo Modal) =====
router.put('/atualizar-frequencia', async (req, res) => {
    try {
        const { nome, data, status } = req.body;
        
        // Procura os IDs corretos no banco baseados no nome e na data que o front-end mandou
        const usuario = await Usuario.findOne({ nome: nome });
        const encontro = await Encontro.findOne({ data: data });
        
        if (!usuario || !encontro) {
            return res.status(404).json({ erro: "Usuário ou Encontro não encontrado." });
        }
        
        // Salva ou atualiza a presença/falta no banco
        const registro = await Frequencia.findOneAndUpdate(
            { encontroId: encontro._id, usuarioId: usuario._id },
            { status: status },
            { new: true, upsert: true } // Upsert cria o registro se ele ainda não existir
        );
        
        res.status(200).json(registro);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ... (Mantenha o restante do arquivo intacto)
// GET: Buscar usuários para exibir no modal
router.get('/users', async (req, res) => {
    try {
        const usuarios = await Usuario.find({}, 'nome'); // Traz apenas os nomes para a lista
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ erro: err.message });
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

// ===== Rota para Deletar Usuário =====
// ===== Rota para Deletar Usuário (Com Exclusão em Cascata) =====
router.delete('/users/:id', async (req, res) => {
    try {
        const idDoUsuario = req.params.id;
        
        // 1. Limpeza: Busca e apaga TODAS as presenças/faltas atreladas a esse ID
        await Frequencia.deleteMany({ usuarioId: idDoUsuario });
        
        // 2. Exclusão: Apaga o documento principal do usuário
        await Usuario.findByIdAndDelete(idDoUsuario);
        
        res.status(200).json({ 
            mensagem: "Usuário e todo o seu histórico de frequências foram excluídos com sucesso!" 
        });
    } catch (err) {
        res.status(500).json({ erro: "Erro ao excluir: " + err.message });
    }
});

// ===== Rota: Marcar Presença pelo Aluno (Via Código) =====
router.post('/marcar-presenca', async (req, res) => {
    try {
        const { usuarioId, codigo } = req.body;
        
        // 1. Procura se existe algum encontro com esse código exato
        const encontro = await Encontro.findOne({ codigo: codigo });
        if (!encontro) {
            return res.status(404).json({ erro: "Código inválido ou encontro não encontrado." });
        }
        
        // 2. Se achar, marca a presença ('P') para este usuário neste encontro
        await Frequencia.findOneAndUpdate(
            { encontroId: encontro._id, usuarioId: usuarioId },
            { status: 'P' },
            { upsert: true, new: true } // Upsert cria o registro se não existir
        );
        
        res.status(200).json({ mensagem: "Presença confirmada com sucesso!" });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ===== Rota: Buscar Frequência Específica do Aluno =====
router.get('/minha-frequencia/:id', async (req, res) => {
    try {
        const usuarioId = req.params.id;
        // Puxa APENAS os registros que pertencem a este usuário, escondendo o resto
        const historico = await Frequencia.find({ usuarioId: usuarioId })
            .populate('encontroId', 'nome data'); 
            
        res.status(200).json(historico);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

module.exports = router;