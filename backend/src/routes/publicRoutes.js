const express = require("express");
const { validate } = require("../middleware/validate");
const { publicSubmissionLimiter } = require("../middleware/rateLimiters");
const publicRegistrationController = require("../controllers/publicRegistrationController");
const publicDraftController = require("../controllers/publicDraftController");
const publicLocationController = require("../controllers/publicLocationController");
const {
  individualRegistrationSchema,
  familyRegistrationSchema,
  saveDraftSchema
} = require("../validators/registrationValidators");

const router = express.Router();

router.get("/locations/search", publicLocationController.searchLocations);

router.post(
  "/registrations/individual",
  publicSubmissionLimiter,
  validate(individualRegistrationSchema),
  publicRegistrationController.submitIndividual
);

router.post(
  "/registrations/family",
  publicSubmissionLimiter,
  validate(familyRegistrationSchema),
  publicRegistrationController.submitFamily
);

router.get("/drafts/:sessionId", publicDraftController.getDraft);
router.put("/drafts/:sessionId", validate(saveDraftSchema), publicDraftController.saveDraft);
router.delete("/drafts/:sessionId", publicDraftController.deleteDraft);

module.exports = router;
