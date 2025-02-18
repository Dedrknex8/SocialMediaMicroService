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
    //invalid the cached keys and delete the cached when post is created
    await invalidPostCache(req,newnlyCreatedPost._id.toString())
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
// Invalid the cache
async function invalidPostCache(req,input){
    const keys = await req.redisClient.keys("posts:*");
    if(keys.length >0){
        await req.redisClient.del(keys);
    }
}
//getallPost
const getallPost = async(req,res)=>{
    logger.warn('Getting all post Endpoint hit!')
    try {
        
        const page = parseInt(req.query.page) ||1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page-1) * limit;

        const cacheKey = `posts:${page}:${limit}`;
        const cachedPosts = await req.redisClient.get(cacheKey);

        if(cachedPosts){
            logger.info('Serving from cached Posts')
            return res.json(JSON.parse(cachedPosts));
        }

        //if not present then search

        const posts = await Post.find({}).sort({createdAt:-1}).skip(startIndex).limit(limit);

        const totalNoOfPosts = await Post.countDocuments();
        if (startIndex >= totalNoOfPosts) {
            return res.json({ posts: [], message: "No more posts!" });
        }

        const result = {
            posts,
            current: page,
            totalPages : Math.ceil(totalNoOfPosts / limit),
            totalPosts: totalNoOfPosts,
        };
        
        await req.redisClient.setex(cacheKey,10, JSON.stringify(result));
        return res.json(result)
    } catch (error) {
        logger.error("error fetching posts",error);

        res.status(500).json({
            success:false,
            message: "Error fetching posts",
        })
    }
}

// Get single Post

const getSinglepost = async(req,res)=>{
   
   try{
    const postId = req.params.id;
    const cachedkey = `post:${postId}`;
    const cachedPost = await req.redisClient.get(cachedkey); // this will get the post to cached

    if(cachedPost){
        logger.info('Serving from cached Post')
        return res.json(JSON.parse(cachedPost));
    }

    const singlePost = await Post.findById(postId);

    if(!singlePost){
        return res.status(401).json({
            sucess:false,
            message:'No post available'
        })
    }

    // set the cached key
    await req.redisClient.setex(cachedPost,3600,JSON.stringify(singlePost));
    return res.status(200).json({
        sucess:true,
        message:`Post found with id ${postId}`,
        data:singlePost
    })
}catch(error){
    logger.warn('error getting the post',error);
    res.status(500).json({
        success:false,
        message: "Error fetching post",
    })
}

}

// delete post

const deletePost = async(req,res)=>{
    logger.info('Delete post endpoint hit');

    try {
        const deletePostId = req.params.id
        const postToBeDeleted = await Post.findByIdAndDelete(deletePostId)

        if(!postToBeDeleted){
            return res.status(400).json({
                sucess:false,
                message:'Cannot delete post with this id'
            })
        }

        
        // maybe decahed the value
        await req.redisClient.del(`post:${deletePostId}`);
        return res.status(200).json({
            success:true,
            message:'Post deleted sucessFully'
        })


        
    } catch (error) {
        logger.warn('Cannot delete post',error);
        res.status(500).json({
            success:false,
            message: "Error deleting posts",
        })
    }
}
module.exports = { createPost,getallPost,getSinglepost,deletePost};