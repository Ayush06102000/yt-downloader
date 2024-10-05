const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();

app.use(cors());
app.use(express.json());

// Root endpoint to check server status
app.get("/", (req, res) => {
  res.send("It's Working");
});

// Download endpoint with Puppeteer
app.post("/download", async (req, res) => {
  try {
    const { url } = req.body;

    // Validate the URL
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true, // Keep headless for Render
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Needed for Docker environments
    });

    const page = await browser.newPage();
    
    // Go to the YouTube video page
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Extract video title (modify this selector based on the page structure)
    const videoTitle = await page.$eval('h1.title', el => el.textContent);

    // Extract video URL (this would depend on how YouTube serves the video in Shorts, adapt as needed)
    const videoSrc = await page.evaluate(() => {
      const videoElement = document.querySelector('video');
      return videoElement ? videoElement.src : null;
    });

    await browser.close();

    if (!videoSrc) {
      return res.status(404).json({ error: "Video URL not found" });
    }

    // Send video title and URL in response
    return res.json({
      title: videoTitle,
      url: videoSrc
    });
    
  } catch (error) {
    console.error("Error during Puppeteer execution:", error);

    // Send error message back to the client
    return res.status(500).json({ error: "Failed to retrieve video", details: error.message });
  }
});

// Set the port for the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
