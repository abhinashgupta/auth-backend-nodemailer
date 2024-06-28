const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const connectDB = require("./db/connection");
const app = express();



const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const passwordRoutes = require("./routes/passwordRoutes");

connectDB();


app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PORT = 3000;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/", authRoutes);
app.use("/", dashboardRoutes);
app.use("/", passwordRoutes);

app.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
