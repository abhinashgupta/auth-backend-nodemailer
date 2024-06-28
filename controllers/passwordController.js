require("dotenv").config();
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const secretKey = process.env.SECRET_KEY;

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASSWORD,
  },
});

exports.getForgotPassword = (req, res) => {
  /**
   * @access public
   * @desc used for render the Forgot password page
   * @route /getForgotPassword
   */
  res.render("forgotPassword", { title: "Forgot Password" });
};

exports.postForgotPassword = async (req, res) => {
  /**
   * @access public
   * @desc used for sending the mail for forgot password
   * @route /postRegister
   */
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).send("User not found");
  }

  const token = jwt.sign({ email }, secretKey, { expiresIn: "1h" });

  const mailOptions = {
    from: process.env.SENDERS_EMAIL,
    to: email,
    subject: "Password Reset",
    text: `Click on this link to reset your password: http://localhost:3000/reset-password/${token}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send("Error sending email");
    } else {
      console.log("Email sent: " + info.response);
      res.send("Password reset link has been sent to your email");
    }
  });
};

exports.getResetPassword = (req, res) => {
  /**
   * @access public
   * @desc used for render the reset password page
   * @route /getResetPassword
   */
  const { token } = req.params;
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(400).send("Invalid or expired token");
    }
    res.render("resetPassword", { title: "Reset Password", token });
  });
};

exports.postResetPassword = async (req, res) => {
  /**
   * @access public
   * @desc used for sending the reset password
   * @route /postRegister
   */
  const { token, password } = req.body;

  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      return res.status(400).send("Invalid or expired token");
    }

    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).send("User not found");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.render("passwordResetSuccess", { title: "Password Reset Success" });
  });
};
