const asyncHandler = require("../utils/asyncHandler");
const draftRepository = require("../repositories/draftRepository");

const getDraft = asyncHandler(async (req, res) => {
  const draft = draftRepository.getDraft(req.params.sessionId);
  if (!draft) {
    return res.status(404).json({ message: "Draft not found" });
  }

  return res.json({
    data: {
      session_id: draft.session_id,
      step: draft.step,
      payload: JSON.parse(draft.payload),
      updated_at: draft.updated_at
    }
  });
});

const saveDraft = asyncHandler(async (req, res) => {
  const draft = draftRepository.upsertDraft(
    req.params.sessionId,
    req.body.payload,
    req.body.step || null
  );

  return res.json({
    message: "Draft saved",
    data: {
      session_id: draft.session_id,
      step: draft.step,
      payload: JSON.parse(draft.payload),
      updated_at: draft.updated_at
    }
  });
});

const deleteDraft = asyncHandler(async (req, res) => {
  draftRepository.deleteDraft(req.params.sessionId);
  return res.status(204).send();
});

module.exports = {
  getDraft,
  saveDraft,
  deleteDraft
};
