(function(){
  const $=id=>document.getElementById(id);
  const savedAward=(()=>{try{return JSON.parse(localStorage.getItem('etb2b_awards_new_award')||'null')}catch(e){return null}})();
  const award=savedAward||{name:'India FinTech Awards 2027',description:'Recognising breakthrough founders, products and teams transforming financial technology across India.',industry:'FinTech',country:'India',currency:'INR',slug:'india-fintech-awards-2027',openDate:'2027-06-01',closeDate:'2027-09-30',judgingDate:'2027-10-10',winnerDate:'2027-11-01'};
  const categoryKey=savedAward&&savedAward.slug?'etb2b_awards_categories_'+savedAward.slug:'etb2b_awards_categories_demo';
  let categories=(()=>{try{return JSON.parse(localStorage.getItem(categoryKey)||'[]')}catch(e){return []}})();
  if(!categories.length)categories=[
    {id:1,name:'Best FinTech Startup',description:'Recognising an ambitious company creating meaningful market impact.'},
    {id:2,name:'Digital Banking Innovation',description:'For products transforming how people and businesses bank.'},
    {id:3,name:'Payments Solution of the Year',description:'Recognising standout payment technology and customer experience.'},
    {id:4,name:'FinTech Leader of the Year',description:'Celebrating exceptional leadership and contribution to the ecosystem.'},
    {id:5,name:'Best AI in Financial Services',description:'For responsible AI creating measurable value in financial services.'},
    {id:6,name:'Financial Inclusion Award',description:'Recognising solutions expanding access to financial services.'}
  ];
  const slug=award.slug||String(award.name||'award').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const storeKey='etb2b_awards_website_'+slug;
  const defaults={
    template:'modern',primary:'#6258f5',accent:'#17a673',headingFont:'modern',cornerStyle:'soft',stageAuto:true,published:false,publishedAt:'',customDomain:'',
    pages:{categories:true,judges:true,winners:true,sponsors:true,contact:true},
    seo:{title:(award.name||'Award')+' | Official Awards Website',description:award.description||'Discover categories, deadlines, judges and how to enter.'},
    content:{
      heroEyebrow:(award.industry||'Industry')+' awards',
      heroTitle:'Celebrating the people shaping what comes next.',
      heroBody:award.description||'Recognising excellence, innovation and measurable impact.',
      heroCta:'Nominate now',
      aboutTitle:'Where excellence gets recognised.',
      aboutBody:'Built to recognise the organisations, teams and leaders setting new standards. Explore the categories, prepare your strongest work and join a community celebrating meaningful achievement.',
      categoriesTitle:'Find your category',
      categoriesBody:'Choose the category that best matches your work, impact and ambition.',
      timelineTitle:'Your path to the awards',
      timelineBody:'Key dates from entries opening through to the winner announcement.',
      judgesTitle:'Judged by industry leaders',
      judgesBody:'Independent experts bring experience, perspective and a consistent scoring framework.',
      sponsorsTitle:'Supported by our partners',
      sponsorsBody:'Partners helping us celebrate excellence across the industry.',
      faqTitle:'Questions before you enter?',
      faqBody:'Everything you need to know before starting your nomination.',
      ctaTitle:'Ready to put your work forward?',
      ctaBody:'Start your entry today. Save progress, collaborate with your team and submit before the deadline.',
      countdownTitle:'Entries close soon',
      countdownBody:'Give your team enough time to prepare a strong submission.',
      statsTitle:'An awards community with impact',
      statsBody:'A growing platform for ambitious organisations and industry leaders.',
      testimonialsTitle:'Why people enter',
      testimonialsBody:'Hear from past participants about the value of taking part.'
    },
    sections:[
      {id:'hero',label:'Hero',enabled:true},
      {id:'about',label:'About',enabled:true},
      {id:'categories',label:'Categories',enabled:true},
      {id:'timeline',label:'Timeline',enabled:true},
      {id:'judges',label:'Judges',enabled:true},
      {id:'sponsors',label:'Sponsors',enabled:true},
      {id:'faq',label:'FAQ',enabled:true},
      {id:'cta',label:'Final CTA',enabled:true}
    ]
  };
  let state=loadState();
  let selectedSection='hero';
  let history=[snapshot()];
  let historyIndex=0;
  let dirty=false;
  let dragId=null;

  function loadState(){
    let saved=null;try{saved=JSON.parse(localStorage.getItem(storeKey)||'null')}catch(e){}
    return saved?merge(JSON.parse(JSON.stringify(defaults)),saved):JSON.parse(JSON.stringify(defaults));
  }
  function merge(target,src){Object.keys(src||{}).forEach(k=>{if(src[k]&&typeof src[k]==='object'&&!Array.isArray(src[k])&&target[k]&&typeof target[k]==='object'&&!Array.isArray(target[k]))merge(target[k],src[k]);else target[k]=src[k]});return target}
  function snapshot(){return JSON.stringify(state)}
  function pushHistory(){const s=snapshot();if(history[historyIndex]===s)return;history=history.slice(0,historyIndex+1);history.push(s);if(history.length>30)history.shift();historyIndex=history.length-1}
  function markDirty(){dirty=true;const el=$('saveState');el.classList.add('unsaved');el.innerHTML='<i></i> Unsaved changes'}
  function persist(showToast){localStorage.setItem(storeKey,JSON.stringify(state));dirty=false;$('saveState').classList.remove('unsaved');$('saveState').innerHTML='<i></i> Draft saved';if(showToast)toast('Website draft saved')}
  function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
  function fmtDate(v){if(!v)return'To be announced';const d=new Date(v+'T00:00:00');if(Number.isNaN(d.getTime()))return v;return d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
  function initials(name){return String(name||'A').split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase()}
  function getPublicUrl(){return state.customDomain.trim()||('b2baward.infinityfree.io/website-preview.html')}
  function currentStage(){
    if(!state.stageAuto)return {label:'Entries open',cta:state.content.heroCta||'Nominate now'};
    const now=new Date();
    const open=award.openDate?new Date(award.openDate+'T00:00:00'):null;
    const close=award.closeDate?new Date(award.closeDate+'T23:59:59'):null;
    const winner=award.winnerDate?new Date(award.winnerDate+'T00:00:00'):null;
    if(open&&now<open)return {label:'Opening '+fmtDate(award.openDate),cta:'Get notified'};
    if(close&&now<=close)return {label:'Entries open',cta:'Nominate now'};
    if(winner&&now<winner)return {label:'Judging in progress',cta:'View categories'};
    if(winner&&now>=winner)return {label:'Winners announced',cta:'View winners'};
    return {label:'Awards programme',cta:state.content.heroCta||'Nominate now'};
  }
  function daysUntilClose(){if(!award.closeDate)return 42;const diff=Math.ceil((new Date(award.closeDate+'T23:59:59')-new Date())/86400000);return Math.max(0,diff)}
  function sectionObj(id){return state.sections.find(s=>s.id===id)}
  function sectionLabel(id){return ({hero:'Hero',about:'About',categories:'Categories',timeline:'Timeline',judges:'Judges',sponsors:'Sponsors',faq:'FAQ',cta:'Final CTA',countdown:'Countdown',stats:'Impact stats',testimonials:'Testimonials'})[id]||id}
  function defaultSection(id){return {id,label:sectionLabel(id),enabled:true}}

  function renderAll(){setAwardText();syncControls();renderSectionList();renderPreview();renderInspector();renderQuality();renderPublish();renderSeoPreview()}
  function setAwardText(){$('sideAwardName').textContent=award.name||'Untitled Award';$('crumbAward').textContent=award.name||'Untitled Award'}
  function syncControls(){
    document.querySelectorAll('[data-template]').forEach(b=>b.classList.toggle('active',b.dataset.template===state.template));
    $('primaryColor').value=state.primary;$('accentColor').value=state.accent;$('primaryHex').textContent=state.primary.toUpperCase();$('accentHex').textContent=state.accent.toUpperCase();
    $('headingFont').value=state.headingFont;$('cornerStyle').value=state.cornerStyle;$('stageAuto').checked=!!state.stageAuto;
    document.querySelectorAll('[data-page]').forEach(c=>c.checked=!!state.pages[c.dataset.page]);
    $('seoTitle').value=state.seo.title||'';$('seoDescription').value=state.seo.description||'';$('seoCount').textContent=(state.seo.description||'').length;$('customDomain').value=state.customDomain||'';
  }

  function renderSectionList(){
    $('sectionList').innerHTML=state.sections.map((s,i)=>`<div class="wb-section-row ${selectedSection===s.id?'selected':''}" draggable="true" data-row-id="${esc(s.id)}"><span class="wb-drag">::</span><div data-select-section="${esc(s.id)}"><b>${esc(s.label||sectionLabel(s.id))}</b><small>${s.enabled?'Visible on homepage':'Hidden from homepage'}</small></div><div class="wb-section-actions"><button data-move="up" data-id="${esc(s.id)}" title="Move up">&uarr;</button><button data-move="down" data-id="${esc(s.id)}" title="Move down">&darr;</button><input class="wb-toggle" type="checkbox" data-toggle-section="${esc(s.id)}" ${s.enabled?'checked':''}></div></div>`).join('');
    document.querySelectorAll('[data-select-section]').forEach(el=>el.addEventListener('click',()=>{selectedSection=el.dataset.selectSection;renderSectionList();renderPreview();renderInspector()}));
    document.querySelectorAll('[data-toggle-section]').forEach(el=>el.addEventListener('change',()=>{pushHistory();const s=sectionObj(el.dataset.toggleSection);if(s)s.enabled=el.checked;markDirty();renderSectionList();renderPreview();renderQuality();pushHistory()}));
    document.querySelectorAll('[data-move]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();moveSection(b.dataset.id,b.dataset.move==='up'?-1:1)}));
    document.querySelectorAll('.wb-section-row').forEach(row=>{
      row.addEventListener('dragstart',()=>{dragId=row.dataset.rowId;row.style.opacity='.55'});
      row.addEventListener('dragend',()=>{dragId=null;row.style.opacity=''});
      row.addEventListener('dragover',e=>e.preventDefault());
      row.addEventListener('drop',e=>{e.preventDefault();const to=row.dataset.rowId;if(!dragId||to===dragId)return;pushHistory();const fromIndex=state.sections.findIndex(s=>s.id===dragId),toIndex=state.sections.findIndex(s=>s.id===to);const item=state.sections.splice(fromIndex,1)[0];state.sections.splice(toIndex,0,item);markDirty();renderSectionList();renderPreview();pushHistory()});
    });
  }
  function moveSection(id,delta){const i=state.sections.findIndex(s=>s.id===id);const n=i+delta;if(i<0||n<0||n>=state.sections.length)return;pushHistory();const item=state.sections.splice(i,1)[0];state.sections.splice(n,0,item);markDirty();renderSectionList();renderPreview();pushHistory()}

  function renderPreview(){
    const stage=currentStage();
    const site=$('previewSite');
    site.className='wb-site template-'+state.template+' corner-'+state.cornerStyle+' font-'+state.headingFont;
    site.style.setProperty('--site-primary',state.primary);site.style.setProperty('--site-accent',state.accent);
    const navLinks=[];
    if(state.pages.categories)navLinks.push('<a href="#categories">Categories</a>');
    if(state.pages.judges)navLinks.push('<a href="#judges">Judges</a>');
    if(state.pages.winners)navLinks.push('<a href="#">Winners</a>');
    if(state.pages.sponsors)navLinks.push('<a href="#sponsors">Sponsors</a>');
    navLinks.push(`<a class="site-cta" href="#categories">${esc(stage.cta)}</a>`);
    let html=`<nav class="wb-site-nav"><div class="wb-site-brand"><span class="wb-site-logo">${esc(initials(award.name))}</span><b>${esc(award.name)}</b></div><div class="wb-site-links">${navLinks.join('')}</div></nav>`;
    state.sections.filter(s=>s.enabled).forEach((s,idx)=>{html+=renderSection(s.id,idx,stage)});
    html+=`<footer class="wb-site-footer"><span>&copy; ${new Date().getFullYear()} ${esc(award.name)}. All rights reserved.</span><span>Vikas Mishra</span></footer>`;
    site.innerHTML=html;
    site.querySelectorAll('[data-section]').forEach(el=>{
      el.classList.toggle('wb-selected-section',el.dataset.section===selectedSection);
      el.addEventListener('click',e=>{if(e.target.closest('a,button'))e.preventDefault();selectedSection=el.dataset.section;renderSectionList();site.querySelectorAll('[data-section]').forEach(x=>x.classList.toggle('wb-selected-section',x.dataset.section===selectedSection));renderInspector()});
    });
    site.querySelectorAll('[data-edit]').forEach(el=>{
      el.setAttribute('contenteditable','true');el.setAttribute('spellcheck','false');
      el.addEventListener('click',e=>e.stopPropagation());
      el.addEventListener('input',()=>{state.content[el.dataset.edit]=el.innerText.trim();markDirty();syncInspectorValue(el.dataset.edit,el.innerText);renderQuality()});
      el.addEventListener('blur',()=>pushHistory());
    });
  }
  function renderSection(id,idx,stage){
    const alt=idx%2?' alt':'';
    const c=state.content;
    if(id==='hero')return `<section class="wb-site-hero" data-section="hero"><div class="wb-eyebrow" data-edit="heroEyebrow">${esc(c.heroEyebrow)}</div><h1 data-edit="heroTitle">${esc(c.heroTitle)}</h1><p data-edit="heroBody">${esc(c.heroBody)}</p><div class="wb-site-hero-actions"><a class="wb-site-button" href="#categories">${esc(stage.cta)}</a><a class="wb-site-secondary" href="#about">Explore the awards</a><span class="wb-stage-pill">${esc(stage.label)}</span></div></section>`;
    if(id==='about')return `<section class="wb-site-section${alt}" id="about" data-section="about"><span class="section-kicker">About the awards</span><h2 data-edit="aboutTitle">${esc(c.aboutTitle)}</h2><p class="lead" data-edit="aboutBody">${esc(c.aboutBody)}</p></section>`;
    if(id==='categories')return `<section class="wb-site-section${alt}" id="categories" data-section="categories"><span class="section-kicker">Categories</span><h2 data-edit="categoriesTitle">${esc(c.categoriesTitle)}</h2><p class="lead" data-edit="categoriesBody">${esc(c.categoriesBody)}</p><div class="wb-categories-grid">${categories.slice(0,6).map((cat,i)=>`<div class="wb-category-card"><span>${String(i+1).padStart(2,'0')}</span><b>${esc(cat.name)}</b><p>${esc(cat.description||'Recognising exceptional work, innovation and measurable impact.')}</p></div>`).join('')}</div></section>`;
    if(id==='timeline')return `<section class="wb-site-section${alt}" data-section="timeline"><span class="section-kicker">Timeline</span><h2 data-edit="timelineTitle">${esc(c.timelineTitle)}</h2><p class="lead" data-edit="timelineBody">${esc(c.timelineBody)}</p><div class="wb-timeline"><div class="wb-time-card"><small>Entries open</small><b>${esc(fmtDate(award.openDate))}</b></div><div class="wb-time-card"><small>Entry deadline</small><b>${esc(fmtDate(award.closeDate))}</b></div><div class="wb-time-card"><small>Judging</small><b>${esc(fmtDate(award.judgingDate))}</b></div><div class="wb-time-card"><small>Winners</small><b>${esc(fmtDate(award.winnerDate))}</b></div></div></section>`;
    if(id==='judges')return `<section class="wb-site-section${alt}" id="judges" data-section="judges"><span class="section-kicker">Independent jury</span><h2 data-edit="judgesTitle">${esc(c.judgesTitle)}</h2><p class="lead" data-edit="judgesBody">${esc(c.judgesBody)}</p><div class="wb-judge-grid">${['Aarav Mehta','Maya Kapoor','Rohan Shah','Neha Iyer'].map((n,i)=>`<div class="wb-judge-card"><div class="wb-judge-avatar"></div><b>${n}</b><small>${['FinTech Investor','Banking Leader','Product Executive','Technology Advisor'][i]}</small></div>`).join('')}</div></section>`;
    if(id==='sponsors')return `<section class="wb-site-section${alt}" id="sponsors" data-section="sponsors"><span class="section-kicker">Partners</span><h2 data-edit="sponsorsTitle">${esc(c.sponsorsTitle)}</h2><p class="lead" data-edit="sponsorsBody">${esc(c.sponsorsBody)}</p><div class="wb-sponsors"><span class="wb-sponsor">PARTNER ONE</span><span class="wb-sponsor">PARTNER TWO</span><span class="wb-sponsor">MEDIA PARTNER</span><span class="wb-sponsor">KNOWLEDGE PARTNER</span></div></section>`;
    if(id==='faq')return `<section class="wb-site-section${alt}" data-section="faq"><span class="section-kicker">FAQ</span><h2 data-edit="faqTitle">${esc(c.faqTitle)}</h2><p class="lead" data-edit="faqBody">${esc(c.faqBody)}</p><div class="wb-faq-list"><div class="wb-faq-item"><b>Who can enter?</b><p>Eligibility depends on the category. Review the category criteria before starting your submission.</p></div><div class="wb-faq-item"><b>Can I save and return later?</b><p>Yes. Entrants can save a draft and complete the submission before the deadline.</p></div><div class="wb-faq-item"><b>How are entries judged?</b><p>Independent judges score eligible submissions against the published criteria.</p></div></div></section>`;
    if(id==='cta')return `<section class="wb-final-cta" data-section="cta"><h2 data-edit="ctaTitle">${esc(c.ctaTitle)}</h2><p data-edit="ctaBody">${esc(c.ctaBody)}</p><a class="wb-site-button" href="#categories">${esc(stage.cta)}</a></section>`;
    if(id==='countdown')return `<section class="wb-site-section${alt}" data-section="countdown"><span class="section-kicker">Deadline</span><h2 data-edit="countdownTitle">${esc(c.countdownTitle)}</h2><p class="lead" data-edit="countdownBody">${esc(c.countdownBody)}</p><div class="wb-countdown-box"><div><b>${esc(fmtDate(award.closeDate))}</b><small>Entry deadline for ${esc(award.name)}</small></div><div class="wb-countdown-number">${daysUntilClose()}</div></div></section>`;
    if(id==='stats')return `<section class="wb-site-section${alt}" data-section="stats"><span class="section-kicker">Impact</span><h2 data-edit="statsTitle">${esc(c.statsTitle)}</h2><p class="lead" data-edit="statsBody">${esc(c.statsBody)}</p><div class="wb-stats-grid"><div class="wb-stat"><b>682</b><span>Registrations</span></div><div class="wb-stat"><b>${categories.length}</b><span>Categories</span></div><div class="wb-stat"><b>18</b><span>Industry judges</span></div><div class="wb-stat"><b>11</b><span>Countries reached</span></div></div></section>`;
    if(id==='testimonials')return `<section class="wb-site-section${alt}" data-section="testimonials"><span class="section-kicker">Community</span><h2 data-edit="testimonialsTitle">${esc(c.testimonialsTitle)}</h2><p class="lead" data-edit="testimonialsBody">${esc(c.testimonialsBody)}</p><div class="wb-testimonial"><p>Being recognised gave our team credibility with customers, partners and future talent.</p><small>Previous award participant - Demo quote</small></div></section>`;
    return '';
  }

  function renderInspector(){
    const id=selectedSection;const section=sectionObj(id);$('inspectorTitle').textContent=sectionLabel(id);$('selectedBadge').textContent=section&&section.enabled?'Visible':'Hidden';$('selectedBadge').className='badge '+(section&&section.enabled?'green':'');
    const fieldsBySection={
      hero:[['Eyebrow','heroEyebrow'],['Headline','heroTitle','textarea'],['Supporting copy','heroBody','textarea'],['Default CTA label','heroCta']],
      about:[['Heading','aboutTitle'],['Body copy','aboutBody','textarea']],categories:[['Heading','categoriesTitle'],['Supporting copy','categoriesBody','textarea']],timeline:[['Heading','timelineTitle'],['Supporting copy','timelineBody','textarea']],judges:[['Heading','judgesTitle'],['Supporting copy','judgesBody','textarea']],sponsors:[['Heading','sponsorsTitle'],['Supporting copy','sponsorsBody','textarea']],faq:[['Heading','faqTitle'],['Supporting copy','faqBody','textarea']],cta:[['Heading','ctaTitle'],['Supporting copy','ctaBody','textarea']],countdown:[['Heading','countdownTitle'],['Supporting copy','countdownBody','textarea']],stats:[['Heading','statsTitle'],['Supporting copy','statsBody','textarea']],testimonials:[['Heading','testimonialsTitle'],['Supporting copy','testimonialsBody','textarea']]
    };
    const fields=fieldsBySection[id]||[];
    $('inspectorFields').innerHTML=fields.map(f=>`<label class="wb-label">${esc(f[0])}${f[2]==='textarea'?`<textarea data-inspector-field="${f[1]}">${esc(state.content[f[1]]||'')}</textarea>`:`<input data-inspector-field="${f[1]}" value="${esc(state.content[f[1]]||'')}">`}</label>`).join('')+`<div class="wb-mini-actions"><button id="hideSelectedBtn">${section&&section.enabled?'Hide section':'Show section'}</button><button id="moveSelectedUp">Move up</button></div>`;
    document.querySelectorAll('[data-inspector-field]').forEach(el=>el.addEventListener('input',()=>{state.content[el.dataset.inspectorField]=el.value;markDirty();renderPreview();renderQuality()}));
    const hide=$('hideSelectedBtn');if(hide)hide.addEventListener('click',()=>{if(!section)return;pushHistory();section.enabled=!section.enabled;markDirty();renderSectionList();renderPreview();renderInspector();renderQuality();pushHistory()});
    const up=$('moveSelectedUp');if(up)up.addEventListener('click',()=>moveSection(id,-1));
  }
  function syncInspectorValue(field,value){const el=document.querySelector('[data-inspector-field="'+field+'"]');if(el&&el!==document.activeElement)el.value=value}

  function renderQuality(){
    const visible=state.sections.filter(s=>s.enabled).length;let score=45;const checks=[];
    if(visible>=6){score+=15;checks.push(['ok','Strong site structure',visible+' homepage sections are visible'])}else checks.push(['warn','Add more context','Use at least 6 useful homepage sections']);
    if((state.content.heroTitle||'').length>20&&(state.content.heroBody||'').length>60){score+=15;checks.push(['ok','Hero is clear','Headline and supporting copy are ready'])}else checks.push(['warn','Improve the hero','Add a clear promise and supporting copy']);
    if((state.seo.title||'').length>=20&&(state.seo.description||'').length>=70){score+=15;checks.push(['ok','SEO basics complete','Title and meta description are set'])}else checks.push(['warn','Complete SEO basics','Add a stronger page title and meta description']);
    if(categories.length>=3){score+=10;checks.push(['ok','Categories connected',categories.length+' categories flow into the site'])}else checks.push(['warn','Add categories','More categories will make the site useful']);
    score=Math.min(100,score);$('qualityScore').textContent=score+'%';$('qualityBar').style.width=score+'%';$('qualityList').innerHTML=checks.slice(0,4).map(x=>`<div class="${x[0]==='warn'?'warn':''}"><span>${x[0]==='ok'?'&#10003;':'!'}</span><div><b>${esc(x[1])}</b><small>${esc(x[2])}</small></div></div>`).join('');
    const seoScore=Math.min(100,40+Math.min(25,(state.seo.title||'').length/2)+Math.min(35,(state.seo.description||'').length/4));$('seoScore').textContent=Math.round(seoScore)+'%';
  }
  function renderPublish(){const url=getPublicUrl();$('publicUrl').textContent=url;$('modalPublicUrl').textContent=url;$('publishStatus').textContent=state.published?'Live website':'Draft site';$('liveDot').classList.toggle('live',!!state.published);$('publishedTime').textContent=state.publishedAt?'Published '+new Date(state.publishedAt).toLocaleString():'Not published yet'}
  function renderSeoPreview(){$('seoPreviewUrl').textContent=state.customDomain.trim()||('etb2baward.vercel.app/'+slug);$('seoPreviewTitle').textContent=state.seo.title||award.name;$('seoPreviewDescription').textContent=state.seo.description||award.description||''}

  document.querySelectorAll('.wb-tabbar button').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.wb-tabbar button').forEach(x=>x.classList.toggle('active',x===btn));document.querySelectorAll('.wb-tab-panel').forEach(p=>p.classList.toggle('active',p.dataset.panel===btn.dataset.tab))}));
  document.querySelectorAll('[data-template]').forEach(btn=>btn.addEventListener('click',()=>{pushHistory();state.template=btn.dataset.template;markDirty();syncControls();renderPreview();pushHistory()}));
  ['primaryColor','accentColor'].forEach(id=>$(id).addEventListener('input',()=>{state[id==='primaryColor'?'primary':'accent']=$(id).value;markDirty();syncControls();renderPreview()}));
  $('primaryColor').addEventListener('change',pushHistory);$('accentColor').addEventListener('change',pushHistory);
  $('headingFont').addEventListener('change',()=>{pushHistory();state.headingFont=$('headingFont').value;markDirty();renderPreview();pushHistory()});
  $('cornerStyle').addEventListener('change',()=>{pushHistory();state.cornerStyle=$('cornerStyle').value;markDirty();renderPreview();pushHistory()});
  document.querySelectorAll('[data-page]').forEach(c=>c.addEventListener('change',()=>{pushHistory();state.pages[c.dataset.page]=c.checked;markDirty();renderPreview();pushHistory()}));
  $('stageAuto').addEventListener('change',()=>{pushHistory();state.stageAuto=$('stageAuto').checked;markDirty();renderPreview();renderInspector();pushHistory()});
  $('seoTitle').addEventListener('input',()=>{state.seo.title=$('seoTitle').value;markDirty();renderSeoPreview();renderQuality()});$('seoTitle').addEventListener('change',pushHistory);
  $('seoDescription').addEventListener('input',()=>{state.seo.description=$('seoDescription').value;$('seoCount').textContent=state.seo.description.length;markDirty();renderSeoPreview();renderQuality()});$('seoDescription').addEventListener('change',pushHistory);
  $('customDomain').addEventListener('input',()=>{state.customDomain=$('customDomain').value;markDirty();renderSeoPreview();renderPublish()});$('customDomain').addEventListener('change',pushHistory);

  document.querySelectorAll('[data-device]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-device]').forEach(x=>x.classList.toggle('active',x===btn));$('previewCanvas').className='wb-canvas '+btn.dataset.device}));
  $('refreshPreviewBtn').addEventListener('click',()=>{renderPreview();toast('Preview refreshed')});
  $('saveWebsiteBtn').addEventListener('click',()=>persist(true));
  $('publishBtn').addEventListener('click',publish);$('publishSideBtn').addEventListener('click',publish);
  function publish(){state.published=true;state.publishedAt=new Date().toISOString();persist(false);renderPublish();$('publishModal').classList.add('open');$('publishModal').setAttribute('aria-hidden','false')}
  document.querySelectorAll('[data-close-publish]').forEach(x=>x.addEventListener('click',()=>{$('publishModal').classList.remove('open');$('publishModal').setAttribute('aria-hidden','true')}));
  $('copyLinkBtn').addEventListener('click',async()=>{const url=location.origin.replace(/\/$/,'')+'/website-preview.html';try{await navigator.clipboard.writeText(url);toast('Preview link copied')}catch(e){toast('Copy this URL from the address bar')}});

  $('addSectionBtn').addEventListener('click',()=>{$('sectionDrawer').classList.add('open');$('sectionDrawer').setAttribute('aria-hidden','false')});
  document.querySelectorAll('[data-close-drawer]').forEach(x=>x.addEventListener('click',closeDrawer));
  function closeDrawer(){$('sectionDrawer').classList.remove('open');$('sectionDrawer').setAttribute('aria-hidden','true')}
  document.querySelectorAll('[data-add-type]').forEach(btn=>btn.addEventListener('click',()=>{const id=btn.dataset.addType;const existing=sectionObj(id);pushHistory();if(existing){existing.enabled=true;selectedSection=id;toast(sectionLabel(id)+' is visible again')}else{state.sections.splice(Math.max(1,state.sections.length-1),0,defaultSection(id));selectedSection=id;toast(sectionLabel(id)+' added')}markDirty();closeDrawer();renderSectionList();renderPreview();renderInspector();renderQuality();pushHistory()}));

  $('generateSiteBtn').addEventListener('click',()=>{pushHistory();const industry=(award.industry||'').toLowerCase();if(industry.includes('fin')){state.template='modern';state.primary='#3846d7';state.accent='#12a67a';state.content.heroTitle='Recognising the innovators redefining financial services.'}else if(industry.includes('health')){state.template='corporate';state.primary='#167c68';state.accent='#62b68d';state.content.heroTitle='Celebrating progress that improves lives.'}else if(industry.includes('design')){state.template='editorial';state.primary='#803f63';state.accent='#d29b49';state.content.heroTitle='Celebrating ideas that shape how the world looks and feels.'}else{state.template='modern';state.content.heroTitle='Celebrating the people shaping what comes next.'}state.content.heroBody=award.description||state.content.heroBody;state.content.categoriesTitle='Choose where your work belongs';state.content.ctaTitle='Your strongest work deserves to be seen.';markDirty();renderAll();pushHistory();toast('Award Copilot generated the website')});
  $('brandKitBtn').addEventListener('click',()=>{pushHistory();const key=(award.industry||award.type||'').toLowerCase();if(key.includes('fin')){state.primary='#2537c7';state.accent='#0fa979';state.headingFont='modern'}else if(key.includes('health')){state.primary='#0d7666';state.accent='#d69b3e';state.headingFont='rounded'}else if(key.includes('design')){state.primary='#7c3f63';state.accent='#d39c45';state.headingFont='editorial'}else{state.primary='#6258f5';state.accent='#17a673';state.headingFont='modern'}markDirty();renderAll();pushHistory();$('brandStatus').textContent='Generated';toast('Brand kit generated from your award')});

  $('copilotOpen').addEventListener('click',()=>$('copilotPanel').classList.add('open'));$('copilotClose').addEventListener('click',()=>$('copilotPanel').classList.remove('open'));
  document.querySelectorAll('[data-copilot]').forEach(btn=>btn.addEventListener('click',()=>{
    const action=btn.dataset.copilot;let answer='';
    if(action==='hero'){pushHistory();state.content.heroTitle='Put your best work in front of the people who matter.';state.content.heroBody='Enter '+award.name+' and showcase the ideas, teams and results raising the standard across '+(award.industry||'your industry')+'.';answer='I tightened the hero around entrant value: visibility, credibility and industry recognition. The preview has been updated.';markDirty();renderPreview();renderInspector();pushHistory()}
    if(action==='shorter'){pushHistory();state.content.aboutBody='Recognising the organisations, teams and leaders setting new standards. Explore the categories and submit your strongest work.';state.content.categoriesBody='Choose the category that best matches your achievement.';state.content.judgesBody='Independent experts score every eligible entry against clear criteria.';answer='I shortened three high-traffic sections so visitors can scan the page faster.';markDirty();renderPreview();renderInspector();pushHistory()}
    if(action==='sections'){answer=sectionObj('countdown')?'Your section mix is strong. Consider moving Countdown directly below Categories while entries are open.':'I recommend adding Countdown. It creates urgency and uses your configured entry deadline automatically.'}
    if(action==='seo'){pushHistory();state.seo.title=(award.name||'Awards')+' - Categories, Entries & Winners';state.seo.description='Explore '+award.name+', view award categories and key dates, meet the judges and submit your entry before '+fmtDate(award.closeDate)+'.';answer='I created search copy using the award name, categories, judging and deadline intent. Review it in the SEO tab.';markDirty();syncControls();renderSeoPreview();renderQuality();pushHistory()}
    $('copilotAnswer').textContent=answer;
  }));

  $('undoBtn').addEventListener('click',()=>{if(historyIndex<=0)return;historyIndex--;state=JSON.parse(history[historyIndex]);markDirty();renderAll()});
  $('redoBtn').addEventListener('click',()=>{if(historyIndex>=history.length-1)return;historyIndex++;state=JSON.parse(history[historyIndex]);markDirty();renderAll()});
  window.addEventListener('beforeunload',()=>{if(dirty)localStorage.setItem(storeKey,JSON.stringify(state))});
  renderAll();
})();
