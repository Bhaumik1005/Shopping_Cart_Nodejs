const mongoose = require('mongoose');


const purchaseSchema = new mongoose.Schema({


    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    user:{
        type:Object
    },
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Cart'
    },
    address:{
        type:String,
        // required:true
    },
    subTotal:{
        type:Number,
    },
    cartproductQuentity:{
        type:Number
    },
    paymentStatus:{
        type: Boolean,
        enum:[true,false],
        default: false
    },
    purchaseItem:{
        type:Object
    }
})


const Purchase = mongoose.model("Purchase", purchaseSchema);
module.exports = Purchase;