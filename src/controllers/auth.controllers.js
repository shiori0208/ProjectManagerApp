import { User } from "../models/users.model.js";
import { ApiResponse } from "../utils/api-response.js"; 
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js"; 
import { emailVerifyMailContent, sendEmail } from "../utils/mail.js"; 


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId); 
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
            "User registered successfully. Verification email sent to your email."
        )
    ); 

});

export { registerUser }; 