import { passwordRegex, emailRegex } from "../utils/utils.js";
const authValidator = {};

authValidator.signup = (req, res, next) => {
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
  next();
};
authValidator.signin = (req, res, next) => {
  let { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(403)
      .json({ error: "Please provide both email and password" });
  }
  next();
};
authValidator.googleAuth = (req, res, next) => {
  let { access_token } = req.body;
  if (!access_token) {
    return res.status(403).json({ error: "Please provide access token" });
  }
  next();
};
authValidator.changePassword = (req, res, next) => {
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
  next();
};

export default authValidator;
