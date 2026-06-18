const mongoose = require('mongoose');

const EncontroSchema = new mongoose.Schema({
    codigo: { 
        type: String, 
        required: true, 
        unique: true // Garante que cada encontro tenha um QR Code único
    },
    nome: { 
        type: String, 
        required: true 
    },
    tipo: { 
        type: String, 
        required: true,
        enum: ['Reunião', 'Adoração','Outro'] // Validação de tipos
    },
    data: { 
        type: Date, // Usar Date facilita filtrar encontros por período
        required: true 
    },
    descr: { 
        type: String 
    }
}, { timestamps: true }); // Adiciona automaticamente 'createdAt' e 'updatedAt'

module.exports = mongoose.model('Encontro', EncontroSchema);