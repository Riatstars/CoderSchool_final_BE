const commentValidator = {};

commentValidator.addComment = (req, res, next) => {
  let { comment } = req.body;
  if (!comment.length) {
    return res
      .status(402)
      .json({ error: "Write something to leave a comment" });
  }
  next();
};

export default commentValidator;
