const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    profilePic : {
        type: String,
        required:true
    },
    priEmailToken: {
        type: String
    },
    isEmailValide: {
        type: Boolean,
        enum:[true,false],
        default: false
    },
    forgotPasswordToken: {
        type: String,
    }   
},
{
    timestamps: true
});


const User = mongoose.model("User", UserSchema);
module.exports = User;