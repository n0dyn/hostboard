/** Read CPU, memory, and disk from text snapshots so tests do not need a live host. */

export function parseMeminfo(text) {
  const total = matchKb(text, "MemTotal");
  const available = matchKb(text, "MemAvailable");
  if (!total) return 0;
  return round1((1 - available / total) * 100);
}

export function parseCpu(first, second) {
  const start = cpuTimes(first);
  const end = cpuTimes(second);
  const idle = end.idle - start.idle;
  const total = end.total - start.total;
  if (total <= 0) return 0;
  return round1((1 - idle / total) * 100);
}

export function parseDf(text) {
  const lines = text.trim().split(/\n/).filter(Boolean);
  const cols = lines[lines.length - 1].trim().split(/\s+/);
  const raw = cols[4] || "0%";
  return Number(raw.replace("%", "")) || 0;
}

export function snapshotFrom(meminfo, cpuFirst, cpuSecond, df) {
  return {
    cpu: parseCpu(cpuFirst, cpuSecond),
    mem: parseMeminfo(meminfo),
    disk: parseDf(df),
  };
}

function matchKb(text, key) {
  const found = text.match(new RegExp(`${key}:\\s+(\\d+)`));
  return found ? Number(found[1]) : 0;
}

function cpuTimes(text) {
  const line = text.split(/\n/).find((row) => row.startsWith("cpu "));
  const parts = (line || "").trim().split(/\s+/).slice(1).map(Number);
  const idle = (parts[3] || 0) + (parts[4] || 0);
  const total = parts.reduce((sum, value) => sum + value, 0);
  return { idle, total };
}

function round1(value) {
  return Math.round(value * 10) / 10;
}
