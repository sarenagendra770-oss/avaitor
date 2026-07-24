document.addEventListener('DOMContentLoaded', () => {
  const panel = document.querySelector('.panel');
  if (panel) {
    panel.insertAdjacentHTML('beforeend', '<div class="setting-group"><label><input type="checkbox" checked /> Sound effects</label></div>');
  }
});
