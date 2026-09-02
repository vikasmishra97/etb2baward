(function(){
  const AWARD_KEY='etb2b_awards_new_award';
  const award=(()=>{try{return JSON.parse(localStorage.getItem(AWARD_KEY)||'null')}catch(e){return null}})()||{
    name:'ETB2B Excellence Awards 2027',eventCategory:'Business Excellence',description:'Recognising excellence, innovation and measurable impact.',venue:'New Delhi',city:'Delhi',hasEventDates:true,eventStart:'2027-11-01T18:00',eventEnd:'2027-11-01T23:00',hasNominationDates:true,nominationStart:'2027-06-01T09:00',nominationEnd:'2027-09-30T23:59',slug:'etb2b-excellence-awards-2027'
  };
  const slug=award.slug||String(award.name||'award').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const storeKey='etb2b_awards_website_'+slug;
  let raw=null;try{raw=JSON.parse(localStorage.getItem(storeKey)||'null')}catch(e){}
  const state=ETB2BSite.normalizeState(raw,award);
  const site=document.getElementById('publicSite');
  ETB2BSite.render(site,award,state,{builder:false});
  if(location.hash){setTimeout(()=>document.querySelector(location.hash)?.scrollIntoView({block:'start'}),80)}

  const title=(state.header.seoTitle||award.name||'ETB2B Awards').trim();
  const desc=(state.header.seoDescription||award.description||'Recognising excellence, innovation and measurable impact.').trim();
  document.title=title;
  setMeta('name','description',desc);
  setMeta('property','og:title',title);
  setMeta('property','og:description',desc);
  setMeta('property','og:type','website');
  setMeta('property','og:url',location.href);
  if(state.header.seoImage)setMeta('property','og:image',state.header.seoImage);
  setMeta('name','twitter:card','summary_large_image');
  setMeta('name','twitter:title',title);
  setMeta('name','twitter:description',desc);
  if(state.header.seoImage)setMeta('name','twitter:image',state.header.seoImage);
  if(state.header.thumbnailImage){const icon=document.querySelector('link[rel="icon"]');if(icon)icon.href=state.header.thumbnailImage}

  function setMeta(attr,key,value){let m=document.head.querySelector(`meta[${attr}="${key}"]`);if(!m){m=document.createElement('meta');m.setAttribute(attr,key);document.head.appendChild(m)}m.setAttribute('content',value||'')}
  function toast(msg){const t=document.getElementById('publicToast');t.textContent=msg;t.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('show'),2000)}
  function saveInterest(form,mode='interest'){
    const fd=new FormData(form);const lead=Object.fromEntries(fd.entries());
    const captureLabel=String(form.dataset.captureSource||'').trim()||(mode==='nominate'?'Nominate Now':'Express Interest');
    const isPrimaryNomination=mode==='nominate'&&captureLabel.toLowerCase()==='nominate now';
    lead.id='REG-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,6).toUpperCase();
    lead.createdAt=new Date().toISOString();lead.award=award.name;lead.awardSlug=slug;lead.slug=slug;lead.source='Public award website';lead.captureLabel=captureLabel;lead.captureType=isPrimaryNomination?'nomination':(captureLabel.toLowerCase()==='express interest'?'express_interest':'featured_button');lead.page=location.pathname||'/';lead.status='registered';
    const key='etb2b_awards_interest_'+slug;let rows=[];try{rows=JSON.parse(localStorage.getItem(key)||'[]')}catch(e){}if(!Array.isArray(rows))rows=[];rows.push(lead);localStorage.setItem(key,JSON.stringify(rows));
    let all=[];try{all=JSON.parse(localStorage.getItem('etb2b_awards_registrations')||'[]')}catch(e){}if(!Array.isArray(all))all=[];all.push(lead);localStorage.setItem('etb2b_awards_registrations',JSON.stringify(all));
    localStorage.setItem('etb2b_awards_last_registration',JSON.stringify(lead));
    if(isPrimaryNomination){
      const profile={name:lead.name||'',email:lead.email||'',mobile:lead.mobile||'',company:lead.company||'',designation:lead.designation||'',registeredAt:lead.createdAt,source:'public_nominate',captureLabel:lead.captureLabel};
      Object.keys(lead).filter(k=>k.startsWith('custom_')).forEach(k=>profile[k]=lead[k]);
      localStorage.setItem('etb2b_public_nominee_profile_'+slug,JSON.stringify(profile));
      let regs=[];try{regs=JSON.parse(localStorage.getItem('etb2b_public_nomination_registrations')||'[]')}catch(e){}if(!Array.isArray(regs))regs=[];
      const ix=regs.findIndex(r=>r.slug===slug&&String(r.email||'').toLowerCase()===String(profile.email||'').toLowerCase());
      const reg=Object.assign({},profile,{award:award.name||'ETB2B Awards',slug,registeredAt:profile.registeredAt});if(ix>=0)regs[ix]=reg;else regs.push(reg);
      localStorage.setItem('etb2b_public_nomination_registrations',JSON.stringify(regs));
    }
    return lead;
  }
  function nomineeProfile(){try{return JSON.parse(localStorage.getItem('etb2b_public_nominee_profile_'+slug)||'null')}catch(e){return null}}
  function isNomineeRegistered(){const p=nomineeProfile();return !!(p&&p.registeredAt&&String(p.email||'').trim())}

  document.querySelectorAll('[data-hero-cta]').forEach(el=>el.addEventListener('click',e=>{
    const cta=ETB2BSite.ctaFor(award);
    if(cta.mode==='nominate'){if(isNomineeRegistered()){e.preventDefault();location.href='nominate.html'}return}
    if(cta.mode==='closed'){e.preventDefault();toast('Nominations are currently closed')}else if(el.getAttribute('href')==='#interest'){e.preventDefault();document.getElementById('interest')?.scrollIntoView({behavior:'smooth',block:'center'})}
  }));
  document.querySelectorAll('[data-public-interest-form]').forEach(form=>form.addEventListener('submit',e=>{
    e.preventDefault();const mode=form.dataset.ctaMode;if(mode==='closed'){toast('Nominations are closed');return}
    if(!form.reportValidity())return;const lead=saveInterest(form,mode);
    if(lead.captureType==='nomination'){location.href='nominate.html';return}
    location.href='thank-you.html';
  }));
})();
