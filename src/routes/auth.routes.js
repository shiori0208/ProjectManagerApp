import { Router } from "express";
import { login, registerUser } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userLoginValidator, userRegisterValidator } from "../validators/vali.js"; 




const router = Router(); 

router.route("/register").post(userRegisterValidator(), validate, registerUser);

router.route("/login").post(userLoginValidator(), validate, login);


export default router; 

