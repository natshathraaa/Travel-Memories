const Journal = require("../models/Journal");
const { uploadBufferToCloudinary } = require("../config/cloudinary");

const uploadPhotoFiles = async (files = []) => {
  if (!Array.isArray(files) || files.length === 0) {
    return [];
  }

  const uploads = files.map(async (file) => {
    const result = await uploadBufferToCloudinary(file.buffer);
    return result.secure_url;
  });

  return Promise.all(uploads);
};

// CREATE JOURNAL
exports.createJournal = async (req, res, next) => {
  try {
    const uploadedPhotoUrls = await uploadPhotoFiles(req.files);
    const existingPhotos = Array.isArray(req.body.photos) ? req.body.photos : [];

    const journal = await Journal.create({
      userId: req.user._id, // store only user ID
      ...req.body,
      photos: [...existingPhotos, ...uploadedPhotoUrls],
    });
    return res.status(201).json(journal);
  } catch (error) {
    return next(error);
  }
};

// GET MY JOURNALS
exports.getMyJournals = async (req, res, next) => {
  try {
    const journals = await Journal.find({ userId: req.user._id });
    return res.json(journals);
  } catch (error) {
    return next(error);
  }
};

// GET SINGLE JOURNAL (for edit mode)
exports.getJournal = async (req, res, next) => {
  try {
    const journal = await Journal.findById(req.params.id);

    if (!journal) {
      return res.status(404).json({ message: "Journal not found" });
    }

    if (journal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    return res.json(journal);
  } catch (error) {
    return next(error);
  }
};

// GET MAP DATA
exports.getMyJournalMap = async (req, res, next) => {
  try {
    const journals = await Journal.find({ userId: req.user._id }).select(
      "placeName location.latitude location.longitude"
    );

    const mapData = journals.map((journal) => ({
      journalId: journal._id,
      placeName: journal.placeName,
      latitude: journal.location ? journal.location.latitude : undefined,
      longitude: journal.location ? journal.location.longitude : undefined,
    }));

    return res.json(mapData);
  } catch (error) {
    return next(error);
  }
};

// GET GALLERY DATA
exports.getMyGallery = async (req, res, next) => {
  try {
    const journals = await Journal.find({ userId: req.user._id }).select(
      "placeName photos"
    );

    const gallery = journals.map((journal) => ({
      journalId: journal._id,
      placeName: journal.placeName,
      photos: Array.isArray(journal.photos) ? journal.photos : [],
    }));

    return res.json(gallery);
  } catch (error) {
    return next(error);
  }
};

// UPDATE JOURNAL
exports.updateJournal = async (req, res, next) => {
  try {
    const journal = await Journal.findById(req.params.id);

    if (!journal) {
      return res.status(404).json({ message: "Journal not found" });
    }

    if (journal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const uploadedPhotoUrls = await uploadPhotoFiles(req.files);
    const existingPhotos = Array.isArray(req.body.photos)
      ? req.body.photos
      : journal.photos || [];

    Object.assign(journal, req.body);
    journal.photos = [...existingPhotos, ...uploadedPhotoUrls];
    await journal.save();

    return res.json(journal);
  } catch (error) {
    return next(error);
  }
};

// DELETE JOURNAL
exports.deleteJournal = async (req, res, next) => {
  try {
    const journal = await Journal.findById(req.params.id);

    if (!journal) {
      return res.status(404).json({ message: "Journal not found" });
    }

    if (journal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await journal.deleteOne();
    return res.json({ message: "Journal deleted successfully" });
  } catch (error) {
    return next(error);
  }
};
