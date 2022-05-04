let multer = require('multer');
  

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'UploadProfile')
    },
    filename: (req, file, cb) => {
        cb(null,  Date.now() + '_' +file.originalname)
    }
});

const profileType = ["image/png","image/jpg","image/jpeg"]

exports.multer = multer({ storage: storage ,
    
        fileFilter  : (req, file, cb) => {
            if (profileType.includes(file.mimetype) ) {
                cb(null, true)
            } else {
                cb(null, false)
                return cb(new Error('Only .png, .jpg, .mp4 and .jpeg format allowed!'))
            }
        }
}).single('profilepic');




    

