import * as fs from "fs";
import { dumpFsmap, minifyFsmap } from "./dumper";
import { summarizeFsmap } from "./dumper";
import { writeFsmap, readFsmap, diffFsmap } from "./fsmap";

async function printFsmap(fsmap: FileHash[]) {
  console.log("Filesystem Map:");
  fsmap.forEach((file) => {
    console.log(file.md5.substr(0, 7), file.index, file.path);
  });
}

async function main() {
  const fsmap = await dumpFsmap("./target");
  printFsmap(fsmap);

  const summary = await summarizeFsmap(fsmap);
  console.log("\nSummary of", fsmap.length, "files =", summary.substr(0, 7));

  if (!fs.existsSync("./meta"))
    await fs.mkdirSync("./meta", { recursive: true });
  await writeFsmap("./meta/target.fsmap", fsmap);

  console.log("\nSaved .fsmap");

  console.log("\nLoaded .fsmap:");
  const fsmapImported = await readFsmap("./meta/target.fsmap");
  printFsmap(fsmapImported);

  console.log();

  const current = await dumpFsmap("./local");
  printFsmap(current);

  console.log("\nMinified:", minifyFsmap(current), "\n");

  const diff = await diffFsmap(fsmap, current);
  console.log("Missing Indices:", diff.missingIndices);
  console.log(
    "Invalid Files: ",
    diff.invalidFiles.map((file) => file.path)
  );
}

main();
