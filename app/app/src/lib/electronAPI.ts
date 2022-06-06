import type { Conf, ConfContainer } from './Conf';

const electronAPI =
  typeof window === 'object'
    ? (
        window as unknown as {
          electronAPI: {
            requestConfigFile(): void;
            requestHelp(): void;
            configFile(
              callback: (event: any, data: ConfContainer) => void
            ): void;
            requestSave(data: {
              config: Conf[];
              filename: string;
              uid: string;
            }): void;
            requestSaveAs(data: { config: Conf[]; uid: string }): void;
            requestLaunch(data: {
              config: Conf[];
              mode: 'normal' | 'clickable';
            }): void;
            saved(
              callback: (
                event: any,
                data: { filename: string; basename: string; uid: string }
              ) => void
            ): void;
          };
        }
      ).electronAPI
    : {
        requestConfigFile() {},
        requestHelp() {},
        configFile(_callback: (event: any, data: ConfContainer) => void) {},
        requestSave(_data: {
          config: Conf[];
          filename: string;
          uid: string;
        }) {},
        requestSaveAs(_data: { config: Conf[]; uid: string }) {},
        requestLaunch(_data: {
          config: Conf[];
          mode: 'normal' | 'clickable';
        }) {},
        saved(
          _callback: (
            event: any,
            data: { filename: string; basename: string; uid: string }
          ) => void
        ) {},
      };

export default electronAPI;
