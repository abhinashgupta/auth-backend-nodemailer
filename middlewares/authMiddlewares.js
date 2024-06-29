// middlewares/authMiddleware.js
require("dotenv").config();
const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY;
const logger = require("../logger");

const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        logger.warn(`Failed token verification for user: ${err.message}`);
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    logger.warn(`Unauthorized access attempt`);
    res.sendStatus(401);
  }
};

const authorizeRole = (role) => {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      logger.warn(`Forbidden access attempt by user: ${req.user.email}`);
      res.sendStatus(403);
    }
  };
};

module.exports = {
  authenticateJWT,
  authorizeRole,
};
