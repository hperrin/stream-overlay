window.addEventListener('DOMContentLoaded', () => {
  // Focus handlers.
  window.electronAPI.onFocus(() => document.body.classList.add('focused'));
  window.electronAPI.onBlur(() => document.body.classList.remove('focused'));

  // Request a focus event to be fired if we are currently focused.
  window.electronAPI.requestFocusEvent();

  const frame = document.getElementById('frame');
  // Config handler.
  window.electronAPI.config((_event, config) => {
    // Page title.
    document.getElementsByTagName('title')[0].innerText =
      config.title || 'Stream Overlay';
    // Title bar.
    document.getElementById('title').innerText =
      config.title || 'Stream Overlay';
    // Frame URL.
    frame.src = config.url;
  });
  window.electronAPI.requestConfig();

  document
    .getElementById('close')
    .addEventListener('click', () => window.electronAPI.requestClose());
});
