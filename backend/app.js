const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/journals", require("./routes/journalRoutes"));
app.use("/api/gallery", require("./routes/galleryRoutes"));
app.use("/api/geocode", require("./routes/geocodeRoutes"));

app.use((req, res, next) => {
  res.status(404);
  next(new Error("Route not found"));
});

app.use(errorHandler);

module.exports = app;
