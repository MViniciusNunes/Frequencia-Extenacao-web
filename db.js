const mongoose = require('mongoose');
const dns = require('dns'); // Importa o módulo de rede do Node.js

// Força o Node.js a pesquisar a URL usando IPv4 primeiro
dns.setDefaultResultOrder('ipv4first');

const conectarDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            family: 4 // Força a conexão final também em IPv4
        });
        
        console.log('Conectado ao MongoDB Atlas com sucesso.');
    } catch (err) {
        console.error('Erro ao conectar ao MongoDB:', err.message);
        process.exit(1); 
    }
};

module.exports = conectarDB;