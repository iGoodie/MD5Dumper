import * as hasha from "hasha";
import * as util from "util";
import * as path from "path";
import * as fs from "fs";
import * as stream from "stream";

const readdirPromisified = util.promisify((path: string, cb: ReadDirCallback) =>
  fs.readdir(path, { encoding: "utf8", withFileTypes: true }, cb)
);

export async function dumpFsmap(
  rootDirectoryPath: string,
  currentDirectoryPath: string = "",
  fsmap: Fsmap = [],
  depth: number = 0
) {
  const realRootPath = path.join(rootDirectoryPath, currentDirectoryPath);
  const directory = await (await readdirPromisified(realRootPath)).sort();

  for (let dirent of directory) {
    const virtualPath = path.join(currentDirectoryPath, dirent.name);
    const realPath = path.join(rootDirectoryPath, virtualPath);

    if (dirent.isDirectory()) {
      await dumpFsmap(rootDirectoryPath, virtualPath, fsmap, depth + 1);
    } else {
      const fileStream: fs.ReadStream = fs.createReadStream(realPath);
      fileStream.push(virtualPath);

      const traversedDirent: FileHash = {
        depth,
        index: fsmap.length + 1,
        path: virtualPath,
        md5: await hasha.fromStream(fileStream, { algorithm: "md5" }),
      };

      fsmap.push(traversedDirent);
    }
  }

  return fsmap;
}

export function minifyFsmap(fsmap: Fsmap) {
  return fsmap.map((dirent) => dirent.md5).join("");
}

export function summarizeFsmap(fsmap: Fsmap) {
  const md5stream = new stream.Readable();
  fsmap.forEach((dirent) => md5stream.push(dirent.md5));
  md5stream.push(null);
  return hasha.fromStream(md5stream);
}
