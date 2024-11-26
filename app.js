const express = require('express');
const cors = require('cors');
const connectDB = require("./config/db");
const cookieParser = require('cookie-parser');
const roleRoutes=require('./routes/roleRoutes')
const permissionRooutes=require('./routes/permissionRoutes')
const userRoutes = require('./routes/userRoutes');
const authRoutes=require('./routes/authRoutes')
const rateLimitMiddleware = require('./middleware/rateLimitMiddleware');
const logger = require('./utils/logger');
require('dotenv').config();

const app = express();
connectDB();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(rateLimitMiddleware);

app.use('/api',roleRoutes)
app.use('/api',permissionRooutes)
app.use('/api/users', userRoutes);
app.use('/api/auth',authRoutes)
app.get('/', (req, res) => {
    res.send('Welcome to the Node.js RBAC Example!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});
