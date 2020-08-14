import { collectHashes } from "./dumper";
import { summarizeFsmap } from "./dumper";

async function main() {
  const fsmap = await collectHashes("./target");
  console.log("Filesystem Map:");
  fsmap.forEach((file) => {
    console.log(file.md5.substr(0, 7), file.index, file.path);
  });

  const summary = await summarizeFsmap(fsmap);
  console.log("\nSummary of", fsmap.length, "files =", summary.substr(0, 7));
}

main();
