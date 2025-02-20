const {uploadMedia,delMedia} = require('../controllers/media-controller');
const multer = require('multer');
const express = require('express');
const { authenticateReq } = require('../middleware/auth-middleware');
const logger = require('../utils/logger');

const router = express.Router();

const upload = multer({
    storage : multer.memoryStorage(),
    limits : {
        fileSize : 5 * 1024 * 1024 //5mb
    }
}).single('file') //allow only one file at a time

router.post('/upload', authenticateReq, (req,res,next)=>{
    upload(req,res, function(err){
        if(err instanceof multer.MulterError){
            logger.error('Multer error while uploading',err);
            return res.status(400).json({
                success:false,
                message:'Multer has failed while uploading ',
                error:err.message,
                stack : err.stack
            })
        }else if(err){
            logger.warn('Unknow error while uploading',error);
            return res.status(400).json({
                success:false,
                message:'Unknow  has failed while uploading ',
                error:err.message,
                stack : err.stack
            })
        }


        if(!req.file){
            return res.status(400).json({
                success:false,
                message:'No file has selected for upload'
            })
        }
        next()
    })
},uploadMedia)

router.delete('/delete/:id',authenticateReq,delMedia)


module.exports = router;