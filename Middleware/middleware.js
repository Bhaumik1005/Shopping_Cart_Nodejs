const Joi = require('joi');
const express = require("express");
const app = express();

app.use(express.json());


//User-defined function to validate the user
exports.validateUserData = function validateUserData(req, res, next){
    
        const schema = Joi.object({
      
            name: Joi.string()
                  .min(2)
                  .max(30)
                  .required()
            ,
                    
            email: Joi.string()
                .trim()
                .email({minDomainSegments: 2,tlds: { allow: ['com', 'net','in', 'cloud'] }})
                .required()
            , 
             
            password: Joi.string()
                .min(8)
                .max(15)
                .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
                .required()
            ,

            age: Joi.number()
                .min(18)
                .max(50)
                .required()
            ,

            phoneNumber: Joi.string()
                .max(10)
                .pattern(/[7-9]{1}[0-9]{9}/)
                .required()
            ,
            // profilePic : Joi.image()
               
            // ,
            isEmailValide: Joi.boolean()
            .default(false)
});

const{name,email,password,age,phoneNumber,isEmailValide} = req.body;

const {error} = schema.validate({name,email,password,age,phoneNumber,isEmailValide});



    if(error){
        res.status(500).json({    
            message: " Invalide Data",
            data: [error.details[0].message]});
    }else{
        return next();
    }

} 


exports.validateUserLogin = function validateUserLogin(req, res, next){


    const schema = Joi.object({

                
        email: Joi.string()
            .trim()
            .email({minDomainSegments: 2,tlds: { allow: ['com', 'net','in', 'cloud'] }})
            .required()
        , 
         
        password: Joi.string()
            .min(8)
            .max(15)
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
            .required()
        ,
    })


    const{email,password} = req.body;

    const {error} = schema.validate({email,password});


    if(error){  
        res.status(500).json({    
        message: " Invalide Data",
        data: [error.details[0].message]});
    }else{
        return next();
    }
}


exports.validateResetPass = function validateResetPass(req,res, next){
    const schema = Joi.object({

        password: Joi.string()
            .min(8)
            .max(15)
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
            .required()
        ,
    })


    const{password} = req.body;

    const {error} = schema.validate({password});


    if(error){  
        res.status(500).json({    
        message: " Invalide Data",
        data: [error.details[0].message]});
    }else{
        return next();
    }
}


exports.validateUpdateData = function validateUpdateData(req, res, next){


    const schema = Joi.object({

                
        name: Joi.string()
                .min(2)
                .max(30)
                .required()
            ,
        age: Joi.number()
                .min(18)
                .max(50)
                .required()
                ,

        phoneNumber: Joi.string()
                .max(10)
                .pattern(/[7-9]{1}[0-9]{9}/)
                .required(),

        profilePic: Joi.string()
            .required()
                
    })


    const{name,age,phoneNumber,profilePic} = req.body;

    const {error} = schema.validate({name,age,phoneNumber,profilePic});


    if(error){  
        res.status(500).json({    
        message: " Invalide Data",
        data: [error.details[0].message]});
    }else{
        return next();
    }
}


exports.validateAddProduct = function validateAddProduct(req, res,next){
    const schema = Joi.object({

                
        name: Joi.string()
                .min(2)
                .max(30)
                .required()
            ,
        price: Joi.number()
                .required()
        ,
        quentity: Joi.number()
                .required()
                .min(1)
        ,
        discription:Joi.string()        
        ,
        ownerId: Joi.string(),
            required:true
                
    })


    const{name,price,quentity,discription,ownerId} = req.body;

    const {error} = schema.validate({name,price,quentity,discription,ownerId});


    if(error){  
        res.status(500).json({    
        message: " Invalide Data",
        data: [error.details[0].message]});
    }else{
        return next();
    }
}


exports.validateUpdateProduct = function validateUpdateProduct(req, res,next){
    const schema = Joi.object({

                
        name: Joi.string()
                .min(2)
                .max(30)
                
            ,
        price: Joi.number()               
        ,
        quentity: Joi.number()
                .min(1)
        ,
        discription:Joi.string(),    
        // productId: Joi.string()
        //     .required()        
    })


    const{name,price,quentity,discription} = req.body;

    const {error} = schema.validate({name,price,quentity,discription});


    if(error){  
        res.status(500).json({    
        message: " Invalide Data",
        data: [error.details[0].message]});
    }else{
        return next();
    }
}