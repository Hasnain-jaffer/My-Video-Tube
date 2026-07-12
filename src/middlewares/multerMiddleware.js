import multer from "multer";
// multer is a middleware for handling multipart/form-data, which is primarily used for uploading files. It makes it easy to handle file uploads in Node.js applications.Multer stores files for each field as an array, even if you upload only one file.

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp") // Specify the directory where uploaded files will be stored
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname) // Specify the filename for uploaded files
    }
});
export const upload = multer({ 
    storage,
 });   // Create a multer instance with the defined storage configuration