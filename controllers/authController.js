require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const secretKey = process.env.SECRET_KEY;

exports.register = async (req, res) => {
  /**
   * @access public
   * @desc used for register the particular user role
   * @route /register
   */

  const { email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword, role });

  try {
    await user.save();
    res.redirect("/login");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error registering user");
  }
};

exports.login = async (req, res) => {
  /**
   * @access public
   * @desc used for render the login page
   * @route /login
   */
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).send("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (isPasswordValid) {
    const token = jwt.sign({ email, role: user.role }, secretKey);
    res.cookie("token", token, { httpOnly: true });
    if (user.role === "user") {
      res.redirect("/user");
    } else if (user.role === "admin") {
      res.redirect("/admin");
    } else {
      res.redirect("/login");
    }
  } else {
    res.status(401).send("Invalid email or password");
  }
};
