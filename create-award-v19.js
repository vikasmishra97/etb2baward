(function(){
  const $=id=>document.getElementById(id);
  const STORE='etb2b_awards_new_award';
  const CURRENT='etb2b_current_award';
  let logoData='';

  function toast(msg){const t=$('toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1600)}
  function slugify(v){return (v||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').slice(0,60)}
  function formatDate(v){if(!v)return 'Date to be announced';const d=new Date(v);return d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
  function now(){return new Date()}
  function ctaFor(a){
    if(a.hasNominationDates && a.nominationStart && a.nominationEnd){
      const s=new Date(a.nominationStart), e=new Date(a.nominationEnd), n=now();
      if(n<s)return {label:'Express Interest',state:'Nominations open soon'};
      if(n<=e)return {label:'Nominate Now',state:'Nomination open'};
      return {label:'Nominations Closed',state:'Nomination closed'};
    }
    return {label:'Express Interest',state:'Interest collection'};
  }
  function collect(){return {
    name:$('eventName').value.trim(), awardType:'Industry', type:$('eventCategory').value, eventCategory:$('eventCategory').value, industry:$('eventCategory').value,
    description:$('shortDescription').value.trim(), venue:$('venue').value.trim(), city:$('city').value.trim(),
    hasEventDates:$('hasEventDates').checked,eventStart:$('eventStart').value,eventEnd:$('eventEnd').value,
    hasNominationDates:$('hasNominationDates').checked,nominationStart:$('nominationStart').value,nominationEnd:$('nominationEnd').value,
    openDate:($('nominationStart').value||'').slice(0,10),closeDate:($('nominationEnd').value||'').slice(0,10),deadline:($('nominationEnd').value||'').slice(0,10),winnerDate:($('eventStart').value||'').slice(0,10),
    slug:slugify($('slug').value||$('eventName').value),logoData:logoData,
    country:'India',currency:'INR',entryType:'paid',baseFee:2000,
    generatedCategories:['Award of the Year','Innovation Award','Leadership Award','Rising Star Award','Campaign of the Year'],suggestedCategories:['Award of the Year','Innovation Award','Leadership Award','Rising Star Award','Campaign of the Year']
  }}
  function updatePreview(){
    const a=collect();const c=ctaFor(a);
    $('previewName').textContent=a.name||'Your award name';$('previewDesc').textContent=a.description||'Add a short description to see the public site take shape.';
    $('previewCategory').textContent=(a.eventCategory||'AWARDS').toUpperCase();$('previewVenue').textContent=[a.venue,a.city].filter(Boolean).join(', ')||'Venue';
    $('previewDate').textContent=a.hasEventDates?formatDate(a.eventStart):'Date to be announced';$('previewCta').textContent=c.label;$('previewState').textContent=c.state;
    $('slug').value=slugify($('slug').value||a.name);$('descCount').textContent=$('shortDescription').value.length;
  }
  function setWrap(toggleId,wrapId){const on=$(toggleId).checked;$(wrapId).style.display=on?'grid':'none';updatePreview()}
  function fillSample(){
    $('eventName').value='ET Future Forward Awards 2026';$('eventCategory').value='HR & Talent Management';
    $('shortDescription').value='Celebrating organisations and leaders building the future of work through human-first innovation, technology and transformative talent practices.';
    $('venue').value='Crowne Plaza Kuala Lumpur';$('city').value='Kuala Lumpur';$('hasEventDates').checked=true;$('hasNominationDates').checked=true;
    $('eventStart').value='2026-10-22T18:00';$('eventEnd').value='2026-10-22T23:00';
    $('nominationStart').value='2026-08-20T08:00';$('nominationEnd').value='2026-09-30T23:59';$('slug').value='et-future-forward-awards-2026';updatePreview();toast('Test award filled');
  }
  function validate(a){
    document.querySelectorAll('.ca19-field').forEach(x=>x.classList.remove('invalid'));const missing=[];
    [['eventName','Event name'],['eventCategory','Event category'],['shortDescription','Description'],['venue','Venue'],['city','City']].forEach(([id,label])=>{if(!$(id).value.trim()){missing.push(label);$(id).closest('.ca19-field')?.classList.add('invalid')}});
    if(a.hasEventDates){[['eventStart','Event start'],['eventEnd','Event end']].forEach(([id,label])=>{if(!$(id).value){missing.push(label);$(id).closest('.ca19-field')?.classList.add('invalid')}})}
    if(a.hasNominationDates){[['nominationStart','Nomination start'],['nominationEnd','Nomination end']].forEach(([id,label])=>{if(!$(id).value){missing.push(label);$(id).closest('.ca19-field')?.classList.add('invalid')}})}
    if(a.eventStart&&a.eventEnd&&new Date(a.eventEnd)<new Date(a.eventStart))missing.push('Event end must be after start');
    if(a.nominationStart&&a.nominationEnd&&new Date(a.nominationEnd)<new Date(a.nominationStart))missing.push('Nomination end must be after start');
    if(missing.length){$('formError').hidden=false;$('formError').textContent='Please fix: '+missing.join(' · ');return false}$('formError').hidden=true;return true;
  }
  function save(draft){const a=collect();a.updatedAt=new Date().toISOString();a.status=draft?'draft':'setup';localStorage.setItem(STORE,JSON.stringify(a));localStorage.setItem(CURRENT,a.name||'Untitled Award');return a}

  document.querySelectorAll('input,select,textarea').forEach(el=>el.addEventListener('input',updatePreview));
  $('hasEventDates').addEventListener('change',()=>setWrap('hasEventDates','eventDatesWrap'));$('hasNominationDates').addEventListener('change',()=>setWrap('hasNominationDates','nominationDatesWrap'));
  $('sampleBtn').addEventListener('click',fillSample);$('saveDraftBtn').addEventListener('click',()=>{save(true);toast('Award draft saved')});
  $('eventLogo').addEventListener('change',()=>{const f=$('eventLogo').files[0];if(!f)return;if(f.size>1500000){toast('Please use an image below 1.5 MB');$('eventLogo').value='';return}const r=new FileReader();r.onload=()=>{logoData=r.result;$('logoLabel').textContent=f.name;$('previewLogo').src=logoData;save(true);toast('Logo ready')};r.readAsDataURL(f)});
  $('createAwardBtn').addEventListener('click',()=>{const a=collect();if(!validate(a))return;save(false);toast('Award created');setTimeout(()=>location.href='website.html',350)});
  $('previewCta').addEventListener('click',()=>toast('This CTA becomes live in the Website Studio'))
  try{const saved=JSON.parse(localStorage.getItem(STORE)||'null');if(saved){$('eventName').value=saved.name||'';$('eventCategory').value=saved.eventCategory||'';$('shortDescription').value=saved.description||'';$('venue').value=saved.venue||'';$('city').value=saved.city||'';$('hasEventDates').checked=saved.hasEventDates!==false;$('eventStart').value=saved.eventStart||'';$('eventEnd').value=saved.eventEnd||'';$('hasNominationDates').checked=saved.hasNominationDates!==false;$('nominationStart').value=saved.nominationStart||'';$('nominationEnd').value=saved.nominationEnd||'';$('slug').value=saved.slug||slugify(saved.name);logoData=saved.logoData||''}}
  catch(e){}
  if(logoData)$('previewLogo').src=logoData;
  setWrap('hasEventDates','eventDatesWrap');setWrap('hasNominationDates','nominationDatesWrap');updatePreview();
})();
