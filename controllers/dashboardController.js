exports.getAdminDashboard = (req, res) => {
  /**
   * @access public
   * @desc used for render the Admin Dashboard page
   * @route /getAdminDashboard
   */
  res.render("admin", { title: "Admin Dashboard" });
};

exports.getUserDashboard = (req, res) => {
  /**
   * @access public
   * @desc used for render the User Dashboard page
   * @route /getUserDashboard
   */
  res.render("user", { title: "User Dashboard" });
};
