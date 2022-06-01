export type Conf = {
  url: string;
  title?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  opacity?: number;
  fullscreen?: boolean;
};

export type ConfContainer = {
  filename: string;
  basename: string;
  config: Conf[];
};
