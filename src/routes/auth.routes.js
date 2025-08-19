import { Router } from "express";
import { login, registerUser } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userRegisterValidator } from "../validators/vali.js"; 




const router = Router(); 

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(login);


export default router; 

