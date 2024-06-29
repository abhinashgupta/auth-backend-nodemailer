require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const csurf = require("csurf");
const csrfMiddleware = require("./middlewares/csrfMiddleware");
const nonceMiddleware = require("./middlewares/nonceMiddleware");
const connectDB = require("./db/connection");
const logger = require("./logger");

const app = express();

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const passwordRoutes = require("./routes/passwordRoutes");

connectDB();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Use nonce middleware
app.use(nonceMiddleware);
// Use Helmet to secure headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
        // Add more directives as needed
      },
    },
  })
);

// CSRF protection
const csrfProtection = csurf({ cookie: true });
app.use(csrfProtection);
app.use(csrfMiddleware);

const PORT = process.env.PORT || 4000;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/", authRoutes);
app.use("/", dashboardRoutes);
app.use("/", passwordRoutes);

app.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err.message);
  logger.error(err.stack);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

module.exports = app;
