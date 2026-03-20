const asyncHandler = require("../utils/asyncHandler");
const stagingRepository = require("../repositories/stagingRepository");
const approvalService = require("../services/approvalService");
const auditService = require("../services/auditService");

const listBatches = asyncHandler(async (req, res) => {
  const result = stagingRepository.listBatches(req.query);
  res.json({ data: result.rows, pagination: result.pagination });
});

const getBatch = asyncHandler(async (req, res) => {
  const batch = stagingRepository.getBatchWithMembers(Number(req.params.batchId));
  if (!batch) {
    return res.status(404).json({ message: "Batch not found" });
  }

  return res.json({ data: batch });
});

const getDuplicates = asyncHandler(async (req, res) => {
  const candidates = stagingRepository.listDuplicateCandidatesForMember(Number(req.params.memberId));
  return res.json({ data: candidates });
});

const approveMember = asyncHandler(async (req, res) => {
  const out = approvalService.approveStagingMember(Number(req.params.memberId), req.adminUser.id);

  auditService.logAdminAction({
    adminUserId: req.adminUser.id,
    action: "approve_staging_member",
    entityType: "staging_member",
    entityId: Number(req.params.memberId),
    metadata: { createdMemberId: out.member.id }
  });

  return res.json({
    message: "Staging member approved",
    data: out
  });
});

const rejectMember = asyncHandler(async (req, res) => {
  const out = approvalService.rejectStagingMember(
    Number(req.params.memberId),
    req.adminUser.id,
    req.body.reason
  );

  auditService.logAdminAction({
    adminUserId: req.adminUser.id,
    action: "reject_staging_member",
    entityType: "staging_member",
    entityId: Number(req.params.memberId),
    metadata: { reason: req.body.reason }
  });

  return res.json({
    message: "Staging member rejected",
    data: out
  });
});

const mergeMember = asyncHandler(async (req, res) => {
  const out = approvalService.mergeStagingMember(
    Number(req.params.memberId),
    req.adminUser.id,
    req.body.targetMemberId
  );

  auditService.logAdminAction({
    adminUserId: req.adminUser.id,
    action: "merge_staging_member",
    entityType: "staging_member",
    entityId: Number(req.params.memberId),
    metadata: { targetMemberId: req.body.targetMemberId }
  });

  return res.json({
    message: "Staging member merged",
    data: out
  });
});

module.exports = {
  listBatches,
  getBatch,
  getDuplicates,
  approveMember,
  rejectMember,
  mergeMember
};
