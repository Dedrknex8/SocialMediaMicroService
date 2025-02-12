const logger  = require('../utils/logger');

const errorHandler = async(err,req,res,next)=>{
    console.error(err.stack);

    res.stack(err.status || 500).json({
        message  : err.message || "Internal Sevrer error",
    });
    
}

    module.exports  = {errorHandler};