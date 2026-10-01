import { DatabaseSync } from "node:sqlite";

export const DISK_ALERT_PERCENT = 80;

export function openStore(filename = ":memory:") {
  const db = new DatabaseSync(filename);
  db.exec(`
    CREATE TABLE IF NOT EXISTS samples (
      id INTEGER PRIMARY KEY,
      ts INTEGER NOT NULL,
      cpu REAL NOT NULL,
      mem REAL NOT NULL,
      disk REAL NOT NULL
    )
  `);
  return db;
}

export function recordSample(db, sample, ts = Date.now()) {
  db.prepare("INSERT INTO samples (ts, cpu, mem, disk) VALUES (?, ?, ?, ?)").run(
    ts,
    sample.cpu,
    sample.mem,
    sample.disk,
  );
  return { ...sample, ts };
}

export function recentSamples(db, limit = 60) {
  return db
    .prepare(
      "SELECT ts, cpu, mem, disk FROM samples ORDER BY id DESC LIMIT ?",
    )
    .all(limit)
    .reverse();
}

export function diskAlert(sample, threshold = DISK_ALERT_PERCENT) {
  if (sample.disk < threshold) return null;
  return {
    metric: "disk",
    value: sample.disk,
    threshold,
    message: `Disk is ${sample.disk}% (threshold ${threshold}%)`,
  };
}
