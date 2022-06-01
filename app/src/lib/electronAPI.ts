const electronAPI =
  typeof window === 'object'
    ? (
        window as unknown as {
          electronAPI: {
            requestHelp(): void;
          };
        }
      ).electronAPI
    : {
        requestHelp() {},
      };

export default electronAPI;
