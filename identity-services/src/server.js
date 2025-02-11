require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const redis = require('ioredis');
const connectTodb  = require('./database/db');
const logger = require('./utils/logger');
const {RateLimiterRedis}  = require('rate-limiter-flexible');
const {rateLimit} = require('express-rate-limit');
const {RedisStore} = require('rate-limit-redis');
const routes = require('./routes/identity-router');
const {errorHandler}= require('./middleware/errorHandler')

const app = express(); //invoke express
app.use(express.json()); //this will parse json data

connectTodb();
const redisClient = new redis(process.env.REDIS_URI);


//middleware
app.use(helmet());
app.use(cors());

app.use((req,res,next)=>{
    logger.info(`Recived ${req.method} request to ${req.url}`)
    logger.info(`Request body, ${req.body}`)
    next();
})

//DDOS PROTECTIOPN

const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient, //which client
    keyPrefix: 'middleware', //which databse
    points: 10, // max req from one Ip
    duration:1 //max req in 1 second 
})

app.use((req,res,next)=>{
    rateLimiter.consume(req.ip).then(()=>next()).catch(()=>{
        logger.warn(`Rate limit exceed for ip : ${req.ip}`)
        res.status(429).json({
            success:false,
            message: "Please try again later hit limit exceeds"
        })
    })
})

//Ip based Rate limit for sensitive endpoints
const sensitiveEndpointRateLimiter = rateLimit({
    windowMs: 15 * 60*1000, //15min
    max:50,//max no of req
    standardHeaders:true, // rate limit info on headers
    legacyHeaders:false,
    handler: (req,res)=>{
        logger.warn(`Sensitive endPoint rate limit exceed for Ip : ${req.ip}`);
        res.status(429).json({
            success:false,
            message:"Rate limit execeeds try again Later!"
        })
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    })
})


//apply sensitiveEndpointLimiter to our orutes
app.use('/api/auth/register',sensitiveEndpointRateLimiter);

app.use('/api/auth', routes);

// Error handler
app.use(errorHandler)
const PORT = process.env.PORT || 2929
app.listen(PORT, ()=>{
    logger.info(`runnig on port ${PORT}`);
})

//unhandle pomise rejecetion

process.on(`unhandleRejection`, (reason,promise)=>{
    logger.error('unhandleRejection at',promise,"reason:",reason)
})
