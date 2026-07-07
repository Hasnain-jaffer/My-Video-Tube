import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });

const uploadToCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null; // Return null if no file path is provided
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto', // Specify the resource type as 'image'
        });
         // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url); 
        console.log('Cloudinary upload result:', response.url); // Log the result for debugging
        return response;
    }   
    catch (error) {
        fs.unlinkSync(localFilePath); // Delete the file from local storage if upload fails
        return null; // Return null if upload fails
    }
};

export  {uploadToCloudinary};


