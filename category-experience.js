(function(){
  const ctx=window.ETB2BPublicContext||{};
  const award=ctx.award||{};
  const state=ctx.state||{};
  const slug=ctx.slug||award.slug||'demo';
  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
  const read=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key)||'null');return v??fallback}catch(e){return fallback}};
  const categoryKey='etb2b_awards_categories_'+slug;
  const masterKey='etb2b_awards_master_categories_'+slug;
  const settingsKey='etb2b_awards_category_settings_'+slug;
  const selectionKey='etb2b_public_category_selection_'+slug;
  const bucketKey='etb2b_public_nomination_bucket_'+slug;
  const profileKey='etb2b_public_nominee_profile_'+slug;
  const settings=Object.assign({selectionMode:'multiple',maxSelections:5,autoImportAnswers:true,aiFinder:true},read(settingsKey,{}));
  let cats=read(categoryKey,[]);
  let masters=read(masterKey,[]);

  if(!Array.isArray(cats)||!cats.length){
    cats=(award.suggestedCategories||award.generatedCategories||['Award of the Year','Innovation Award','Leadership Award','Rising Star Award','Campaign of the Year']).map((name,i)=>({id:'suggested-'+i,name,description:'Recognising standout work, measurable impact and category leadership.',status:'open',group:i<2?'Innovation & Technology':'Excellence',feeMode:'custom',fee:Number(award.baseFee||0),currency:award.currency||'INR',categoryType:award.entryType==='free'?'free':'paid',allowedArea:'global',eligibility:'Open to eligible organisations and individuals.'}));
  }
  if(!Array.isArray(masters)||!masters.length){
    const groups=[...new Set(cats.map(c=>String(c.group||'').trim()).filter(Boolean))];
    masters=(groups.length?groups:['General Awards']).map((name,i)=>({id:'derived-'+i,name,description:'Explore the '+name+' award categories.',status:'active'}));
  }
  cats.forEach(c=>{
    let master=masters.find(m=>String(m.id)===String(c.masterId));
    if(!master&&c.group)master=masters.find(m=>String(m.name).toLowerCase()===String(c.group).toLowerCase());
    if(!master)master=masters[0];
    c.masterId=master?.id||'';
    c.group=master?.name||c.group||'General Awards';
    if(!c.categoryType)c.categoryType=Number(c.fee||0)===0?'free':'paid';
    if(!c.currency)c.currency=award.currency||'INR';
    if(!c.allowedArea)c.allowedArea='global';
  });

  const activeMasterIds=new Set(masters.filter(m=>m.status!=='inactive').map(m=>String(m.id)));
  const openCats=cats.filter(c=>c.status!=='draft'&&c.status!=='closed'&&activeMasterIds.has(String(c.masterId)));
  const visibleMasters=masters.filter(m=>m.status!=='inactive'&&openCats.some(c=>String(c.masterId)===String(m.id)));
  const symbols={INR:'₹',USD:'$',AED:'د.إ',GBP:'£',SGD:'S$'};
  const baseFee=award.entryType==='free'?0:Number(award.baseFee||0);
  const fee=c=>c.categoryType==='free'?0:(c.feeMode==='custom'||typeof c.fee!=='undefined'?Number(c.fee||0):baseFee);
  const moneyFor=c=>{const sym=symbols[c?.currency||award.currency]||'₹';const n=fee(c||{});return n===0?'Free':sym+n.toLocaleString('en-IN')};
  const moneyTotal=n=>{const sym=symbols[award.currency]||'₹';return Number(n||0)===0?'Free':sym+Number(n||0).toLocaleString('en-IN')};
  const masterFor=c=>masters.find(m=>String(m.id)===String(c.masterId))||masters.find(m=>m.name===c.group)||{id:'general',name:c.group||'General Awards',description:''};
  const areaLabel=v=>v==='national'?'National only':v==='international'?'International only':'National + International';

  const existingBucket=read(bucketKey,{items:[]});
  const submittedIds=new Set((Array.isArray(existingBucket.items)?existingBucket.items:[]).filter(x=>x&&x.submitted).map(x=>String(x.categoryId)));
  let selected=read(selectionKey,[]).map(String).filter(id=>openCats.some(c=>String(c.id)===id)&&!submittedIds.has(id));
  if(settings.selectionMode==='single'&&selected.length>1)selected=selected.slice(0,1);
  if(settings.selectionMode==='multiple'&&Number(settings.maxSelections||0)>0&&selected.length>Number(settings.maxSelections))selected=selected.slice(0,Number(settings.maxSelections));
  localStorage.setItem(selectionKey,JSON.stringify(selected));
  let activeMaster='all',detailCat=null,selectedOnly=false,pendingCategoryId='';
  const toast=msg=>{const t=document.getElementById('publicToast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1700)};
  const nomineeProfile=()=>read(profileKey,{});
  const isRegistered=()=>{const p=nomineeProfile();return !!(p&&p.registeredAt&&String(p.email||'').trim())};
  const categoryById=id=>openCats.find(c=>String(c.id)===String(id));
  const maxAllowed=()=>settings.selectionMode==='single'?1:Number(settings.maxSelections||0);
  const pageConfig=()=> (state.publicPages||[]).find(p=>p.id==='categories')||{};
  function niceDeadline(){if(!award.hasNominationDates||!award.nominationEnd)return 'Deadline to be announced';try{return 'Closes '+new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'short',year:'numeric'}).format(new Date(award.nominationEnd))}catch(e){return 'Nomination deadline'}}

  function persist(){if(selectedOnly&&!selected.length)selectedOnly=false;localStorage.setItem(selectionKey,JSON.stringify(selected));renderDock();renderCatalog();renderRail();renderJourney()}
  function addOrToggle(id){
    id=String(id);
    if(!isRegistered()){pendingCategoryId=id;openEntrantDetails(true);toast('Register once to select categories and start your nomination');return}
    if(submittedIds.has(id)){toast('This category has already been submitted');return}
    if(settings.selectionMode==='single'){selected=[id];persist();toast('Category selected');return}
    if(selected.includes(id)){selected=selected.filter(x=>x!==id);persist();return}
    const max=maxAllowed();if(max&&selected.length>=max){toast('You can select up to '+max+' new categories');return}
    selected.push(id);persist();toast('Added to nomination list');
  }

  function renderHero(){
    const pg=pageConfig();
    document.getElementById('categoryEyebrow').textContent=pg.eyebrow||'AWARD CATEGORIES';
    document.getElementById('categoryTitle').textContent=pg.title||'Choose the award track. Then choose your category.';
    document.getElementById('categoryIntro').textContent=pg.intro||'Browse Master Categories first, then select one or more Sub Categories that best match your work.';
    document.getElementById('masterCount').textContent=visibleMasters.length;
    document.getElementById('categoryCount').textContent=openCats.length;
    document.getElementById('footerAward').textContent='© '+new Date().getFullYear()+' '+(award.name||'ETB2B Awards');
    document.getElementById('deadlinePill').textContent=niceDeadline();
    const max=maxAllowed();
    document.getElementById('selectionModePill').textContent=settings.selectionMode==='single'?'Select one category':('Select multiple categories'+(max?' · max '+max:''));
    document.getElementById('heroSelectionHint').textContent=settings.selectionMode==='single'?'Choose one category':(max?'Choose up to '+max+' categories':'No category limit');
    renderJourney();
  }

  function renderJourney(){
    const text=document.getElementById('journeySelectionText');
    const step=document.getElementById('journeyStepChoose');
    const count=document.getElementById('selectedFilterCount');
    if(text)text.textContent=selected.length?(selected.length+' categor'+(selected.length===1?'y':'ies')+' selected'):'Select the best-fit categories';
    if(step)step.classList.toggle('done',selected.length>0);
    if(count)count.textContent=selected.length;
    const filter=document.getElementById('selectedOnlyToggle');
    if(filter){filter.classList.toggle('active',selectedOnly);filter.setAttribute('aria-pressed',selectedOnly?'true':'false')}
  }

  function renderRail(){
    const rail=document.getElementById('masterCategoryRail');
    const items=[{id:'all',name:'All Categories',description:'View every award track',count:openCats.length},...visibleMasters.map(m=>({id:String(m.id),name:m.name,description:m.description||'Award track',count:openCats.filter(c=>String(c.masterId)===String(m.id)).length}))];
    rail.innerHTML=items.map((m,i)=>`<button type="button" class="master-rail-item ${activeMaster===m.id?'active':''}" data-master-filter="${esc(m.id)}"><span>${i===0?'ALL':String(i).padStart(2,'0')}</span><div><b>${esc(m.name)}</b><small>${esc(m.description||'')}</small></div><em>${m.count}</em></button>`).join('');
    rail.querySelectorAll('[data-master-filter]').forEach(b=>b.addEventListener('click',()=>{activeMaster=b.dataset.masterFilter;renderRail();renderCatalog();const top=document.querySelector('.category-toolbar-wrap');if(top)window.scrollTo({top:Math.max(0,top.getBoundingClientRect().top+window.scrollY-90),behavior:'smooth'})}));
  }

  function cardHTML(c,index){
    const m=masterFor(c),isSubmitted=submittedIds.has(String(c.id)),isSelected=selected.includes(String(c.id)),locked=!isRegistered();
    return `<article class="subcategory-public-card ${isSelected?'selected':''} ${locked?'registration-locked':''}" data-card-id="${esc(c.id)}">
      <div class="subcategory-card-top"><span>SUB CATEGORY ${String(index+1).padStart(2,'0')}</span><button type="button" class="subcategory-check ${isSelected||isSubmitted?'checked':''} ${locked&&!isSubmitted?'locked':''}" ${isSubmitted?'disabled data-submitted-cat="1"':`data-select="${esc(c.id)}"`} aria-label="${isSubmitted?'Submitted':locked?'Register to select':isSelected?'Remove':'Select'} ${esc(c.name)}">${isSubmitted?'✓':isSelected?'✓':locked?'🔒':''}</button></div>
      <h3>${esc(c.name)}</h3>
      <p>${esc(c.description||'Recognising excellence and measurable impact in this category.')}</p>
      <div class="subcategory-card-meta"><span>${esc(c.categoryType==='free'?'Free entry':moneyFor(c))}</span><span>${esc(areaLabel(c.allowedArea))}</span></div>
      <div class="subcategory-card-footer"><button type="button" class="view-category" data-view="${esc(c.id)}">View details</button><button type="button" class="select-category ${isSelected||isSubmitted?'selected':''} ${locked&&!isSubmitted?'locked':''}" ${isSubmitted?'disabled data-submitted-cat="1"':`data-select="${esc(c.id)}"`}>${isSubmitted?'Submitted ✓':locked?'Register to select':isSelected?'Selected':'Add category'}${isSubmitted?'':' →'}</button></div>
    </article>`;
  }

  function renderCatalog(){
    const q=document.getElementById('categorySearch').value.trim().toLowerCase();
    let mastersToShow=activeMaster==='all'?visibleMasters:visibleMasters.filter(m=>String(m.id)===String(activeMaster));
    if(selectedOnly)mastersToShow=mastersToShow.filter(m=>openCats.some(c=>String(c.masterId)===String(m.id)&&selected.includes(String(c.id))));
    const sections=[];let resultCount=0;
    mastersToShow.forEach((m,masterIndex)=>{
      const list=openCats.filter(c=>String(c.masterId)===String(m.id)&&(!selectedOnly||selected.includes(String(c.id)))&&(`${c.name} ${m.name} ${m.description||''} ${c.description||''} ${c.eligibility||''}`).toLowerCase().includes(q));
      if(!list.length)return;resultCount+=list.length;
      sections.push(`<section class="master-category-public-section" data-master-section="${esc(m.id)}"><header class="master-public-head"><div class="master-public-index">${String(masterIndex+1).padStart(2,'0')}</div><div><span>MASTER CATEGORY</span><h2>${esc(m.name)}</h2><p>${esc(m.description||('Explore '+m.name+' award categories.'))}</p></div><strong>${list.length} Sub Categor${list.length===1?'y':'ies'}</strong></header><div class="subcategory-public-grid">${list.map(cardHTML).join('')}</div></section>`);
    });
    const grid=document.getElementById('categoryGrid');
    grid.innerHTML=sections.length?sections.join(''):'<div class="category-empty-pro"><b>No categories found</b><p>Try a different search or Master Category.</p></div>';
    document.getElementById('categoryViewNote').textContent=selectedOnly?('Showing '+resultCount+' selected categor'+(resultCount===1?'y':'ies')):('Showing '+resultCount+' of '+openCats.length+' open categories');
    grid.querySelectorAll('[data-select]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();addOrToggle(b.dataset.select)}));
    grid.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>openDetail(b.dataset.view)));
  }

  function total(){return selected.reduce((n,id)=>n+fee(categoryById(id)||{}),0)}
  function renderDock(){
    const dock=document.getElementById('categorySelectionDock');dock.hidden=selected.length===0;
    document.getElementById('dockCount').textContent=selected.length;document.getElementById('heroSelectedCount').textContent=selected.length;document.getElementById('dockTotal').textContent=moneyTotal(total())+' total entry fee';document.getElementById('heroReviewBtn').disabled=selected.length===0;
    const chips=document.getElementById('dockChips');chips.innerHTML=selected.map(id=>{const c=categoryById(id);const m=c?masterFor(c):null;return c?`<span class="category-dock-chip"><small>${esc(m?.name||'')}</small>${esc(c.name)}<button type="button" data-remove="${esc(id)}">×</button></span>`:''}).join('');chips.querySelectorAll('[data-remove]').forEach(b=>b.addEventListener('click',()=>{selected=selected.filter(x=>x!==b.dataset.remove);persist()}));
  }

  function openDetail(id){
    detailCat=categoryById(id);if(!detailCat)return;const m=masterFor(detailCat);
    document.getElementById('detailGroup').textContent=(m.name||'AWARD CATEGORY').toUpperCase();document.getElementById('detailTitle').textContent=detailCat.name;document.getElementById('detailDescription').textContent=detailCat.description||'Recognising excellence and measurable impact in this category.';document.getElementById('detailEligibility').textContent=detailCat.eligibility||'Open eligibility. Review the award terms before submitting.';document.getElementById('detailFee').textContent=moneyFor(detailCat);document.getElementById('detailArea').textContent=areaLabel(detailCat.allowedArea);document.getElementById('detailLimit').textContent=String(detailCat.maxEntries||'0')==='0'?'No limit':'Max '+detailCat.maxEntries+' per entrant';const selectedNow=selected.includes(String(detailCat.id)),submittedNow=submittedIds.has(String(detailCat.id)),locked=!isRegistered();const detailBtn=document.getElementById('detailSelectBtn');detailBtn.disabled=submittedNow;detailBtn.classList.toggle('locked',locked&&!submittedNow);detailBtn.textContent=submittedNow?'Already submitted ✓':locked?'Register to select this category':selectedNow?'Remove from nomination list':'Add to nomination list';document.getElementById('categoryDetailModal').classList.add('open');document.getElementById('categoryDetailModal').setAttribute('aria-hidden','false');
  }
  function closeDetail(){document.getElementById('categoryDetailModal').classList.remove('open');document.getElementById('categoryDetailModal').setAttribute('aria-hidden','true')}

  function saveBucketAndGo(){
    if(!isRegistered()){openEntrantDetails(true);toast('Complete quick registration to continue');return}
    if(!selected.length)return;const current=read(bucketKey,{});const prior=Array.isArray(current.items)?current.items:[];
    const submitted=prior.filter(x=>x&&x.submitted);
    const working=selected.map(id=>{const c=categoryById(id),p=prior.find(x=>String(x.categoryId)===String(id))||{};return {categoryId:id,name:c?.name||p.name||'Category',group:masterFor(c||{}).name||c?.group||'',masterId:c?.masterId||'',fee:fee(c||{}),status:p.status||'Form not started',completed:!!p.completed,submitted:false,paymentId:p.paymentId||''}});
    const items=[...submitted,...working.filter(x=>!submitted.some(s=>String(s.categoryId)===String(x.categoryId)))];
    const bucket={award:award.name,slug,updatedAt:new Date().toISOString(),items};
    localStorage.setItem(bucketKey,JSON.stringify(bucket));location.href='nomination-bucket.html';
  }
  function profileComplete(profile){return !!(profile?.registeredAt&&String(profile?.email||'').trim())||['name','email','company','designation','mobile'].every(k=>String(profile?.[k]||'').trim())}
  function openEntrantDetails(force){
    const profile=read(profileKey,{name:'',email:'',company:'',designation:'',mobile:''});
    if(profileComplete(profile)&&!force)return false;
    const modal=document.getElementById('entrantDetailsModal');
    document.getElementById('entrantName').value=profile.name||'';document.getElementById('entrantEmail').value=profile.email||'';document.getElementById('entrantCompany').value=profile.company||'';document.getElementById('entrantDesignation').value=profile.designation||'';document.getElementById('entrantMobile').value=profile.mobile||'';
    modal.classList.add('open');modal.setAttribute('aria-hidden','false');setTimeout(()=>document.getElementById('entrantName').focus(),40);return true;
  }
  function closeEntrantDetails(){const modal=document.getElementById('entrantDetailsModal');if(!modal)return;modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}
  function saveEntrantDetails(){
    const els={name:document.getElementById('entrantName'),email:document.getElementById('entrantEmail'),company:document.getElementById('entrantCompany'),designation:document.getElementById('entrantDesignation'),mobile:document.getElementById('entrantMobile')};
    const profile=Object.fromEntries(Object.entries(els).map(([k,el])=>[k,el.value.trim()]));let ok=true;
    Object.values(els).forEach(el=>el.classList.remove('entrant-error'));Object.entries(els).forEach(([k,el])=>{if(!profile[k]){el.classList.add('entrant-error');ok=false}});
    if(profile.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)){els.email.classList.add('entrant-error');ok=false}
    if(!ok){toast('Please complete your registration details');return}
    profile.registeredAt=profile.registeredAt||new Date().toISOString();profile.source='category_gate';
    localStorage.setItem(profileKey,JSON.stringify(profile));
    const registrations=read('etb2b_public_nomination_registrations',[]);
    const existing=registrations.findIndex(r=>r.slug===slug&&String(r.email||'').toLowerCase()===profile.email.toLowerCase());
    const registration=Object.assign({},profile,{award:award.name||'ETB2B Awards',slug,registeredAt:new Date().toISOString()});
    if(existing>=0)registrations[existing]=registration;else registrations.push(registration);
    localStorage.setItem('etb2b_public_nomination_registrations',JSON.stringify(registrations));
    closeEntrantDetails();renderCatalog();renderDock();renderJourney();
    const pending=pendingCategoryId;pendingCategoryId='';
    if(pending){addOrToggle(pending);if(detailCat&&String(detailCat.id)===String(pending))openDetail(pending)}
    else toast('Registration saved. You can now select categories.');
  }

  function aiTokens(text){const stop=new Set(['the','and','for','with','that','this','our','your','from','into','about','have','has','was','are','were','to','of','in','a','an','we','i','it','on','by']);return [...new Set(String(text||'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(x=>x.length>2&&!stop.has(x)))]}
  function runAI(){
    const input=document.getElementById('aiCategoryInput').value.trim();if(!input){toast('Tell us a little about the work first');return}const tokens=aiTokens(input);
    let ranked=openCats.map((c,i)=>{const m=masterFor(c),title=String(c.name||'').toLowerCase(),body=(c.name+' '+m.name+' '+(m.description||'')+' '+(c.description||'')+' '+(c.eligibility||'')).toLowerCase();let score=0,signals=[];tokens.forEach(t=>{if(title.includes(t)){score+=5;signals.push(t)}else if(body.includes(t)){score+=2;signals.push(t)}});if(/design|architect|interior|project/.test(input.toLowerCase())&&/design|architect|interior|project/.test(body)){score+=5;signals.push('project fit')}if(/leader|founder|ceo|individual/.test(input.toLowerCase())&&/leader|individual|person|jury/.test(body)){score+=5;signals.push('entrant fit')}if(/ai|technology|innovation|digital/.test(input.toLowerCase())&&/ai|technology|innovation|digital/.test(body)){score+=5;signals.push('innovation fit')}return {c,m,score:score+(openCats.length-i)*.01,signals:[...new Set(signals)].slice(0,3)}}).sort((a,b)=>b.score-a.score).slice(0,4);
    if(!ranked.some(x=>x.score>1))ranked=openCats.slice(0,4).map((c,i)=>({c,m:masterFor(c),score:1-i*.1,signals:['broad category fit']}));
    const box=document.getElementById('aiCategoryResults');box.hidden=false;box.innerHTML=ranked.map((r,i)=>`<article class="category-ai-result"><span>${i+1}</span><div><small class="ai-master-label">${esc(r.m.name)}</small><b>${esc(r.c.name)}</b><small>${r.score>8?'Strong fit':r.score>3?'Good fit':'Worth exploring'} · ${esc(r.signals.join(', ')||'category relevance')}</small><button type="button" data-ai-select="${esc(r.c.id)}">+ Add to nomination list</button></div></article>`).join('');box.querySelectorAll('[data-ai-select]').forEach(b=>b.addEventListener('click',()=>addOrToggle(b.dataset.aiSelect)));
  }

  document.getElementById('categorySearch').addEventListener('input',renderCatalog);
  const selectedFilter=document.getElementById('selectedOnlyToggle');
  if(selectedFilter)selectedFilter.addEventListener('click',()=>{selectedOnly=!selectedOnly;renderJourney();renderRail();renderCatalog()});
  const aiToggle=document.getElementById('aiFinderToggle'),aiBody=document.getElementById('categoryAiBody');
  const setAiOpen=open=>{if(!aiToggle||!aiBody)return;aiToggle.setAttribute('aria-expanded',open?'true':'false');aiBody.hidden=!open;document.getElementById('categoryAiSection')?.classList.toggle('category-ai-collapsed',!open)};
  if(aiToggle)aiToggle.addEventListener('click',()=>setAiOpen(aiToggle.getAttribute('aria-expanded')!=='true'));
  document.getElementById('aiRecommendBtn').addEventListener('click',()=>{setAiOpen(true);runAI()});
  document.querySelectorAll('[data-ai-example]').forEach(b=>b.addEventListener('click',()=>{setAiOpen(true);document.getElementById('aiCategoryInput').value=b.dataset.aiExample;runAI()}));
  document.getElementById('reviewSelectionBtn').addEventListener('click',saveBucketAndGo);document.getElementById('heroReviewBtn').addEventListener('click',saveBucketAndGo);
  document.getElementById('entrantContinueBtn')?.addEventListener('click',saveEntrantDetails);
  document.querySelectorAll('[data-close-entrant-details]').forEach(b=>b.addEventListener('click',()=>{pendingCategoryId='';closeEntrantDetails()}));
  document.querySelectorAll('[data-close-category-detail]').forEach(b=>b.addEventListener('click',closeDetail));
  document.getElementById('detailSelectBtn').addEventListener('click',()=>{if(!detailCat)return;addOrToggle(detailCat.id);openDetail(detailCat.id)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeDetail();pendingCategoryId='';closeEntrantDetails()}});
  if(settings.aiFinder===false)document.getElementById('categoryAiSection').hidden=true;
  renderHero();renderRail();renderCatalog();renderDock();renderJourney();
})();
