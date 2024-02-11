import express from "express";
import { authApi } from "./auth.api.js";
import { blogApi } from "./blog.api.js";
import { userApi } from "./user.api.js";
import { followApi } from "./follow.api.js";
import { commentApi } from "./comment.api.js";
import { notiApi } from "./noti.api.js";

const router = express.Router();

router.get("/", function (req, res, next) {
  res.send({ status: "ok", message: "hello world!" });
});

router.use("/", authApi);
router.use("/", blogApi);
router.use("/", userApi);
router.use("/", followApi);
router.use("/", commentApi);
router.use("/", notiApi);

export { router };
