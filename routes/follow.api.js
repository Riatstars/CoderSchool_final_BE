import express from "express";
import followController from "../controller/follow.controller.js";
import { verifyJWT } from "../utils/utils.js";

const followApi = express.Router();

followApi.post("/check-follow", verifyJWT, followController.checkFollow);
followApi.post("/update-follow", verifyJWT, followController.updateFollow);
followApi.post("/get-followings", verifyJWT, followController.getFollowings);
followApi.post(
  "/all-followings-count",
  verifyJWT,
  followController.allFollowingsCount
);
followApi.post("/get-followers", verifyJWT, followController.getFollowers);
followApi.post(
  "/all-followers-count",
  verifyJWT,
  followController.allFollowersCount
);

export { followApi };
