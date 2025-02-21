const { uploadMediaCloudinary } = require('../utils/cloudinary');
const logger = require('../utils/logger');
const Media = require('../modells/Media');
const {deleteMediaCloudinary} = require('../utils/cloudinary')
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

// Fetch media
const getMedia = async(req,res)=>{
    logger.info('Getting media ...');
    try {
        
        const result =  await Media.find({});

        if(!result){
           return res.status(400).json({
                success:false,
                message:"Cann't find any media"
            })
        }
        return res.status(200).json({
            success:true,
            message:"Fond media any media",
            result,
        })

    } catch (error) {
        logger.warn('Error fetching media failed',error);
        res.status(500).json({
            success:false,
            message:'Someting went wrong while fetching media..',
        })
    }
}

// Delete media

const delMedia = async(req,res)=>{
    logger.info('Media delete endpoint..')

    try {
        const imageTobeDeleted = req.params.id;

        const userId = req.user.userId;

        const media = await Media.findById(imageTobeDeleted);
        logger.info(`Media deleted from database: ${imageTobeDeleted}`);
        if(!media){
            return res.status(400).json({
                sucess : false,
                message : "Cann't find the media"
            })
        }

        //check if the media is uploaded by same user
        if (media.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized! You can only delete your own media.",
            });
        }

       const cloudinary =  await deleteMediaCloudinary(media.publicId);
        await Media.findByIdAndDelete(imageTobeDeleted);
        
        return res.status(200).json({
            success: true,
            message: "Media deleted successfully",
        });

        
    } catch (error) {
        logger.warn("error deleting",error);
        return res.status(500).json({
            sucess:false,
            messsage:"something went wrong"
        })
    }
}
module.exports= { uploadMedia,delMedia,getMedia };