import express from "express";
import blogController from "../controller/blog.controller.js";
import { verifyJWT } from "../utils/utils.js";

const blogApi = express.Router();

blogApi.post("/latest-blogs", blogController.latestBlogs);
blogApi.post(
  "/latest-blogs-with-auth",
  verifyJWT,
  blogController.latestBlogsWithAuth
);
blogApi.post("/all-latest-blogs-count", blogController.allLatestBlogsCount);
blogApi.get("/trending-blogs", blogController.trendingBlogs);
blogApi.post("/search-blogs", blogController.searchBlogs);
blogApi.post("/search-blogs-count", blogController.searchBlogsCount);
blogApi.post("/get-blog", blogController.getBlog);
blogApi.post("/create-blog", verifyJWT, blogController.createBlog);
blogApi.post("/like-blog", verifyJWT, blogController.likeBlog);
blogApi.post("/isliked-by-user", verifyJWT, blogController.isLikedByUser);
blogApi.post("/user-written-blogs", verifyJWT, blogController.userWrittenBlogs);
blogApi.post(
  "/user-written-blogs-count",
  verifyJWT,
  blogController.userWrittenBlogsCount
);
blogApi.post("/liked-blogs", verifyJWT, blogController.likedBlogs);
blogApi.post("/liked-blogs-count", verifyJWT, blogController.likedBlogsCount);
blogApi.post("/delete-blog", verifyJWT, blogController.deleteBlog);

export { blogApi };
