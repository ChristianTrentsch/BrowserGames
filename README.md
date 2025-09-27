# BrowserGames

Statische Browsergames. Übersichtlich, modern und responsiv gestaltet mit HTML, CSS und JavaScript.

## 🔗 Live-Demo

## ➡️ [https://ChristianTrentsch.github.io/BrowserGames/](https://ChristianTrentsch.github.io/BrowserGames/)

## 📚 Inhaltsverzeichnis

- [BrowserGames](#browsergames)
  - [🔗 Live-Demo](#-live-demo)
  - [➡️ https://ChristianTrentsch.github.io/BrowserGames/](#️-httpschristiantrentschgithubiobrowsergames)
  - [📚 Inhaltsverzeichnis](#-inhaltsverzeichnis)
  - [🏡 Über das Projekt](#-über-das-projekt)
  - [✨ Features](#-features)
  - [🛠️ Technologien](#️-technologien)
  - [🗂️ Lokale Entwicklung](#️-lokale-entwicklung)
    - [ℹ️ Warum löst das mein CORS-Problem?](#ℹ️-warum-löst-das-mein-cors-problem)

---

## 🏡 Über das Projekt

**BrowserGames** ist ein kleines, browserbasiertes Spiel, das ohne Datenbank direkt im Browser läuft. Ziel ist es, Spielern ein unterhaltsames, leicht zugängliches Erlebnis zu bieten.

---

## ✨ Features

- 🎮 Interaktives Gameplay direkt im Browser
- 🕹️ Steuerung mit Tastatur oder Controller
- 🗂️ Lokaler Retro Highscore
- 📱 Responsives Design für Desktop und Mobile
- ⚡ Schnelle Ladezeiten durch statische Struktur

---

## 🛠️ Technologien

- HTML5
- CSS3
- Typescript 5.9
- Bootstrap 5.3
- Fontawesome 6.4
- GitHub Pages für Hosting

## 🗂️ Lokale Entwicklung

- node muss installiert sein
- Projektordner mit VSC öffnen
- in VSC Terminal öffnen
- Server starten `npm start`
- http://localhost:3000 öffnen und los gehts

### ℹ️ Warum löst das mein CORS-Problem?

Wenn du die **HTML-Datei direkt** mit  
`file://index.html` öffnest, interpretiert der Browser das als eine **andere Origin**  
➡️ **CORS-Blockade tritt auf**

Wenn du sie dagegen über  
`http://localhost:3000` lädst, stammen **HTML, JS und CSS vom gleichen Origin**  
➡️ **Keine CORS-Fehler mehr 🎉**

⚠️ Die Probleme sind erst entstanden,  
als ich **Klassen per `import`** nutzen wollte.  
Das erfordert zwingend einen Server, da `file://` mit Modulen nicht sauber funktioniert.
