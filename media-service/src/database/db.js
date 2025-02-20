const mongoose = require('mongoose');
const logger = require('../utils/logger')
const connectTodb= async()=>{
     mongoose.connect(process.env.MONGO_URI).then(logger.info("conncted to db sucessfully")).catch((err)=>
        {logger.error("connection error",err);
    })
}

module.exports = connectTodb;