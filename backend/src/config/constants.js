const AGE_BRACKETS = [
  "0-5",
  "6-10",
  "11-15",
  "16-25",
  "26-35",
  "36-45",
  "46-55",
  "56+"
];

const GENDERS = ["male", "female"];

const ROLES = {
  ADMIN: "admin",
  DATA_CLEANER: "data_cleaner"
};

const STAGING_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  MERGED: "merged"
};

const BATCH_TYPE = {
  INDIVIDUAL: "individual",
  FAMILY: "family"
};

module.exports = {
  AGE_BRACKETS,
  GENDERS,
  ROLES,
  STAGING_STATUS,
  BATCH_TYPE
};
