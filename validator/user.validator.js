const userValidator = {};

userValidator.getProfile = (req, res, next) => {
  let { username } = req.body;
  if (!username) {
    return res.status(402).json({ error: "Please provide username" });
  }
  next();
};

userValidator.searchUsers = (req, res, next) => {
  let { query } = req.body;
  if (!query) {
    return res.status(402).json({ error: "Please provide search query" });
  }
  next();
};

userValidator.updateProfileImg = (req, res, next) => {
  let { url } = req.body;
  if (!url) {
    return res.status(402).json({ error: "Please provide url" });
  }
};

userValidator.updateProfile = (req, res, next) => {
  let { username, bio } = req.body;
  if (username.length < 3) {
    return res.status(403).json({ error: "Username should be longer than 3." });
  }
  if (bio.length > bioLimit) {
    return res
      .status(403)
      .json({ error: "Bio should not exceed " + bioLimit + " character" });
  }
  next();
};

export default userValidator;
