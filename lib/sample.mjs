import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { parseCpu, parseDf, parseMeminfo } from "./metrics.mjs";

export function sampleHost() {
  const meminfo = readFileSync("/proc/meminfo", "utf8");
  const first = readFileSync("/proc/stat", "utf8");
  sleep(120);
  const second = readFileSync("/proc/stat", "utf8");
  const df = execFileSync("df", ["-P", "-k", "/"], { encoding: "utf8" });
  return {
    cpu: parseCpu(first, second),
    mem: parseMeminfo(meminfo),
    disk: parseDf(df),
  };
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}
