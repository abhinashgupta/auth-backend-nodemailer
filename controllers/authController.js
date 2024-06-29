// authController.js
require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const logger = require("../logger");
const secretKey = process.env.SECRET_KEY;

exports.getRegister = (req, res) => {
  res.render("register", { title: "Register", csrfToken: req.csrfToken() });
};

exports.getLogin = (req, res) => {
  res.render("login", { title: "Login", csrfToken: req.csrfToken() });
};

// authController.js
exports.register = async (req, res) => {
  const { email, password, role, _csrf } = req.body;
  console.log('CSRF Token Received:', _csrf); // Log the received CSRF token

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword, role });

  try {
    await user.save();
    logger.info(`User registered: ${email}`);
    res.redirect("/login");
  } catch (error) {
    logger.error(`Error registering user: ${email} - ${error.message}`);
    res.status(500).send("Error registering user");
  }
};




exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    logger.warn(`Login attempt failed for non-existent user: ${email}`);
    return res.status(401).send("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (isPasswordValid) {
    const token = jwt.sign({ email, role: user.role }, secretKey);
    res.cookie("token", token, { httpOnly: true });
    logger.info(`User logged in: ${email}`);
    if (user.role === "user") {
      res.redirect("/user");
    } else if (user.role === "admin") {
      res.redirect("/admin");
    } else {
      res.redirect("/login");
    }
  } else {
    logger.warn(`Login attempt failed for user: ${email}`);
    res.status(401).send("Invalid email or password");
  }
};
