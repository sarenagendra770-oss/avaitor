function formatCurrency(value) {
  const amount = Number(value || 0);
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getCurrentUserKey() {
  const authUser = JSON.parse(localStorage.getItem('aeroXAuthUser') || 'null');
  const userId = authUser?.id || 'guest';
  return `aeroXUser_${userId}`;
}

function getWalletBalance() {
  const userKey = getCurrentUserKey();
  const stored = Number(localStorage.getItem(`${userKey}_walletBalance`));
  if (Number.isFinite(stored) && stored >= 0) {
    return stored;
  }
  return 12480;
}

function setWalletBalance(value) {
  const nextValue = Math.max(0, Number(value) || 0);
  const userKey = getCurrentUserKey();
  localStorage.setItem(`${userKey}_walletBalance`, nextValue.toString());
  document.dispatchEvent(new CustomEvent('wallet:updated', { detail: nextValue }));
  return nextValue;
}

function updateWalletDisplays() {
  document.querySelectorAll('.balance, #balanceValue').forEach((element) => {
    element.textContent = formatCurrency(getWalletBalance());
  });
}

function logoutUser() {
  localStorage.removeItem('aeroXAuthUser');
  localStorage.removeItem('aeroXIsLoggedIn');
  localStorage.removeItem('aeroXUserName');
  window.location.href = 'login.html';
}

function attachLogoutButton(target, fallbackLabel = 'Logout') {
  if (!target || target.querySelector('.logout-link')) return;
  const link = document.createElement('a');
  link.href = '#';
  link.className = 'logout-link';
  link.textContent = fallbackLabel;
  link.addEventListener('click', (event) => {
    event.preventDefault();
    logoutUser();
  });
  target.appendChild(link);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href]').forEach((link) => {
    if (link.getAttribute('href') === '#') {
      link.addEventListener('click', (event) => event.preventDefault());
    }
  });

  const navbar = document.querySelector('.navbar');
  if (navbar) attachLogoutButton(navbar);

  const sidebar = document.querySelector('.admin-sidebar');
  if (sidebar) attachLogoutButton(sidebar, 'Logout');

  updateWalletDisplays();
  document.addEventListener('wallet:updated', updateWalletDisplays);
});
