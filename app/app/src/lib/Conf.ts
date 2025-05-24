export type Conf = {
  url: string;
  title?: string;
  width?: number | string;
  height?: number | string;
  x?: number | string;
  y?: number | string;
  opacity?: number;
  fullscreen?: boolean;
};

export type ConfContainer = {
  filename: string;
  basename: string;
  config: Conf[];
  dirty?: boolean;
  uid?: string;
};
