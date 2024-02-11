import express from "express";
import authController from "../controller/auth.controller.js";
import { verifyJWT } from "../utils/utils.js";

const authApi = express.Router();

authApi.post("/signup", authController.signUp);
authApi.post("/signin", authController.signIn);
authApi.post("/google-auth", authController.googleAuth);
authApi.post("/change-password", verifyJWT, authController.changePassword);

export { authApi };
