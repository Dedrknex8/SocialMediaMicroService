require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const helmet = require('helmet');
const cors = require('cors');
const mediaRoutes = require('./routes/media-router');
const errorhandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const connectTodb = require('../src/database/db');

const app = express();
const PORT=process.env.PORT || 3003

connectTodb();
//middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

//create redisClient
const redisClient = new Redis(process.env.REDIS_URI);

//middleware to log
app.use((req,res,next)=>{
    logger.info(`Recived ${req.method} request to ${req.url}`)
    logger.info(`Request body, ${req.body}`)
    next();
});


app.use('/api/media',mediaRoutes);

app.use(errorhandler);

app.listen(PORT,()=>{
    logger.info('Listing to port sucessFully')
});