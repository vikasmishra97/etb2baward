(function(){
  const STORAGE_KEY='etb2bPrototypeSession';
  const form=document.getElementById('loginForm');
  const userId=document.getElementById('userId');
  const errorEl=document.getElementById('loginError');
  const loginBtn=document.getElementById('loginBtn');

  // If this browser already has a prototype session, skip the login screen.
  const existingSession=localStorage.getItem(STORAGE_KEY);
  if(existingSession){
    window.location.replace('index.html');
    return;
  }

  function showError(message){
    errorEl.textContent=message;
    errorEl.hidden=false;
  }

  function isValidEmail(value){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  form.addEventListener('submit',function(e){
    e.preventDefault();
    errorEl.hidden=true;

    const email=userId.value.trim().toLowerCase();
    if(!email){
      showError('Please enter your email ID.');
      userId.focus();
      return;
    }

    if(!isValidEmail(email)){
      showError('Please enter a valid email ID.');
      userId.focus();
      return;
    }

    loginBtn.disabled=true;
    const label=loginBtn.querySelector('span');
    const original=label.textContent;
    label.textContent='Continuing...';

    // Prototype-only persistence. No password or backend authentication is used.
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      email: email,
      loggedIn: true,
      createdAt: Date.now()
    }));

    setTimeout(function(){
      label.textContent=original;
      loginBtn.disabled=false;
      window.location.href='portal-select.html';
    },250);
  });
})();
