require('dotenv').config();
const express = require('express');
const app = express(); //invoke express
const cors = require('cors');
const mongoose = require('mongoose');
const connectTodb  = require('./database/db');
const logger = require('./utils/logger');


connectTodb();

//middleware
app.use(helmet());
app.use(cors);
app.use(express.json()); //this will parse json data

app.use((req,res,next)=>{
    logger.info(`Recived ${req.method} request to ${req.url}`)
    logger.info(`Request body, ${req.body}`)
    next();
})

