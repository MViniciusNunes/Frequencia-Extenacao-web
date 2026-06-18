const mongoose = require('mongoose');

const FrequenciaSchema = new mongoose.Schema({
    encontroId: { type: mongoose.Schema.Types.ObjectId, ref: 'Encontro', required: true },
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    status: { type: String, enum: ['P', 'F', 'FJ'], default: 'P' }
},{ timestamps: true });

module.exports = mongoose.model('Frequencia', FrequenciaSchema);