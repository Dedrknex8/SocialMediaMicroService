

const logger = require('../utils/logger')
const {validateRegistration} = require('../utils/valildation');

//user registration

const registerUser = async(req,res)=>{
    logger.info('register endpoint hit'); //this will give log verytimner /register
    try {
        //validate schema

        const {} = validateRegistration(req.body);
        if(error){
            logger.warn('validation error',error.details[0].message);
            return res.status(400).json({
                sucess : false,
                message : error.details[0].message
            })
        }
    } catch (error) {
        
    }
}

//userLogin


//refersh token


//logout