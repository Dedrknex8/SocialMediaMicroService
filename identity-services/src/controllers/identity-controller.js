

    const user = require('../models/user');
    const logger = require('../utils/logger')
    const { validateRegistration,validateLogin } = require('../utils/valildation');
    const  generateToken  = require('../utils/generateToken');

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

                const {accessToken,refreshToken} = await generateToken(Newuser)
                
                res.status(200).json({
                    sucess: true,
                    message:"User registered succesfully",
                    accessToken,
                    refreshToken
                });
            
        } catch (error) {
            console.log(error);
            
            logger.error('Registration error occured',`${error}`);
            res.status(500).json({
                success:false,
                message: "Internal Server error"
            })
        }
    }

    //userLogin
    const loginUser = async (req, res) => {
        logger.info("Login endpoint hit!");
        try {
          const { error } = validateLogin(req.body);
          if (error) {
            logger.warn("Validation error", error.details[0].message);
            return res.status(400).json({
              success: false,
              message: error.details[0].message,
            });
          }
          const { email, password } = req.body;
          const User = await user.findOne({ email });
      
          if (!User) {
            logger.warn("Invalid user");
            return res.status(400).json({
              success: false,
              message: "Invalid credentials",
            });
          }
      
          // user valid password or not
          const isValidPassword = await User.comparePassword(password);
          if (!isValidPassword) {
            logger.warn("Invalid password");
            return res.status(400).json({
              success: false,
              message: "Invalid password",
            });
          }
      
          const { accessToken, refreshToken } = await generateToken(User);
      
          res.json({
            accessToken,
            refreshToken,
            userId: user._id,
          });
        } catch (e) {
          logger.error("Login error occured", e);
          res.status(500).json({
            success: false,
            message: "Internal server error",
          });
        }
      };

    //refersh token


    //logout

    module.exports = {registerUser,loginUser}