require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const helmet = require('helmet');
const cors = require('cors');
const errorHanlder = require('./middleware/errorHandler')
const logger = require('./utils/logger');
const connectTodb = require('../src/database/db');
const { RateLimiterRedis } = require('rate-limiter-flexible');
const { connectRabbitMQ ,consumeEvent} = require('./utils/rabbitmq');
const searchRoutes = require('./routes/search-routes');
const {handlePostCreated} = require('./EventHandler/search-eventhandler');

const app = express();
const PORT = process.env.PORT || 3004;

connectTodb();
//middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
//create redisClient
const redisClient = new Redis(process.env.REDIS_URI);

app.use((req,res,next)=>{
    logger.info(`Recived ${req.method} request to ${req.url}`)
    logger.info(`Request body, ${req.body}`)
    next();
});

//DDOS PROTECTIOPN globaly

const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient, //which client
    keyPrefix: 'middleware', //which databse
    points: 100, // max req from one Ip
    duration:1 //max req in 1 second 
});
app.use((req,res,next)=>{
    rateLimiter.consume(req.ip).then(()=>next()).catch(()=>{
        logger.warn(`Rate limit exceed for ip : ${req.ip}`)
        res.status(429).json({
            success:false,
            message: "Please try again later hit limit exceeds"
        })
    })
});


app.use('/api/search', searchRoutes);



//Task create new area and for ip based filtering 
app.use(errorHanlder); // export as middleware not as object {errorhandler} X 

async function startServer(){
    try {
        
        logger.info('Subscribing to the event !!');
        await connectRabbitMQ();

        //consume the event
        await consumeEvent('post.created', handlePostCreated );
        app.listen(PORT,()=>{
            logger.info('Listing to port sucessFully')
        });
    } catch (error) {
        logger.error('Error starting the server');
        process.exit(1);
    }
}

startServer();

process.on("unhandledRejection", (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason.stack || reason}`);
});