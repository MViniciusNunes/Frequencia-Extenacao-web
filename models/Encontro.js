const mongoose = require('mongoose');

const EncontroSchema = new mongoose.Schema({
    codigo: { type: String, required: true, unique: true }, 
    nome: { type: String, required: true }, 
    tipo: { type: String, required: true }, 
    data: { type: String, required: true },
    descricao: { type: String },

    participantes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario' 
    }]
}, { timestamps: true });

module.exports = mongoose.model('Encontro', EncontroSchema);