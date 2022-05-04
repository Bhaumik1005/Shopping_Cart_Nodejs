const router = require("express").Router();
const controller = require("../controller/usercontroller");
const passport = require("passport"); //Authentication Middleware
const ValidateMiddleware = require("../Middleware/middleware");
// const ProfilePicPath = require("../UploadProfile")




//For Update User Profile,
router.post("/updateProfile",passport.authenticate('jwt', { session: false }),ValidateMiddleware.validateUpdateData, controller.UpdateProfile)

//For Get User Data 
router.get("/getuserprofile", passport.authenticate('jwt', { session: false }), controller.GetUserProfile);


//For Add Product 
router.post("/addProduct",passport.authenticate('jwt', { session: false }), ValidateMiddleware.validateAddProduct, controller.AddProduct);


//For Display Specific User Product
router.get("/displayUserProduct", passport.authenticate('jwt', { session: false }),  controller.displayUserProduct)

//For display All Product 
router.get("/displayAllProduct",controller.displayProduct);


//For Update Product 
router.post("/updateProduct",passport.authenticate('jwt', { session: false }), ValidateMiddleware.validateUpdateProduct, controller.updateProduct);


//For Update Product 
router.post("/delateProduct",passport.authenticate('jwt', { session: false }), controller.deleteProduct);


//For Add Product to cart
router.post("/addcartProduct", passport.authenticate('jwt', { session: false }),controller.addcartProduct)


//For delete Product to cart
router.delete("/deletecartProduct", passport.authenticate('jwt', { session: false }),controller.deletecartProduct)


//For Display User Cart
router.get("/displayCartProduct", passport.authenticate('jwt', { session: false }),controller.displayCartProduct)


//For Purchase User Cart Product
router.post("/purchaseProduct",passport.authenticate('jwt', { session: false }),controller.purchaseCartProduct)

//For Display Purchase Products
router.get("/displayPurchaseProduct",passport.authenticate('jwt', { session: false }),controller.displayPurchaseProduct)


module.exports = router;