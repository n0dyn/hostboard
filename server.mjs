import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { sampleHost } from "./lib/sample.mjs";
import { diskAlert, openStore, recentSamples, recordSample } from "./lib/store.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 8080);
const dbPath = process.env.HOSTBOARD_DB || join(root, "hostboard.sqlite");
const db = openStore(dbPath);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

const server = createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  if (url.pathname === "/api/metrics") {
    const current = recordSample(db, sampleHost());
    const body = JSON.stringify({
      current,
      history: recentSamples(db),
      alert: diskAlert(current),
    });
    res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
    res.end(body);
    return;
  }

  const file = url.pathname === "/" ? "/index.html" : url.pathname;
  const safe = join(root, "public", file.replace(/\.\./g, ""));
  try {
    const body = readFileSync(safe);
    const ext = safe.slice(safe.lastIndexOf("."));
    res.writeHead(200, { "content-type": types[ext] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

server.listen(port, () => {
  console.log(`hostboard listening on ${port}`);
});
