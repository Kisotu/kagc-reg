const express = require("express");
const adminAnalyticsController = require("../controllers/adminAnalyticsController");

const router = express.Router();

router.get("/summary", adminAnalyticsController.summary);
router.get("/by-location", adminAnalyticsController.byLocation);
router.get("/by-age-bracket", adminAnalyticsController.byAgeBracket);

module.exports = router;
