declare type FsmapLite = FileHashLite[];
declare type Fsmap = FileHash[];

declare type FileHash = {
  index: number;
  path?: string;
  depth?: number;
  md5: string;
};

declare type FileHashLite = {
  index: number;
  md5: string;
};
