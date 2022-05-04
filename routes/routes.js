const express = require("express");
const router = require("express").Router();
const userController = require("../controller/usercontroller");
const userModel = require("../model/UserModel")
const passport = require("passport"); //Authentication Middleware
const ValidateMiddleware = require("../Middleware/middleware");
const UploadProfileMiddleware = require("../Middleware/uploadProfile")
const fs = require('fs');
let multer = require('multer');

router.post('/profilepic',UploadProfileMiddleware.multer,userController.uploadProfile);


router.post('/signup', userController.registerUser);


//For Validate User E-mail
router.post("/verifyuseremail/:priEmailToken", userController.VerifyUserEmail);


// //For Use Login Check User Details
router.post("/login",ValidateMiddleware.validateUserLogin, userController.loginReq);


// //For ForGot password
router.post("/forgotpassword", userController.ForgotPassword)


// //For ForGot password
router.get("/rstpass",ValidateMiddleware.validateResetPass, userController.RstPassword)


// //For ForGot password
router.post("/resetpass/:forgotPasswordToken", userController.ResetPassword)





module.exports = router;