const Media = require("../modells/Media");
const { deleteMediaCloudinary } = require("../utils/cloudinary");
const logger = require('../utils/logger');
const handlerPostDeleted = async(event)=>{
console.log(event,"eventevent");

const {postId,mediaIds} = event;
try {
    const mediaTodelete = await Media.find({_id : {$in: mediaIds}}); //this will give post id

    for(const media of mediaTodelete){
        await deleteMediaCloudinary(media.publicId);
        await Media.findByIdAndDelete(media._id);
        
        logger.info(`Deleted media ${media._id} associated with this post:${postId  }`);
        logger.info('Meida deleted process completed')
    }

} catch (error) {
    logger.error('Error ocuuredd while deletion');
}

};

module.exports =  {handlerPostDeleted};