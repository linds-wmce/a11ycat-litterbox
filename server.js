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

    // Create a simple jsdom without scripts
    const dom = new JSDOM(html, { 
      url,
      runScripts: "outside-only"
    });
    
    const { window } = dom;
    const { document } = window;

    // Polyfill/stub MutationObserver to prevent errors
    window.MutationObserver = class MutationObserver {
      constructor(callback) {
        this.callback = callback;
      }
      observe() {}
      disconnect() {}
      takeRecords() { return []; }
    };

    // Execute axe-core in the window context using vm.runInContext
    const vm = await import('vm');
    const context = vm.createContext(window);
    vm.runInContext(axeSource, context);
    
    // Get axe from the window
    const axe = window.axe;

    // Configure axe to work better with jsdom
    axe.configure({
      branding: { application: 'a11ycat' },
      noHtml: false
    });

    // Run axe-core analysis
    const results = await new Promise((resolve, reject) => {
      axe.run(document, {
        // Disable rules that require MutationObserver or problematic APIs
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']
        }
      }, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
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
