const logger = require('../utils/logger');
const rateLimit = require('express-rate-limit');
const { RateLimiterRedis } = require('rate-limiter-flexible');
const {RedisStore} = require('rate-limit-redis');
const Redis = require('ioredis');
const redisClient = new Redis(process.env.REDIS_URL);

const createPostRateLimit = rateLimit({
    storeClient: redisClient,
    keyPrefix:'create-post',
    points:10, //MAX 10 REQ PER IP
    duration:1, //MEANS PER SECOND

});

const createPostRateLimitMiddleware = (req,res,next) =>{
    createPostRateLimitMiddleware.consume(req.ip).then(()=> next()).catch(()=>{
        logger.warn(`Create post rate limit exceeded for IP : ${req.ip}`)
        res.status(429).json({
            sucess:false,
            message:"Too many request. Please wait for a moment"
        })
    }) //this will take the ip

}

//Get post rate limiter for both the post
const getPostLimiter = rateLimit({
    windowMs: 60*100, //1Min
    max:100, //100 req per user for testing (change it for situation)
    standardHeaders:true,
    legacyHeaders:false,
    handler:(req,res)=>{
        logger.warn(`Get post rate limit exceeded for IP:${req.ip}`);
        res.status(429).json({
            success:false,
            message:"Too mant req.Try again later"
        });
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    })
    
})

/* const sensitiveEndpointRateLimiter = rateLimit({
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
}) */

module.exports = { createPostRateLimit,getPostLimiter };