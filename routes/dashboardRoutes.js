const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const {
  authenticateJWT,
  authorizeRole,
} = require("../middlewares/authMiddlewares");

router.get(
  "/admin",
  authenticateJWT,
  authorizeRole("admin"),
  dashboardController.getAdminDashboard
);
router.get(
  "/user",
  authenticateJWT,
  authorizeRole("user"),
  dashboardController.getUserDashboard
);

module.exports = router;
