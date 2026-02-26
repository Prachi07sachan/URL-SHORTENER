const express = require("express");
const shortid = require("shortid");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const Url = require("./models/Url");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(express.static("public"));

// Create short URL
app.post("/shorten", async (req, res) => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: "URL is required" });
  }

  const shortId = shortid.generate();

  const newUrl = new Url({
    shortId,
    originalUrl
  });

  await newUrl.save();

  res.json({
    shortUrl: `http://localhost:${process.env.PORT}/${shortId}`,
    shortId: shortId
  });
});

// Get URL info (for clicks and QR code)
app.get("/api/url/:shortId", async (req, res) => {
  const url = await Url.findOne({ shortId: req.params.shortId, isDeleted: false });

  if (!url) {
    return res.status(404).json({ error: "URL not found" });
  }

  res.json({
    shortId: url.shortId,
    originalUrl: url.originalUrl,
    clicks: url.clicks,
    createdAt: url.createdAt,
    shortUrl: `http://localhost:${process.env.PORT}/${url.shortId}`
  });
});

// Delete URL
app.delete("/api/url/:shortId", async (req, res) => {
  const url = await Url.findOne({ shortId: req.params.shortId });

  if (!url) {
    return res.status(404).json({ error: "URL not found" });
  }

  url.isDeleted = true;
  await url.save();

  res.json({ message: "URL deleted successfully" });
});

// Redirect to original URL
app.get("/:shortId", async (req, res) => {
  const url = await Url.findOne({ shortId: req.params.shortId, isDeleted: false });

  if (!url) {
    return res.status(404).send("URL not found");
  }

  // Increment clicks
  url.clicks += 1;
  await url.save();

  res.redirect(url.originalUrl);
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
