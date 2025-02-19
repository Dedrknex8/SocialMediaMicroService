require('dotenv').config();
const express = require('express');
const Redis = require('ioredis');
const helmet = require('helmet');
const cors = require('cors');
const {rateLimit} = require('express-rate-limit');
const {RedisStore} = require('rate-limit-redis');
const logger = require('./utils/logger');
const proxy = require('express-http-proxy');
const {errorHandler} = require ('./middleware/errorhandler');
const { log } = require('winston');
const { validateToken } = require('./middleware/auth-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

const redisClient = new Redis(process.env.REDIS_URL);

app.use(helmet());
app.use(cors());
app.use(express.json()); // JSON PARSER 

//rate limiting
const rateLimitOptions = rateLimit({
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

app.use(rateLimitOptions);

//login middleware
app.use((req,res,next)=>{
    logger.info(`Recived ${req.method} request to ${req.url}`)
    logger.info(`Request body, ${req.body}`)
    next();
});

// create proxy
const proxyOptions = {
    proxyReqPathResolver: (req) => {
         return req.originalUrl.replace(/^\/v1/, '/api'); //this will replace api with v1 and new path as with port 3001
        // console.log("🔹 Proxying request to:", newPath);
        // return newPath;
    },      
    proxyErrorHandler : (err,res,next)=>{
        console.log(err);
        
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
        return proxyReqOpts;
    },
    userResDecorator: (proxyRes,proxyResData,userReq,userRes)=>{
        logger.info(`Response recived from Identity service: ${proxyRes.statusCode} `);
        // console.log("Something wrong here");
    return proxyResData;

    },
}));

app.use(errorHandler);

//Setting up proxy for post service
app.use('/v1/post',validateToken,proxy(process.env.POST_SERVICE_URL,{
    ...proxyOptions,
    proxyReqOptDecorator : (proxyReqOpts,srcReq)=>{
        proxyReqOpts.headers['Content-Type'] = "application/json";
        proxyReqOpts.headers['x-user-id'] = srcReq.user.userId; // for post service auth middleware
        return proxyReqOpts; 
    },
    userResDecorator: (proxyRes,proxyResData,userReq,userRes)=>{
        logger.info(`Response recived from POST service: ${proxyRes.statusCode} `);
        // console.log("Something wrong here");
    return proxyResData;
    },
    
})),




app.listen(PORT,()=>{
    logger.info(`API GATEWAY IS RUNNIN ON PORT ${PORT} `);
    logger.info(`Identity service is running on ${process.env.IDENTITY_SERVICE_URL} `);
    logger.info(`POST service is running on ${process.env.POST_SERVICE_URL} `);
    
})