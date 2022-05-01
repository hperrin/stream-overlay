window.electronAPI.onFocus(() => document.body.classList.add('focused'));
window.electronAPI.onBlur(() => document.body.classList.remove('focused'));

window.electronAPI.url(
  (_event, url) => (document.getElementById('frame').src = url)
);
window.electronAPI.requestUrl();

document
  .getElementById('close')
  .addEventListener('click', () => window.electronAPI.requestClose());
