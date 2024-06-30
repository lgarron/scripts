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

for (const fileName of await readdir(folder)) {
  const sourceFile = join(folder, fileName);
  const targetFile = join(jxlFolderName, `${fileName}.jxl`);
  console.log("--------");
  console.log(`${fileName} → ${targetFile}`);
  if (await file(targetFile).exists()) {
    console.log("Exists!");
    continue;
  }
  try {
    await $`cjxl --effort 10 ${sourceFile} ${targetFile}`;
    await $`/usr/bin/touch -r ${sourceFile} ${targetFile}`;
  } catch (e) {
    console.error(e);
  }
}
