import * as fs from "fs";
import * as readline from "readline";
import clonedeep from "lodash.clonedeep";

export async function writeFsmap(
  path: string,
  fsmap: Fsmap,
  minified: boolean = false
) {
  const stream = fs.createWriteStream(path);
  stream.once("open", function (fd) {
    fsmap.forEach((file) => {
      stream.write(file.md5);
      if (!minified) {
        stream.write(file.path);
        stream.write("\n");
      }
    });
  });
}

export async function readFsmap(path: string): Promise<Fsmap> {
  const stream = fs.createReadStream(path);

  const fsmap: Fsmap = [];

  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    fsmap.push({
      index: fsmap.length,
      md5: line.substr(0, 32),
      path: line.substring(32),
    });
  }

  return fsmap;
}

export async function readMinified(path: string): Promise<FsmapLite> {
  const fsmap: FsmapLite = [];

  let data = fs.readFileSync(path, "utf-8");

  let md5 = "";
  let index = 0;
  for (const character of data) {
    md5 += character;
    if (md5.length == 32) {
      fsmap.push({
        index: index++,
        md5,
      });
      md5 = "";
    }
  }

  return fsmap;
}

export async function diffFsmap(target: FsmapLite, current: Fsmap) {
  const targetStack = clonedeep(target).reverse();
  const currentStack = clonedeep(current).reverse();

  const missingIndices: number[] = [];
  const invalidFiles: FileHash[] = [];

  function existsAhead(file: FileHash) {
    return targetStack.some((targetFile) => targetFile.md5 === file.md5);
  }

  while (targetStack.length !== 0 && currentStack.length !== 0) {
    const targetFile = targetStack[targetStack.length - 1];
    const currentFile = currentStack[currentStack.length - 1];

    if (targetFile.md5 === currentFile.md5) {
      targetStack.pop();
      currentStack.pop();
      continue;
    }

    if (existsAhead(currentFile)) {
      missingIndices.push(targetFile.index);
      targetStack.pop();
    } else {
      invalidFiles.push(currentFile);
      currentStack.pop();
    }
  }

  return { missingIndices, invalidFiles };
}
