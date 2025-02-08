const mongoose = require("mongoose");

const mongoose = requrie('mongoose');

const refreshTokenSchema = new mongoose.Schema({
    token:{
    type : String,
    requrie : true,
    unique : true,
    },
    User: {
        type : mongoose.Schema.types.ObjectId,
        ref : User
    },
    expiresAt : {
        type: Date,
        required : true
    }
},{timeStamps: true});

refreshTokenSchema.index({expiresAt:1},{expiresAfterSeconds : 0});

const refershToken = mongoose.model('RefreshToken',refreshTokenSchema);

module.exports(refershToken);