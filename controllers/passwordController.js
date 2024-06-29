// passwordController.js
require("dotenv").config();
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const logger = require("../logger");
const secretKey = process.env.SECRET_KEY;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASSWORD,
  },
});

exports.getForgotPassword = (req, res) => {
  res.render("forgotPassword", {
    title: "Forgot Password",
    nonce: res.locals.nonce,
  });
};

exports.postForgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    logger.warn(`Password reset requested for non-existent user: ${email}`);
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
      logger.error(
        `Error sending password reset email to ${email} - ${error.message}`
      );
      res.status(500).send("Error sending email");
    } else {
      logger.info(`Password reset email sent to ${email}`);
      res.send("Password reset link has been sent to your email");
    }
  });
};

exports.getResetPassword = (req, res) => {
  const { token } = req.params;
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      logger.warn(`Invalid or expired token used for password reset: ${token}`);
      return res.status(400).send("Invalid or expired token");
    }
    res.render("resetPassword", {
      title: "Reset Password",
      token,
      nonce: res.locals.nonce,
    });
  });
};

exports.postResetPassword = async (req, res) => {
  const { token, password } = req.body;

  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      logger.warn(`Invalid or expired token used for password reset: ${token}`);
      return res.status(400).send("Invalid or expired token");
    }

    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      logger.warn(
        `Password reset requested for non-existent user: ${decoded.email}`
      );
      return res.status(404).send("User not found");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    logger.info(`Password reset successfully for user: ${decoded.email}`);
    res.render("passwordResetSuccess", {
      title: "Password Reset Success",
      nonce: res.locals.nonce,
    });
  });
};
