window.electronAPI.onFocus(() => document.body.classList.add('focused'));
window.electronAPI.onBlur(() => document.body.classList.remove('focused'));

const frame = document.getElementById('frame');
window.electronAPI.url((_event, url) => (frame.src = url));
window.electronAPI.requestUrl();

document
  .getElementById('close')
  .addEventListener('click', () => window.electronAPI.requestClose());
