const express = require('express');
const router = express.Router();
const db = require('../db');

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

router.put('/:id', (req, res)=>{
    const {nome, email} = req.body; 
    const {id} = req.params;
    db.query('UPDATE users SET nome = ?, email = ? WHERE id = ?', [nome, email, id], (err) =>{
        if(err) return res.status(500).send(err);
        res.json({id, nome, email}); 
    });
});

router.delete('/:id', (req, res) =>{
    const {id} = req.params;
    db.query('DELETE FROM users WHERE id = ?', [id], (err)=>{
        if(err) return res.status(500).send(err);
        res.sendStatus(204);
    });
});

module.exports = router;