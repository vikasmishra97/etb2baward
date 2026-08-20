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
  function saveInterest(form){const fd=new FormData(form);const lead=Object.fromEntries(fd.entries());lead.createdAt=new Date().toISOString();lead.award=award.name;const key='etb2b_awards_interest_'+slug;let rows=[];try{rows=JSON.parse(localStorage.getItem(key)||'[]')}catch(e){}rows.push(lead);localStorage.setItem(key,JSON.stringify(rows))}

  document.querySelectorAll('[data-hero-cta]').forEach(el=>el.addEventListener('click',e=>{
    const cta=ETB2BSite.ctaFor(award);if(cta.mode==='nominate'){e.preventDefault();location.href='nominate.html'}else if(cta.mode==='closed'){e.preventDefault();toast('Nominations are currently closed')}else if(el.getAttribute('href')==='#interest'){e.preventDefault();document.getElementById('interest')?.scrollIntoView({behavior:'smooth',block:'center'})}
  }));
  document.querySelectorAll('[data-public-interest-form]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();const mode=form.dataset.ctaMode;if(mode==='nominate'){location.href='nominate.html';return}if(mode==='closed'){toast('Nominations are closed');return}saveInterest(form);location.href='thank-you.html'}));
})();
