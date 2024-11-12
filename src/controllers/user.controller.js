import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/ApiResponce.js";

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefrshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})

        return { accessToken , refreshToken }

    } catch (error) {
        throw new ApiError(
            500,"something went wrong while genrating access and refresh token"
        )
    }
}

const registerUser = asyncHandler( async (req , res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exist: username,email
    // check for images , check for avatar
    // upload them to cloudinary , avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // response return

    const {fullName, email ,username, password} = req.body
    
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(
            400,"ALL fields are required"
        )
    }

    const exsitedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if (exsitedUser) {
        throw new ApiError(
            409,"User with email or username already exist"
        )
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
       coverImageLocalPath = req.files.coverImage[0].path; 
    }

    if(!avatarLocalPath) {
        throw new ApiError(
            400,"AVATAR file is required"
        );
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath, (error) => {
        if (error) {
            throw new ApiError(
                400,"AVATAR file is required"
            );
        }
    });
    const coverImage = await uploadOnCloudinary(coverImageLocalPath, (error) => {
        if (error) {
            throw new ApiError(
                400,"AVATAR file is required"
            );
        }
    });


    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) {
        throw new ApiError(
            500,"something went wrong while registering the user"
        )
    }
    
    res.status(201).json(
        new ApiResponce(200, createdUser, "user registered Successfully")
    )
})

const loginUser = asyncHandler( async (req , res) => {
    // req body -> data
    // username or email based login
    // find the user
    // check password
    // access and refresh token
    // send cookie

    const {username , email , password} = req.body

    if (!(username || email)) {
        throw new ApiError(
            400,"username or email required"
        )
    }

    const user = await User.findOne({
        $or : [{username} , {email}]
    })

    if(!user){
        throw new ApiError(
            404,"user does not exist"
        )
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(
            401,"password incorrect"
        );
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-passowrd -refreshToken")

    const options = {
        httpOnly : true,
        secure : true 
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponce(
            200, 
            {
                user: loggedInUser, accessToken ,refreshToken
            },
            "User logged in successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req , res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            },
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly : true,
        secure : true 
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponce(
            200,
            {},
            "User Logged out Successfully"
        )
    )
})

export { 
    registerUser,
    loginUser,
    logoutUser 
}