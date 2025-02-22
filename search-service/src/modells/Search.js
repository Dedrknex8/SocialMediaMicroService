const mongoose = require('mongoose');


const searchPostSchema = new mongoose.Schema({
    postId : {
        type:String,
        required:true,
        unique:true,
    },
    userId : {
        type:String,
        required:true,
        unique:true,
    },
    content: {
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default: Date.now()
    }
},{timestamps:true}
);

searchPostSchema.index({content : 'text'});
searchPostSchema.index({createdAt : -1}); //-1 means desc order

const Search = mongoose.model('Search',searchPostSchema);

module.exports = Search;