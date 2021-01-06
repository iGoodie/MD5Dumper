declare type FsmapLite = FileHashLite[];
declare type Fsmap = FileHash[];

declare type FileHash = FileHashLite & {
  path?: string;
  depth?: number;
};

declare type FileHashLite = {
  index: number;
  md5: string;
};
