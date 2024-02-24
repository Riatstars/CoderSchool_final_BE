import express from "express";
import followController from "../controller/follow.controller.js";
import { verifyJWT } from "../utils/utils.js";

const followApi = express.Router();

followApi.post("/check-follow", verifyJWT, followController.checkFollow);
followApi.put("/update-follow", verifyJWT, followController.updateFollow);
followApi.get("/get-followings", verifyJWT, followController.getFollowings);
followApi.get(
  "/all-followings-count/:user_id",
  verifyJWT,
  followController.allFollowingsCount
);
followApi.get("/get-followers", verifyJWT, followController.getFollowers);
followApi.get(
  "/all-followers-count/:user_id",
  verifyJWT,
  followController.allFollowersCount
);

export { followApi };
