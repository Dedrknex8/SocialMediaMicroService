const mongoose = require('mongoose');
const argon2 = require('argon2');

const userSchema = new mongoose.Schema({
    username : {
        type : String,
        require : true,
        unique : true,
        trim: true,
    },
    email : {
        type : String,
        require : true,
        unique : true,
        trim: true,
        lowercase : true
    },
    password : {
        type : String,
        require : true,
        unique : true,
    },
    createdAt : {
        type : Date,
        default : Date.now
   },
   
},{timestamps:true});

//hash password method
userSchema.pre('save',async function(next){
    if(this.isModified('password')){
        try {
            this.password =  await argon2.hash(this.password)
        } catch (error) {
           return next(error);
        }
    }
});

userSchema.methods.comparePassword = async function(candidatePassword){
    try {
        return await argon2.verify(this.password,candidatePassword);
    } catch (error) {
        console.log(error);
        
    }
}
userSchema.index({username : 'text'});


    


module.exports = mongoose.model('user',userSchema);