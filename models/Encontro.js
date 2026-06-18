const mongoose = require('mongoose');

const EncontroSchema = new mongoose.Schema({
    codigo: { type: String, required: true, unique: true }, // Ex: "KS8596L"
    nome: { type: String, required: true }, // Ex: "Culto de Domingo"
    tipo: { type: String, required: true }, // Ex: "Culto", "Célula"
    data: { type: String, required: true },
    descricao: { type: String },
    
    // Relacionamento 1:N -> Um encontro tem vários participantes
    // Aqui vamos guardar os IDs dos usuários que lerem o QR Code
    participantes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario' 
    }]
}, { timestamps: true });

module.exports = mongoose.model('Encontro', EncontroSchema);