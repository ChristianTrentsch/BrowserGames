# BrowserGames

Statische Browsergames. Übersichtlich, modern und responsiv gestaltet mit HTML, CSS und JavaScript.

## 🔗 Live-Demo

### 🌐 [https://ChristianTrentsch.github.io/BrowserGames/](https://ChristianTrentsch.github.io/BrowserGames/)

## 📚 Inhaltsverzeichnis

- [BrowserGames](#browsergames)
  - [🔗 Live-Demo](#-live-demo)
    - [🌐 https://ChristianTrentsch.github.io/BrowserGames/](#-httpschristiantrentschgithubiobrowsergames)
  - [📚 Inhaltsverzeichnis](#-inhaltsverzeichnis)
  - [🏡 Über das Projekt](#-über-das-projekt)
  - [✨ Features](#-features)
  - [🛠️ Technologien](#️-technologien)
  - [⚙️ Lokale Entwicklung](#️-lokale-entwicklung)
    - [Voraussetzungen](#voraussetzungen)
  - [🔎 Installation prüfen](#-installation-prüfen)
    - [⚠️ Falls npm oder pnpm in PowerShell blockiert wird](#️-falls-npm-oder-pnpm-in-powershell-blockiert-wird)
  - [📦 pnpm installieren (optional)](#-pnpm-installieren-optional)
  - [📥 Projekt installieren](#-projekt-installieren)
  - [▶️ Entwicklungsserver starten](#️-entwicklungsserver-starten)
  - [🖥️ Projekt im Browser öffnen](#️-projekt-im-browser-öffnen)

## 🏡 Über das Projekt

**BrowserGames** ist ein kleines, browserbasiertes Spiel, das ohne Datenbank direkt im Browser läuft. Ziel ist es, Spielern ein unterhaltsames, leicht zugängliches Erlebnis zu bieten.

## ✨ Features

- 🎮 Interaktives Gameplay direkt im Browser
- 🕹️ Steuerung mit Tastatur oder Controller
- 🗂️ Lokaler Retro Highscore
- 📱 Responsives Design für Desktop und Mobile
- ⚡ Schnelle Ladezeiten durch statische Struktur

## 🛠️ Technologien

- HTML5
- CSS3
- Typescript 5.9
- Bootstrap 5.3
- GitHub Pages für Hosting

## ⚙️ Lokale Entwicklung

### Voraussetzungen

Folgende Software muss installiert sein:

- Node.js
- npm (ist automatisch in Node.js enthalten)
- optional: pnpm

## 🔎 Installation prüfen

Projektordner in Visual Studio Code öffnen und ein Terminal starten.

```powershell
node -v
npm -v
```

Optional zusätzlich prüfen:

```powershell
pnpm -v
```

### ⚠️ Falls npm oder pnpm in PowerShell blockiert wird

PowerShell als Administrator öffnen und einmalig ausführen:

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📦 pnpm installieren (optional)

Das Projekt funktioniert normalerweise auch mit npm.  
pnpm ist jedoch schneller und spart Speicherplatz.

Installation:

```powershell
npm install -g pnpm
```

Danach prüfen:

```powershell
pnpm -v
```

## 📥 Projekt installieren

Im Projektordner Terminal öffnen und Abhängigkeiten installieren.

Mit pnpm:

```powershell
pnpm install
```

oder mit npm:

```powershell
npm install
```

## ▶️ Entwicklungsserver starten

Mit pnpm:

```powershell
pnpm run dev
```

oder:

```powershell
pnpm start
```

Mit npm:

```powershell
npm run dev
```

oder:

```powershell
npm start
```

## 🖥️ Projekt im Browser öffnen

Nach dem Start des Servers im Browser öffnen:

```text
http://localhost:3000
```

Je nach Projekt kann der Port auch abweichen.
Der korrekte Link wird normalerweise im Terminal angezeigt.
