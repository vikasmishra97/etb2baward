(function(){
  const AWARD_KEY='etb2b_awards_new_award';
  const award=(()=>{try{return JSON.parse(localStorage.getItem(AWARD_KEY)||'null')}catch(e){return null}})()||{name:'ETB2B Excellence Awards 2027',eventCategory:'Business Excellence',description:'Recognising excellence, innovation and measurable impact.',venue:'New Delhi',city:'Delhi',hasEventDates:true,eventStart:'2027-11-01T18:00',hasNominationDates:true,nominationStart:'2027-06-01T09:00',nominationEnd:'2027-09-30T23:59',slug:'etb2b-excellence-awards-2027'};
  const slug=award.slug||String(award.name||'award').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  let raw=null;try{raw=JSON.parse(localStorage.getItem('etb2b_awards_website_'+slug)||'null')}catch(e){}
  const state=ETB2BSite.normalizeState(raw,award),root=document.querySelector('.public-page-shell');
  if(root)root.setAttribute('style',ETB2BSite.themeVars(state));
  const host=document.getElementById('publicShellNav');if(host)ETB2BSite.renderNav(host,award,state,{currentPage:document.body.dataset.page||''});
  document.querySelectorAll('[data-award-name]').forEach(x=>x.textContent=award.name||'ETB2B Awards');
  document.querySelectorAll('[data-award-date]').forEach(x=>x.textContent=award.hasEventDates?ETB2BSite.niceDate(award.eventStart):'Date to be announced');
  document.querySelectorAll('[data-award-venue]').forEach(x=>x.textContent=[award.venue,award.city].filter(Boolean).join(', ')||'Venue to be announced');
  window.ETB2BPublicContext={award,state,slug};
})();