import express from "express";
import commentController from "../controller/comment.controller.js";
import { verifyJWT } from "../utils/utils.js";
import commentValidator from "../validator/comment.validator.js";

const commentApi = express.Router();

commentApi.post(
  "/add-comment",
  verifyJWT,
  commentValidator.addComment,
  commentController.addComment
);
commentApi.put("/edit-comment", verifyJWT, commentController.editComment);
commentApi.get("/get-blog-comments", commentController.getBlogComments);
commentApi.get("/get-replies", commentController.getReplies);
commentApi.delete(
  "/delete-comment/:comment_id",
  verifyJWT,
  commentController.deleteComment
);

export { commentApi };
