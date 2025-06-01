export type Conf = {
  url: string;
  title?: string;
  display?: number;
  width?: number | string;
  height?: number | string;
  x?: number | string;
  y?: number | string;
  opacity?: number;
  fullscreen?: boolean;
  scale?: number;
};

export type ConfContainer = {
  filename: string;
  basename: string;
  config: Conf[];
  origConfig?: string;
  uid?: string;
};
