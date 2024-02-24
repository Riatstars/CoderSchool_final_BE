import express from "express";
import userController from "../controller/user.controller.js";
import { verifyJWT } from "../utils/utils.js";
import userValidator from "../validator/user.validator.js";

const userApi = express.Router();

userApi.get(
  "/get-profile",
  userValidator.getProfile,
  userController.getProfile
);
userApi.get(
  "/search-users",
  userValidator.searchUsers,
  userController.searchUsers
);
userApi.put(
  "/update-profile-img",
  verifyJWT,
  userValidator.updateProfileImg,
  userController.updateProfileImg
);
userApi.put(
  "/update-profile",
  verifyJWT,
  userValidator.updateProfile,
  userController.updateProfile
);

export { userApi };
