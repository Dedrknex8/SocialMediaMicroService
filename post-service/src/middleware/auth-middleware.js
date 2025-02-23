const logger = require('../utils/logger');

const authenticateReq = (req,res,next)=>{
    const userId = req.headers['x-user-id']

    if(!userId){
        logger.warn('Access attempted without userID');
        return res.status(401).json({
            sucess:false,
            message:'Authentication required Please log in to Continue'
        })

    }
    req.user = {userId};
    next()
}

module.exports = {authenticateReq};