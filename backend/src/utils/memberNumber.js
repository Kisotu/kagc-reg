function toMemberNumber(sequenceValue) {
  return `KAGC-${String(sequenceValue).padStart(5, "0")}`;
}

module.exports = {
  toMemberNumber
};
