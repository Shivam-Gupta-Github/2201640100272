const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 3000;
const HOST = "http://localhost";

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  })
);
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect(
    "mongodb+srv://shivu:shivamgupta2004@cluster0.cuboorm.mongodb.net/urlshortener"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Schema & Model
const urlSchema = new mongoose.Schema({
  url: { type: String, required: true },
  shortcode: { type: String, required: true, unique: true },
  expiry: { type: Date, required: true },
});

const Url = mongoose.model("Url", urlSchema);

// Helper: URL validation
function isValidUrl(userInput) {
  try {
    new URL(userInput);
    return true;
  } catch {
    return false;
  }
}

// Helper: Random shortcode generator
function generateShortcode(length = 6) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// POST /shorturls
app.post("/shorturls", async (req, res) => {
  try {
    let { url, shortcode, validity } = req.body;

    if (!url || !validity) {
      return res.status(400).json({ error: "url and validity are required" });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // If no shortcode provided, generate one
    if (!shortcode || shortcode.trim() === "") {
      let unique = false;
      while (!unique) {
        shortcode = generateShortcode();
        const existing = await Url.findOne({ shortcode });
        if (!existing) unique = true;
      }
    }

    const expiry = new Date(Date.now() + validity * 60 * 1000); // validity in minutes

    // Save in DB
    const newUrl = new Url({
      url,
      shortcode,
      expiry,
    });

    await newUrl.save();

    res.json({
      shortLink: `${HOST}:${PORT}/${shortcode}`,
      expiry: expiry.toISOString(),
    });
  } catch (err) {
    console.error("Error saving URL:", err); // log error
    if (err.code === 11000) {
      return res.status(400).json({ error: "Shortcode already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /shorturl/:shortcode (info endpoint)
app.get("/shorturls/:shortcode", async (req, res) => {
  try {
    const { shortcode } = req.params;

    const record = await Url.findOne({ shortcode });

    if (!record) {
      return res.status(404).json({ error: "Shortcode not found" });
    }

    res.json({
      url: record.url,
      shortcode: record.shortcode,
      expiry: record.expiry,
      expired: new Date() > record.expiry,
    });
  } catch (err) {
    console.error("Error in GET info:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /:shortcode (redirect)
app.get("/:shortcode", async (req, res) => {
  try {
    const { shortcode } = req.params;

    const record = await Url.findOne({ shortcode });

    if (!record) {
      return res.status(404).send("Shortcode not found");
    }

    if (new Date() > record.expiry) {
      return res.status(410).send("Link has expired");
    }

    res.redirect(record.url); // redirect to original URL
  } catch (err) {
    console.error("Error in GET:", err);
    res.status(500).send("Internal server error");
  }
});

app.listen(PORT, () => {
  console.log(`Server running at ${HOST}:${PORT}`);
});
