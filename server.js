/* 
    Warum löst das dein CORS-Problem?

    Wenn du die HTML-Datei direkt mit file:// öffnest, 
    interpretiert der Browser das als „andere Origin“ → CORS blockiert.

    Wenn du sie über http://localhost:3000 lädst, sind HTML, JS und CSS vom gleichen Origin
    → keine CORS-Fehler mehr.
*/

// server.js (ESM Variante)
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const PORT = 3000;

// __dirname sauber für ESM konstruieren
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // aktuelles Projektverzeichnis

http
  .createServer((req, res) => {
    // URL-Objekt statt url.parse (deprecated)
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);
    let pathname = path.join(__dirname, requestUrl.pathname);

    // Prüfen ob Pfad existiert
    if (fs.existsSync(pathname) && fs.statSync(pathname).isDirectory()) {
      pathname = path.join(pathname, "index.html");
    }

    fs.readFile(pathname, (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.end(`File not found: ${pathname}`);
        return;
      }

      // Content-Type bestimmen
      const ext = path.extname(pathname).toLowerCase();
      const map = {
        ".html": "text/html; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".js": "application/javascript; charset=utf-8",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
      };

      res.setHeader("Content-Type", map[ext] || "application/octet-stream");
      res.end(data);
    });
  })
  .listen(PORT, () => {
    console.log(`✅ Server läuft auf http://localhost:${PORT}`);
  });
