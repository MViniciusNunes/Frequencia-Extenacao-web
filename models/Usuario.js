const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true },
    usuario: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    // Adicionamos a flag isAdmin. Por padrão, todo novo cadastro é um usuário comum.
    isAdmin: { type: Boolean, default: false } 
}, { timestamps: true }); 

module.exports = mongoose.model('Usuario', UsuarioSchema);