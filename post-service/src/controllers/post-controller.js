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
        
        const page = parseInt(req.query.page) ||1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page-1) * limit;

        const cacheKey = `posts:$(page):$(limit)`;
        const cachedKeys = await req.redisClient.get(cacheKey);

        if(cacheKey)

    } catch (error) {
        logger.error("error fetching posts",error);

        res.status(500).json({
            success:false,
            message: "Error fetching posts",
        })
    }
}

module.exports = { createPost,getallPost };