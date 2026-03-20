const express = require("express");
const { validate } = require("../middleware/validate");
const adminMemberController = require("../controllers/adminMemberController");
const { membersQuerySchema } = require("../validators/adminValidators");

const router = express.Router();

router.get("/", validate(membersQuerySchema, "query"), adminMemberController.listMembers);
router.get("/export.csv", validate(membersQuerySchema, "query"), adminMemberController.exportMembersCsv);
router.get("/families/:familyId/members", adminMemberController.listFamilyMembers);

module.exports = router;
