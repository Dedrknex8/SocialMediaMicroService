const Search = require("../modells/Search");
const logger = require('../utils/logger')

async function handlePostCreated(event) {
    logger.info("herer handlePost")
    try {
      const newSearchPost = new Search({
        postId: event.postId,
        userId: event.userId,
        content: event.content,
        createdAt: event.createdAt,
      });
  
      await newSearchPost.save();
      logger.info(
        `Search post created: ${event.postId}, ${newSearchPost._id.toString()}`
      );
    } catch (e) {
      logger.error(e, "Error handling post creation event");
    }
};

async function handlePostDeleted(event){
  logger.info("Deleting post ..");
  try {
    
    await Search.findOneAndDelete({postId: event.postId})
    logger.info(`Post deleted sucessfully! postId : ${event.postId}` )
  } catch (e) {
      logger.error(e, "Error handling post deldetion event");
    }
}

module.exports = {handlePostCreated,handlePostDeleted};