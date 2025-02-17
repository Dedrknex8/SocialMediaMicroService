const Post = require('../modells/post');
const logger = require('../utils/logger');
const {validateCreatePost} = require('../utils/valildation');
//create post
const createPost = async(req,res)=>{
    logger.warn('Creating post Endpoint hit!')
    
    try {
        const { error } = validateCreatePost(req.body);
        if (error) {
          logger.warn("create post error", error.details[0].message);
          return res.status(400).json({
            success: false,
            message: error.details[0].message,
          });
        }
    const { content,mediaIds } = req.body;
    const newnlyCreatedPost = new Post({
        user : req.user.userId,
        content,
        mediaIds:mediaIds || []
    })
    
    await newnlyCreatedPost.save();
    logger.info(`Post created sucessfully ${newnlyCreatedPost}`)
    res.status(201).json({
        success : true,
        message: 'Post created sucessfully'
    })
    } catch (error) {
        logger.warn(`error creating the post ${error}`);
        res.status(500).json({
            success : false,
            message:'Internal server error'
        })
    }

}
//getallPost
const getallPost = async(req,res)=>{
    logger.warn('Getting all post Endpoint hit!')
    try {
    const getPost = await Post.find({}); //this will get all the books        
    if(getPost?.length >0){
        logger.info("Posts found");
        res.status(200).json({
            success:true,
            message:"All post Found",
            data:getPost
        })
    }else{
        logger.info("Cannot find posts");
        res.status(400).json({
            success:false,
            message:"Cannt find any Post"
        })
    }
    } catch (error) {
        logger.warn(`error Getting the post ${error}`);
        res.status(500).json({
            success : false,
            message:'Internal server error'
        })
    }

}

module.exports = { createPost,getallPost };