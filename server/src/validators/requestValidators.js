const { REQUEST_TYPE, REQUEST_URGENCY } = require("../constants");

const validateCreateRequest = (req, res, next) => {
  const { type, description, district, lng, lat, urgency } = req.body;
  const errors = [];

  if (!type || !Object.values(REQUEST_TYPE).includes(type)) errors.push("A valid request type is required");
  if (!description || description.trim().length < 5) errors.push("Description must be at least 5 characters");
  if (!district || !district.trim()) errors.push("District is required");
  if (lng === undefined || lat === undefined || Number.isNaN(Number(lng)) || Number.isNaN(Number(lat))) {
    errors.push("Valid lng/lat coordinates are required");
  }
  if (urgency && !Object.values(REQUEST_URGENCY).includes(urgency)) errors.push("Invalid urgency level");

  if (errors.length) {
    res.status(400);
    return next(new Error(errors.join(". ")));
  }
  next();
};

module.exports = { validateCreateRequest };
