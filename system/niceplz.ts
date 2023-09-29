#!/usr/bin/env bun

import { file } from "bun";
import { homedir } from "node:os";
import { join } from "node:path";

const PNICE_FISH = new URL("./pnice.fish", import.meta.url).pathname;
const PNICE_BIN = (await Bun.file(PNICE_FISH).exists()) ? PNICE_FISH : "pnice";

type ProcessPriorityList = Record<string, number>;
type NiceplzConfig = {
  processes_by_substring: ProcessPriorityList;
};

const bunFile = file(join(homedir(), ".config/niceplz/niceplz.json"), {
  type: "application/json",
});

const config = (await bunFile.json()) as NiceplzConfig;
for (const [substring, priority] of Object.entries(
  config.processes_by_substring,
)) {
  await Bun.spawn({
    cmd: [PNICE_BIN, substring, `${priority}`],
    stdout: "inherit",
  }).exited;
}
