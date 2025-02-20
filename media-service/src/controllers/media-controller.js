const { uploadMediaCloudinary } = require('../utils/cloudinary');
const logger = require('../utils/logger');
const Media = require('../modells/Media');

const uploadMedia = async(req,res)=>{
    logger.info('Upload Media Endpoint hit');
    try {

        if(!req.file){
            logger.error('No file present');
            res.status(400).json({
                success:false,
                message:'No file to upload. Please upload any file',
            })
        }

        const {originalName,mimeType,buffer} = req.file
        const userId = req.user.userId; //userId will gfet from authentication
        

        logger.info(`file details : originalName=${originalName},type=${mimeType}`);
        logger.info('Uploading to cloudinary started ...');

        //save it to media file
        const cloudinaryUploadResult = await uploadMediaCloudinary(req.file);
        logger.info(`Cloudinary upload successfull.PublicId: ${cloudinaryUploadResult.public_id}`);

        const newlyCreatedMedia = new Media({
            publicId : cloudinaryUploadResult.public_id,
            originalName,
            mimeType,
            url: cloudinaryUploadResult.secure_url,
            userId
        })

        await newlyCreatedMedia.save();

        res.status(200).json({
            sucess:true,
            message:'Media uploaded sucesssfully',
            mediaId: newlyCreatedMedia._id,
            url: newlyCreatedMedia.url,

        })

    } catch (error) {
        logger.warn('Upload media failed',error);
        res.status(500).json({
            success:false,
            message:'Someting went wrong while uploading media..',
        })
    }
}

module.exports= { uploadMedia };