const validator = require("validator");

const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) errors.push("Name must be at least 2 characters");
  if (!email || !validator.isEmail(email)) errors.push("A valid email is required");
  if (!password || password.length < 6) errors.push("Password must be at least 6 characters");
  if (role && !["victim", "volunteer", "ngo", "admin"].includes(role)) errors.push("Invalid role");

  if (errors.length) {
    res.status(400);
    return next(new Error(errors.join(". ")));
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !validator.isEmail(email) || !password) {
    res.status(400);
    return next(new Error("A valid email and password are required"));
  }
  next();
};

module.exports = { validateRegister, validateLogin };
