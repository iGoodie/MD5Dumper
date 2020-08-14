declare type Fsmap = FileHash[];

declare type FileHash = {
  index: number;
  path: string;
  depth?: number;
  md5: string;
};
