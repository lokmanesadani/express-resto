const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  isAuthenticated,
} = require("../controllers/authentication");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/isAuth", isAuthenticated);

module.exports = router;
