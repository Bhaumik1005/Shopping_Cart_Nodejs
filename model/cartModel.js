const mongoose = require('mongoose');



const cartSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        // required:true,
        ref: 'User'
    },
    productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product',
            // required:true
    },
    productName:{
            type:String           
    },
    cartproductQuentity:{
            type:Number,
            required:true,
            min:1,
            default:1,
            immutable: true 
    },
    subTotal:{
        type:Number,
    },
    isDelete: {
        type:Boolean,
        enum:[true,false],
        default:false
    }
})



const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;