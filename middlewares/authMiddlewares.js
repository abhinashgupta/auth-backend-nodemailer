require('dotenv').config();
const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY;

const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token;
  console.log("Token from cookies:", token); 
  if (token) {
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      console.log("User authenticated:", user); 
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

const authorizeRole = (role) => {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.sendStatus(403);
    }
  };
};

module.exports = {
  authenticateJWT,
  authorizeRole,
};
