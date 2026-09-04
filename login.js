(function(){
  const USER_KEY='etb2b_auth_user';
  const PORTAL_KEY='etb2b_selected_portal';
  const $=id=>document.getElementById(id);

  const errorEl=$('loginError');
  const successEl=$('loginSuccess');
  const emailStep=$('emailStep');
  const otpStep=$('otpStep');
  const emailForm=$('emailForm');
  const otpForm=$('otpForm');
  const workEmail=$('workEmail');
  const otpCode=$('otpCode');
  const otpEmailLabel=$('otpEmailLabel');
  const sendOtpBtn=$('sendOtpBtn');
  const verifyOtpBtn=$('verifyOtpBtn');
  const resendOtpBtn=$('resendOtpBtn');
  const changeEmailBtn=$('changeEmailBtn');

  const supabaseUrl=(document.querySelector('meta[name="supabase-url"]')?.content||'').trim();
  const supabaseAnonKey=(document.querySelector('meta[name="supabase-anon-key"]')?.content||'').trim();
  const allowedDomain=((document.querySelector('meta[name="allowed-email-domain"]')?.content||'timesinternet.in').trim().toLowerCase());
  let pendingEmail='';
  let supabaseClient=null;

  function configured(){
    return supabaseUrl && supabaseAnonKey && !supabaseUrl.startsWith('YOUR_') && !supabaseAnonKey.startsWith('YOUR_');
  }

  function getClient(){
    if(supabaseClient) return supabaseClient;
    if(!configured() || !window.supabase?.createClient) return null;
    supabaseClient=window.supabase.createClient(supabaseUrl,supabaseAnonKey,{
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
    });
    return supabaseClient;
  }

  function normalizeEmail(value){return String(value||'').trim().toLowerCase();}
  function validCompanyEmail(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.endsWith('@'+allowedDomain);
  }
  function displayNameFromEmail(email){
    const local=(email.split('@')[0]||'User').replace(/[._-]+/g,' ').trim();
    return local.replace(/\b\w/g,c=>c.toUpperCase());
  }
  function hideMessages(){errorEl.hidden=true;successEl.hidden=true;}
  function showError(message){successEl.hidden=true;errorEl.textContent=message;errorEl.hidden=false;}
  function showSuccess(message){errorEl.hidden=true;successEl.textContent=message;successEl.hidden=false;}
  function setBusy(btn,busy,label){
    if(!btn)return;
    if(!btn.dataset.original)btn.dataset.original=btn.querySelector('span')?.textContent||btn.textContent;
    btn.disabled=busy;
    const text=btn.querySelector('span');
    if(text) text.textContent=busy?label:btn.dataset.original;
  }
  function showOtp(email){
    pendingEmail=email;
    otpEmailLabel.textContent=email;
    emailStep.hidden=true;
    otpStep.hidden=false;
    otpCode.value='';
    otpCode.focus();
  }
  function showEmail(){
    pendingEmail='';
    otpStep.hidden=true;
    emailStep.hidden=false;
    otpCode.value='';
    hideMessages();
    workEmail.focus();
  }

  async function sendOtp(email,isResend){
    hideMessages();
    if(!configured()){
      showError('Email OTP needs Supabase setup. Add your Supabase Project URL and anon key in login.html.');
      return false;
    }
    const client=getClient();
    if(!client){showError('Authentication service could not load. Please refresh and try again.');return false;}

    const {error}=await client.auth.signInWithOtp({
      email,
      options:{shouldCreateUser:true}
    });
    if(error){showError(error.message||'Unable to send the verification code. Please try again.');return false;}
    showOtp(email);
    showSuccess(isResend?'A new verification code has been sent.':'Verification code sent successfully.');
    return true;
  }

  emailForm.addEventListener('submit',async function(e){
    e.preventDefault();
    const email=normalizeEmail(workEmail.value);
    hideMessages();
    if(!email){showError('Enter your Times Internet work email.');return;}
    if(!validCompanyEmail(email)){
      showError('Access is restricted to @'+allowedDomain+' email IDs only.');
      return;
    }
    setBusy(sendOtpBtn,true,'Sending code...');
    try{await sendOtp(email,false);}catch(err){showError('Unable to send the code. Please try again.');}
    finally{setBusy(sendOtpBtn,false);}
  });

  otpForm.addEventListener('submit',async function(e){
    e.preventDefault();
    hideMessages();
    const token=String(otpCode.value||'').replace(/\D/g,'').slice(0,6);
    if(!pendingEmail){showError('Please enter your email again.');showEmail();return;}
    if(token.length!==6){showError('Enter the 6-digit verification code from your email.');return;}
    const client=getClient();
    if(!client){showError('Authentication service is not configured.');return;}

    setBusy(verifyOtpBtn,true,'Verifying...');
    try{
      const {data,error}=await client.auth.verifyOtp({email:pendingEmail,token,type:'email'});
      if(error){showError(error.message||'Invalid or expired code. Please try again.');return;}
      const verifiedEmail=normalizeEmail(data?.user?.email||pendingEmail);
      if(!validCompanyEmail(verifiedEmail)){
        try{await client.auth.signOut();}catch(_e){}
        showError('This account is not permitted to access the ETB2B backend.');
        return;
      }

      const meta=data?.user?.user_metadata||{};
      const user={
        id:data?.user?.id||'',
        name:meta.full_name||meta.name||displayNameFromEmail(verifiedEmail),
        email:verifiedEmail,
        picture:meta.avatar_url||meta.picture||'',
        provider:'email_otp',
        verified:true,
        signedInAt:new Date().toISOString()
      };
      localStorage.setItem(USER_KEY,JSON.stringify(user));
      localStorage.removeItem(PORTAL_KEY);
      showSuccess('Email verified. Redirecting to portal selection...');
      setTimeout(()=>{location.href='portal-select.html';},450);
    }catch(err){showError('Unable to verify the code. Please try again.');}
    finally{setBusy(verifyOtpBtn,false);}
  });

  resendOtpBtn.addEventListener('click',async function(){
    if(!pendingEmail){showEmail();return;}
    resendOtpBtn.disabled=true;
    try{await sendOtp(pendingEmail,true);}catch(err){showError('Unable to resend the code. Please try again.');}
    finally{
      let left=30;
      resendOtpBtn.textContent='Resend in '+left+'s';
      const timer=setInterval(()=>{
        left--;
        if(left<=0){clearInterval(timer);resendOtpBtn.disabled=false;resendOtpBtn.textContent='Resend code';}
        else resendOtpBtn.textContent='Resend in '+left+'s';
      },1000);
    }
  });

  changeEmailBtn.addEventListener('click',showEmail);
  otpCode.addEventListener('input',()=>{otpCode.value=otpCode.value.replace(/\D/g,'').slice(0,6);});

  try{
    const existing=JSON.parse(localStorage.getItem(USER_KEY)||'null');
    const portal=JSON.parse(localStorage.getItem(PORTAL_KEY)||'null');
    if(existing?.email && validCompanyEmail(normalizeEmail(existing.email)) && portal?.id){location.replace('index.html');return;}
    if(existing?.email && validCompanyEmail(normalizeEmail(existing.email))){location.replace('portal-select.html');return;}
    if(existing?.email){localStorage.removeItem(USER_KEY);localStorage.removeItem(PORTAL_KEY);}
  }catch(e){}
})();
