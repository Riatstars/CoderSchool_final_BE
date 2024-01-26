import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import cors from "cors";
import admin from "firebase-admin";
import serviceAccountKey from "./react-js-blog-website-ce8d0-firebase-adminsdk-e0mnm-f3df1d78d5.json" assert { type: "json" };
import authController from "./controller/auth.controller.js";
import blogController from "./controller/blog.controller.js";
import { verifyJWT, getImgUploadUrl } from "./utils/utils.js";
import userController from "./controller/user.controller.js";
import commentController from "./controller/comment.controller.js";
import notificationController from "./controller/notification.controller.js";

const server = express();
let PORT = 3000;
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});
server.use(express.json());
server.use(cors());
mongoose.connect(process.env.DB_LOCATION, {
  autoIndex: true,
});
server.listen(PORT, () => {
  console.log("listening on port => " + PORT);
});

server.get("/get-upload-url", getImgUploadUrl);

server.post("/signup", authController.signUp);
server.post("/signin", authController.signIn);
server.post("/google-auth", authController.googleAuth);
server.post("/change-password", verifyJWT, authController.changePassword);

server.post("/latest-blogs", blogController.latestBlogs);
server.post("/all-latest-blogs-count", blogController.allLatestBlogsCount);
server.get("/trending-blogs", blogController.trendingBlogs);
server.post("/search-blogs", blogController.searchBlogs);
server.post("/search-blogs-count", blogController.searchBlogsCount);
server.post("/create-blog", verifyJWT, blogController.createBlog);
server.post("/get-blog", blogController.getBlog);
server.post("/like-blog", verifyJWT, blogController.likeBlog);
server.post("/isliked-by-user", verifyJWT, blogController.isLikedByUser);
server.post("/user-written-blogs", verifyJWT, blogController.userWrittenBlogs);
server.post(
  "/user-written-blogs-count",
  verifyJWT,
  blogController.userWrittenBlogsCount
);
server.post("/delete-blog", verifyJWT, blogController.deleteBlog);

server.post("/get-profile", userController.getProfile);
server.post("/search-users", userController.searchUsers);
server.post("/update-profile-img", verifyJWT, userController.updateProfileImg);
server.post("/update-profile", verifyJWT, userController.updateProfile);

server.post("/add-comment", verifyJWT, commentController.addComment);
server.post("/get-blog-comments", commentController.getBlogComments);
server.post("/get-replies", commentController.getReplies);
server.post("/delete-comment", verifyJWT, commentController.deleteComment);

server.get(
  "/new-notification",
  verifyJWT,
  notificationController.newNotificationAvai
);
server.post(
  "/notifications",
  verifyJWT,
  notificationController.getNotifications
);
server.post(
  "/all-notifications-count",
  notificationController.allNotificationsCount
);
