const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  validateJournalCreate,
  validateJournalUpdate,
} = require("../middleware/validation");
const {
  uploadPhotos,
  normalizeJournalPayload,
} = require("../middleware/uploadMiddleware");
const {
  createJournal,
  getMyJournals,
  getJournal,
  getMyJournalMap,
  updateJournal,
  deleteJournal,
} = require("../controllers/journalController");

router.post(
  "/",
  protect,
  uploadPhotos,
  normalizeJournalPayload,
  validateJournalCreate,
  createJournal
);
router.get("/map", protect, getMyJournalMap);
router.get("/:id", protect, getJournal);
router.get("/", protect, getMyJournals);
router.put(
  "/:id",
  protect,
  uploadPhotos,
  normalizeJournalPayload,
  validateJournalUpdate,
  updateJournal
);
router.delete("/:id", protect, deleteJournal);

module.exports = router;
