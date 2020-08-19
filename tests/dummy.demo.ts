/// <reference path="../types/index.d.ts"/>
/// <reference path="../types/dump.d.ts"/>
/// <reference path="../types/promisification.d.ts"/>

import * as fs from "fs";
import * as paths from "path";
import MD5Dumper from "../src/index";

async function printFsmap(fsmap: FileHash[]) {
  console.log("Filesystem Map:");
  fsmap.forEach((file) => {
    console.log(file.md5.substr(0, 7), file.index, file.path);
  });
}

async function dumpDirectory(path: string, metaPath?: string) {
  const fsmap = await MD5Dumper.dumpFsmap(path);
  const summary = await MD5Dumper.summarizeFsmap(fsmap);

  if (metaPath !== undefined) {
    if (!fs.existsSync(metaPath))
      await fs.mkdirSync(metaPath, { recursive: true });

    await MD5Dumper.writeFsmap(paths.join(metaPath, "update.fsmap"), fsmap);
    await MD5Dumper.writeFsmap(
      paths.join(metaPath, "update.minified.fsmap"),
      fsmap,
      true
    );
    await fs.writeFileSync(paths.join(metaPath, "summary.md5"), summary);
  }

  return { fsmap, summary };
}

async function main() {
  const targetMetadata = await dumpDirectory(
    "./tests/target_dummy",
    "./tests/target_meta"
  );
  const currentMetadata = await dumpDirectory("./tests/current_dummy");

  const diff = await MD5Dumper.diffFsmap(
    targetMetadata.fsmap,
    currentMetadata.fsmap
  );
  console.log("Missing Indices:", diff.missingIndices);
  console.log(
    "Invalid Files: ",
    diff.invalidFiles.map((file) => file.path)
  );

  console.log(
    "Client now needs to require files on the index",
    diff.missingIndices
  );
}

main();
