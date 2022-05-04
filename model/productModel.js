const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;


const ProductSchema = new mongoose.Schema({

    name: {
        type: String,
        required:true,
        unique:true
    },
    price: {
        type:Number,
        required:true
    },
    image:{
        type:String,
    },
    quentity:{
        type:Number,
        required:true,
    },
    discription:{
        type:String,
    },
    ownerId:{
        type: ObjectID,
        required: true,
        ref: 'User'
    }
    
})



const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;