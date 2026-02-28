const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getMyGallery } = require("../controllers/journalController");

router.get("/", protect, getMyGallery);

module.exports = router;
