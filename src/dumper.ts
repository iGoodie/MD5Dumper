import * as hasha from "hasha";
import * as util from "util";
import * as path from "path";
import * as fs from "fs";
import * as stream from "stream";

const readdirPromisified = util.promisify((path: string, cb: OpenDirCallback) =>
  fs.readdir(path, { encoding: "utf8", withFileTypes: true }, cb)
);

export async function collectHashes(
  rootDirectoryPath: string,
  currentDirectoryPath: string = "",
  traversed: FileHash[] = [],
  depth: number = 0
) {
  const realRootPath = path.join(rootDirectoryPath, currentDirectoryPath);
  const directory = await (await readdirPromisified(realRootPath)).sort();

  for (let dirent of directory) {
    const virtualPath = path.join(currentDirectoryPath, dirent.name);
    const realPath = path.join(rootDirectoryPath, virtualPath);

    if (dirent.isDirectory()) {
      await collectHashes(rootDirectoryPath, virtualPath, traversed, depth + 1);
    } else {
      const fileStream: fs.ReadStream = fs.createReadStream(realPath);
      fileStream.push(virtualPath);

      const traversedDirent: FileHash = {
        depth,
        index: traversed.length + 1,
        path: virtualPath,
        md5: await hasha.fromStream(fileStream, { algorithm: "md5" }),
      };

      traversed.push(traversedDirent);
    }
  }

  return traversed;
}

export function summarizeFsmap(files: FileHash[]) {
  const md5stream = new stream.Readable();
  files.forEach((dirent) => md5stream.push(dirent.md5));
  md5stream.push(null);

  return hasha.fromStream(md5stream);
}
