declare type ReadDirCallback = (
  err: NodeJS.ErrnoException,
  files: import("fs").Dirent[]
) => void;
