import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { User } from '../models/userModel.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
   
const generateAccessAndRefreshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

        
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating the refresh and access token!");
    }
}  

const registerUser = asyncHandler(async (req, res) => {
    // get user data from request body
    // validate user data
    // check if user already exists,username,email
    // check images, but check  avatar
    // upload images to cloudinary
    // create user in database
    // remove password and refresh token from user object
    // check if user is created successfully
    // send response with user data and success message 

    const { username, email, password, fullName } = req.body;
    // console.log("Request body:", req.body);
    
    // .some() method checks if at least one element in the array passes the test implemented by the provided function. In this case, it checks if any of the fields are empty strings after trimming whitespace.
    if ([username, email, password, fullName].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // $or operator is used to find a document that matches any of the specified conditions. In this case, it checks if there is an existing user with either the same username or email.
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
        throw new ApiError(400, "Username or email already exists");
    }
    
    // Check if avatar file is provided in the request. If not, throw an error indicating that the avatar file is required.
    const avatarLocalPath = req.files?.avatar?.[0]?.path; // take the path of the uploaded avatar file from the request object. The optional chaining operator (?.) is used to safely access nested properties without throwing an error if any part of the chain is undefined or null.

    // Check if cover image file is provided in the request. If not, it will be handled later when creating the user.
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path; // take the path of the uploaded cover image file from the request object. The optional chaining operator (?.) is used to safely access nested properties without throwing an error if any part of the chain is undefined or null.

    // console.log(req.files);

    // let coverImageLocalPath;
    // if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    //     coverImageLocalPath = req.files.coverImage[0].path
    // }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }
    
    // Upload avatar and cover image to Cloudinary using the provided utility function. The function returns an object containing the URL of the uploaded image.
    const avatar = await uploadToCloudinary(avatarLocalPath);
    const coverImage = await uploadToCloudinary(coverImageLocalPath);

    if(!avatar) {
        throw new ApiError(500, "Failed to upload avatar to Cloudinary");
    }
    
    // Create a new user in the database with the provided data and the URLs of the uploaded images. The cover image URL is optional, so it uses a conditional operator to set it to an empty string if not provided.
    const newUser = await User.create({
        username : username.toLowerCase(),
        email,
        password,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    });

    // Fetch the newly created user from the database, excluding the password and refresh token fields for security reasons. This ensures that sensitive information is not sent back in the response.
    const createdUser = await User.findById(newUser._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Failed to create user");
    }

    res.status(201).json(new ApiResponse(200, "User registered successfully", {
        createdUser
    }));

    });

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // uername or email, password
    // validate data
    // check if user exists
    // check if password is correct
    // generate access token and refresh token
    // send response with user data and tokens

    const { username, email, password } = req.body;
    if(!username || !email) {
        throw new ApiError(400,"username or email is required!");
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })
    
    if(!user) {
        throw new ApiError(404, "User does not exist!");        
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid User Credentials!");        
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    };

    // industry standard 
    // const isProduction = process.env.NODE_ENV === "production";

    // const cookieOptions = {
    // httpOnly: true,
    // secure: isProduction, // ensures that the cookie is only sent over HTTPS in production
    // sameSite: isProduction ? "none" : "lax", // allows the cookie to be sent in cross-site requests in production, but restricts it to same-site requests in development
    // };

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
        new ApiResponse(
            200,
            "User logged in successfully",
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            }
        )
    );

})    
 

export { registerUser, loginUser };