const asyncHandler = require("../utils/asyncHandler");

const indexPage = asyncHandler(async (req, res) => {
  res.render("index", {
    title: "KAGC Registration Backend",
    now: new Date().toISOString()
  });
});

module.exports = {
  indexPage
};
