// csrfMiddleware.js
module.exports = (req, res, next) => {
  const csrfToken = req.csrfToken();
  res.cookie("XSRF-TOKEN", csrfToken); // Set CSRF token in a cookie
  res.locals.csrfToken = csrfToken;
  console.log("Generated CSRF Token:", csrfToken); // Log the generated CSRF token
  next();
};
