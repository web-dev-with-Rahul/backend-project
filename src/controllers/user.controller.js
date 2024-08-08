import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../models/uploadOnCloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser=asyncHandler(async(req,res)=>{
    // get user detail from frontend 
    // validation -not empty
    // check if user already exists
    //check for images , check for avatar
    // upload them for cloudinary , avatar 
    //create user object - create entery in db 
    // remove password and refresh token field from response 
    // check for user creation 
    //return response

    const {fullName,email,username,password}=req.body
    console.log("email: " + email)

    if(
        [fullName,email,username,password].some((field)=>
        field?.trim()==="")
    ){
        throw new ApiError("All fields are required",400)
    }
    const existedUser=User.findOne({
        $or:[{email},{username}]
    })
    if(existedUser){
        throw new ApiError("User with email and username already exists",409)
    }

    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files?.coverImage[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError("Avatar is required",400)
    }

    const avatar= await uploadOnCloudinary(avatarLocalPath)
    const coverImage= await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new ApiError("Avatar file required",500)
    }

    const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase(),
    })
    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError("Something went wrong while registering user",500)
    }
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered successfully")
    )

})

export {
    registerUser,
}