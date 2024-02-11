import express from "express";
import userController from "../controller/user.controller.js";
import { verifyJWT } from "../utils/utils.js";

const userApi = express.Router();

userApi.post("/get-profile", userController.getProfile);
userApi.post("/search-users", userController.searchUsers);
userApi.post("/update-profile-img", verifyJWT, userController.updateProfileImg);
userApi.post("/update-profile", verifyJWT, userController.updateProfile);

export { userApi };
