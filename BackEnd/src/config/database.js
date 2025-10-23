const mongoose = require('mongoose');


const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI no está definido en las variables de entorno.");
        }
        
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        
        console.log(`MongoDB Conectado: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error de conexión a MongoDB: ${error.message}`);
        
        process.exit(1);
    }
};

module.exports = connectDB;