const { z } = require("zod");

const adminLoginSchema = z.object({
  username: z.string().trim().min(3).max(60),
  password: z.string().min(8).max(200)
});

module.exports = {
  adminLoginSchema
};
