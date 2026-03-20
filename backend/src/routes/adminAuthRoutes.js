const express = require("express");
const { validate } = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimiters");
const { requireAdminAuth } = require("../middleware/auth");
const adminAuthController = require("../controllers/adminAuthController");
const { adminLoginSchema } = require("../validators/authValidators");

const router = express.Router();

router.post("/login", authLimiter, validate(adminLoginSchema), adminAuthController.login);
router.get("/me", requireAdminAuth, adminAuthController.me);
router.get("/csrf-token", requireAdminAuth, adminAuthController.csrfToken);
router.post("/logout", requireAdminAuth, adminAuthController.logout);

module.exports = router;
