const {
  z,
  requiredName,
  optionalPhone,
  gender,
  ageBracket,
  optionalLocation,
  optionalSubcounty
} = require("./common");

const individualRegistrationSchema = z.object({
  sessionId: z.string().trim().min(8).max(64).optional(),
  name: requiredName,
  phone: optionalPhone,
  gender,
  age_bracket: ageBracket,
  location: optionalLocation,
  subcounty: optionalSubcounty
});

const familyMemberSchema = z.object({
  name: requiredName,
  phone: optionalPhone,
  gender,
  age_bracket: ageBracket,
  location: optionalLocation,
  subcounty: optionalSubcounty
});

const familyRegistrationSchema = z.object({
  sessionId: z.string().trim().min(8).max(64).optional(),
  family_name: z.string().trim().min(2).max(120),
  location: optionalLocation,
  subcounty: optionalSubcounty,
  members: z.array(familyMemberSchema).min(1).max(20)
});

const saveDraftSchema = z.object({
  step: z.string().trim().min(1).max(30).optional(),
  payload: z.record(z.any())
});

module.exports = {
  individualRegistrationSchema,
  familyRegistrationSchema,
  saveDraftSchema
};
