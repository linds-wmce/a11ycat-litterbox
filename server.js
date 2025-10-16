import express from "express";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read axe-core source
const axeSource = fs.readFileSync(
  join(__dirname, "node_modules", "axe-core", "axe.min.js"),
  "utf8"
);

const app = express();
app.use(cors());
app.use(express.json());

app.post("/audit", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    // fetch the HTML
    const response = await fetch(url);
    const html = await response.text();

    // load into jsdom
    const dom = new JSDOM(html, { 
      url,
      runScripts: "dangerously",
      resources: "usable"
    });
    const { window } = dom;

    // Inject axe-core into the jsdom window
    const scriptElement = window.document.createElement("script");
    scriptElement.textContent = axeSource;
    window.document.head.appendChild(scriptElement);

    // Wait for axe to be available
    await new Promise(resolve => setTimeout(resolve, 100));

    // run axe in the jsdom context with proper callback handling
    const results = await new Promise((resolve, reject) => {
      try {
        // Set up callback in window context
        window.axeCallback = (err, results) => {
          if (err) reject(err);
          else resolve(results);
        };
        
        // Run axe
        window.eval('axe.run(document, window.axeCallback)');
      } catch (err) {
        reject(err);
      }
    });

    res.json(results);
  } catch (error) {
    const errorId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.error("🐾 Audit failed:", errorId, error);
    res.status(500).json({ 
      id: errorId,
      error: "Audit failed", 
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🐱 a11ycat-litterbox running on port ${PORT}`);
});
