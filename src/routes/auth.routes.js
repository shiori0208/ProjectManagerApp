import { Router } from "express";
import { login, registerUser, logout } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userLoginValidator, userRegisterValidator } from "../validators/vali.js"; 
import { verifyJWT } from "../middlewares/auth.middleware.js"; 




const router = Router(); 

router.route("/register").post(userRegisterValidator(), validate, registerUser);

router.route("/login").post(userLoginValidator(), validate, login);

//secure routes
router.route("/logout").post(verifyJWT, logout);




export default router; 

