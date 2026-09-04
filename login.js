(function () {
  const form = document.getElementById('loginForm');
  const userId = document.getElementById('userId');
  const errorEl = document.getElementById('loginError');
  const loginBtn = document.getElementById('loginBtn');

  function showError(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errorEl.hidden = true;

    const email = userId.value.trim();

    if (!email) {
      showError('Please enter your email ID.');
      userId.focus();
      return;
    }

    if (!isValidEmail(email)) {
      showError('Please enter a valid email ID.');
      userId.focus();
      return;
    }

    loginBtn.disabled = true;
    const label = loginBtn.querySelector('span');
    if (label) label.textContent = 'Continuing...';

    // Prototype flow only: no account data or session is stored.
    window.location.assign('portal-select.html');
  });
})();
