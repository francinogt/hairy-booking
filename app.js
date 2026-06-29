// Startdatei fuer Plesk (Phusion Passenger).
//
// Passenger startet diese Datei und gibt den Port ueber die Umgebungsvariable
// PORT vor. Wir starten Next.js programmatisch und reichen alle Requests an
// den Next-Request-Handler weiter.
//
// Voraussetzung: vorher wurde auf dem Server `npm ci` und `npm run build`
// ausgefuehrt (siehe Hinweise im Chat / README).

const { createServer } = require("http");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);
const hostname = process.env.HOSTNAME || "127.0.0.1";

const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => handle(req, res)).listen(port, () => {
      console.log(`hairy-booking laeuft auf http://${hostname}:${port}`);
    });
  })
  .catch((err) => {
    console.error("Fehler beim Start von Next.js:", err);
    process.exit(1);
  });
