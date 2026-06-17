const express = require('express');
const router = express.Router();
const db = require('../db');

// ===== Rota de usuários

router.post('/users', (req, res) => {
    const { nome, email, usuario, senha } = req.body;

    const query = 'INSERT INTO users (nome, email, usuario, senha) VALUES (?, ?, ?, ?)';
    db.query(query, [nome, email, usuario, senha], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).json({ id: result.insertId, nome, email, usuario });
    });
});

router.get('/users', (req, res) => {
    db.query('SELECT id, nome, email, usuario FROM users', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

router.put('/:id', (req, res) => {
    const { nome, email } = req.body;
    const { id } = req.params;
    db.query('UPDATE users SET nome = ?, email = ? WHERE id = ?', [nome, email, id], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ id, nome, email });
    });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM users WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).send(err);
        res.sendStatus(204);
    });
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