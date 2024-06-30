// #!/usr/bin/env -S fish --no-config

import { mkdir, readdir } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { exit } from "node:process";
import { $, argv, file } from "bun";

// if type -d

// # for file in *.png *.heic *.jpg *.jpeg
// #     echo $file
// #     cjxl --effort 10 $file "../No Man's Sky (JXL)/$file.jxl"
// #     touch -r $file "../No Man's Sky (JXL)/$file.jxl"
// # end

const folder = argv[2]; // TODO
if (!folder) {
  console.log("Usage: jxlify-folderify <folder path>");
  exit(1);
}

const folderParent = dirname(folder);
const folderName = basename(folder);

const jxlFolderName = join(folderParent, `${folderName} (JXL)`);
mkdir(jxlFolderName, { recursive: true });

async function processFile(fileName: string) {
  const sourceFile = join(folder, fileName);
  const targetFile = join(jxlFolderName, `${fileName}.jxl`);
  console.log("--------");
  console.log(`${fileName} → ${targetFile}`);
  if (await file(targetFile).exists()) {
    console.log("Already exists!");
    return;
  }
  try {
    await $`cjxl --effort 10 ${sourceFile} ${targetFile}`;
    await $`/usr/bin/touch -r ${sourceFile} ${targetFile}`;
  } catch (e) {
    console.error(e);
  }
}

const queue = await readdir(folder);
function next(): string | undefined {
  const [v] = queue.splice(0, 1);
  return v;
}

async function worker() {
  let v = next();
  while (v) {
    await processFile(v);
    v = next();
  }
}

const NUM_WORKERS = 8;
const workers = [];
for (let i = 0; i < NUM_WORKERS; i++) {
  workers.push(worker());
}
await Promise.all(workers);
