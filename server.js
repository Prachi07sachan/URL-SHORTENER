const express = require("express");
const shortid = require("shortid");

const app = express();
app.use(express.json());

const urlDB = {}; 

// Create short URL
app.post("/shorten", (req, res) => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: "URL is required" });
  }

  const shortId = shortid.generate();
  urlDB[shortId] = originalUrl;

  res.json({
    shortUrl: `http://localhost:3000/${shortId}`
  });
});

// Redirect 
app.get("/:shortId", (req, res) => {
  const originalUrl = urlDB[req.params.shortId];

  if (!originalUrl) {
    return res.status(404).json({ error: "URL not found" });
  }

  res.redirect(originalUrl);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
