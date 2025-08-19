import { body } from "express-validator";

const userRegisterValidator = () => {

    return [
        body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required!")
        .isEmail()
        .withMessage("Email is invalid!"), //this function lets you write errors message when above one gets triggered 

        body("username")
        .trim()
        .notEmpty()
        .withMessage("Username is required!")
        .isLowercase()
        .withMessage("Please put username in lowercase")
        .isLength({min: 5})
        .withMessage("Min username length is 5."), 

        body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required"),

        body("fullName")
        .optional()
        .trim()
    ]
}

const userLoginValidator = () => {
    return [
        body("email")
        .optional()
        .isEmail()
        .withMessage("Email is invalid"),

        body("password")
        .notEmpty()
        .withMessage("Password is required")
    ];
}; 



export { 
    userRegisterValidator,
    userLoginValidator
}; 