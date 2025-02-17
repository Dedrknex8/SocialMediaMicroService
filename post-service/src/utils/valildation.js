const Joi =require('joi');

const validateCreatePost = (data) => {
    const schema = Joi.object({
        content: Joi.string().min(3).max(150).required(),
        
    });

    return schema.validate(data);
};


module.exports = { validateCreatePost}; // Export as an object