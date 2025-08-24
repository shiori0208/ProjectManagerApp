import { User } from "../models/users.model.js";
import { ApiResponse } from "../utils/api-response.js"; 
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js"; 
import { emailVerifyMailContent, sendEmail } from "../utils/mail.js"; 
import jwt from "jsonwebtoken"; 


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId); 
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        return {accessToken, refreshToken}; 

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating token!");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const {email, username, password, role} = req.body;

    const existingUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if(existingUser) {
        throw new ApiError(409, "User with email or username already exists!");
    }

    const user = await User.create({
        email,
        password,
        username,
        isEmailVerified: false
    }); 

    const {unhashedToken, hashedToken, tokenExpiry} = user.generateTempToken(); 
    user.emailVerificationToken = hashedToken; 
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({validateBeforeSave: false});

    await sendEmail(
        {
            email: user?.email,
            subject: "Please verify your email.",
            mailgenContent: emailVerifyMailContent(
                user.username, 
                `${req.protocol}://${req.get("host")}/api/v1/sers/verify-email/${unhashedToken}`
            ), 

    });

    const createdUser = await User.findById(user._id) //always wrap await in a var
    .select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry"); //remove data with -

    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user..."); 
    }

    return res
    .status(201)
    .json(
        new ApiResponse (
            200, 
            {user: createdUser},
            "User registered successfully. Verification email sent to your email!"
        )
    ); 

});

const login = asyncHandler(async (req, res) => {
    const {email, password, username} = req.body

    if(!email){
        throw new ApiError(400, "Email required!"); 
    }

    const user = await User.findOne({ email }); //looking for user in database

    if(!user){
        throw new ApiError(400, "User doesn't exist!"); 
    }

    const isPasswordValid = await user.isPasswordCorrect(password); //checking password validity

    if(!isPasswordValid){
        throw new ApiError(400, "Password is incorrect!"); 
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id); 

    const loggedInUser = await User.findById(user._id) //always wrap await in a var
    .select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry"); //remove data with -

    const options = {
        httpOnly: true,
        secure: true, 
    }

    return res
    .status(200) 
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
              user: loggedInUser,
              accessToken,
              refreshToken  
            },
            "User logged in successfully!"
        )
    )
});

const logout = asyncHandler(async (req, res) => {
   
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: ""
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User logged out")); 
}); 

const getCurrentUser = asyncHandler (async (req, res) => {
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            req.user,
            "Current user fetched succesfully!"
        )
    )
}); 

const verifyEmail = asyncHandler (async (req, res) => {
    const {verificationToken} = req.params; //new learning getting data from url

    if(!verificationToken) {
        throw new ApiError(400, "Email verification token missing!");
    }

    let hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex"); 

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: {$gt: Date.now()}
    })

    if(!user){
         throw new ApiError(400, "Email verification token is inavlid or expired!");
    }

    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined; 

    user.isEmailVerified = true; 
    await user.save({validateBeforeSave: false}); 

    return res.status(200). 
    json(
        new ApiResponse(
            200,
            {
                isEmailVerified: true
            },
            "Email is verified!"
        )
    );
}); 

const resendEmailVerification = asyncHandler (async (req, res) => {
    const user = await User.findById(req.user?._id);

    if(!user){
        throw new ApiError(404, "User doesnt exist!"); 
    }

    if(user.isEmailVerified){
        throw new ApiError(409, "Already verified!"); 
    }

    const {unhashedToken, hashedToken, tokenExpiry} = user.generateTempToken(); 

    user.emailVerificationToken = hashedToken; 
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({validateBeforeSave: false});

    await sendEmail(
        {
            email: user?.email,
            subject: "Please verify your email.",
            mailgenContent: emailVerifyMailContent(
                user.username, 
                `${req.protocol}://${req.get("host")}/api/v1/sers/verify-email/${unhashedToken}`
            ), 

    });

    const createdUser = await User.findById(user._id) //always wrap await in a var
    .select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry"); //remove data with -

    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user..."); 
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Mail has been resent to your email id"
        )
    )
}); 

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken 

    if(!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized access"); //token present or not
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET); 

        const user = await user.findById(decodedToken?._id);

        if(!user) {
            throw new ApiError(404, "Inavlid refresh token") //decoded token matched
        }

        if(incomingRefreshToken !== user?.refreshAccessToken) {
            throw new ApiError(401, "Refresh token is expired"); //token there in database
        }

        const options = {
            httpOnly: true,
            secure: true 
        }

        const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefreshTokens(user._id); 

        user.refreshToken = newRefreshToken;
        await user.save();

        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed."
            )
        )


    } catch (error) {
         throw new ApiError(401, "Inavlid refresh token"); 
    }

})

export { registerUser, 
    login, 
    logout,
    getCurrentUser, 
    verifyEmail,
    resendEmailVerification,
    refreshAccessToken
}; 
