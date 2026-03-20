const { z } = require("zod");
const { AGE_BRACKETS, GENDERS } = require("../config/constants");

const requiredName = z.string().trim().min(2).max(120);
const optionalPhone = z
  .string()
  .trim()
  .regex(/^[0-9+()\-\s]{7,20}$/)
  .optional()
  .or(z.literal(""));
const gender = z.enum(GENDERS);
const ageBracket = z.enum(AGE_BRACKETS);
const optionalLocation = z.string().trim().min(2).max(120).optional();
const optionalSubcounty = z.string().trim().min(2).max(120).optional();

module.exports = {
  z,
  requiredName,
  optionalPhone,
  gender,
  ageBracket,
  optionalLocation,
  optionalSubcounty
};
