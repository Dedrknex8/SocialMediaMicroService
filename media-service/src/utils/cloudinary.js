const cloudinary = require('cloudinary').v2;
const logger = require('./logger');


cloudinary.config({
    cloud_name :process.env.CLOUD_NAME,
    api_key :process.env.API_KEY,
    api_secret : process.env.API_SECRET_KEY,
});

const uploadMediaCloudinary = (file)=> {
    return new Promise((resolve,reject)=>{
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type : 'auto' //detect automatically if img video

            },
            (error,result)=>{
                if(error){
                    logger.warn("Error uploading to cloudinary",error);
                    reject(error);
                }else{
                    resolve(result)
                }   
            }
        )
        uploadStream.end(file.buffer);
    })
}
const deleteMediaCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        logger.warn("Error deleting from Cloudinary", error);
        throw error;
    }
};

module.exports = { uploadMediaCloudinary,deleteMediaCloudinary };
