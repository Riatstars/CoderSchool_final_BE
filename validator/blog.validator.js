const blogValidator = {};

blogValidator.createBlog = (req, res, next) => {
  let { title, banner, content, des, tags, draft } = req.body;
  if (!title.length) {
    return res.status(403).json({ error: "You must provide a title" });
  }
  if (!draft) {
    if (!des.length || des.length > 200) {
      return res.status(403).json({
        error: "You must provide blog description under 200 characters.",
      });
    }
    if (!banner.length) {
      return res.status(403).json({
        error: "You must provide blog banner to publish it.",
      });
    }
    if (!content.blocks.length) {
      return res.status(403).json({
        error: "There must be some blog content to publish",
      });
    }
    if (!tags.length || tags.length > 10) {
      return res.status(403).json({
        error: "Provide tags in the order to publish post, maximum 10",
      });
    }
  }
  next();
};

export default blogValidator;
