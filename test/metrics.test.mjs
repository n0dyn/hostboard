import assert from "node:assert/strict";
import test from "node:test";
import { parseCpu, parseDf, parseMeminfo, snapshotFrom } from "../lib/metrics.mjs";
import { diskAlert, openStore, recentSamples, recordSample } from "../lib/store.mjs";

const MEM = "MemTotal:       8000000 kB\nMemAvailable:   2000000 kB\n";
const CPU_A = "cpu  100 0 100 800 0 0 0 0\n";
const CPU_B = "cpu  200 0 200 900 0 0 0 0\n";
const DF = "Filesystem 1024-blocks Used Available Capacity Mounted on\n/dev/root 100000 91000 9000 91% /\n";

test("memory used percent comes from MemAvailable", () => {
  assert.equal(parseMeminfo(MEM), 75);
});

test("cpu percent ignores idle time between two stat snapshots", () => {
  assert.equal(parseCpu(CPU_A, CPU_B), 66.7);
});

test("df parser reads the capacity column", () => {
  assert.equal(parseDf(DF), 91);
});

test("disk at or above 80 percent raises an alert and history is kept", () => {
  const sample = snapshotFrom(MEM, CPU_A, CPU_B, DF);
  const db = openStore();
  recordSample(db, sample, 1_000);
  recordSample(db, { ...sample, disk: 10 }, 2_000);
  const history = recentSamples(db);
  assert.equal(history.length, 2);
  assert.equal(history[0].ts, 1_000);
  assert.equal(diskAlert(sample).metric, "disk");
  assert.equal(diskAlert({ disk: 79 }), null);
});
