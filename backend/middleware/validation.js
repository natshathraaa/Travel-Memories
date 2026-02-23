const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const isValidDate = (value) => {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const isStringArray = (value) =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isNumber = (value) => typeof value === "number" && !Number.isNaN(value);

const validateLocation = (location) => {
  if (location === undefined) return true;
  if (location === null || typeof location !== "object" || Array.isArray(location)) {
    return false;
  }

  const { city, state, country, latitude, longitude } = location;

  if (city !== undefined && !isNonEmptyString(city)) return false;
  if (state !== undefined && !isNonEmptyString(state)) return false;
  if (country !== undefined && !isNonEmptyString(country)) return false;
  if (latitude !== undefined && !isNumber(latitude)) return false;
  if (longitude !== undefined && !isNumber(longitude)) return false;

  return true;
};

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!isNonEmptyString(name)) {
    return res.status(400).json({ message: "Name is required" });
  }

  if (!isNonEmptyString(email) || !email.includes("@")) {
    return res.status(400).json({ message: "Valid email is required" });
  }

  if (!isNonEmptyString(password) || password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  return next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!isNonEmptyString(email) || !email.includes("@")) {
    return res.status(400).json({ message: "Valid email is required" });
  }

  if (!isNonEmptyString(password)) {
    return res.status(400).json({ message: "Password is required" });
  }

  return next();
};

const validateJournalCreate = (req, res, next) => {
  const { placeName, date, story, photos, isPublic, isFavorite, tags, location } = req.body;

  if (!isNonEmptyString(placeName)) {
    return res.status(400).json({ message: "placeName is required" });
  }

  if (!isValidDate(date)) {
    return res.status(400).json({ message: "date must be a valid date" });
  }

  if (!isNonEmptyString(story)) {
    return res.status(400).json({ message: "story is required" });
  }

  if (photos !== undefined && !isStringArray(photos)) {
    return res.status(400).json({ message: "photos must be an array of strings" });
  }

  if (isPublic !== undefined && typeof isPublic !== "boolean") {
    return res.status(400).json({ message: "isPublic must be a boolean" });
  }

  if (isFavorite !== undefined && typeof isFavorite !== "boolean") {
    return res.status(400).json({ message: "isFavorite must be a boolean" });
  }

  if (!validateLocation(location)) {
    return res.status(400).json({ message: "location must be a valid object" });
  }

  if (tags !== undefined && !isStringArray(tags)) {
    return res.status(400).json({ message: "tags must be an array of strings" });
  }

  return next();
};

const validateJournalUpdate = (req, res, next) => {
  const { placeName, date, story, photos, isPublic, isFavorite, tags, location } = req.body;

  const hasAnyField =
    placeName !== undefined ||
    date !== undefined ||
    story !== undefined ||
    photos !== undefined ||
    isPublic !== undefined ||
    isFavorite !== undefined ||
    tags !== undefined ||
    location !== undefined;

  if (!hasAnyField) {
    return res
      .status(400)
      .json({ message: "At least one field must be provided" });
  }

  if (placeName !== undefined && !isNonEmptyString(placeName)) {
    return res.status(400).json({ message: "placeName must be a non-empty string" });
  }

  if (date !== undefined && !isValidDate(date)) {
    return res.status(400).json({ message: "date must be a valid date" });
  }

  if (story !== undefined && !isNonEmptyString(story)) {
    return res.status(400).json({ message: "story must be a non-empty string" });
  }

  if (photos !== undefined && !isStringArray(photos)) {
    return res.status(400).json({ message: "photos must be an array of strings" });
  }

  if (isPublic !== undefined && typeof isPublic !== "boolean") {
    return res.status(400).json({ message: "isPublic must be a boolean" });
  }

  if (isFavorite !== undefined && typeof isFavorite !== "boolean") {
    return res.status(400).json({ message: "isFavorite must be a boolean" });
  }

  if (!validateLocation(location)) {
    return res.status(400).json({ message: "location must be a valid object" });
  }

  if (tags !== undefined && !isStringArray(tags)) {
    return res.status(400).json({ message: "tags must be an array of strings" });
  }

  return next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateJournalCreate,
  validateJournalUpdate,
};
