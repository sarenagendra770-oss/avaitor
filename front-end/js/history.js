document.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector('.panel');
  if (list) {
    list.insertAdjacentHTML('beforeend', '<p class="panel-note">Your recent rounds are synced and ready to review.</p>');
  }
});
