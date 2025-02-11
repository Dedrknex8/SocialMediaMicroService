const crypto = require('crypto');
const { required } = require('joi');
const jwt = require('jsonwebtoken');
const refershToken = require('../models/RefreshToken')

const generateToken = async(user)=>{
    const accessToken = jwt.sign({
        userId : user._id,
        username : user.username,
        role : user.role,
    },process.env.JWT_Secret,{
        expiresIn :'15m' //this will expire after 15Min
    })
    //REFRESH TOKEN GENRARTE TOKEN AFTER EXPIRY WIHTOUT HAVING TO LOG IN
    const refreshToken = crypto.randomBytes(40).toString('hex'); // this will create a token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate()+7);

    await RefershToken.create({
        token: refreshToken,
        user: user._id,
        expiresAt,
      });
    
    return {accessToken,RefreshToken}
}

module.exports =  {generateToken}   