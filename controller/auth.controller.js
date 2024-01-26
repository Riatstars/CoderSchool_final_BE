import {
  passwordRegex,
  emailRegex,
  generateUsername,
  formatDatatoSend,
} from "../utils/utils.js";
import bcrypt from "bcrypt";
import User from "../Schema/User.js";
import { getAuth } from "firebase-admin/auth";

const authController = {};

authController.signUp = (req, res) => {
  let { fullname, email, password } = req.body;
  if (fullname.length < 3) {
    return res
      .status(403)
      .json({ Error: "Fullname must be at least 3 letters long" });
  }
  if (!email.length || !emailRegex.test(email)) {
    return res.status(403).json({ Error: "Please provide email" });
  }
  if (!passwordRegex.test(password)) {
    return res.status(403).json({
      Error:
        "Password must be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters",
    });
  }
  bcrypt.hash(password, 10, async (err, hashed_password) => {
    let username = await generateUsername(email);
    let user = new User({
      personal_info: { fullname, email, password: hashed_password, username },
    });
    user
      .save()
      .then((u) => res.status(200).json(formatDatatoSend(u)))
      .catch((err) => {
        if (err.code == 11000) {
          return res.status(500).json({ Error: "Email already exist" });
        }
        return res.status(500).json({ Error: err.message });
      });
  });
};

authController.signIn = (req, res) => {
  let { email, password } = req.body;
  User.findOne({ "personal_info.email": email })
    .then((user) => {
      if (!user) {
        return res.status(403).json({ error: "Email not found" });
      }
      if (!user.google_auth) {
        bcrypt.compare(password, user.personal_info.password, (err, result) => {
          if (err) {
            return res
              .status(403)
              .json({ error: "Error occured while login, please try again" });
          }
          if (!result) {
            return res.status(403).json({ error: "wrong passsword" });
          } else {
            return res.status(200).json(formatDatatoSend(user));
          }
        });
      } else {
        return res.status(403).json({
          error: "Account was create using google. Please login with google.",
        });
      }
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
};

authController.googleAuth = async (req, res) => {
  let { access_token } = req.body;
  getAuth()
    .verifyIdToken(access_token)
    .then(async (decodedUser) => {
      let { email, name, picture } = decodedUser;
      picture = picture.replace("s96-c", "s384-c");
      let user = await User.findOne({ "personal_info.email": email })
        .select(
          "personal_info.fullname admin personal_info.username personal_info.profile_img google_auth"
        )
        .then((u) => {
          return u || null;
        })
        .catch((err) => {
          return res.status(500).json({ error: err.message });
        });
      if (user) {
        if (!user.google_auth) {
          return res.status(403).json({
            error:
              "This email was signed up without Google, please login with password to access the account",
          });
        }
      } else {
        let username = await generateUsername(email);
        user = new User({
          personal_info: {
            fullname: name,
            email,
            profile_img: picture,
            username,
            admin: false,
          },
          google_auth: true,
        });
        await user
          .save()
          .then((u) => (user = u))
          .catch((err) => {
            return res.status(500).json({ error: err.message });
          });
      }
      return res.status(200).json(formatDatatoSend(user));
    })
    .catch((err) =>
      res.status(500).json({
        error:
          "Failed to authenticate you with google. Try with other google account",
      })
    );
};

authController.changePassword = (req, res) => {
  let { currentPassword, newPassword } = req.body;
  if (
    !passwordRegex.test(currentPassword) ||
    !passwordRegex.test(newPassword)
  ) {
    return res.status(403).json({
      error:
        "Password must be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters",
    });
  }
  User.findOne({ _id: req.user })
    .then((user) => {
      if (user.google_auth) {
        return res.status(403).json({
          error:
            "You cant change password of account with google authentication",
        });
      }
      bcrypt.compare(
        currentPassword,
        user.personal_info.password,
        (err, result) => {
          if (err) {
            return res.status(500).json({
              error:
                "Some error occure while changing the password, please try again.",
            });
          }
          if (!result) {
            return res
              .status(403)
              .json({ error: "Incorrect current password" });
          }
          bcrypt.hash(newPassword, 10, (err, hashed_password) => {
            User.findOneAndUpdate(
              { _id: req.user },
              { "personal_info.password": hashed_password }
            )
              .then((u) => {
                return res.status(200).json({ status: "Password changed" });
              })
              .catch((err) => {
                return res.status(500).json({ error: err.message });
              });
          });
        }
      );
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
};

export default authController;
