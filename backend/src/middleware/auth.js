const adminUserRepository = require("../repositories/adminUserRepository");

function requireAdminAuth(req, res, next) {
  if (!req.session || !req.session.adminUserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = adminUserRepository.findById(req.session.adminUserId);
  if (!user) {
    req.session.destroy(() => {});
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.adminUser = user;
  return next();
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.adminUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.adminUser.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return next();
  };
}

module.exports = {
  requireAdminAuth,
  requireRole
};
