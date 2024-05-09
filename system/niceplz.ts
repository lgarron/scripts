#!/usr/bin/env bun

import { homedir } from "node:os";
import { join } from "node:path";
import { $, BunFile, file } from "bun";

const PNICE_FISH = new URL("./pnice.fish", import.meta.url).pathname;
const PNICE_BIN = (await file(PNICE_FISH).exists()) ? PNICE_FISH : "pnice";

type ProcessPriorityList = Record<string, number>;
type NiceplzConfig = {
  processes_by_substring: ProcessPriorityList;
};

const bunFile: BunFile = file(join(homedir(), ".config/niceplz/niceplz.json"), {
  type: "application/json",
});

const config = (await bunFile.json()) as NiceplzConfig;
for (const [substring, priority] of Object.entries(
  config.processes_by_substring,
)) {
  await $`${PNICE_BIN} ${substring} ${priority}`;
}
