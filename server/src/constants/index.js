const ROLES = Object.freeze({
  VICTIM: "victim",
  VOLUNTEER: "volunteer",
  NGO: "ngo",
  ADMIN: "admin",
});

const REQUEST_STATUS = Object.freeze({
  PENDING: "pending",
  ACCEPTED: "accepted",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
});

const REQUEST_URGENCY = Object.freeze({
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
});

const REQUEST_TYPE = Object.freeze({
  RESCUE: "rescue",
  MEDICAL: "medical",
  FOOD: "food",
  SHELTER: "shelter",
  WATER: "water",
  OTHER: "other",
});

module.exports = { ROLES, REQUEST_STATUS, REQUEST_URGENCY, REQUEST_TYPE };
