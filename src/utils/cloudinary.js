import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'
import { ApiError } from './ApiError.js'
import { ApiResponce } from './ApiResponce.js';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath, _callback) => {
    try {
        if(!localFilePath) return null
        //upload file in cloudinary
        const cloudinaryResponse = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file has been uploaded
        fs.unlinkSync(localFilePath)
        _callback(null);
        return cloudinaryResponse
    } catch (error) {
        console.log("Catch block error:", error);
        fs.unlinkSync(localFilePath) //remove local saved temp file
        _callback(error);
        return null;
    }      
}

const deleteFromCloudinary = async(filePath) => {
    if(!filePath) return null
    //delete from cloudinary
    const imageTobeDeleted = cloudinary.uploader.destroy(filePath)
    return imageTobeDeleted
}

export { 
    uploadOnCloudinary,
    deleteFromCloudinary
}