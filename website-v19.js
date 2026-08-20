(function(){
  const $=id=>document.getElementById(id);
  const AWARD_KEY='etb2b_awards_new_award';
  const award=(()=>{try{return JSON.parse(localStorage.getItem(AWARD_KEY)||'null')}catch(e){return null}})()||{
    name:'ET Future Forward Awards 2026',eventCategory:'HR & Talent Management',description:'Celebrating organisations and leaders building the future of work through human-first innovation, technology and transformative talent practices.',venue:'Crowne Plaza Kuala Lumpur',city:'Kuala Lumpur',hasEventDates:true,eventStart:'2026-10-22T18:00',eventEnd:'2026-10-22T23:00',hasNominationDates:true,nominationStart:'2026-08-20T08:00',nominationEnd:'2026-09-30T23:59',slug:'et-future-forward-awards-2026'
  };
  const storeKey='etb2b_awards_website_'+(award.slug||'demo');
  let rawState=(()=>{try{return JSON.parse(localStorage.getItem(storeKey)||'null')}catch(e){return null}})();let state=ETB2BSite.normalizeState(rawState,award);
  let selectedId='overview';
  let dirty=false;

  const presets={
    'awards-night':{primary:'#a90e17',accent:'#d8ad59',surface:'#fffaf2',font:'editorial',radius:'soft'},
    executive:{primary:'#0f2d43',accent:'#caa14d',surface:'#f7f8fa',font:'modern',radius:'soft'},
    editorial:{primary:'#74131a',accent:'#b68b48',surface:'#f5efe3',font:'editorial',radius:'sharp'},
    modern:{primary:'#d71920',accent:'#1e77d3',surface:'#f7f8fb',font:'modern',radius:'round'}
  };
  const designs=['classic','editorial','cards','split','dark'];

  function toast(msg){const t=$('toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1600)}
  function saveAward(){award.industry=award.eventCategory||award.industry;award.type=award.eventCategory||award.type;award.openDate=(award.nominationStart||'').slice(0,10);award.closeDate=(award.nominationEnd||'').slice(0,10);award.deadline=award.closeDate;award.winnerDate=(award.eventStart||'').slice(0,10);localStorage.setItem(AWARD_KEY,JSON.stringify(award));localStorage.setItem('etb2b_current_award',award.name||'Untitled Award');$('sideAwardName').textContent=award.name||'Untitled Award';$('crumbAward').textContent=award.name||'Untitled Award'}
  function save(showToast=true){state.updatedAt=new Date().toISOString();localStorage.setItem(storeKey,JSON.stringify(state));saveAward();dirty=false;updateSaveState();if(showToast)toast('Website draft saved')}
  function markDirty(){dirty=true;updateSaveState();render();}
  function updateSaveState(){const dot=document.querySelector('.wb19-save-dot');$('saveStatus').textContent=dirty?'Unsaved changes':'Draft saved';dot?.classList.toggle('unsaved',dirty)}
  function escAttr(s){return String(s??'').replace(/"/g,'&quot;')}
  function currentSection(){return state.sections.find(s=>s.id===selectedId)||state.sections[0]}
  function selectSection(id){selectedId=id;renderSectionManager();renderInspector();const s=currentSection();$('inspectorHeading').textContent=s.label;$('inspectorTheme').textContent=(s.theme||'classic').replace(/^./,m=>m.toUpperCase())}
  function render(){
    ETB2BSite.render($('liveSite'),award,state,{builder:true});
    const c=ETB2BSite.ctaFor(award);$('ctaExplanation').textContent=`Current website CTA: ${c.label}. ${c.sub}.`;
    updateReadiness();
  }
  function updateReadiness(){let score=48;const checks=[];if(award.name&&award.venue)score+=10;if(state.header.desktopImage){score+=10;checks.push('banner')}if(state.sections.filter(s=>s.enabled).length>=7)score+=12;if(state.form.showOnBanner&&Object.values(state.form.fields).some(Boolean))score+=8;if(state.pages.thankyou.enabled)score+=5;if(state.nav.sticky)score+=3;score=Math.min(score,100);$('readinessScore').textContent=score+'%';$('readinessBar').style.width=score+'%';$('readinessCopy').textContent=score>=90?'Website is ready for category setup. You can keep refining it later.':state.header.desktopImage?'Your structure is strong. Review section content and registration fields before continuing.':'Upload a desktop banner and review your key sections before moving to Categories.'}

  function renderSectionManager(){
    $('sectionManager').innerHTML=state.sections.map(s=>`<div class="wb19-section-row ${s.enabled?'':'disabled'}" data-id="${s.id}"><label title="Show / hide"><input type="checkbox" data-section-toggle="${s.id}" ${s.enabled?'checked':''}><i></i></label><div><b>${s.label}</b><small>${s.id==='custom'?'HTML / embed area':'Homepage section'}</small></div><select data-section-theme="${s.id}">${designs.map(d=>`<option value="${d}" ${s.theme===d?'selected':''}>${d[0].toUpperCase()+d.slice(1)}</option>`).join('')}</select><button type="button" data-edit-section="${s.id}" title="Edit">✎</button></div>`).join('');
    document.querySelectorAll('[data-section-toggle]').forEach(el=>el.addEventListener('change',()=>{const s=state.sections.find(x=>x.id===el.dataset.sectionToggle);s.enabled=el.checked;if(s.id!=='custom')state.nav.visible[s.id]=el.checked;markDirty();renderSectionManager();renderNavManager()}));
    document.querySelectorAll('[data-section-theme]').forEach(el=>el.addEventListener('change',()=>{const s=state.sections.find(x=>x.id===el.dataset.sectionTheme);s.theme=el.value;markDirty();if(selectedId===s.id)selectSection(s.id)}));
    document.querySelectorAll('[data-edit-section]').forEach(b=>b.addEventListener('click',()=>selectSection(b.dataset.editSection)));
  }
  function field(label,key,value,type='input'){
    if(type==='textarea')return `<label class="wb19-field"><span>${label}</span><textarea data-inspector-key="${key}">${value??''}</textarea></label>`;
    return `<label class="wb19-field"><span>${label}</span><input data-inspector-key="${key}" value="${escAttr(value??'')}"></label>`;
  }
  function repeatEditor(type,items){
    const rows=(items||[]).map((it,i)=>{
      if(type==='speakers')return `<div class="wb19-repeat-row" data-repeat-index="${i}"><input data-repeat-field="name" value="${escAttr(it.name)}" placeholder="Name"><input data-repeat-field="role" value="${escAttr(it.role)}" placeholder="Role"><input data-repeat-field="company" value="${escAttr(it.company)}" placeholder="Company"><div class="wb19-repeat-actions"><button data-remove-repeat="${i}">Remove</button></div></div>`;
      if(type==='agenda')return `<div class="wb19-repeat-row" data-repeat-index="${i}"><input data-repeat-field="time" value="${escAttr(it.time)}" placeholder="18:00"><input data-repeat-field="title" value="${escAttr(it.title)}" placeholder="Agenda item"><div class="wb19-repeat-actions"><button data-remove-repeat="${i}">Remove</button></div></div>`;
      return `<div class="wb19-repeat-row" data-repeat-index="${i}"><input data-repeat-field="title" value="${escAttr(it.title)}" placeholder="Resource title"><input data-repeat-field="url" value="${escAttr(it.url)}" placeholder="https://"><div class="wb19-repeat-actions"><button data-remove-repeat="${i}">Remove</button></div></div>`;
    }).join('');
    return `<div class="wb19-inspector-list" data-repeat-type="${type}">${rows}</div><button class="wb19-add-row" data-add-repeat="${type}">+ Add ${type==='speakers'?'speaker':type==='agenda'?'agenda item':'resource'}</button>`;
  }
  function renderInspector(){
    const s=currentSection();if(!s)return;
    let html=field('Section title','title',s.title);
    if(['overview','eventDescription','glimpse'].includes(s.id))html+=field('Content','body',s.body,'textarea');
    if(['keypoints','who','why'].includes(s.id))html+=field('List items · one per line','items',s.items,'textarea');
    if(s.id==='speakers')html+=repeatEditor('speakers',s.speakers);
    if(s.id==='agenda')html+=repeatEditor('agenda',s.agenda);
    if(s.id==='resources')html+=repeatEditor('resources',s.resources);
    if(s.id==='contact')html+=field('Email','email',s.email)+field('Phone','phone',s.phone)+field('Address','address',s.address,'textarea');
    if(s.id==='custom')html+=field('Custom HTML / embed code','html',s.html,'textarea')+'<p class="wb19-help">HTML and CSS markup is rendered in this prototype. Keep scripts out of the demo for predictable behaviour.</p>';
    html+=`<label class="wb19-field"><span>Section design</span><select id="inspectorDesign">${designs.map(d=>`<option value="${d}" ${s.theme===d?'selected':''}>${d[0].toUpperCase()+d.slice(1)}</option>`).join('')}</select></label>`;
    $('sectionInspector').innerHTML=html;
    document.querySelectorAll('[data-inspector-key]').forEach(el=>el.addEventListener('input',()=>{s[el.dataset.inspectorKey]=el.value;markDirty();renderSectionManager()}));
    $('inspectorDesign').addEventListener('change',e=>{s.theme=e.target.value;markDirty();renderSectionManager();$('inspectorTheme').textContent=e.target.value[0].toUpperCase()+e.target.value.slice(1)});
    document.querySelectorAll('[data-repeat-field]').forEach(el=>el.addEventListener('input',()=>{const type=el.closest('[data-repeat-type]').dataset.repeatType;const idx=Number(el.closest('[data-repeat-index]').dataset.repeatIndex);s[type][idx][el.dataset.repeatField]=el.value;markDirty()}));
    document.querySelectorAll('[data-remove-repeat]').forEach(b=>b.addEventListener('click',()=>{const type=b.closest('[data-repeat-type]').dataset.repeatType;s[type].splice(Number(b.dataset.removeRepeat),1);markDirty();renderInspector()}));
    document.querySelectorAll('[data-add-repeat]').forEach(b=>b.addEventListener('click',()=>{const type=b.dataset.addRepeat;if(type==='speakers')s.speakers.push({name:'New Speaker',role:'Role',company:'Company'});if(type==='agenda')s.agenda.push({time:'18:00',title:'New agenda item'});if(type==='resources')s.resources.push({title:'New resource',url:'#'});markDirty();renderInspector()}));
  }
  function renderNavManager(){
    $('navManager').innerHTML=state.sections.filter(s=>s.id!=='custom').map(s=>`<label class="wb19-nav-row"><span>${s.label}</span><input type="checkbox" data-nav-id="${s.id}" ${state.nav.visible[s.id]!==false&&s.enabled?'checked':''} ${s.enabled?'':'disabled'}></label>`).join('');
    document.querySelectorAll('[data-nav-id]').forEach(el=>el.addEventListener('change',()=>{state.nav.visible[el.dataset.navId]=el.checked;markDirty()}));
  }
  function syncControls(){
    $('basicEventName').value=award.name||'';$('basicEventCategory').value=award.eventCategory||award.industry||'';$('basicDescription').value=award.description||'';$('basicVenue').value=award.venue||'';$('basicCity').value=award.city||'';$('basicEventStart').value=award.eventStart||'';$('basicEventEnd').value=award.eventEnd||'';$('basicNominationStart').value=award.nominationStart||'';$('basicNominationEnd').value=award.nominationEnd||'';
    $('heroDesign').value=state.header.design;$('overlay').value=state.header.overlay;$('overlayValue').textContent=state.header.overlay+'%';$('primaryColor').value=state.theme.primary;$('accentColor').value=state.theme.accent;$('surfaceColor').value=state.theme.surface;$('fontStyle').value=state.theme.font;
    $('showForm').checked=state.form.showOnBanner;$('formTitle').value=state.form.title;$('stickyNav').checked=state.nav.sticky;$('navRewards').checked=state.nav.showRewards!==false;
    document.querySelectorAll('[data-form-field]').forEach(el=>el.checked=!!state.form.fields[el.dataset.formField]);
    $('thankEnabled').checked=state.pages.thankyou.enabled;$('thankTitle').value=state.pages.thankyou.title;$('thankBody').value=state.pages.thankyou.body;$('rewardsEnabled').checked=state.pages.rewards.enabled;$('rewardsTitle').value=state.pages.rewards.title;$('rewardsBody').value=state.pages.rewards.body;
    document.querySelectorAll('[data-preset]').forEach(b=>b.classList.toggle('active',b.dataset.preset===state.theme.preset));
  }
  function readFile(input,target,label){const f=input.files[0];if(!f)return;if(f.size>1800000){toast('Use an image below 1.8 MB');input.value='';return}const r=new FileReader();r.onload=()=>{state.header[target]=r.result;$(label).textContent=f.name;markDirty();save(false)};r.readAsDataURL(f)}
  function applyPreset(name){Object.assign(state.theme,presets[name]);state.theme.preset=name;if(name==='awards-night')state.header.design='immersive';if(name==='executive')state.header.design='split';if(name==='editorial')state.header.design='editorial';if(name==='modern')state.header.design='minimal';syncControls();markDirty();toast('Theme applied')}
  function continueCategories(){save(false);location.href='categories.html'}

  $('sideAwardName').textContent=award.name;$('crumbAward').textContent=award.name;
  [['basicEventName','name'],['basicEventCategory','eventCategory'],['basicDescription','description'],['basicVenue','venue'],['basicCity','city'],['basicEventStart','eventStart'],['basicEventEnd','eventEnd'],['basicNominationStart','nominationStart'],['basicNominationEnd','nominationEnd']].forEach(([id,key])=>$(id).addEventListener('input',e=>{award[key]=e.target.value;if(key==='nominationStart'||key==='nominationEnd')award.hasNominationDates=!!(award.nominationStart&&award.nominationEnd);if(key==='eventStart'||key==='eventEnd')award.hasEventDates=!!(award.eventStart&&award.eventEnd);saveAward();markDirty();}));
  document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('[data-panel]').forEach(p=>p.classList.toggle('active',p.dataset.panel===b.dataset.tab))}));
  document.querySelectorAll('[data-device]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-device]').forEach(x=>x.classList.toggle('active',x===b));$('previewFrame').className='wb19-canvas '+b.dataset.device}));
  $('heroDesign').addEventListener('change',e=>{state.header.design=e.target.value;markDirty()});$('overlay').addEventListener('input',e=>{state.header.overlay=Number(e.target.value);$('overlayValue').textContent=e.target.value+'%';markDirty()});
  $('desktopBanner').addEventListener('change',e=>readFile(e.target,'desktopImage','desktopBannerLabel'));$('mobileBanner').addEventListener('change',e=>readFile(e.target,'mobileImage','mobileBannerLabel'));
  document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>applyPreset(b.dataset.preset)));
  [['primaryColor','primary'],['accentColor','accent'],['surfaceColor','surface']].forEach(([id,key])=>$(id).addEventListener('input',e=>{state.theme[key]=e.target.value;state.theme.preset='custom';document.querySelectorAll('[data-preset]').forEach(b=>b.classList.remove('active'));markDirty()}));$('fontStyle').addEventListener('change',e=>{state.theme.font=e.target.value;markDirty()});
  $('showForm').addEventListener('change',e=>{state.form.showOnBanner=e.target.checked;markDirty()});$('formTitle').addEventListener('input',e=>{state.form.title=e.target.value;markDirty()});document.querySelectorAll('[data-form-field]').forEach(el=>el.addEventListener('change',()=>{state.form.fields[el.dataset.formField]=el.checked;markDirty()}));
  $('stickyNav').addEventListener('change',e=>{state.nav.sticky=e.target.checked;markDirty()});$('navRewards').addEventListener('change',e=>{state.nav.showRewards=e.target.checked;markDirty()});
  $('thankEnabled').addEventListener('change',e=>{state.pages.thankyou.enabled=e.target.checked;markDirty()});$('thankTitle').addEventListener('input',e=>{state.pages.thankyou.title=e.target.value;markDirty()});$('thankBody').addEventListener('input',e=>{state.pages.thankyou.body=e.target.value;markDirty()});$('rewardsEnabled').addEventListener('change',e=>{state.pages.rewards.enabled=e.target.checked;markDirty()});$('rewardsTitle').addEventListener('input',e=>{state.pages.rewards.title=e.target.value;markDirty()});$('rewardsBody').addEventListener('input',e=>{state.pages.rewards.body=e.target.value;markDirty()});
  $('saveSiteBtn').addEventListener('click',()=>save(true));$('sampleDesignBtn').addEventListener('click',()=>applyPreset('awards-night'));$('refreshBtn').addEventListener('click',()=>{render();toast('Preview refreshed')});$('continueCategoriesBtn').addEventListener('click',continueCategories);$('bottomContinueBtn').addEventListener('click',continueCategories);
  window.addEventListener('beforeunload',()=>{if(dirty)save(false)});

  syncControls();renderSectionManager();renderNavManager();selectSection('overview');render();updateSaveState();
})();
