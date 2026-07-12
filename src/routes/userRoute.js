import { Router } from "express";
import { registerUser } from "../controllers/userController.js";
import { upload } from "../middlewares/multerMiddleware.js";



const router = Router();

router.route('/register').post(
    upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
]), // Use the multer middleware to handle file uploads for avatar and coverImage fields
    registerUser
);


export default router; 