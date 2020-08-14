import * as fs from "fs";
import * as readline from "readline";

export async function writeFsmap(path: string, fsmap: FileHash[]) {
  const stream = fs.createWriteStream(path);
  stream.once("open", function (fd) {
    fsmap.forEach((file) => {
      stream.write(file.md5);
      stream.write(file.path);
      stream.write("\n");
    });
  });
}

export async function readFsmap(path: string): Promise<FileHash[]> {
  const stream = fs.createReadStream(path);

  const fsmap: FileHash[] = [];

  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    fsmap.push({
      index: fsmap.length + 1,
      md5: line.substr(0, 32),
      path: line.substring(32),
    });
  }

  return fsmap;
}
