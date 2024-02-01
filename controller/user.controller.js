import Follow from "../Schema/Follow.js";
import User from "../Schema/User.js";

const userController = {};

userController.getProfile = (req, res) => {
  let { username } = req.body;

  User.findOne({ "personal_info.username": username })
    .select("-personal_info.password -google_auth -updatedAt -blogs _id")
    .then((user) => {
      return res.status(200).json(user);
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
};
userController.searchUsers = (req, res) => {
  let { query } = req.body;
  User.find({ "personal_info.username": { $regex: query, $options: "i" } })
    .limit(50)
    .select(
      "personal_info.fullname personal_info.username personal_info.profile_img -_id"
    )
    .then((users) => {
      return res.status(200).json({ users });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
};
userController.updateProfileImg = (req, res) => {
  let { url } = req.body;
  User.findOneAndUpdate({ _id: req.user }, { "personal_info.profile_img": url })
    .then(() => {
      return res.status(200).json({ profile_img: url });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
};
userController.updateProfile = (req, res) => {
  let bioLimit = 150;
  let { username, bio, social_links } = req.body;
  if (username.length < 3) {
    return res.status(403).json({ error: "Username should be longer than 3." });
  }
  if (bio.length > bioLimit) {
    return res
      .status(403)
      .json({ error: "Bio should not exceed " + bioLimit + " character" });
  }
  let social_linksArr = Object.keys(social_links);

  try {
    for (let i = 0; i < social_linksArr.length; i++) {
      if (social_links[social_linksArr[i]].length) {
        let hostname = new URL(social_links[social_linksArr[i]]).hostname;
        if (
          !hostname.includes(social_linksArr[i] + ".com") &&
          social_linksArr[i] !== "website"
        ) {
          return res.status(403).json({
            error: `${social_linksArr[i]} link is invalid. please enter full link`,
          });
        }
      }
    }
  } catch (error) {
    return res.status(500).json({
      error: "You must provide full social links with http(s) included.",
    });
  }
  let updateObj = {
    "personal_info.username": username,
    "personal_info.bio": bio,
    social_links,
  };
  User.findOneAndUpdate({ _id: req.user }, updateObj, { runValidator: true })
    .then((response) => {
      return res.status(200).json({ username });
    })
    .catch((err) => {
      if (err.code == 11000) {
        return res.status(409).json({
          error: "username already taken",
        });
      }
      return res.status(500).json({
        error: err.message,
      });
    });
};

export default userController;
