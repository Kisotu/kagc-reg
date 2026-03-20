const express = require("express");
const { requireAdminAuth, requireRole } = require("../middleware/auth");
const { ROLES } = require("../config/constants");

const publicRoutes = require("./publicRoutes");
const adminAuthRoutes = require("./adminAuthRoutes");
const adminStagingRoutes = require("./adminStagingRoutes");
const adminMemberRoutes = require("./adminMemberRoutes");
const adminAnalyticsRoutes = require("./adminAnalyticsRoutes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.use("/public", publicRoutes);
router.use("/admin/auth", adminAuthRoutes);

router.use("/admin/staging", requireAdminAuth, requireRole([ROLES.ADMIN, ROLES.DATA_CLEANER]), adminStagingRoutes);
router.use("/admin/members", requireAdminAuth, requireRole([ROLES.ADMIN, ROLES.DATA_CLEANER]), adminMemberRoutes);
router.use("/admin/analytics", requireAdminAuth, requireRole([ROLES.ADMIN, ROLES.DATA_CLEANER]), adminAnalyticsRoutes);

module.exports = router;
