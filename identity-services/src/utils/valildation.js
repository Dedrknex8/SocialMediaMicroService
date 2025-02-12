const Joi = require('joi');

const validateRegistration = (data) => {
    const schema = Joi.object({
        username: Joi.string().min(3).max(15).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
    });

    return schema.validate(data);
};
const validateLogin = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
    });

    return schema.validate(data);
};

module.exports = { validateRegistration, validateLogin}; // Export as an object