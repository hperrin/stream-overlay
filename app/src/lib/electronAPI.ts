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
            requestSave(data: Conf, filename: string): void;
            requestSaveAs(data: Conf): void;
            requestLaunch(data: Conf): void;
          };
        }
      ).electronAPI
    : {
        requestConfigFile() {},
        requestHelp() {},
        configFile(_event: any, _callback: any) {},
        requestSave(_data: Conf, _filename: string) {},
        requestSaveAs(_data: Conf) {},
        requestLaunch(_data: Conf) {},
      };

export default electronAPI;
