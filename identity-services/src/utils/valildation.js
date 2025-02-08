const Joi = require('joi');

const validateRegistration = (data) =>{
    const schema  = Joi.object({
        username : Joi.string().min(3).max(15).required(),
        email:Joi.string().email().required(),
        password: Joi.string().min(6).require()
    })

    return schema.validate(date); //this will validate the schema wd the data
}

module.exports = validateRegistration;