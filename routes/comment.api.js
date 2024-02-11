import express from "express";
import commentController from "../controller/comment.controller.js";
import { verifyJWT } from "../utils/utils.js";

const commentApi = express.Router();

commentApi.post("/add-comment", verifyJWT, commentController.addComment);
commentApi.post("/edit-comment", verifyJWT, commentController.editComment);
commentApi.post("/get-blog-comments", commentController.getBlogComments);
commentApi.post("/get-replies", commentController.getReplies);
commentApi.post("/delete-comment", verifyJWT, commentController.deleteComment);

export { commentApi };
