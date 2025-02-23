const Search = require('../modells/Search');
const logger = require('../utils/logger');

const searchPostController = async(req,res)=>{
    logger.info('Search endpoint hit ...')
    try {
        const {query} = req.query;

        if(!query){
            return res.status(400).json({
                success:false,
                message:"Query parameter is requried",
            });
        }

        const cacheKey = `posts:${query}`;
        const cachePosts = await req.redisClient.get(cacheKey)

        if(cachePosts){
            logger.info('Serving from cached result');
            const parsedPosts = JSON.parse(cachePosts);

            //if cache post data is empty,fetch from db
            if(parsedPosts.length === 0){
                logger.warn("cache data is empty, fetcghing from fresh result")
           
            }else {
                return res.json({
                    success: true,
                    result: parsedPosts,
                    message: "Content found (cached)",
                });
            }
        }

        //fetch from MongoDb if cache is not present
        const result = await Search.find(
            {
                $text: {$search : query},
            },
            {
                score: {$meta : "textScore"},
            },
        ).sort({ score : { $meta : "textScore"} }).limit(10);
        
        if(!result || result.length === 0){
            return res.status(401).json({
                success:false,
                message:"Can't find any content"
            });
        }

        //store result in cached in redis with time to live (600 seconds == 10 min)
        await req.redisClient.setex(cacheKey, 600, JSON.stringify(result));        
        return res.status(200).json({
            success:true,
            result,
            message:"Content Found",
        })
    } catch (error) {
        logger.error('Error while searching',error);
        return res.status(500).json({
            success:false,
            message:'Error while searching'
        })
    }
};




module.exports = { searchPostController };