(function(){
  const USER_KEY='etb2b_auth_user';
  const PORTAL_KEY='etb2b_selected_portal';
  const errorEl=document.getElementById('loginError');
  const fallback=document.getElementById('googleFallback');
  const clientId=(document.querySelector('meta[name="google-client-id"]')?.content||'').trim();

  function showError(message){errorEl.textContent=message;errorEl.hidden=false;}
  function decodeJwt(token){
    try{
      const base64Url=token.split('.')[1];
      const base64=base64Url.replace(/-/g,'+').replace(/_/g,'/');
      const json=decodeURIComponent(atob(base64).split('').map(c=>'%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      return JSON.parse(json);
    }catch(e){return null;}
  }
  function storeGoogleUser(response){
    const p=decodeJwt(response.credential||'');
    if(!p||!p.email){showError('Google sign-in completed, but your account details could not be read. Please try again.');return;}
    const user={
      id:p.sub||'',
      name:p.name||p.email.split('@')[0],
      email:p.email,
      picture:p.picture||'',
      givenName:p.given_name||'',
      familyName:p.family_name||'',
      provider:'google',
      signedInAt:new Date().toISOString()
    };
    localStorage.setItem(USER_KEY,JSON.stringify(user));
    localStorage.removeItem(PORTAL_KEY);
    location.href='portal-select.html';
  }
  window.handleEtb2bGoogleCredential=storeGoogleUser;

  function initGoogle(){
    const configured=clientId && !clientId.startsWith('YOUR_GOOGLE_CLIENT_ID');
    if(!configured){
      fallback.hidden=false;
      fallback.addEventListener('click',()=>showError('Google Sign-In needs your Google OAuth Client ID. Replace YOUR_GOOGLE_CLIENT_ID in login.html with the Web Client ID for this GitHub domain.'));
      return;
    }
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      if(window.google?.accounts?.id){
        clearInterval(timer);
        google.accounts.id.initialize({client_id:clientId,callback:storeGoogleUser,auto_select:false,cancel_on_tap_outside:true});
        google.accounts.id.renderButton(document.getElementById('googleButton'),{theme:'outline',size:'large',shape:'rectangular',text:'signin_with',width:420,logo_alignment:'left'});
      }else if(tries>40){
        clearInterval(timer);fallback.hidden=false;fallback.addEventListener('click',()=>showError('Google Sign-In could not load. Check your internet connection and allowed OAuth origins.'));
      }
    },150);
  }

  try{
    const existing=JSON.parse(localStorage.getItem(USER_KEY)||'null');
    const portal=JSON.parse(localStorage.getItem(PORTAL_KEY)||'null');
    if(existing?.email && portal?.id){location.replace('index.html');return;}
    if(existing?.email){location.replace('portal-select.html');return;}
  }catch(e){}
  initGoogle();
})();
