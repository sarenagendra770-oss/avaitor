document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginMessage = document.getElementById('loginMessage');
  const registerMessage = document.getElementById('registerMessage');

  const userStorageKey = 'aeroXUsers';

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(userStorageKey) || '[]');
    } catch (error) {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(userStorageKey, JSON.stringify(users));
  }

  function showMessage(element, text, type) {
    if (!element) return;
    element.textContent = text;
    element.className = `auth-message ${type}`;
  }

  function setAuthSession(user) {
    localStorage.setItem('aeroXAuthUser', JSON.stringify(user));
    localStorage.setItem('aeroXIsLoggedIn', 'true');
    localStorage.setItem('aeroXUserName', user.name || user.email);
    const userKey = `aeroXUser_${user.id}`;
    if (!localStorage.getItem(`${userKey}_walletBalance`)) {
      localStorage.setItem(`${userKey}_walletBalance`, '12480');
    }
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = loginForm.querySelector('input[type="email"]').value.trim().toLowerCase();
      const password = loginForm.querySelector('input[type="password"]').value;
      const user = getUsers().find((entry) => entry.email.toLowerCase() === email);

      if (!user || user.password !== password) {
        showMessage(loginMessage, 'Invalid email or password.', 'error');
        return;
      }

      setAuthSession(user);
      showMessage(loginMessage, 'Login successful. Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = 'lobby.html';
      }, 400);
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = registerForm.querySelector('input[name="name"]').value.trim();
      const email = registerForm.querySelector('input[type="email"]').value.trim().toLowerCase();
      const password = registerForm.querySelector('input[type="password"]').value;
      const users = getUsers();

      if (users.some((entry) => entry.email.toLowerCase() === email)) {
        showMessage(registerMessage, 'This email is already registered. Please login.', 'error');
        return;
      }

      const newUser = { id: Date.now(), name, email, password };
      users.push(newUser);
      saveUsers(users);
      setAuthSession(newUser);
      showMessage(registerMessage, 'Account created successfully. Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = 'verify-email.html';
      }, 400);
    });
  }
});
