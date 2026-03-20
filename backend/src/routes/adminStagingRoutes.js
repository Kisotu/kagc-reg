const express = require("express");
const { validate } = require("../middleware/validate");
const adminStagingController = require("../controllers/adminStagingController");
const {
  rejectMemberSchema,
  mergeMemberSchema,
  batchQuerySchema
} = require("../validators/adminValidators");

const router = express.Router();

router.get("/batches", validate(batchQuerySchema, "query"), adminStagingController.listBatches);
router.get("/batches/:batchId", adminStagingController.getBatch);
router.get("/members/:memberId/duplicates", adminStagingController.getDuplicates);

router.post("/members/:memberId/approve", adminStagingController.approveMember);
router.post(
  "/members/:memberId/reject",
  validate(rejectMemberSchema),
  adminStagingController.rejectMember
);
router.post(
  "/members/:memberId/merge",
  validate(mergeMemberSchema),
  adminStagingController.mergeMember
);

module.exports = router;
