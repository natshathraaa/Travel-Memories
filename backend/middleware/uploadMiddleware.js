const multer = require("multer");

const storage = multer.memoryStorage();

const uploadPhotos = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
      return;
    }
    cb(new Error("Only image files are allowed"));
  },
}).array("photosFiles", 10);

const parseMaybeJson = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;

  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
};

const parseBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
};

const normalizeJournalPayload = (req, res, next) => {
  req.body.location = parseMaybeJson(req.body.location, undefined);
  req.body.tags = parseMaybeJson(req.body.tags, undefined);
  req.body.photos = parseMaybeJson(req.body.photos, undefined);

  req.body.isPublic = parseBoolean(req.body.isPublic);
  req.body.isFavorite = parseBoolean(req.body.isFavorite);

  next();
};

module.exports = { uploadPhotos, normalizeJournalPayload };