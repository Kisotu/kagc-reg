const bcrypt = require("bcryptjs");
const asyncHandler = require("../utils/asyncHandler");
const adminUserRepository = require("../repositories/adminUserRepository");

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = adminUserRepository.findByUsername(username);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  req.session.adminUserId = user.id;
  adminUserRepository.updateLastLogin(user.id);

  return res.json({
    message: "Login successful",
    data: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  });
});

const me = asyncHandler(async (req, res) => {
  if (!req.session?.adminUserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = adminUserRepository.findById(req.session.adminUserId);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  return res.json({ data: user });
});

const logout = asyncHandler(async (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("kagc.sid");
    res.status(204).send();
  });
});

const csrfToken = asyncHandler(async (req, res) => {
  if (!req.csrfToken) {
    return res.status(404).json({ message: "CSRF is not enabled" });
  }
  return res.json({ csrfToken: req.csrfToken() });
});

module.exports = {
  login,
  me,
  logout,
  csrfToken
};
