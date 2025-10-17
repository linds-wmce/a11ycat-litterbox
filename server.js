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

    // load into jsdom with script execution enabled
    const dom = new JSDOM(html, { 
      url,
      runScripts: "dangerously",
      resources: "usable",
      beforeParse(window) {
        // Inject axe-core before the page parses
        const script = window.document.createElement("script");
        script.textContent = axeSource;
        window.document.head.appendChild(script);
      }
    });
    
    const { window } = dom;

    // Wait a bit for the page to settle and axe to initialize
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if axe is available
    if (typeof window.axe === 'undefined') {
      throw new Error('Axe-core failed to load in jsdom');
    }

    // run axe in the jsdom context
    const results = await new Promise((resolve, reject) => {
      // Set up the callback in the window context
      window._axeCallback = function(err, results) {
        if (err) reject(err);
        else resolve(results);
      };
      
      // Run axe using window.eval to execute in the right context
      try {
        window.eval('axe.run(document, window._axeCallback);');
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
