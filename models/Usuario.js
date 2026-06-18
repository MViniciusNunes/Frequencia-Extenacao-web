const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true },
    usuario: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    isAdmin: { type: Boolean, default: false } 
}, { timestamps: true }); 

module.exports = mongoose.model('Usuario', UsuarioSchema);