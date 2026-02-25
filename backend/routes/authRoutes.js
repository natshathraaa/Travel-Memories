const express = require("express");
const router = express.Router();
const {
	registerUser,
	loginUser,
	refreshAccessToken,
	verifyToken,
	logoutUser,
} = require("../controllers/authController");
const { validateRegister, validateLogin } = require("../middleware/validation");

router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);
router.post("/refresh", refreshAccessToken);
router.get("/me", verifyToken);
router.post("/logout", logoutUser);

module.exports = router;
