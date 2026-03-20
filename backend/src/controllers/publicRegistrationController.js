const asyncHandler = require("../utils/asyncHandler");
const registrationService = require("../services/registrationService");

const submitIndividual = asyncHandler(async (req, res) => {
  const result = registrationService.submitIndividualRegistration(req.body);
  res.status(201).json({
    message: "Registration submitted for admin review",
    data: result
  });
});

const submitFamily = asyncHandler(async (req, res) => {
  const result = registrationService.submitFamilyRegistration(req.body);
  res.status(201).json({
    message: "Family registration submitted for admin review",
    data: result
  });
});

module.exports = {
  submitIndividual,
  submitFamily
};
