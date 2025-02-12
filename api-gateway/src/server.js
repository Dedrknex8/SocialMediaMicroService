require('dotenv').config();
const express = require('express');
const Redis = require('ioredis');
const helmet = require('helmet');
const cors = require('cors');
const {rateLimit} = require('express-rate-limit');
const {redisStore} = require('rate-limit-redis');
const logger = require('./utils/logger');
const proxy = require('express-http-proxy');
const app = express();
const PORT = process.env.PORT;

const redisClient = new Redis(process.env.REDIS_URL);

app.use(helmet());
app.use(cors());
app.use(express.json()); // JSON PARSER 

//rate limiting
const rateLimite = nrateLimit({
    windowMs: 15 * 60*1000, //15min
    max:100,//max no of req
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

app.use(rateLimit);

//login middleware
app.use((req,res,next)=>{
    logger.info(`Recived ${req.method} request to ${req.url}`)
    logger.info(`Request body, ${req.body}`)
    next();
});

// create proxy
const proxyOptions = {
    proxyReqPathResolver : (req)=>{
        return req.originalUrl.replace(/^\v1/,'api')
    },
    proxyErrorHandler : (err,res,next)=>{
        logger.error(`Proxy error ${err.message}`);
        res.status(500).json({
            success:false,
            message:`Internal Server Error err:${err.message}`
        })
    }
}

//setting proxy for identity service
app.use('/v1/auth',proxy(process.env.IDENTITY_SERVICE_URL,{
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts,srcReq)=>{
        proxyReqOpts.headers['Content-Type']="application/json"
        return proxyOptions;
    },
    userResDecorator: (proxyRes,proxy)

}));

