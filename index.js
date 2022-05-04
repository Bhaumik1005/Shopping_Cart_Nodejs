const express = require("express");
const mongoose = require("mongoose");
const Router = require("./routes/routes");
const bodyParser = require('body-parser');
const ejs = require("ejs");
const app = express();
const path = require('path');
// const multer


// app.use(bodyParser.json()) 

// app.use(bodyParser.urlencoded({ extended: true })); 

app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(bodyParser.json({ limit: "10mb" }));


// app.use(express.json())

// console.log("req  - - -  - - -", req);

// let route1 = require('../routes/routes'); // Include custom router 1
let userProfile = require('./routes/userProfile');// Include custom router 2

app.set('view engine', 'ejs');
// app.use(express.json());


//route middlewares
app.use("/user",Router);
app.use("/userProfile",userProfile);
console.log(path.join(__dirname,'/UploadProfile'));
app.use('/UploadProfile/',express.static(path.join(__dirname,'/UploadProfile')))

mongoose.connect('mongodb://localhost/UserData', {
    useNewUrlParser: true
});


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("opne", function() {
    console.log("Connected Successfully");
});



app.listen(9000, () => console.log("Server is running.... at 9000"));