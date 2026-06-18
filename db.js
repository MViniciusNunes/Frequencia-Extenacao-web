const mongoose = require('mongoose');

const conectarDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            family: 4 
        });
        
        console.log('Conectado ao MongoDB Atlas com sucesso (via .env).');
    } catch (err) {
        console.error('Erro ao conectar ao MongoDB:', err.message);
        process.exit(1); 
    }
};

module.exports = conectarDB;