    const user = require('../models/user');
    const logger = require('../utils/logger')
    const { validateRegistration,validateLogin } = require('../utils/valildation');
    const  generateToken  = require('../utils/generateToken');
    const RefreshToken = require('../models/RefreshToken');

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
            userId: User._id,
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
        const userRefreshToken= async(req,res)=>{
          logger.info('Refresh Token endpoint hit')
          console.log("Hit sucess");
          
          try {
            const {refreshToken} = req.body;
            if(!refreshToken){
              logger.warn('refresh token missing');
              return res.status(400).json({
                sucess:false,
                message: "refresh token missing"
            });
          }
            //get the store token from this token
            const storeToken = await RefreshToken.findOne({token : refreshToken});

            if(!storeToken || storeToken.expiresAt < new Date()){
              logger.warn('Invalid or expire token');
              return res.status(400).json({
                sucess:false,
                message: "Token expired or Invalid"
            });
          }

            // find the user from this stored token
            const User = await user.findById(storeToken.user)

            if(!User){
              logger.warn('Invalid or expire token');
              return res.status(401).json({
                sucess:false,
                message: "User not found"
            });
            }

            //Generate new token
            const {accessToken : newaccessToken,refreshToken: newRefreshToken} = await generateToken(User)

            // delete the old token
            await RefreshToken.deleteOne({_id: storeToken._id})

            return res.status(200).json({
              sucess: true,
              messaage:"New token genrated successfully",
              accessToken : newaccessToken,
              refreshToken : newRefreshToken,

            })
            
          } catch (error) {
            logger.warn("Error getting the refresh token");
            res.status(500).json({
              success:false,
              message: "Internal Server error"
          })
          }
        }

      //logout
        const userLogout = async(req,res)=>{
          logger.info('Logout endpoint hit!');
          try {
            
            const {refreshToken} = req.body;
            if(!refreshToken){
              logger.warn("Invalid refresh token");
              res.status(400).json({
                success:false,
                message:"Invalid or wrong refershToken"
              })
            };

            //del the refresh token before logout

            await RefreshToken.deleteOne({token : refreshToken});
            res.status(200).json({
              sucess:true,
              message:'User logout sucessfully'
            })
          } catch (error) {
            logger.warn("Error getting the refresh token");
            res.status(500).json({
              success:false,
              message: "Internal Server error"
          });
          }    
        
        }
        
      // DeleteUser
      const deleteUser = async(req,res)=>{
        logger.info('Delete user endpoint hit!');

        
        try {
          const { userId }  = req.body;
          if(!userId){
            logger.warn("UserId is invalid or missing");
            return res.status(400).json({
              success:false,
              message:"userId is missing or invalid"
            })
          }    
  
          const User = await user.findById(userId);
  
          if(!User){
            logger.warn('cannot find user');
            return res.status(400).json({
              success:false,
              message:"can't find user or invalid user id"
            })
          }

          await user.findByIdAndDelete(userId);
          res.status(200).json({
            success:true,
            message:"User deleted sucessfully"
          });
          
        } catch (error) {
          logger.warn("Error Deleting the user",error);
          res.status(500).json({
            success:false,
            message: "Internal Server error"
        });
        }    
      }

      module.exports = {registerUser,loginUser,userRefreshToken,userLogout,deleteUser}