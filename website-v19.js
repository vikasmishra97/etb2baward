(function(){
  const $=id=>document.getElementById(id);
  const AWARD_KEY='etb2b_awards_new_award';
  const award=(()=>{try{return JSON.parse(localStorage.getItem(AWARD_KEY)||'null')}catch(e){return null}})()||{
    name:'ET Future Forward Awards 2026',eventCategory:'HR & Talent Management',description:'Celebrating organisations and leaders building the future of work through human-first innovation, technology and transformative talent practices.',venue:'Crowne Plaza Kuala Lumpur',city:'Kuala Lumpur',hasEventDates:true,eventStart:'2026-10-22T18:00',eventEnd:'2026-10-22T23:00',hasNominationDates:true,nominationStart:'2026-08-20T08:00',nominationEnd:'2026-09-30T23:59',slug:'et-future-forward-awards-2026'
  };
  const storeKey='etb2b_awards_website_'+(award.slug||'demo');
  let rawState=(()=>{try{return JSON.parse(localStorage.getItem(storeKey)||'null')}catch(e){return null}})();
  let state=ETB2BSite.normalizeState(rawState,award);
  let selectedId='overview';
  let dirty=false;

  const presets={
    'awards-night':{primary:'#a90e17',accent:'#d8ad59',surface:'#fffaf2',font:'editorial',radius:'soft'},
    executive:{primary:'#0f2d43',accent:'#caa14d',surface:'#f7f8fa',font:'modern',radius:'soft'},
    editorial:{primary:'#74131a',accent:'#b68b48',surface:'#f5efe3',font:'editorial',radius:'sharp'},
    modern:{primary:'#d71920',accent:'#1e77d3',surface:'#f7f8fb',font:'modern',radius:'round'}
  };

  const layoutCatalog={
    prose:[
      {id:'classic',name:'Classic',desc:'Clean heading and readable story',preview:'classic'},
      {id:'editorial',name:'Editorial',desc:'Premium magazine-style presentation',preview:'editorial'},
      {id:'split',name:'Split Story',desc:'Two-column story with visual contrast',preview:'split'},
      {id:'spotlight',name:'Award Spotlight',desc:'Bold statement with premium accent',preview:'spotlight'},
      {id:'magazine',name:'Magazine',desc:'Large title with columned content',preview:'magazine'},
      {id:'centered',name:'Centered',desc:'Elegant centered narrative',preview:'centered'},
      {id:'framed',name:'Framed',desc:'Story inside an award-style frame',preview:'framed'},
      {id:'dark',name:'Dark Premium',desc:'Stage-night dark treatment',preview:'dark'}
    ],
    list:[
      {id:'cards',name:'Award Cards',desc:'Four premium content cards',preview:'cards'},
      {id:'icon-grid',name:'Icon Grid',desc:'Visual grid with accent markers',preview:'icon-grid'},
      {id:'numbered',name:'Numbered',desc:'Large numbered editorial list',preview:'numbered'},
      {id:'split',name:'Split List',desc:'Balanced two-column layout',preview:'split-list'},
      {id:'checklist',name:'Checklist',desc:'Clear benefit / eligibility checklist',preview:'checklist'},
      {id:'ribbon',name:'Award Ribbon',desc:'Horizontal premium ribbon cards',preview:'ribbon'},
      {id:'minimal',name:'Minimal',desc:'Simple, whitespace-first list',preview:'minimal'},
      {id:'dark',name:'Dark Cards',desc:'Dark award-night grid',preview:'dark'}
    ],
    speakers:[
      {id:'cards',name:'Profile Cards',desc:'Balanced speaker profile cards',preview:'cards'},
      {id:'portraits',name:'Portrait Grid',desc:'Large portrait-style avatars',preview:'portraits'},
      {id:'speaker-spotlight',name:'Speaker Spotlight',desc:'Feature the first speaker prominently',preview:'spotlight'},
      {id:'editorial',name:'Editorial',desc:'Clean speaker directory',preview:'editorial'},
      {id:'compact',name:'Compact',desc:'Dense layout for larger panels',preview:'compact'},
      {id:'speaker-marquee',name:'Stage Marquee',desc:'Premium stage-card treatment',preview:'marquee'},
      {id:'dark',name:'Dark Stage',desc:'High-contrast awards-night style',preview:'dark'}
    ],
    agenda:[
      {id:'timeline',name:'Timeline',desc:'Classic time-led agenda',preview:'timeline'},
      {id:'agenda-cards',name:'Session Cards',desc:'Individual agenda cards',preview:'cards'},
      {id:'agenda-columns',name:'Two Columns',desc:'Compact two-column schedule',preview:'columns'},
      {id:'compact',name:'Compact',desc:'Tight schedule for long agendas',preview:'compact'},
      {id:'agenda-stage',name:'Stage Run',desc:'Bold stage-production timeline',preview:'stage'},
      {id:'editorial',name:'Editorial',desc:'Premium editorial schedule',preview:'editorial'},
      {id:'dark',name:'Dark Timeline',desc:'Night-mode agenda',preview:'dark'}
    ],
    resources:[
      {id:'cards',name:'Resource Cards',desc:'Cards with clear download actions',preview:'cards'},
      {id:'resource-list',name:'Download List',desc:'Simple document list',preview:'list'},
      {id:'resource-tiles',name:'Visual Tiles',desc:'Strong tile-based resources',preview:'tiles'},
      {id:'resource-feature',name:'Featured Resource',desc:'Highlight the first resource',preview:'spotlight'},
      {id:'editorial',name:'Editorial',desc:'Premium publication layout',preview:'editorial'},
      {id:'minimal',name:'Minimal',desc:'Simple text links',preview:'minimal'},
      {id:'dark',name:'Dark Library',desc:'Dark premium resource cards',preview:'dark'}
    ],
    glimpse:[
      {id:'split',name:'Story + Gallery',desc:'Narrative beside a visual gallery',preview:'split'},
      {id:'mosaic',name:'Mosaic',desc:'Magazine-style image mosaic',preview:'mosaic'},
      {id:'filmstrip',name:'Filmstrip',desc:'Wide previous-edition highlights',preview:'filmstrip'},
      {id:'gallery',name:'Gallery Grid',desc:'Balanced visual gallery',preview:'gallery'},
      {id:'spotlight',name:'Hero Glimpse',desc:'Large visual-first showcase',preview:'spotlight'},
      {id:'minimal',name:'Minimal',desc:'Light story and image treatment',preview:'minimal'},
      {id:'dark',name:'Dark Gallery',desc:'Award-night gallery treatment',preview:'dark'}
    ],
    contact:[
      {id:'cards',name:'Contact Cards',desc:'Email, phone and venue cards',preview:'cards'},
      {id:'contact-split',name:'Split Contact',desc:'Contact information with callout',preview:'split'},
      {id:'contact-banner',name:'Contact Banner',desc:'Wide call-to-action strip',preview:'banner'},
      {id:'centered',name:'Centered',desc:'Simple centered contact block',preview:'centered'},
      {id:'minimal',name:'Minimal',desc:'Clean text-first contact details',preview:'minimal'},
      {id:'dark',name:'Dark Contact',desc:'Premium dark footer-style block',preview:'dark'}
    ],
    custom:[
      {id:'classic',name:'Classic',desc:'Standard custom content block',preview:'classic'},
      {id:'framed',name:'Framed',desc:'Contained custom module',preview:'framed'},
      {id:'fullbleed',name:'Full Width',desc:'Edge-to-edge custom section',preview:'fullbleed'},
      {id:'minimal',name:'Minimal',desc:'No-frills custom content',preview:'minimal'},
      {id:'dark',name:'Dark',desc:'Dark custom section',preview:'dark'}
    ]
  };

  function sectionKind(s){
    if(['overview','eventDescription'].includes(s.id))return'prose';
    if(['keypoints','who','why'].includes(s.id))return'list';
    if(s.id==='speakers')return'speakers';
    if(s.id==='agenda')return'agenda';
    if(s.id==='resources')return'resources';
    if(s.id==='glimpse')return'glimpse';
    if(s.id==='contact')return'contact';
    return'custom';
  }
  function layoutsFor(s){return layoutCatalog[sectionKind(s)]||layoutCatalog.prose}
  function layoutName(s){const found=layoutsFor(s).find(x=>x.id===s.theme);return found?found.name:(s.theme||'Classic').replace(/-/g,' ').replace(/\b\w/g,m=>m.toUpperCase())}
  function toast(msg){const t=$('toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1600)}
  function saveAward(){award.industry=award.eventCategory||award.industry;award.type=award.eventCategory||award.type;award.openDate=(award.nominationStart||'').slice(0,10);award.closeDate=(award.nominationEnd||'').slice(0,10);award.deadline=award.closeDate;award.winnerDate=(award.eventStart||'').slice(0,10);localStorage.setItem(AWARD_KEY,JSON.stringify(award));localStorage.setItem('etb2b_current_award',award.name||'Untitled Award');$('sideAwardName').textContent=award.name||'Untitled Award';$('crumbAward').textContent=award.name||'Untitled Award'}
  function save(showToast=true){state.updatedAt=new Date().toISOString();localStorage.setItem(storeKey,JSON.stringify(state));saveAward();dirty=false;updateSaveState();if(showToast)toast('Website draft saved')}
  function markDirty(){dirty=true;updateSaveState();render()}
  function updateSaveState(){const dot=document.querySelector('.wb19-save-dot');$('saveStatus').textContent=dirty?'Unsaved changes':'Draft saved';dot?.classList.toggle('unsaved',dirty)}
  function escAttr(s){return String(s??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
  function currentSection(){return state.sections.find(s=>s.id===selectedId)||state.sections[0]}
  function updateSelectedLabels(){const s=currentSection();if(!s)return;$('inspectorHeading').textContent=s.label;$('inspectorTheme').textContent=layoutName(s);if($('designerSectionName'))$('designerSectionName').textContent=s.label;if($('designerLayoutName'))$('designerLayoutName').textContent=layoutName(s)}
  function selectSection(id){selectedId=id;renderSectionManager();renderInspector();renderLayoutGallery();updateSelectedLabels()}
  function render(){ETB2BSite.render($('liveSite'),award,state,{builder:true});const c=ETB2BSite.ctaFor(award);$('ctaExplanation').textContent=`Current website CTA: ${c.label}. ${c.sub}.`;updateReadiness()}
  function updateReadiness(){let score=48;if(award.name&&award.venue)score+=10;if(state.header.desktopImage)score+=10;if(state.sections.filter(s=>s.enabled).length>=7)score+=12;if(state.form.showOnBanner&&Object.values(state.form.fields).some(Boolean))score+=8;if(state.pages.thankyou.enabled)score+=5;if(state.nav.sticky)score+=3;score=Math.min(score,100);$('readinessScore').textContent=score+'%';$('readinessBar').style.width=score+'%';$('readinessCopy').textContent=score>=90?'Website is ready for category setup. You can keep refining it later.':state.header.desktopImage?'Your structure is strong. Review section content and registration fields before continuing.':'Upload a desktop banner and review your key sections before moving to Categories.'}

  function renderSectionManager(){
    $('sectionManager').innerHTML=state.sections.map(s=>{
      const options=layoutsFor(s).map(d=>`<option value="${d.id}" ${s.theme===d.id?'selected':''}>${d.name}</option>`).join('');
      return `<div class="wb19-section-row ${s.enabled?'':'disabled'} ${selectedId===s.id?'selected':''}" data-id="${s.id}"><label title="Show / hide"><input type="checkbox" data-section-toggle="${s.id}" ${s.enabled?'checked':''}><i></i></label><button type="button" class="wb19-section-name" data-open-section="${s.id}" title="Edit ${escAttr(s.label)}"><b>${s.label}</b><small>${s.id==='custom'?'HTML / embed area':'Homepage section'}</small></button><select data-section-theme="${s.id}" title="Quick layout">${options}</select><button type="button" class="wb19-edit-section" data-edit-section="${s.id}" title="Edit content & layouts" aria-label="Edit ${escAttr(s.label)}">✎</button></div>`;
    }).join('');
    document.querySelectorAll('[data-section-toggle]').forEach(el=>el.addEventListener('change',()=>{const s=state.sections.find(x=>x.id===el.dataset.sectionToggle);s.enabled=el.checked;if(s.id!=='custom')state.nav.visible[s.id]=el.checked;markDirty();renderSectionManager();renderNavManager()}));
    document.querySelectorAll('[data-section-theme]').forEach(el=>el.addEventListener('change',()=>{const s=state.sections.find(x=>x.id===el.dataset.sectionTheme);s.theme=el.value;selectedId=s.id;markDirty();renderSectionManager();renderInspector();renderLayoutGallery();updateSelectedLabels()}));
    document.querySelectorAll('[data-edit-section],[data-open-section]').forEach(b=>b.addEventListener('click',()=>openSectionDesigner(b.dataset.editSection||b.dataset.openSection,'content')));
  }

  function field(label,key,value,type='input'){
    if(type==='textarea')return `<label class="wb19-field"><span>${label}</span><textarea data-inspector-key="${key}">${escAttr(value??'')}</textarea></label>`;
    return `<label class="wb19-field"><span>${label}</span><input data-inspector-key="${key}" value="${escAttr(value??'')}"></label>`;
  }
  function repeatEditor(type,items){
    const rows=(items||[]).map((it,i)=>{
      if(type==='speakers')return `<div class="wb19-repeat-row" data-repeat-index="${i}"><input data-repeat-field="name" value="${escAttr(it.name)}" placeholder="Name"><input data-repeat-field="role" value="${escAttr(it.role)}" placeholder="Role"><input data-repeat-field="company" value="${escAttr(it.company)}" placeholder="Company"><div class="wb19-repeat-actions"><button type="button" data-remove-repeat="${i}">Remove</button></div></div>`;
      if(type==='agenda')return `<div class="wb19-repeat-row" data-repeat-index="${i}"><input data-repeat-field="time" value="${escAttr(it.time)}" placeholder="18:00"><input data-repeat-field="title" value="${escAttr(it.title)}" placeholder="Agenda item"><div class="wb19-repeat-actions"><button type="button" data-remove-repeat="${i}">Remove</button></div></div>`;
      return `<div class="wb19-repeat-row" data-repeat-index="${i}"><input data-repeat-field="title" value="${escAttr(it.title)}" placeholder="Resource title"><input data-repeat-field="url" value="${escAttr(it.url)}" placeholder="https://"><div class="wb19-repeat-actions"><button type="button" data-remove-repeat="${i}">Remove</button></div></div>`;
    }).join('');
    return `<div class="wb19-inspector-list" data-repeat-type="${type}">${rows}</div><button type="button" class="wb19-add-row" data-add-repeat="${type}">+ Add ${type==='speakers'?'speaker':type==='agenda'?'agenda item':'resource'}</button>`;
  }
  function editorHtml(s){
    let html=field('Section title','title',s.title);
    if(['overview','eventDescription','glimpse'].includes(s.id))html+=field('Content','body',s.body,'textarea');
    if(['keypoints','who','why'].includes(s.id))html+=field('List items · one per line','items',s.items,'textarea');
    if(s.id==='speakers')html+=repeatEditor('speakers',s.speakers);
    if(s.id==='agenda')html+=repeatEditor('agenda',s.agenda);
    if(s.id==='resources')html+=repeatEditor('resources',s.resources);
    if(s.id==='contact')html+=field('Email','email',s.email)+field('Phone','phone',s.phone)+field('Address','address',s.address,'textarea');
    if(s.id==='custom')html+=field('Custom HTML / embed code','html',s.html,'textarea')+'<p class="wb19-help">HTML and CSS markup is rendered in this prototype. Keep scripts out of the demo for predictable behaviour.</p>';
    html+=`<button type="button" class="wb19-layout-launch" data-open-layout-gallery>Choose visual layout <span>${layoutName(s)} →</span></button>`;
    return html;
  }
  function wireEditor(container,s){
    if(!container)return;
    container.querySelectorAll('[data-inspector-key]').forEach(el=>el.addEventListener('input',()=>{s[el.dataset.inspectorKey]=el.value;markDirty();renderSectionManager()}));
    container.querySelectorAll('[data-repeat-field]').forEach(el=>el.addEventListener('input',()=>{const type=el.closest('[data-repeat-type]').dataset.repeatType;const idx=Number(el.closest('[data-repeat-index]').dataset.repeatIndex);s[type][idx][el.dataset.repeatField]=el.value;markDirty()}));
    container.querySelectorAll('[data-remove-repeat]').forEach(b=>b.addEventListener('click',()=>{const type=b.closest('[data-repeat-type]').dataset.repeatType;s[type].splice(Number(b.dataset.removeRepeat),1);markDirty();renderInspector()}));
    container.querySelectorAll('[data-add-repeat]').forEach(b=>b.addEventListener('click',()=>{const type=b.dataset.addRepeat;if(type==='speakers')s.speakers.push({name:'New Speaker',role:'Role',company:'Company'});if(type==='agenda')s.agenda.push({time:'18:00',title:'New agenda item'});if(type==='resources')s.resources.push({title:'New resource',url:'#'});markDirty();renderInspector()}));
    container.querySelectorAll('[data-open-layout-gallery]').forEach(b=>b.addEventListener('click',()=>setDesignerTab('layout')));
  }
  function renderInspector(){
    const s=currentSection();if(!s)return;
    const html=editorHtml(s);
    $('sectionInspector').innerHTML=html;
    if($('sectionDesignerContent'))$('sectionDesignerContent').innerHTML=html;
    wireEditor($('sectionInspector'),s);
    wireEditor($('sectionDesignerContent'),s);
    updateSelectedLabels();
  }

  function layoutThumb(layout,kind){
    return `<div class="wb19-layout-thumb thumb-${layout.preview} kind-${kind}"><span class="thumb-kicker"></span><span class="thumb-title"></span><div class="thumb-body"><i></i><i></i><i></i><i></i></div><span class="thumb-footer"></span></div>`;
  }
  function renderLayoutGallery(){
    const box=$('layoutGallery');if(!box)return;const s=currentSection();if(!s)return;const kind=sectionKind(s);
    box.innerHTML=layoutsFor(s).map((layout,i)=>`<button type="button" class="wb19-layout-card ${s.theme===layout.id?'active':''}" data-layout-card="${layout.id}">${layoutThumb(layout,kind)}<span class="wb19-layout-meta"><b>${layout.name}</b><small>${layout.desc}</small></span><i class="wb19-layout-check">✓</i></button>`).join('');
    box.querySelectorAll('[data-layout-card]').forEach(btn=>btn.addEventListener('click',()=>{s.theme=btn.dataset.layoutCard;markDirty();renderSectionManager();renderLayoutGallery();updateSelectedLabels();toast(layoutName(s)+' layout applied')}));
  }
  function setDesignerTab(tab){
    document.querySelectorAll('[data-designer-tab]').forEach(b=>b.classList.toggle('active',b.dataset.designerTab===tab));
    document.querySelectorAll('[data-designer-panel]').forEach(p=>p.classList.toggle('active',p.dataset.designerPanel===tab));
  }
  function openSectionDesigner(id,tab='content'){
    selectedId=id;renderSectionManager();renderInspector();renderLayoutGallery();updateSelectedLabels();setDesignerTab(tab);
    const modal=$('sectionDesignerModal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('wb19-modal-open');
  }
  function closeSectionDesigner(){const modal=$('sectionDesignerModal');if(!modal)return;modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('wb19-modal-open')}
  function previewSelectedSection(){const s=currentSection();const el=$('liveSite')?.querySelector('#section-'+s.id);if(el){closeSectionDesigner();setTimeout(()=>el.scrollIntoView({behavior:'smooth',block:'center'}),80);toast('Previewing '+s.label)}}

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
  [['basicEventName','name'],['basicEventCategory','eventCategory'],['basicDescription','description'],['basicVenue','venue'],['basicCity','city'],['basicEventStart','eventStart'],['basicEventEnd','eventEnd'],['basicNominationStart','nominationStart'],['basicNominationEnd','nominationEnd']].forEach(([id,key])=>$(id).addEventListener('input',e=>{award[key]=e.target.value;if(key==='nominationStart'||key==='nominationEnd')award.hasNominationDates=!!(award.nominationStart&&award.nominationEnd);if(key==='eventStart'||key==='eventEnd')award.hasEventDates=!!(award.eventStart&&award.eventEnd);saveAward();markDirty()}));
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
  $('closeSectionDesigner').addEventListener('click',closeSectionDesigner);$('doneSectionDesigner').addEventListener('click',()=>{save(false);closeSectionDesigner();toast('Section updated')});$('previewSelectedSection').addEventListener('click',previewSelectedSection);
  $('sectionDesignerModal').addEventListener('click',e=>{if(e.target===$('sectionDesignerModal'))closeSectionDesigner()});
  document.querySelectorAll('[data-designer-tab]').forEach(b=>b.addEventListener('click',()=>setDesignerTab(b.dataset.designerTab)));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSectionDesigner()});
  window.addEventListener('beforeunload',()=>{if(dirty)save(false)});

  syncControls();renderSectionManager();renderNavManager();selectSection('overview');render();updateSaveState();
})();
