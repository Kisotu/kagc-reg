const { z } = require("zod");

const rejectMemberSchema = z.object({
  reason: z.string().trim().min(2).max(250)
});

const mergeMemberSchema = z.object({
  targetMemberId: z.number().int().positive()
});

const batchQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "merged"]).optional(),
  location: z.string().trim().min(2).max(120).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
});

const membersQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  location: z.string().trim().max(120).optional(),
  ageBracket: z.string().trim().max(20).optional(),
  familyId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
});

module.exports = {
  rejectMemberSchema,
  mergeMemberSchema,
  batchQuerySchema,
  membersQuerySchema
};
