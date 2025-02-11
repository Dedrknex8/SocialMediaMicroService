

const user = require('../models/user');
const logger = require('../utils/logger')
const { validateRegistration } = require('../utils/valildation');
const { generateToken }  = require('../utils/generateToken');

//user registration

const registerUser = async(req,res)=>{
    logger.info('register endpoint hit'); //this will give log everytime hit  /register
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
        const {username,password,email,} = req.body;

        let userExists = await user.findOne( {$or  : [{email},{username}]}); //check if user or email already present
        if(userExists){
            logger.warn("User already exits");
            return res.status(400).json({
                sucess:false,
                message: "User already exits"
            });
        }
            const Newuser = new user({username,email,password});
            await Newuser.save();
            logger.warn("User saved sucessfully",Newuser._id);

            const {accesstoken,refreshtoken} = await generateToken(Newuser)
            
            res.status(200).json({
                sucess: true,
                message:"User registered succesfully",
                accessToken,
                refreshToken
            });
           
    } catch (error) {
        logger.error('Registration error occured',`${error}`);
        res.status(500).json({
            success:false,
            message: "Internal Server error"
        })
    }
}

//userLogin


//refersh token


//logout

module.exports = {registerUser}