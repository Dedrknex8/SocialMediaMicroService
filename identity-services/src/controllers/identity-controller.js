

const user = require('../models/user');
const logger = require('../utils/logger')
const {validateRegistration} = require('../utils/valildation');
const { accessToken,refreshToken }  = require('../utils/generateToken');

//user registration

const registerUser = async(req,res)=>{
    logger.info('register endpoint hit'); //this will give log verytimner /register
    try {
        //validate schema

        const {error} = validateRegistration(req.body);
        if(error){
            logger.warn('validation error',error.details[0].message);
            return res.status(400).json({
                sucess : false,
                message : error.details[0].message
            })
        }
        const {email,password,username} = req.body;

        let userExists = await user.findOne( {$or  : [{emial},{username}]}); //check if user or email already present
        if(userExists){
            logger.warn("User already exits",error.details[0].message);
            res.status(400).json({
                sucess:false,
                message: "User already exits"
            });

            user = new user({username,email,password});
            await user.save();
            logger.warn("User saved sucessfully",user_id);
            
            const {accesstoken,refreshtoken} = await generateToken(user)
            
            res.status(200).json({
                sucess: true,
                message:"User registered succesfully",
                accessToken,
                refreshToken
            });
        }   
    } catch (error) {
        logger.error('Registration error occured');
        res.status().json({
            success:false,
            message: "Internal Server error"
        })
    }
}

//userLogin


//refersh token


//logout

module.exports = {registerUser}