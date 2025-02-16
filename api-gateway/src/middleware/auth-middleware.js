const logger = require("../utils/logger");
const jwt = require('jsonwebtoken');


const validateToken = (req,res,next)=>{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1]; // BEARE TOKEN

    if(!token){
        logger.warn('Authorization failed');
        return res.status(401).json({
            sucess:false,
            message:`Access attempt without valid token`
        })
    }

    jwt.verify(token,process.env.JWT_Secret,(err,user)=>{
        if(err){
            logger.warn('Token verification failed');
            return res.status(429).json({
                sucess:false,
                message:"Invalid token"
            })
        }
        req.user = user;
        next();
    }) 

}

module.exports = {validateToken};