# hostboard

A single-host dashboard for CPU, memory, and disk. It stores a short history in SQLite and raises an alert when disk use reaches 80%. This is one machine, not a multi-agent SIEM.

Requires Node.js 22 or newer (`node:sqlite`).

## Run

```bash
cd hostboard
npm start
```

Open http://localhost:8080. The page polls `/api/metrics` every few seconds.

```bash
docker compose up --build
```

## Tests

```bash
npm test
```

The tests parse `/proc` and `df` text fixtures. They do not read the machine they run on.
