// Usage: router.post("/", protect, allowRoles("ngo", "admin"), handler)
const allowRoles =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `Access denied. This action requires one of the following roles: ${roles.join(", ")}`
      );
    }
    next();
  };

module.exports = { allowRoles };
