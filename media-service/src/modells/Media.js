const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    publicId :{
        type:String,
        required: true,
    },
    originalName : {
        type : String,
        requied : true,
    },
    MimeType : {
        type : String,
        requied : true,
    },
    url : {
        type : String,
        requied : true,
    },
    userId : {
        type  : mongoose.Types.ObjectId,
        ref : 'user',
        required:true,
    }
},{timestamps:true});

const Media = mongoose.model('Model',mediaSchema);

module.exports = Media;