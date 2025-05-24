window.addEventListener('DOMContentLoaded', () => {
  // Config handler.
  window.electronAPI.config((_event, config) => {
    // Page title.
    document.getElementsByTagName('title')[0].innerText =
      config.title || 'Stream Overlay';
    // Title bar.
    document.getElementById('title').innerText =
      config.title || 'Stream Overlay';
  });
  window.electronAPI.requestConfig();

  document
    .getElementById('close')
    .addEventListener('click', () => window.electronAPI.requestClose());
});
