import type { ConfContainer } from './Conf';

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
          };
        }
      ).electronAPI
    : {
        requestConfigFile() {},
        requestHelp() {},
        configFile(_event: any, _callback: any) {},
      };

export default electronAPI;
