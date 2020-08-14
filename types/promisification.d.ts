declare type OpenDirCallback = (
  err: NodeJS.ErrnoException,
  files: import("fs").Dirent[]
) => void;
