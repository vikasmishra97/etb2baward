(function(){
  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
  const lines=v=>String(v||'').split('\n').map(x=>x.trim()).filter(Boolean);
  function niceDate(v){if(!v)return 'Date to be announced';const d=new Date(v);return d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
  function ctaFor(a){
    const now=new Date();
    if(a&&a.hasNominationDates&&a.nominationStart&&a.nominationEnd){const s=new Date(a.nominationStart),e=new Date(a.nominationEnd);if(now<s)return{label:'Express Interest',mode:'interest',sub:'Get notified when nominations open'};if(now<=e)return{label:'Nominate Now',mode:'nominate',sub:'Choose a category and start your entry'};return{label:'Nominations Closed',mode:'closed',sub:'This nomination window has ended'}}
    return{label:'Express Interest',mode:'interest',sub:'Stay informed about nominations'};
  }
  function defaultState(a){
    const name=a?.name||'ETB2B Excellence Awards 2027';
    return{
      theme:{preset:'awards-night',primary:'#a90e17',accent:'#d8ad59',surface:'#fffaf2',font:'editorial',radius:'soft'},
      header:{desktopImage:'',mobileImage:'',sponsorLogo:'',bottomSponsor:'',design:'immersive',overlay:64},
      form:{showOnBanner:true,title:'Register your interest',fields:{name:true,email:true,mobile:true,company:true,designation:false}},
      nav:{sticky:true,showRewards:true,showContact:true,visible:{overview:true,keypoints:true,who:false,why:false,eventDescription:false,speakers:true,agenda:true,resources:false,glimpse:false,contact:true}},
      pages:{landing:{title:name,enabled:true},thankyou:{enabled:true,title:'Thank you for your interest',body:'We have received your details. Our awards team will keep you updated with nomination news and important dates.'},rewards:{enabled:true,title:'Recognition that travels beyond the trophy',body:'Winners receive a digital certificate, winner badge, editorial visibility and a place in the official ETB2B Awards winner gallery.'}},
      sections:[
        {id:'overview',label:'Overview',enabled:true,theme:'editorial',title:'About the Awards',body:'ETB2B Awards celebrates organisations, teams and leaders creating measurable business impact. The program brings together industry peers, jury experts and standout work on one trusted platform.'},
        {id:'keypoints',label:'Key Discussion Points',enabled:true,theme:'cards',title:'What the awards spotlight',items:'Business transformation\nInnovation with measurable impact\nCustomer and employee outcomes\nTechnology that creates real value'},
        {id:'who',label:'Who Should Attend',enabled:true,theme:'split',title:'Built for the people shaping the industry',items:'Business leaders and CXOs\nFounders and entrepreneurs\nFunctional and transformation leaders\nAgencies, solution providers and partners'},
        {id:'why',label:'Why Join Us',enabled:true,theme:'cards',title:'Why participate',items:'Build credible industry recognition\nBenchmark work against the best\nCreate visibility for teams and leaders\nConnect with a high-intent business community'},
        {id:'eventDescription',label:'Event Description',enabled:true,theme:'classic',title:'The experience',body:'From nominations and jury evaluation to the live winner reveal, every stage is designed to celebrate excellent work with transparency, context and premium storytelling.'},
        {id:'speakers',label:'Speakers',enabled:true,theme:'dark',title:'Meet the voices on stage',speakers:[{name:'Ananya Rao',role:'Chief People Officer',company:'FutureWorks'},{name:'Rohit Mehra',role:'Founder & CEO',company:'Nexora'},{name:'Maya Shah',role:'Industry Jury Chair',company:'ETB2B Awards'}]},
        {id:'agenda',label:'Agenda',enabled:true,theme:'editorial',title:'Agenda',agenda:[{time:'18:00',title:'Guest arrival & networking'},{time:'19:00',title:'Opening keynote'},{time:'19:30',title:'Awards block I'},{time:'20:15',title:'Industry conversation'},{time:'21:00',title:'Awards block II & winner reveal'}]},
        {id:'resources',label:'Resources',enabled:true,theme:'classic',title:'Resources',resources:[{title:'Nomination guide',url:'#'},{title:'Judging framework',url:'#'},{title:'Awards brochure',url:'#'}]},
        {id:'glimpse',label:'Glimpse / About',enabled:true,theme:'split',title:'A glimpse of the experience',body:'A premium stage, high-value networking and stories that continue well beyond awards night. Use this section for previous-edition photography, highlights or a brand film.'},
        {id:'contact',label:'Contact',enabled:true,theme:'dark',title:'Need help with your nomination?',email:'awards@etb2b.com',phone:'+91 98765 43210',address:a?.venue||'ETB2B Awards Team'},
        {id:'custom',label:'Custom Code Section',enabled:false,theme:'classic',title:'Custom section',html:'<div class="custom-demo"><strong>Your custom HTML appears here.</strong><p>Add campaign widgets, partner content, embeds or any special block you need.</p></div>'}
      ],published:false,updatedAt:null
    };
  }
  function normalizeState(raw,a){
    const d=defaultState(a);if(!raw||typeof raw!=='object')return d;
    if(raw.theme&&raw.header&&raw.form&&Array.isArray(raw.sections)&&raw.sections.some(s=>s.id==='overview')){
      d.theme=Object.assign(d.theme,raw.theme||{});d.header=Object.assign(d.header,raw.header||{});d.form=Object.assign(d.form,raw.form||{});d.form.fields=Object.assign(d.form.fields,raw.form?.fields||{});d.nav=Object.assign(d.nav,raw.nav||{});d.nav.visible=Object.assign(d.nav.visible,raw.nav?.visible||{});d.pages={landing:Object.assign(d.pages.landing,raw.pages?.landing||{}),thankyou:Object.assign(d.pages.thankyou,raw.pages?.thankyou||{}),rewards:Object.assign(d.pages.rewards,raw.pages?.rewards||{})};d.sections=d.sections.map(sec=>Object.assign(sec,(raw.sections||[]).find(x=>x.id===sec.id)||{}));d.published=!!raw.published;d.updatedAt=raw.updatedAt||null;return d;
    }
    if(raw.primary)d.theme.primary=raw.primary;if(raw.accent)d.theme.accent=raw.accent;if(raw.template)d.theme.preset=raw.template==='luxury'?'awards-night':raw.template;if(raw.headingFont)d.theme.font=raw.headingFont;if(raw.cornerStyle)d.theme.radius=raw.cornerStyle;
    if(raw.content){const ov=d.sections.find(s=>s.id==='overview');ov.title=raw.content.aboutTitle||ov.title;ov.body=raw.content.aboutBody||raw.content.heroBody||ov.body;const key=d.sections.find(s=>s.id==='keypoints');if(raw.content.categoriesBody)key.items=raw.content.categoriesBody+'\n'+key.items;}
    d.published=!!raw.published;return d;
  }
  function sectionClass(s){return `public-section design-${esc(s.theme||'classic')}`}
  function sectionHead(s,kicker){return `<div class="public-section-head"><small>${esc(kicker||s.label)}</small><h2>${esc(s.title||s.label)}</h2></div>`}
  function listCards(items){return `<div class="public-card-grid">${lines(items).map((x,i)=>`<article><span>${String(i+1).padStart(2,'0')}</span><b>${esc(x)}</b></article>`).join('')}</div>`}
  function renderSection(s){if(!s.enabled)return'';const id=`section-${s.id}`;
    if(s.id==='overview'||s.id==='eventDescription')return `<section id="${id}" class="${sectionClass(s)}">${sectionHead(s)}<div class="public-prose">${esc(s.body)}</div></section>`;
    if(s.id==='keypoints'||s.id==='who'||s.id==='why')return `<section id="${id}" class="${sectionClass(s)}">${sectionHead(s)}${listCards(s.items)}</section>`;
    if(s.id==='speakers')return `<section id="${id}" class="${sectionClass(s)}">${sectionHead(s)}<div class="public-speakers">${(s.speakers||[]).map((p,i)=>`<article><div class="speaker-avatar">${esc((p.name||'S').split(' ').map(x=>x[0]).slice(0,2).join(''))}</div><b>${esc(p.name)}</b><span>${esc(p.role)}</span><small>${esc(p.company)}</small></article>`).join('')}</div></section>`;
    if(s.id==='agenda')return `<section id="${id}" class="${sectionClass(s)}">${sectionHead(s)}<div class="public-agenda">${(s.agenda||[]).map((x,i)=>`<article><time>${esc(x.time)}</time><span>${String(i+1).padStart(2,'0')}</span><b>${esc(x.title)}</b></article>`).join('')}</div></section>`;
    if(s.id==='resources')return `<section id="${id}" class="${sectionClass(s)}">${sectionHead(s)}<div class="public-resources">${(s.resources||[]).map(r=>`<a href="${esc(r.url||'#')}" target="_blank" rel="noopener"><span>↗</span><b>${esc(r.title)}</b><small>Open resource</small></a>`).join('')}</div></section>`;
    if(s.id==='glimpse')return `<section id="${id}" class="${sectionClass(s)}">${sectionHead(s)}<div class="public-glimpse"><div><p>${esc(s.body)}</p></div><div class="glimpse-grid"><span></span><span></span><span></span></div></div></section>`;
    if(s.id==='contact')return `<section id="${id}" class="${sectionClass(s)}">${sectionHead(s)}<div class="public-contact"><a href="mailto:${esc(s.email)}"><small>Email</small><b>${esc(s.email)}</b></a><a href="tel:${esc(s.phone)}"><small>Phone</small><b>${esc(s.phone)}</b></a><div><small>Event / Office</small><b>${esc(s.address)}</b></div></div></section>`;
    if(s.id==='custom')return `<section id="${id}" class="${sectionClass(s)} custom-code-section">${sectionHead(s)}<div class="custom-code-output">${s.html||''}</div></section>`;
    return'';
  }
  function heroForm(state,cta,opts){if(!state.form.showOnBanner)return `<div class="hero-cta-only"><a class="public-primary-cta ${cta.mode==='closed'?'disabled':''}" href="${cta.mode==='nominate'?'nominate.html':cta.mode==='closed'?'#':'#interest'}" data-hero-cta>${esc(cta.label)}</a><small>${esc(cta.sub)}</small></div>`;
    const f=state.form.fields||{};const fields=[];
    if(f.name)fields.push('<label><span>Name</span><input name="name" placeholder="Your name" required></label>');
    if(f.email)fields.push('<label><span>Work email</span><input name="email" type="email" placeholder="name@company.com" required></label>');
    if(f.mobile)fields.push('<label><span>Mobile</span><input name="mobile" placeholder="+91" required></label>');
    if(f.company)fields.push('<label><span>Company</span><input name="company" placeholder="Company name"></label>');
    if(f.designation)fields.push('<label><span>Designation</span><input name="designation" placeholder="Your role"></label>');
    return `<form class="hero-register" data-public-interest-form data-cta-mode="${cta.mode}"><div class="hero-register-title"><small>${cta.mode==='nominate'?'NOMINATIONS ARE OPEN':'STAY IN THE LOOP'}</small><b>${esc(cta.mode==='nominate'?'Start your nomination':state.form.title)}</b><span>${esc(cta.sub)}</span></div><div class="hero-register-fields">${fields.join('')}</div><button type="submit" ${cta.mode==='closed'?'disabled':''}>${esc(cta.label)} <span>→</span></button><small class="hero-consent">By continuing, you agree to receive award-related updates.</small></form>`;
  }
  function render(container,a,state,opts={}){
    if(!container)return;const cta=ctaFor(a||{});const heroImage=state.header.desktopImage||'';const logo=a?.logoData||'et-logo.jpg';
    const visibleSections=(state.sections||[]).filter(s=>s.enabled);
    const navLinks=visibleSections.filter(s=>s.id!=='custom'&&(state.nav.visible?.[s.id]!==false)).map(s=>`<a href="#section-${s.id}">${esc(s.label)}</a>`).join('');
    const rewardLink=state.pages.rewards?.enabled&&state.nav.showRewards!==false?'<a href="rewards.html">Rewards</a>':'';
    const mobileImage=state.header.mobileImage||'';const vars=[`--p:${esc(state.theme.primary)}`,`--a:${esc(state.theme.accent)}`,`--surface:${esc(state.theme.surface)}`,`--overlay:${Number(state.header.overlay||64)/100}`];if(heroImage)vars.push(`--hero-image:url('${heroImage.replace(/'/g,"%27")}')`);if(mobileImage)vars.push(`--hero-image-mobile:url('${mobileImage.replace(/'/g,"%27")}')`);
    container.innerHTML=`<div class="public-site preset-${esc(state.theme.preset)} font-${esc(state.theme.font)} radius-${esc(state.theme.radius)}" style="${vars.join(';')}">
      <header class="public-nav ${state.nav.sticky?'sticky':''}"><a class="public-brand" href="website-preview.html"><img src="${esc(logo)}" alt="Logo"><span><b>${esc(a?.name||'ETB2B Awards')}</b><small>ETB2B Awards</small></span></a><nav>${navLinks}${rewardLink}</nav><a class="nav-cta ${cta.mode==='closed'?'disabled':''}" href="${cta.mode==='nominate'?'nominate.html':cta.mode==='closed'?'#':'#interest'}" data-hero-cta>${esc(cta.label)}</a></header>
      <section class="public-hero hero-${esc(state.header.design)}" id="home"><div class="hero-overlay"></div><div class="hero-content"><div class="hero-copy"><small class="hero-kicker">${esc((a?.eventCategory||'ETB2B AWARDS').toUpperCase())}</small><h1>${esc(a?.name||'Your Award')}</h1><p>${esc(a?.description||'Recognising excellence, innovation and measurable impact.')}</p><div class="hero-meta"><span><i>📍</i><b>${esc([a?.venue,a?.city].filter(Boolean).join(', ')||'Venue to be announced')}</b></span><span><i>◷</i><b>${esc(a?.hasEventDates?niceDate(a.eventStart):'Event date to be announced')}</b></span>${a?.hasNominationDates?`<span><i>◆</i><b>Nominations: ${esc(niceDate(a.nominationStart))} – ${esc(niceDate(a.nominationEnd))}</b></span>`:''}</div></div><div id="interest" class="hero-form-wrap">${heroForm(state,cta,opts)}</div></div></section>
      <main class="public-main">${visibleSections.map(renderSection).join('')}</main>
      <section class="public-final-cta"><small>ETB2B AWARDS</small><h2>${esc(cta.mode==='nominate'?'Ready to make your work count?':'Be part of the next edition')}</h2><p>${esc(cta.sub)}</p><a href="${cta.mode==='nominate'?'nominate.html':cta.mode==='closed'?'#':'#interest'}" data-hero-cta>${esc(cta.label)} →</a></section>
      <footer class="public-footer"><span>© ${new Date().getFullYear()} ${esc(a?.name||'ETB2B Awards')}</span><span>Powered by ETB2B Awards · Vikas Mishra</span></footer>
    </div>`;
    if(opts.builder){container.querySelectorAll('a').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));container.querySelectorAll('form').forEach(f=>f.addEventListener('submit',e=>e.preventDefault()));}
  }
  window.ETB2BSite={defaultState,normalizeState,render,ctaFor,niceDate,lines};
})();
