const express = require("express");
const userModel = require("../model/UserModel");
const productModel = require("../model/productModel");
const cartModel = require("../model/cartModel");
const purchaseModel = require("../model/purchaseModel")
const app = express();
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require('path');
const jwt = require('jsonwebtoken'); //For JSON Webtoken
const passport = require("passport"); //Authentication Middleware
const passportJWT = require("passport-jwt"); //Authentication for JWT token 
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy; //For using JWT Strategy
const mongoObjectId = require('mongodb');
const { error } = require("console");
const bcrypt = require("bcrypt");
let multer = require('multer');
const fs = require('fs');


let jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); //Accept the request & return JWT
jwtOptions.secretOrKey = 'mysecretkey'; //For Secrate Key




// Passportjs JWT Strategy
let strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
    console.log('payload received', jwt_payload);
    // let user = users[_.findIndex(users, { id: jwt_payload.id })];

    userModel.findOne({ id: jwt_payload._id }, function(err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            next(null, user);
        } else {
            next(null, false);
        }
    })
});

passport.use(strategy);
app.use(passport.initialize());
app.set('view engine', 'ejs');




//For Upload User ProfilePic
exports.uploadProfile = async function uploadProfile(req,res){
    
    var img = fs.readFileSync(req.file.path);
    console.log("img--------",img);
    var encode_img = img.toString('base64');
    console.log("encode--------",encode_img);
    var final_img = {
        contentType:req.file.mimetype,
        image:new Buffer.from(encode_img,'base64')
    };
    console.log("finalimg--------",final_img);

    if(final_img){
        res.send({
            message:"Image Uploaded Successfully",
            data: [],
            error:[error],
        })
    }else{
            res.send({
                message:"Image not Uploaded",
                error:[error]
            })
        }
        
}

// For Register User
exports.registerUser = async function registerUser(req, res) {
    
    try {
       
         let data = req.body;
         console.log(data);
        console.log('hie,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',req.body);
         let user = new userModel(req.body);
         console.log(user)
         let name = user.name;
         const RegisterEmail = user.email;

     let CheckEmail = await userModel.findOne({email: RegisterEmail})
     if(CheckEmail){
             res.send({
                 message:"Email already Register",
                 error: [error],
                 })
     }else{  

         // console.log(email);
         const priEmailToken = randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
         function randomString(length, chars) {
             let result = '';
             for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
            
             return result;
         }
         // console.log(priEmailToken);

         user.priEmailToken = priEmailToken
        
         // generate salt to hash password
         const salt = await bcrypt.genSalt(10);
       
         // now we set user password to hashed password
        password = await bcrypt.hash(user.password, salt);
         // console.log(password)
         user.password = password

         await user.save();



         let transporter = nodemailer.createTransport({
             service: 'gmail',
             auth: {
             user: 'bhaumikjoshi1052@gmail.com',
                 pass: 'ytfzekwoyuatxbzb'
             }

         });



         const data = await ejs.renderFile(path.join(__dirname, "../views/pages/validation.ejs"), { priEmailToken, name });
         // console.log(data);     
         
         let mailOptions = {

             from: 'bhaumikjoshi1052@gmail.com',
             to: RegisterEmail,
             subject: 'Validate User',
             text: 'Please Verify Your E-mail Id',
             html: data

         };
         transporter.sendMail(mailOptions, (err, info) => {
             if (err) {
                 console.log("ERRRRRR>>>>>>>>.", err);
                 return;
             }
             console.log("sent ", info.response);
         });


         console.log("Email Function Successfuly");
         return res.send(
             {
             message:"Succesfully Add User Data Please Verify your E-mail",
             error: error,
             Token: priEmailToken     
     });
     }
}
    catch (error) {
        console.log('errorrrr...................................',error);
        res.status(500).send({
            message:"Please Add Valid User Data...",
            error: error,            
         } );
    }
};



//  For Validate the user
exports.VerifyUserEmail = async function VerifyUserEmail(req, res) {
    try {

        console.log(req.params.priEmailToken);
        
        const EmailToken = await userModel.findOne({
            priEmailToken: req.params.priEmailToken
        });

        console.log(EmailToken);
        if (req.params.priEmailToken === EmailToken.priEmailToken) {

            let updateOne = await userModel.findOneAndUpdate({
                "_id": EmailToken._id
            }, {
                $set: { isEmailValide: true }
            });

            console.log("updateOne====>>", updateOne)

            if(updateOne){
                await userModel.findOneAndUpdate(
                   { "_id": EmailToken._id}, {$set: { priEmailToken: ""}}
                ) 
            }else{
                console.log(error);
            }

            res.send({
                    message:"Succesfully Verify your E-mail",
                    error: error
                })

        }


    } catch (error) {
        res.status(500).send(error);
    }
};



//For Login User
exports.loginReq = async function loginReq(req, res) {

    try {

        const user = await userModel.findOne({
            email: req.body.email
        })
        console.log(user);

        if (user) {
            // check user password with hashed password stored in the database
            const validPassword = await bcrypt.compare(req.body.password, user.password);


            if (validPassword) {
                        if(user.isEmailValide === true){
                            let payload = { id: user._id };
                            // console.log(payload);
                            let token = jwt.sign(payload, jwtOptions.secretOrKey);
                            res.send({ 
                                message: "Login Successfully", 
                                Token: token,
                                error: error,       
                         });
                        }else {
                            res.status(401).send({ 
                                message: "Invalid Credentials or Verify Your E-mail",
                                error: error
                            });
                        }
            //   res.status(200).json({ message: "Valid password" });
            } else {
              res.status(400).json({ 
                  message: "Invalid Password",
                  error: error           
            });
            }
        } else {
            res.status(401).send({ 
                message: "User does not exist",
                error: error  
         });
        }
    } 
    catch (error) {
        console.log(error);
        return res.send(error);
    }
};



//For Forgot Password
exports.ForgotPassword = async function ForgotPassword(req, res) {
    try{
      
    const forgotemail = req.body.email;
    // console.log(forgotemail);
    let forgotPasswordToken = randomString(30, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
        function randomString(length, chars) {
            let result = '';
            for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
            
            return result;
        }
   
    let ftEmail = await userModel.findOne({
        email: forgotemail
    })
    ftEmail.forgotPasswordToken = forgotPasswordToken
    await ftEmail.save();

    // console.log(ftEmail);
    
    let ftemail = ftEmail.email;
    // console.log(ftemail);
        
    
    let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'bhaumikjoshi1052@gmail.com',
                pass: 'ytfzekwoyuatxbzb'
            }

        });

        const ftdata = await ejs.renderFile(path.join(__dirname, "../views/pages/forgot.ejs"),{forgotPasswordToken});
        console.log('===>',ftdata);

        let mailOptions = {

            from: 'bhaumikjoshi1052@gmail.com',
            to: ftemail,
            subject: 'Forgot Password',
            text: 'Please Forgot Your password',
            html: ftdata

        };


        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log("ERRRRRR>>>>>>>>.", err);
                return;
            }
            console.log("sent ", info.response);
        });

    
        console.log("Email Function Successfuly");
        return res.send({
            message:"Email Send Successfully. Please Forgot Your Password",
            error:[error],
            ForgotPasswordToken: forgotPasswordToken
        });
} 
    catch (error) {
        res.status(500).send(
            {error: error});
    }
    
}


exports.RstPassword = function RstPassword(req,res) {
    res.send("Reset Password Work");
}


//For Reset Your Password
exports.ResetPassword = async function ResetPassword(req,res) {

const frgotToken = await userModel.findOne({
    forgotPasswordToken: req.params.forgotPasswordToken
});
console.log(frgotToken);
const forgottoken = frgotToken.forgotPasswordToken;
console.log(forgottoken)


    let newPass = req.body.newpass;
    console.log(newPass);
    let conformnewPass = req.body.conformnewPass;
    console.log(conformnewPass);

    if(newPass === conformnewPass){
                // generate salt to hash password
                const salt = await bcrypt.genSalt(10);
       
                // now we set user password to hashed password
                newPassword = await bcrypt.hash(newPass, salt);
                
                const updatePass = await userModel.updateOne({forgotPasswordToken: req.params.forgotPasswordToken},{$set: {password: newPassword}});
                console.log("Reset Password Successfully");
                res.send({
                        message:"Reset Password Successfully",
                        error:[error]
                });
    }else{
        res.send(
            {
            message:"Conform Password & New Password are Not Same",
            error:[error]
            })

    }
}


//For Update User Profile
exports.UpdateProfile = async function UpdateProfile(req,res) {
    try {
        let authorization = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(authorization, "mysecretkey");
        console.log("Decode>>>", decoded);

        let userId = decoded.id;
        console.log("User ID", userId);
        // Fetch the user by id 
        const users = await userModel.findOne({
            _id: mongoObjectId.ObjectId(userId)
        })
        console.log(users);
        
        const userProfile = users._id;
        console.log(userProfile)
        let username = req.body.name;
        console.log(username);
        let age = req.body.age;
        console.log(age);
        let phoneNumber = req.body.phoneNumber;
        console.log(phoneNumber);


        let updateProfile = await userModel.updateOne({_id: userId},{$set: {name: req.body.name,age: req.body.age,phoneNumber:req.body.phoneNumber,profilePic:req.body.profilePic }  })

        let UpdatedProfile= await userModel.findOne({_id: userId},{name: true,age: true,phoneNumber:true,profilePic:true})
        console.log(updateProfile);
        res.send(
            {
              message: "Profile Update Successfully",
              error: [error],
              data: [UpdatedProfile]  
            }
            );
    } catch (error) {
        console.log(error);
        return res.status(401).send('unauthorized');
    }
}


// For Get UserData
exports.GetUserProfile = async function GetUserProfile(req, res) {

    try {
        let authorization = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(authorization, "mysecretkey");
        // console.log("Decode>>>", decoded);

        let userId = decoded.id;
        // console.log("User ID", userId);
        // Fetch the user by id 
        const users = await userModel.findOne({
            _id: mongoObjectId.ObjectId(userId)
        }, {name:true,email:true,age:true,phoneNumber:true,profilePic:true})

         users.profilePic = "http://localhost:9000/UploadProfile/"+users.profilePic;
        
        
        // console.log(userProfilePicwithurl);

        return res.send({
            message:"User Data",
            error: [error],
            data:[users]});
        
        // console.log(users);

    } catch (error) {
        console.log(error);
        return res.status(401).send({
            message: "Unauthorized User",
            error: [error]
        });
    }

}




//For Add Product
exports.AddProduct = async function AddProduct(req,res){
try{
    let authorization = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(authorization, "mysecretkey");
        // console.log("Decode>>>", decoded);

        let userId = decoded.id;
        console.log("User ID", userId);
       
        let data = new productModel(req.body);
        // console.log("Before",data);
        

        data.ownerId = userId;
        // console.log("After",data);

        await data.save();
        res.send({
            message:"Product Add Successfully",
            error:[error],
            data:[data]
        });
    }
        catch(error){
            res.send({
                message:"Please Add Unique ProductName This Name will Add Before You",
                error: error
            })
        }
}


//For Update Product
exports.updateProduct = async function updateProduct(req,res){
    try{
    let authorization = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(authorization, "mysecretkey");
        console.log("Decode>>>", decoded);

        let userId = decoded.id;
        console.log("User ID", userId);
        
        // Fetch the user by id 
        const product = await productModel.findOne({
            _id: mongoObjectId.ObjectId(req.body.productId)
        })
    
        if(product._id == req.body.productId){
        console.log(req.body.productId);
    
        let updateProduct = await productModel.updateOne({_id:req.body.productId},{$set:{name:req.body.name,price:req.body.price,quentity:req.body.quentity,discription:req.body.discription} })
    
        let UpdatedProduct = await productModel.findOne({_id: req.body.productId})
    
    
        console.log(updateProduct);
        res.send(
            {
              message: "Product Updated Successfully",
              error: [error],
              data: [UpdatedProduct]  
            }
            );
        }
}
    catch(error){
        console.log(error);
        return res.status(401).send({
            message:"unauthorized user or please add your valide product Id",
            error: [error]
            });
    }
    
    
}


//For Delete Product
exports.deleteProduct = async function deleteProduct(req, res){
    try{
        let authorization = req.headers.authorization.split(' ')[1]
            let decoded = jwt.verify(authorization, "mysecretkey");
            console.log("Decode>>>", decoded);
    
            let userId = decoded.id;
            console.log("User ID", userId);
            
            // Fetch the user by id 
            const product = await productModel.findOne({
                _id: mongoObjectId.ObjectId(req.body.productId)
            })
        
        console.log(req.body.productId);
        
        let deleteProduct = await productModel.deleteOne({_id:req.body.productId})
        
            console.log(deleteProduct);
            res.send(
                {
                  message: "Product delete Successfully",
                  error: [error],
                  data: [UpdatedProduct]  
                }
                );
            }
        catch(error){
            console.log(error);
            return res.status(401).send('unauthorized');
        }
        
}


//For Diisplay Specific User Product
exports.displayUserProduct = async function displayUserProduct(req, res){
    try{
    let authorization = req.headers.authorization.split(' ')[1]
    let decoded = jwt.verify(authorization, "mysecretkey");
    // console.log("Decode>>>", decoded);

    let userId = decoded.id;


    let displayUserProduct = await productModel.find({ownerId: userId},{name:true,price:true,quentity:true,discription:true})
    console.log(displayUserProduct);

    res.send({
        message: "Display User Product",
        error:[error],
        data:[displayUserProduct]
    })
}catch(error){
    res.send({
        message:"Can not Display Your Product",
        error:[error]
    })
}
} 

//For Display All Products
exports.displayProduct = async function displayProduct(req, res){
try{
        let displayProduct = await productModel.find({},{name:true,price:true,image:true,quentity:true,discription:true})

        res.send({
            message:"Display All Product",
            error:[error],
            data:[displayProduct]
        })
    }
catch(error){
    res.send({
        message:"Can't Display All Product",
        error:[error]
    })
}

} 

//For Add Product to Cart
exports.addcartProduct = async function addcartProduct(req, res){
    const{productId, cartproductQuentity} = req.body;
    // console.log(req.body);
    let authorization = req.headers.authorization.split(' ')[1]
    let decoded = jwt.verify(authorization, "mysecretkey");
    // console.log("Decode>>>", decoded);

    let userId = decoded.id;
    
    const productDetails = await productModel.findOne({_id: productId},{name:true, price:true,quentity:true})
    // console.log(productDetails);

    const productName = productDetails.name;
    const productPrice = productDetails.price;
    const productQuentity = productDetails.quentity;

    

    // console.log(productQuentity);
    if(cartproductQuentity > productQuentity){
        res.send(
            {
                message:"Not more Stock",
                error:[error]
            }
        )
    }else{
    
    //Sub total of product
    let subTotal = productPrice * cartproductQuentity;

    try{

        let UserProductdata = await cartModel.findOne({userId: userId ,productId: productId});
        // console.log(UserProductdata);

        if(UserProductdata){
            
            let  updatedProductQuentity = UserProductdata.cartproductQuentity + cartproductQuentity;
            // console.log("updateproducrQuentity",updatedProductQuentity);

            UserProductdata.cartproductQuentity = updatedProductQuentity
            // console.log("UserProductData",UserProductdata);


            subTotal = productPrice * updatedProductQuentity;
            UserProductdata.subTotal = subTotal

            await UserProductdata.save();
        

             
            // await productDetails.save();

            let updateddata = await cartModel.findOne({productId: productId},{productName:true,cartproductQuentity:true,subTotal:true})
             res.send({
                 message:"Your Product Quentity updated",
                 error:[error],
                 data:[updateddata]
             })
        }else{
            //no cart for user, create new cart
            const newCart = await cartModel.create({
                userId,
                productId,
                productName,
                productPrice,
                cartproductQuentity,
                subTotal
              });

            //   let updateProductquentity = productQuentity - cartproductQuentity
            //     console.log("updated product quentity",updateProductquentity);

            //     productDetails.quentity = updateProductquentity

            //     await productDetails.save();
              let NewAddeddata = await cartModel.findOne({productId: productId},{productName:true,cartproductQuentity:true,subTotal:true})
              
              
              
              return res.status(201).send({
                message:"Successfully New Product is Added to cart",
                error:[error],
                data:[NewAddeddata]   
              });
            }
    } catch(error){
        console.log(error);
        res.send({
            message:"cant Add cart",
            error:[error]
        })
    }
}  
}



//For delete Product into cart 
exports.deletecartProduct = async function deletecartProduct(req, res){
try{
    const productId = req.body.productId;
    console.log("Product id",productId);

    let authorization = req.headers.authorization.split(' ')[1]
    let decoded = jwt.verify(authorization, "mysecretkey");
    // console.log("Decode>>>", decoded);

    let userId = decoded.id;

    console.log("User Id",userId);
    let UserProductdata = await cartModel.findOne({userId: userId ,productId: productId},{productId:true,productName:true,cartproductQuentity:true,subTotal:true});
    console.log(UserProductdata);
   

    if(UserProductdata){
    let deletecartProduct = await cartModel.deleteOne({productId: productId})

    res.send({
        message:"Delete Product Successfully",
        error:[error],
        data:[UserProductdata]
    })
    }else{
        res.send({
            message:"Please Add Valide Product Id",
            error:[error],
        })
    }

}catch(error){
    res.send({
        message:"Please Add Valide Product ID",
        error:[error]
    })
}
}

//for Display User Cart product
exports.displayCartProduct = async function displayCartProduct(req, res){
    
    try{
    let authorization = req.headers.authorization.split(' ')[1]
    let decoded = jwt.verify(authorization, "mysecretkey");
    // console.log("Decode>>>", decoded);

    let userId = decoded.id;

    let cartProduct = await cartModel.find({userId: userId, isDelete: false},{productId: true,productName:true,cartproductQuentity:true,subTotal:true})

    res.send({
        message:"Your Cart Data",
        error:[error],
        data:[cartProduct]
    })
}catch(error){
    res.sned({
        message:"Cant Not Display Cart",
        error:[error],

    })
}
}


//For Purchase Cart Product
exports.purchaseCartProduct = async function purchaseCartProduct(req, res){
    try{
        let address = req.body.address;
        console.log(address);
        let authorization = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(authorization, "mysecretkey");
        // console.log("Decode>>>", decoded);
    
        let userId = decoded.id;
        let user = await userModel.find({_id: userId},{_id:false,name:true,email:true,phoneNumber:true}) 
        let updatedCart = await cartModel.find({userId: userId,isDelete: false},{productId: true,productName:true,cartproductQuentity:true,subTotal:true,isDelete:true})
        console.log("Updated Cart",updatedCart);
        let status = 0; 

        if(updatedCart){
           
        //MAin LOGIC FOR PURCHASE
        let purchaseItem = [];
          
        for ( let i=0; i<updatedCart.length;i++){
                
                    
                let productId = updatedCart[i].productId;
                let subTotal = updatedCart[i].subTotal;
                let cartproductQuentity = updatedCart[i].cartproductQuentity;
                console.log("cartproductQuentity==",cartproductQuentity)
                console.log("productId==",productId)
                console.log("subTotal==",subTotal)
                let newProductId = await productModel.findOne({_id: productId})
                console.log("newProductId.quentity==",newProductId.quentity)
                let NewProductQuentity = newProductId.quentity;


                if(cartproductQuentity> NewProductQuentity){
                    status += 1;
                console.log("Inner Status",status);        

                }

                 else{
                    purchaseItem.push({productId,subTotal,cartproductQuentity,userId,user}); 
                }
                // console.log("Outer Status",status);    
 
        }
        if(status == 1){
            // console.log("HIii");
                res.send({
                    message:"Not More Stock Available Please Change Product Quentity",
                    error:[error],
                    // data:["Please Change this Product Quentity",,
                    //     "Available Stock is:"]
                    })
            }else{
            
                    for (let i=0; i< purchaseItem.length;i++){
                            let userId = purchaseItem[i].userId
                            let user = purchaseItem[i].user
                            let productId = purchaseItem[i].productId
                            let subTotal = purchaseItem[i].subTotal
                            let cartproductQuentity = purchaseItem[i].cartproductQuentity
                            let productDetails = await productModel.findOne({_id: productId},{quentity:true})
                            // console.log("newProductId.quentity==",productDetails.quentity)
                            let ProductQuentity = productDetails.quentity;
                            // console.log(newPurchaseItem);
                            const newPurchase  = await purchaseModel.create({
                            // newPurchaseItem  
                    
                                       userId,
                                       productId,
                                       address,
                                       subTotal,
                                       cartproductQuentity
                // //                        // finalTotal
                            })
                //      console.log(newPurchase);
            
                        //For Update isDelete Status in cartModel
                        let updatedCartProduct = await cartModel.updateMany({userId: userId},{$set:{isDelete:true}});
            
                        //For Update Product Quentity
                        let updateProductquentity = ProductQuentity - cartproductQuentity
                        console.log("updated product quentity",updateProductquentity);
                        productDetails.quentity= updateProductquentity
                        await productDetails.save()  
                        
                        
                        
                    }

                    let PurchaseItems = await purchaseModel.find({userId:userId,paymentStatus:false})
                    res.send({
                
                        message:"Your Purchase Items",
                        error:[error],
                        data: [PurchaseItems ]
                    })
                    
    }  
        }else{
            res.send({
                message:"Can Not Find Product",
                // error:[errror]
            })
        }
    }catch(error){
        console.log(error);
    }
}


//For Display Ourchase Product
exports.displayPurchaseProduct = async function displayPurchaseProduct(req, res){
    try{
        let address = req.body.address;
        console.log(address);
        let authorization = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(authorization, "mysecretkey");
        // console.log("Decode>>>", decoded);
    
        let userId = decoded.id;


        let purchaseProducts = await purchaseModel.find({userId:userId, paymentStatus:false});
        console.log(purchaseProducts);
}catch(error){
    res.send({
        message:"Can not Display PurchaseProduct",
        error:[error]
    })
}






}