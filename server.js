const express = require("express");
const shortid = require("shortid");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const Url = require("./models/Url");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

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
    shortUrl: `http://localhost:${process.env.PORT}/${shortId}`
  });
});

// Redirect to original URL
app.get("/:shortId", async (req, res) => {
  const url = await Url.findOne({ shortId: req.params.shortId });

  if (!url) {
    return res.status(404).json({ error: "URL not found" });
  }

  res.redirect(url.originalUrl);
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
