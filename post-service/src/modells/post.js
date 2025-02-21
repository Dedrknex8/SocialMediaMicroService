const mongoose = require('mongoose');

const postShema = new mongoose.Schema({
    user:{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required : true
    },
    content:{
        type:String,
        required:true,
    },
    mediaIds:[
        {        
        type : String,

        }
    ],
    createdAt : {
        type:Date,
        default:Date.now
    }
    },{timestamps : true});

//creating a post schema index
postShema.index({content: 'text'});
const Post = mongoose.model('Post',postShema);
module.exports = Post;