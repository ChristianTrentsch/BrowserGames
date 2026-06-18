# Globaler Highscore mit Supabase

## Übersicht

GitHub Pages hostet nur statische Dateien, kein Backend, keine Datenbank.
Supabase stellt eine PostgreSQL-Datenbank mit REST-API bereit, die du direkt aus JavaScript heraus ansprechen kannst.
Deine Seite bleibt auf GitHub Pages, nur die Highscore-Requests gehen an Supabase.

---

## 1. Supabase-Projekt anlegen

1. Gehe auf [https://supabase.com](https://supabase.com) und erstelle einen kostenlosen Account
2. Klicke auf **New Project**
3. Vergib einen Projektnamen, z.B. `browsergames`
4. Wähle eine Region (am besten **Frankfurt** für Europa)
5. Setze ein sicheres Datenbankpasswort und speichere es
6. Warte ca. 1–2 Minuten bis das Projekt bereit ist

---

## 2. Tabelle erstellen

Im Supabase Dashboard:

1. Linke Sidebar → **Table Editor** → **New Table**
2. Tabellenname: `highscores`
3. **Row Level Security (RLS) vorerst deaktivieren** (später absichern, siehe Abschnitt 5)
4. Folgende Spalten anlegen:

| Spaltenname  | Typ           | Default           | Hinweis                               |
| ------------ | ------------- | ----------------- | -------------------------------------- |
| `id`         | `int8`        | auto-increment    | Primärschlüssel, wird autom. angelegt  |
| `name`       | `varchar`     | —                 | max. 6 Zeichen (Spielername)           |
| `points`     | `int4`        | `0`               | Punktzahl                              |
| `game`       | `varchar`     | `'catchthealien'` | Für spätere weitere Spiele             |
| `created_at` | `timestamptz` | `now()`           | Wird automatisch gesetzt               |

5. Klicke auf **Save**

### Alternativ per SQL (schneller)

Linke Sidebar → **SQL Editor** → **New Query** → einfügen und ausführen:

```sql
CREATE TABLE highscores (
  id         bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name       varchar(6)   NOT NULL,
  points     int          NOT NULL DEFAULT 0,
  game       varchar(50)  NOT NULL DEFAULT 'catchthealien',
  created_at timestamptz  NOT NULL DEFAULT now()
);
```

> Die Spaltenlänge wurde im Projektverlauf von ursprünglich 3 auf 6 Zeichen erhöht:
> ```sql
> ALTER TABLE highscores ALTER COLUMN name TYPE varchar(6);
> ```

---

## 3. API-Zugangsdaten holen

1. Linke Sidebar → **Project Settings** → **API**
2. Notiere dir zwei Werte:
   - **Project URL** → sieht aus wie `https://xyzxyzxyz.supabase.co`
   - **publishable Key** → Schlüssel beginnt mit `sb_publishable_...`

> Supabase hat 2025 das Key-System umgestellt: der frühere `anon`-Key (langer JWT-String)
> wurde durch den neuen `publishable`-Key ersetzt. Funktional übernimmt er dieselbe Rolle —
> er ist für den Browser gedacht und kann öffentlich sichtbar sein, solange RLS korrekt
> konfiguriert ist (siehe Abschnitt 5).
> Den `service_role`- bzw. `secret`-Key **niemals** ins Frontend einfügen.

---

## 4. Code in catchthealien einbauen

### 4.1 Supabase-Library einbinden

Im `<head>` der `index.html` direkt nach den bestehenden `<link>`-Tags:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### 4.2 Supabase initialisieren

Ganz oben im `<script>`-Block, vor allen anderen Variablen:

```js
const SUPABASE_URL = "https://DEINE-PROJEKT-URL.supabase.co";
const SUPABASE_KEY = "DEIN-PUBLISHABLE-KEY";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
```

> Der Key liegt aktuell direkt im Code. Das ist mit aktiviertem RLS unkritisch,
> da der `publishable`-Key bewusst für den öffentlichen Frontend-Einsatz gedacht ist.

### 4.3 Highscore speichern

```js
async function saveHighscore(name, points) {
  const { error } = await supabaseClient
    .from("highscores")
    .insert({ name, points, game: "catchthealien" });

  if (error) {
    console.error("Fehler beim Speichern:", error.message);
  }
}
```

### 4.4 Highscores laden

```js
async function loadHighscores() {
  const { data, error } = await supabaseClient
    .from("highscores")
    .select("name, points")
    .eq("game", "catchthealien")
    .order("points", { ascending: false })
    .limit(10);

  const tableBody = document.querySelector("#highscoreTable tbody");
  tableBody.innerHTML = "";

  if (error) {
    console.error("Fehler beim Laden:", error.message);
    tableBody.innerHTML =
      '<tr><td colspan="3">Highscores konnten nicht geladen werden.</td></tr>';
    return;
  }

  data.forEach((entry, index) => {
    tableBody.innerHTML += `<tr><td>${index + 1}</td><td>${entry.name}</td><td>${entry.points}</td></tr>`;
  });
}
```

### 4.5 gameOver() — Namenseingabe über eigenes Modal

Die ursprüngliche `prompt()`-Lösung wurde durch ein eigenes, ins Neon-Design
passendes Modal ersetzt (`prompt()` lässt sich nicht stylen). Details dazu
in Abschnitt 8.

```js
async function gameOver() {
  gameRunning = false;
  lastTimestamp = null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  showGameOverModal(score);
}
```

---

## 5. Tabelle absichern (Row Level Security)

Ohne RLS kann jeder beliebige Daten einfügen oder löschen.
Für einen öffentlichen Highscore reichen zwei einfache Regeln:

Linke Sidebar → **Authentication** → **Policies** → Tabelle `highscores` → **New Policy**:

### Regel 1 — Lesen für alle erlauben

```sql
CREATE POLICY "Highscores lesbar für alle"
ON highscores FOR SELECT
USING (true);
```

### Regel 2 — Einfügen für alle erlauben

```sql
CREATE POLICY "Highscores einfügen für alle"
ON highscores FOR INSERT
WITH CHECK (true);
```

### RLS aktivieren

```sql
ALTER TABLE highscores ENABLE ROW LEVEL SECURITY;
```

### Zusätzlich notwendig: Tabellenrechte für die `anon`-Rolle

Mit dem neuen Supabase-Key-System (`publishable`-Key) reichen die RLS-Policies
allein nicht aus — die `anon`-Rolle braucht zusätzlich explizite Tabellenrechte,
sonst kommt ein `401 Unauthorized` / `permission denied for table highscores`:

```sql
GRANT SELECT, INSERT ON highscores TO anon;
```

> Das war der eigentliche Fix für unseren 401-Fehler: RLS-Policies und
> `GRANT` sind zwei getrennte Sicherheitsebenen in Postgres. Policies legen
> fest *was* erlaubt ist, `GRANT` legt fest *ob die Rolle die Tabelle
> überhaupt anfassen darf*. Beides wird benötigt.

> Damit kann jeder lesen und schreiben, aber niemand fremde Einträge
> **löschen oder ändern** — für einen einfachen Spielhighscore ausreichend.

---

## 6. Reset-Button

Der bisherige Reset-Button (`localStorage`-basiert) wurde entfernt/auskommentiert,
da der Highscore jetzt zentral in Supabase liegt. Echtes Löschen aus dem Frontend
ist bewusst nicht eingebaut, da dafür der `service_role`-Key benötigt würde,
der nicht ins Frontend gehört. Löschen erfolgt direkt im Supabase Dashboard
(**Table Editor** → `highscores`).

---

## 7. Testen

1. Lokal mit `npm start` den Server starten
2. Spiel durchspielen und Namen eingeben
3. Im Supabase Dashboard → **Table Editor** → `highscores` prüfen ob der Eintrag angekommen ist
4. Seite neu laden → Highscore-Tabelle sollte den Eintrag anzeigen
5. Auf GitHub pushen → GitHub Pages zeigt den globalen Highscore

### Eingaben gezielt testen (DevTools-Konsole)

```js
const testNames = ["ABC", "a1!", "';--", "<script>", "🛸👾", "Ü ß", "", "ABCDEFGH"];
for (const name of testNames) {
  console.log(`"${name}" → "${sanitizeName(name)}"`);
}
```

Direkter Schreib-/Lesetest gegen die DB:

```js
await saveHighscore("TEST1", 99);
await loadHighscores();
```

---

## 8. Namenseingabe: Filter, Längenlimit, Sperrliste, eigenes Modal

### 8.1 Zeichenfilter (nur A–Z, 0–9)

```js
function sanitizeName(input) {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .substring(0, 6);
}
```

### 8.2 Sperrliste für unerwünschte Begriffe

```js
const BLOCKLIST = [
  "FICKEN", "FICKT",  "SCHEIS", "FOTZE",  "HURENS",
  "WICHSE", "WICHST", "ARSCHL", "KACKE",  "PENNIS",
  "VAGINA", "NUTTEN",  "HUREN",  "SCHLAMM",
  "FUCKYO", "FUCKOF", "FUCKER", "BITCH",  "ASSHO",
  "PUSSY",  "CUNT",   "NIGGER", "FAGGOT", "RETARD",
  "WHORE",  "SLUT",   "BASTRD", "DICKHE",
];

function containsBlockedWord(name) {
  return BLOCKLIST.some((w) => name.includes(w));
}
```

Zusätzliche Absicherung auf DB-Ebene (greift auch falls die API direkt
angesprochen wird, am Frontend vorbei):

```sql
ALTER TABLE highscores
ADD CONSTRAINT name_no_profanity
CHECK (name NOT IN ('FICKEN','FICKT','SCHEIS','FOTZE','HURENS', '...'));
```

### 8.3 Eigenes Game-Over-Modal statt prompt()

`prompt()` ist ein nativer Browser-Dialog und lässt sich nicht stylen.
Stattdessen ein HTML-Modal im Neon-Design der Seite, das Alien-Bild aus dem
Projekt statt einem Emoji:

```html
<div id="gameOverModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:1000; align-items:center; justify-content:center;">
  <div style="background:#1a1a1a; border:2px solid #00f3ff; border-radius:16px; padding:2rem; width:min(320px, 90vw); text-align:center; box-shadow:0 0 30px rgba(0,243,255,0.2);">
    <img src="./images/space_alien.png" alt="Alien" style="height:70px; width:auto; margin-bottom:0.5rem;" />
    <h2 style="color:#00f3ff; font-size:1.4rem; font-weight:600; margin:0 0 0.25rem; text-shadow:0 0 8px #00f3ff;">Game Over</h2>
    <p style="color:#aaa; font-size:0.9rem; margin:0 0 1.25rem;">Punkte: <span id="modalScore" style="color:#fff; font-weight:600;"></span></p>
    <div style="margin-bottom:1rem; text-align:left;">
      <label style="display:block; font-size:0.75rem; color:#888; margin-bottom:6px;">Name (A–Z, 0–9, max. 6 Zeichen)</label>
      <input id="nameInput" type="text" maxlength="6" placeholder="RangeR" autocomplete="off"
        style="width:100%; box-sizing:border-box; background:#111; border:1px solid rgba(0,243,255,0.35); border-radius:8px; color:#fff; font-size:1.4rem; text-align:center; letter-spacing:6px; padding:10px; outline:none; font-family:monospace;" />
      <p id="nameError" style="color:#ff4c4c; font-size:0.75rem; margin:6px 0 0; display:none;">Bitte mindestens einen Buchstaben eingeben.</p>
    </div>
    <button id="modalSaveBtn" style="width:100%; background:#00f3ff; color:#111; border:none; border-radius:8px; padding:10px; font-size:1rem; font-weight:600; cursor:pointer;">Speichern</button>
    <p style="font-size:0.7rem; color:#555; margin:0.75rem 0 0;">Sonderzeichen werden automatisch entfernt</p>
  </div>
</div>
```

```js
function showGameOverModal(punkte) {
  const modal = document.getElementById("gameOverModal");
  const input = document.getElementById("nameInput");
  const errorMsg = document.getElementById("nameError");

  document.getElementById("modalScore").textContent = punkte;
  input.value = "";
  errorMsg.style.display = "none";
  modal.style.display = "flex";
  setTimeout(() => input.focus(), 100);

  input.addEventListener("input", () => {
    input.value = sanitizeName(input.value);
  });

  document.getElementById("modalSaveBtn").onclick = async () => {
    let name = sanitizeName(input.value);

    if (!name) {
      errorMsg.style.display = "block";
      return;
    }

    if (containsBlockedWord(name)) {
      name = "???";
    }

    modal.style.display = "none";
    await saveHighscore(name, punkte);
    await loadHighscores();
  };
}
```

---

## Zusammenfassung der geänderten Dateien

| Datei                      | Änderung                                                                                          |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| `catchthealien/index.html` | Supabase CDN-Script, `saveHighscore`, `loadHighscores`, eigenes Game-Over-Modal statt `prompt()`     |
| Supabase Dashboard          | Tabelle `highscores` (varchar(6)), RLS-Policies, `GRANT SELECT, INSERT ON highscores TO anon`        |

---

## Troubleshooting-Notizen aus dem Projektverlauf

| Fehler | Ursache | Fix |
|---|---|---|
| `401 Unauthorized` / `permission denied for table highscores` | RLS-Policies allein reichen nicht — `anon`-Rolle hatte keine Tabellenrechte | `GRANT SELECT, INSERT ON highscores TO anon;` |
| Key-Format `sb_publishable_...` statt langer JWT-String | Supabase hat 2025 auf ein neues Key-System umgestellt | Aktuellen `publishable`-Key aus **Project Settings → API** verwenden |

---

## Nützliche Links

- [Supabase Docs — JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Supabase Docs — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Docs — API Keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Supabase Free Tier Limits](https://supabase.com/pricing)