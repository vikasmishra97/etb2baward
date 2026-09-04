(function(){
  const form=document.getElementById('loginForm');
  const userId=document.getElementById('userId');
  const password=document.getElementById('password');
  const errorEl=document.getElementById('loginError');
  const loginBtn=document.getElementById('loginBtn');

  function showError(message){
    errorEl.textContent=message;
    errorEl.hidden=false;
  }

  form.addEventListener('submit',function(e){
    e.preventDefault();
    errorEl.hidden=true;

    if(!userId.value.trim()){
      showError('Please enter your email or user ID.');
      userId.focus();
      return;
    }

    if(!password.value.trim()){
      showError('Please enter your password.');
      password.focus();
      return;
    }

    loginBtn.disabled=true;
    const label=loginBtn.querySelector('span');
    const original=label.textContent;
    label.textContent='Signing in...';

    setTimeout(function(){
      label.textContent=original;
      loginBtn.disabled=false;
      window.location.href='portal-select.html';
    },350);
  });
})();
