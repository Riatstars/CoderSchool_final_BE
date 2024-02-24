import express from "express";
import blogController from "../controller/blog.controller.js";
import { verifyJWT } from "../utils/utils.js";
import blogValidator from "../validator/blog.validator.js";

const blogApi = express.Router();

blogApi.get("/latest-blogs", blogController.latestBlogs);
blogApi.get(
  "/latest-blogs-with-auth",
  verifyJWT,
  blogController.latestBlogsWithAuth
);
blogApi.get("/all-latest-blogs-count", blogController.allLatestBlogsCount);
blogApi.get("/trending-blogs", blogController.trendingBlogs);
blogApi.get("/search-blogs", blogController.searchBlogs);
blogApi.get("/search-blogs-count", blogController.searchBlogsCount);
blogApi.get("/get-blog/:blog_id", blogController.getBlog);
blogApi.post(
  "/create-blog",
  verifyJWT,
  blogValidator.createBlog,
  blogController.createBlog
);
blogApi.post("/like-blog", verifyJWT, blogController.likeBlog);
blogApi.get(
  "/isliked-by-user/:blog_id",
  verifyJWT,
  blogController.isLikedByUser
);
blogApi.get("/user-written-blogs", verifyJWT, blogController.userWrittenBlogs);
blogApi.get(
  "/user-written-blogs-count",
  verifyJWT,
  blogController.userWrittenBlogsCount
);
blogApi.get("/liked-blogs", verifyJWT, blogController.likedBlogs);
blogApi.get("/liked-blogs-count", verifyJWT, blogController.likedBlogsCount);
blogApi.delete("/delete-blog/:blog_id", verifyJWT, blogController.deleteBlog);

export { blogApi };
