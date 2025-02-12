const mongoose = require("mongoose");


const refreshTokenSchema = new mongoose.Schema({
    token:{
    type : String,
    requried : true,
    unique : true,
    },
    user: {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required:true
    },
    expiresAt : {
        type: Date,
        required : true
    }
},{timestamps: true});
console.log("error here");


refreshTokenSchema.index({expiresAt:1},{expiresAfterSeconds : 0});

const RefreshToken = mongoose.model('RefreshToken',refreshTokenSchema);

module.exports =   RefreshToken