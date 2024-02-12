import express from "express";
import authController from "../controller/auth.controller.js";
import { verifyJWT } from "../utils/utils.js";
import authValidator from "../validator/auth.validator.js";

const authApi = express.Router();

authApi.post("/signup", authValidator.signup, authController.signUp);
authApi.post("/signin", authValidator.signin, authController.signIn);
authApi.post(
  "/google-auth",
  authValidator.googleAuth,
  authController.googleAuth
);
authApi.post(
  "/change-password",
  verifyJWT,
  authValidator.changePassword,
  authController.changePassword
);

export { authApi };
