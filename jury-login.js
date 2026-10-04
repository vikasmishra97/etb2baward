(() => {
  const JUDGE_KEY='etb2b_awards_judges_v3';
  const SESSION_KEY='etb2b_jury_session_v1';
  const form=document.getElementById('juryLoginForm');
  const error=document.getElementById('juryLoginError');
  document.getElementById('showJuryPassword').addEventListener('change',e=>document.getElementById('juryPassword').type=e.target.checked?'text':'password');
  form.addEventListener('submit',e=>{
    e.preventDefault();
    let judges=[];try{judges=JSON.parse(localStorage.getItem(JUDGE_KEY))||[]}catch{}
    const email=document.getElementById('juryEmail').value.trim().toLowerCase();
    const password=document.getElementById('juryPassword').value;
    const jury=judges.find(j=>String(j.email||'').toLowerCase()===email && String(j.password||'')===password);
    if(!jury){error.textContent='Email or password is incorrect.';error.classList.add('show');return}
    if(jury.enabled===false){error.textContent='This jury account has been disabled. Please contact the award team.';error.classList.add('show');return}
    if(jury.status==='draft'){error.textContent='This jury invitation is still in draft and cannot log in.';error.classList.add('show');return}
    localStorage.setItem(SESSION_KEY,JSON.stringify({juryId:jury.id,loggedInAt:new Date().toISOString()}));
    if(jury.status==='invited'){jury.status='active';localStorage.setItem(JUDGE_KEY,JSON.stringify(judges))}
    window.location.href='jury-portal.html';
  });
})();
