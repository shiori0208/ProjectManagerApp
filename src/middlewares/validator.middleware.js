import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.js"; 


export const validate = (req, res, next) => {
   const errors = validationResult(req);
   if(errors.isEmpty()) 
   {
    return next();
   }
   
   const extractedErrors = []
   errors.array().map((err) => extractedErrors
   .push(
    {
        [err.path]: err.msg //pushing all errors into array 

    })); 

    throw new ApiError(422, "Received data seems invalid.",  extractedErrors); 
   

}; 


