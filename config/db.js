const mongoose = require("mongoose");
const logger = require('../utils/logger');
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
        });
        logger.info('MongoDB connected successfully');
        console.log("MongoDB Connected...");
    } catch (err) {
        logger.error(`MongoDB connection error: ${err.message}`);
        process.exit(1); 
    }
};
module.exports = connectDB;
