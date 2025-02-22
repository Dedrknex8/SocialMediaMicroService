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
  }

module.exports = {handlePostCreated};