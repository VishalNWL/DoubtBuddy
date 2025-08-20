import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {  //here we describe where should we store file
      cb(null, "./Public")  //this will provide path for where the file should be stored
    },
    filename: function (req, file, cb) { //here we describe from what name file shoud stored
     
      cb(null, file.originalname)  // this will store file with that name as give by user we can update it 
    }
  })
export const upload = multer({
     storage: storage
 })