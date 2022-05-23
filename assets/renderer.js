window.electronAPI.onFocus(() => document.body.classList.add('focused'));
window.electronAPI.onBlur(() => document.body.classList.remove('focused'));

const frame = document.getElementById('frame');
window.electronAPI.config((_event, config) => {
  // Page title.
  document.getElementsByTagName('title')[0].innerText =
    config.title || 'Stream Overlay';
  // Title bar.
  document.getElementById('title').innerText = config.title || 'Stream Overlay';
  // Frame URL.
  frame.src = config.url;
});
window.electronAPI.requestConfig();

document
  .getElementById('close')
  .addEventListener('click', () => window.electronAPI.requestClose());
