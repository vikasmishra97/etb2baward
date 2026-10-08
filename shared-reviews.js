/* Shared jury reviews: authenticated Supabase REST, row-level security enforced in database. */
(function () {
  'use strict';
  const cfg=window.ETB2B_SHARED_REVIEWS_CONFIG||{};
  const enabled=!!(cfg.url&&cfg.anonKey);
  const base=String(cfg.url||'').replace(/\/$/,'');
  const storageKey='etb2b_shared_auth_v1';
  let session=null;
  const getSaved=()=>{try{return JSON.parse(sessionStorage.getItem(storageKey)||'null')}catch{return null}};
  const store=s=>{session=s; if(s)sessionStorage.setItem(storageKey,JSON.stringify(s));else sessionStorage.removeItem(storageKey)};
  async function request(path,opts={}){
    if(!enabled)throw Error('Shared database not configured');
    const token=opts.token||session?.access_token;
    const headers={'apikey':cfg.anonKey,'Content-Type':'application/json',...(token?{'Authorization':'Bearer '+token}:{}),...(opts.headers||{})};
    const res=await fetch(base+path,{method:opts.method||'GET',headers,body:opts.body?JSON.stringify(opts.body):undefined,cache:'no-store'});
    if(!res.ok){const body=await res.text();throw Error(`Shared database ${res.status}: ${body.slice(0,240)}`)}
    const body=await res.text();return body?JSON.parse(body):null;
  }
  async function login(email,password){const s=await request('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password},token:cfg.anonKey});store(s);return profile()}
  async function renew(){if(!session?.refresh_token)return false;try{const s=await request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:session.refresh_token},token:cfg.anonKey});store(s);return true}catch{store(null);return false}}
  async function call(path,opts={}){if(!session?.access_token)throw Error('Sign in to shared reviews first');if(session.expires_at&&session.expires_at<Date.now()/1000+60)await renew();try{return await request(path,opts)}catch(e){if(String(e).includes('401')&&await renew())return request(path,opts);throw e}}
  async function profile(){const rows=await call('/rest/v1/review_accounts?select=user_id,role,juror_id,enabled&limit=1');if(!rows?.length||!rows[0].enabled)throw Error('Your Supabase account has not been linked to an enabled jury/admin role');return rows[0]}
  async function restore(){if(!enabled)return null;store(getSaved());if(!session)return null;try{return await profile()}catch{if(await renew())return profile();return null}}
  async function saveReview(review){const p=await profile();if(p.role!=='juror')throw Error('Jury login required');if(String(p.juror_id)!==String(review.juryId))throw Error('This account does not match the currently selected juror');const body={juror_id:String(review.juryId),nomination_id:String(review.nominationId),level:Number(review.level),status:review.status,payload:review};await call('/rest/v1/jury_review_records?on_conflict=juror_id,nomination_id,level',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body});}
  async function listSubmitted(){const p=await profile();if(p.role!=='admin')throw Error('Admin role required for synchronized results');const rows=await call('/rest/v1/jury_review_records?select=juror_id,nomination_id,level,payload,updated_at&status=eq.submitted&order=updated_at.desc&limit=10000');return rows||[]}
  window.ETB2BSharedReviews={enabled,login,restore,profile,saveReview,listSubmitted,logout:()=>store(null)};
})();
