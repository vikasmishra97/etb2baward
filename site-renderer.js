(function(){
  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
  const uid=(p='id')=>p+'_'+Math.random().toString(36).slice(2,9);
  const lines=v=>Array.isArray(v)?v:String(v||'').split('\n').map(x=>x.trim()).filter(Boolean);
  function niceDate(v){if(!v)return 'Date to be announced';const d=new Date(v);if(Number.isNaN(d.getTime()))return v;return d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
  function niceTime(v,fallback=''){if(!v)return fallback;const d=new Date(v);if(Number.isNaN(d.getTime()))return v;return d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}
  function ctaFor(a){
    const now=new Date();
    if(a&&a.hasNominationDates&&a.nominationStart&&a.nominationEnd){const s=new Date(a.nominationStart),e=new Date(a.nominationEnd);if(now<s)return{label:'Express Interest',mode:'interest',sub:'Get notified when nominations open'};if(now<=e)return{label:'Nominate Now',mode:'nominate',sub:'Choose a category and start your entry'};return{label:'Nominations Closed',mode:'closed',sub:'This nomination window has ended'}}
    return{label:'Express Interest',mode:'interest',sub:'Stay informed about nominations'};
  }
  function defaultState(a){
    const name=a?.name||'ETB2B Excellence Awards 2027';
    return{
      theme:{preset:'awards-night',primary:'#a90e17',accent:'#d8ad59',surface:'#fffaf2',font:'editorial',radius:'soft'},
      header:{desktopImage:'',mobileImage:'',illustrationImage:'',brandingBanner:'',sponsorLogo:'',bottomSponsor:'',seoImage:'',thumbnailImage:'',seoTitle:'',seoDescription:'',design:'stage',overlay:58,heroPosition:'center',illustrationSize:48,brandingWidth:84,heroHeight:690},
      form:{showOnBanner:true,title:'Register your interest',fields:{name:true,email:true,mobile:true,company:true,designation:false}},
      nav:{sticky:true,style:'transparent',background:'#4b0d13',opacity:88,textColor:'#ffffff',twoRow:true,order:['home','page:categories','page:jury','page:guidelines','page:criteria','page:terms','section:overview','section:why','section:speakers','section:agenda','section:contact','page:faq','page:contact','page:previous','page:rewards'],pages:{home:true,categories:true,jury:true,guidelines:true,criteria:true,terms:true,faq:true,contact:true,previous:true},visible:{overview:true,keypoints:false,who:false,why:true,eventDescription:false,speakers:true,agenda:true,resources:false,glimpse:false,contact:true}},
      pages:{landing:{title:name,enabled:true},thankyou:{enabled:true,title:'Thank you for your interest',body:'We have received your details. Our awards team will keep you updated with nomination news and important dates.'},rewards:{enabled:true,title:'Recognition that travels beyond the trophy',body:'Winners receive a digital certificate, winner badge, editorial visibility and a place in the official ETB2B Awards winner gallery.'}},
      publicPages:[
        {id:'categories',label:'Categories',navLabel:'Categories',enabled:true,showInNav:true,eyebrow:'AWARD CATEGORIES',title:'Choose your category',intro:'Select the category that best matches your work. Review the category fit, then start your nomination.'},
        {id:'jury',label:'Jury',navLabel:'Jury',enabled:true,showInNav:true,eyebrow:'THE PEOPLE BEHIND THE DECISIONS',title:'Jury',intro:'Meet the industry leaders and subject-matter experts evaluating the strongest work in the awards.'},
        {id:'guidelines',label:'Entry Guidelines',navLabel:'Entry Guidelines',enabled:true,showInNav:true,eyebrow:'HOW TO ENTER',title:'Entry Guidelines',intro:'A simple guide to preparing a complete, credible nomination before you start.',items:'Choose the right category|Select the category that most closely reflects the work, campaign, leader or organisation you are entering.\nPrepare your story|Keep the challenge, approach, execution and measurable outcomes clear and evidence-led.\nCollect evidence|Have supporting files, links, images, data and approvals ready before final submission.\nCheck eligibility|Confirm the work falls within the eligible period and meets the specific category requirements.\nReview before payment|Check names, company details, credits and attachments carefully before completing your entry.\nSubmit before deadline|Complete payment where applicable and submit before the published nomination closing date.'},
        {id:'criteria',label:'Judging Criteria',navLabel:'Judging Criteria',enabled:true,showInNav:true,eyebrow:'HOW ENTRIES ARE EVALUATED',title:'Judging Criteria',intro:'The jury evaluates entries against a transparent scoring framework focused on quality, impact and execution.',note:'Scores are reviewed across the configured criteria and weights. The jury is expected to evaluate independently and declare conflicts where applicable.'},
        {id:'terms',label:'T&C',navLabel:'T&C',enabled:true,showInNav:true,eyebrow:'AWARDS POLICY',title:'Terms & Conditions',intro:'Please review the core participation, eligibility and judging conditions before submitting a nomination.',items:'Eligibility|Entries must meet the published category scope, eligible period and geographic or industry requirements.\nAccuracy|Entrants are responsible for ensuring submitted information, claims, names and supporting materials are accurate and authorised.\nJudging|Judging outcomes are based on the published criteria. Jury and organiser decisions are final subject to the awards governance process.\nConfidentiality|Mark confidential material clearly. Public winner content may be edited for presentation while preserving the substance of the entry.\nFees|Where entry fees apply, the entry is considered complete only after the required payment or approved waiver is recorded.\nPublicity|Shortlisted and winning organisations may be referenced in awards communications, winner galleries and event materials.'},
        {id:'faq',label:'FAQs',navLabel:'FAQs',enabled:true,showInNav:true,eyebrow:'HELP CENTRE',title:'Frequently Asked Questions',intro:'Quick answers to the questions entrants most often ask while preparing a nomination.',items:'Who can enter the awards?|Eligibility depends on the selected category. Organisations, teams and individuals should review the category description and entry guidelines before submitting.\nCan I submit more than one entry?|Yes. You can submit multiple nominations and enter different categories where the work meets the relevant criteria.\nCan I save my nomination and finish later?|Yes. The full product flow is designed to support draft entries before final submission.\nWhat happens after I submit?|Your entry is checked for completion and eligibility before being assigned to the judging process.\nCan I edit an entry after submission?|This depends on the award configuration and whether the submission window is still open. Contact the awards team if you need assistance.\nWhen will winners be announced?|The event date and announcement schedule are published on the award homepage and official communications.'},
        {id:'contact',label:'Contact Us',navLabel:'Contact Us',enabled:true,showInNav:true,eyebrow:'AWARDS TEAM',title:'Contact Us',intro:'Reach the right awards contact for nomination, partnership, media or event questions.'},
        {id:'previous',label:'Previous Edition',navLabel:'Previous Edition',enabled:true,showInNav:true,eyebrow:'PAST HIGHLIGHTS',title:'Previous Edition',intro:'Explore the previous edition, standout moments and the community that shaped the awards.',body:'Use this page for previous winners, event photographs, jury highlights, testimonials, videos and an archive of earlier editions.'},
        {id:'rewards',label:'Rewards',navLabel:'Rewards',enabled:true,showInNav:true,eyebrow:'WINNER RECOGNITION',title:'Recognition that travels beyond the trophy',intro:'Winners receive premium recognition across the ETB2B Awards ecosystem.',items:'Winner Certificate|A branded digital certificate with verification details for sharing internally and externally.\nWinner Badge|A ready-to-use winner mark for websites, sales decks, social media and communications.\nEditorial Visibility|Winner storytelling through the official gallery, social assets and award communications.\nIndustry Recognition|A credible benchmark that recognises the team, work and business outcomes behind the entry.'}
      ],
      sections:[
        {id:'overview',label:'Overview',enabled:true,theme:'editorial',title:'About the Awards',body:'ETB2B Awards celebrates organisations, teams and leaders creating measurable business impact. The program brings together industry peers, jury experts and standout work on one trusted platform.'},
        {id:'keypoints',label:'Key Discussion Points',enabled:true,theme:'cards',title:'What the awards spotlight',items:'Business transformation\nInnovation with measurable impact\nCustomer and employee outcomes\nTechnology that creates real value'},
        {id:'who',label:'Who Should Attend',enabled:true,theme:'split',title:'Built for the people shaping the industry',items:'Business leaders and CXOs\nFounders and entrepreneurs\nFunctional and transformation leaders\nAgencies, solution providers and partners'},
        {id:'why',label:'Why Join Us',enabled:true,theme:'cards',title:'Why participate',items:'Build credible industry recognition\nBenchmark work against the best\nCreate visibility for teams and leaders\nConnect with a high-intent business community'},
        {id:'eventDescription',label:'Event Description',enabled:true,theme:'classic',title:'The experience',body:'From nominations and jury evaluation to the live winner reveal, every stage is designed to celebrate excellent work with transparency, context and premium storytelling.'},
        {id:'speakers',label:'Speakers',enabled:true,theme:'speaker-marquee',title:'Distinguished Jury',showGroupHeadings:true,
          speakerGroups:[{id:'jury',name:'Jury & Speakers',active:true,weight:100},{id:'leaders',name:'Industry Leaders',active:true,weight:80}],
          speakers:[
            {id:'sp1',name:'Ananya Rao',role:'Chief People Officer',company:'FutureWorks',groupId:'jury',photo:'',status:true,weight:100},
            {id:'sp2',name:'Rohit Mehra',role:'Founder & CEO',company:'Nexora',groupId:'jury',photo:'',status:true,weight:90},
            {id:'sp3',name:'Maya Shah',role:'Industry Jury Chair',company:'ETB2B Awards',groupId:'leaders',photo:'',status:true,weight:80}
          ]},
        {id:'agenda',label:'Agenda',enabled:true,theme:'editorial',title:'Agenda',
          agendaGroups:[{id:'opening',name:'Opening',active:true,weight:100},{id:'awards',name:'Awards',active:true,weight:90},{id:'networking',name:'Networking',active:true,weight:70}],
          agenda:[
            {id:'ag1',title:'Guest arrival & networking',start:'',end:'',time:'18:00',groupId:'networking',speakerIds:[],summary:'Guest arrival, registration and networking.',points:'',status:true},
            {id:'ag2',title:'Opening keynote',start:'',end:'',time:'19:00',groupId:'opening',speakerIds:['sp1'],summary:'Welcome address and opening keynote.',points:'',status:true},
            {id:'ag3',title:'Awards block I',start:'',end:'',time:'19:30',groupId:'awards',speakerIds:['sp3'],summary:'First set of award categories and winner reveals.',points:'',status:true},
            {id:'ag4',title:'Industry conversation',start:'',end:'',time:'20:15',groupId:'opening',speakerIds:['sp1','sp2'],summary:'A moderated industry conversation.',points:'',status:true},
            {id:'ag5',title:'Awards block II & winner reveal',start:'',end:'',time:'21:00',groupId:'awards',speakerIds:['sp3'],summary:'Final award categories and closing winner reveal.',points:'',status:true}
          ]},
        {id:'resources',label:'Resources',enabled:true,theme:'classic',title:'Resources',resources:[{title:'Nomination guide',url:'#'},{title:'Judging framework',url:'#'},{title:'Awards brochure',url:'#'}]},
        {id:'glimpse',label:'Glimpse / About',enabled:true,theme:'split',title:'A glimpse of the experience',body:'A premium stage, high-value networking and stories that continue well beyond awards night. Use this section for previous-edition photography, highlights or a brand film.',
          galleryGroups:[{id:'highlights',name:'Event Highlights',active:true,weight:100},{id:'winners',name:'Winners',active:true,weight:90},{id:'networking',name:'Networking',active:true,weight:80}],
          images:[]},
        {id:'contact',label:'Contact',enabled:true,theme:'dark',title:'Need help with your nomination?',showGroupHeadings:true,
          contactGroups:[{id:'delegates',name:'For Delegates',active:true},{id:'sponsors',name:'For Sponsors',active:true},{id:'media',name:'For Media',active:true}],
          contacts:[{id:'ct1',name:'Awards Helpdesk',email:'awards@etb2b.com',phone:'+91 98765 43210',company:'ETB2B Awards',designation:'Awards Team',groupId:'delegates',status:true}],
          email:'awards@etb2b.com',phone:'+91 98765 43210',address:a?.venue||'ETB2B Awards Team'},
        {id:'custom',label:'Custom Code Section',enabled:false,theme:'classic',title:'Custom section',html:'<div class="custom-demo"><strong>Your custom HTML appears here.</strong><p>Add campaign widgets, partner content, embeds or any special block you need.</p></div>'}
      ],published:false,updatedAt:null
    };
  }
  function normalizeGroupArray(raw,defs,prefix){
    const arr=Array.isArray(raw)&&raw.length?raw:defs;
    return arr.map((g,i)=>Object.assign({id:g.id||`${prefix}${i+1}`,name:`Group ${i+1}`,active:true,weight:100},g,{id:g.id||`${prefix}${i+1}`}));
  }
  function normalizeState(raw,a){
    const d=defaultState(a);if(!raw||typeof raw!=='object')return d;
    d.theme=Object.assign(d.theme,raw.theme||{});d.header=Object.assign(d.header,raw.header||{});if(raw.header&&raw.header.brandingWidth==null)d.header.brandingWidth=84;if(raw.header&&raw.header.heroHeight==null)d.header.heroHeight=690;if(raw.header&&raw.header.illustrationImage&&raw.header.brandingWidth==null&&raw.header.design==='immersive')d.header.design='stage';d.form=Object.assign(d.form,raw.form||{});d.form.fields=Object.assign(d.form.fields,raw.form?.fields||{});d.nav=Object.assign(d.nav,raw.nav||{});d.nav.visible=Object.assign(d.nav.visible,raw.nav?.visible||{});d.nav.pages=Object.assign(defaultState(a).nav.pages,raw.nav?.pages||{});
    d.pages={landing:Object.assign(d.pages.landing,raw.pages?.landing||{}),thankyou:Object.assign(d.pages.thankyou,raw.pages?.thankyou||{}),rewards:Object.assign(d.pages.rewards,raw.pages?.rewards||{})};
    const defPublic=defaultState(a).publicPages||[];const rawPublic=Array.isArray(raw.publicPages)?raw.publicPages:[];const rawPublicMap=Object.fromEntries(rawPublic.map(x=>[x.id,x]));
    d.publicPages=defPublic.map(pg=>Object.assign({},pg,rawPublicMap[pg.id]||{}));
    d.publicPages.forEach(pg=>{if(raw.nav?.pages&&Object.prototype.hasOwnProperty.call(raw.nav.pages,pg.id))pg.enabled=raw.nav.pages[pg.id]!==false;if(pg.id==='rewards'&&raw.pages?.rewards?.enabled!=null)pg.enabled=raw.pages.rewards.enabled!==false;});
    if(Array.isArray(raw.sections)){
      const defMap=Object.fromEntries(d.sections.map(s=>[s.id,s]));const rawMap=Object.fromEntries(raw.sections.map(s=>[s.id,s]));
      const ids=[...raw.sections.map(s=>s.id).filter(id=>defMap[id]),...d.sections.map(s=>s.id).filter(id=>!rawMap[id])];
      d.sections=ids.map(id=>Object.assign({},defMap[id],rawMap[id]||{}));
    }
    const sp=d.sections.find(s=>s.id==='speakers');if(sp){
      const ds=defaultState(a).sections.find(s=>s.id==='speakers');sp.speakerGroups=normalizeGroupArray(sp.speakerGroups,ds.speakerGroups,'sg');
      sp.speakers=(Array.isArray(sp.speakers)&&sp.speakers.length?sp.speakers:ds.speakers).map((p,i)=>Object.assign({id:p.id||`sp${i+1}`,name:'Speaker',role:'',company:'',groupId:sp.speakerGroups[0]?.id||'',photo:'',status:true,weight:100},p,{id:p.id||`sp${i+1}`}));
      sp.showGroupHeadings=sp.showGroupHeadings!==false;
    }
    const ag=d.sections.find(s=>s.id==='agenda');if(ag){
      const da=defaultState(a).sections.find(s=>s.id==='agenda');ag.agendaGroups=normalizeGroupArray(ag.agendaGroups,da.agendaGroups,'agp');
      ag.agenda=(Array.isArray(ag.agenda)&&ag.agenda.length?ag.agenda:da.agenda).map((x,i)=>Object.assign({id:x.id||`ag${i+1}`,title:'Agenda item',start:'',end:'',time:x.time||'',groupId:ag.agendaGroups[0]?.id||'',speakerIds:[],summary:'',points:'',status:true},x,{id:x.id||`ag${i+1}`,speakerIds:Array.isArray(x.speakerIds)?x.speakerIds:[]}));
    }
    const gl=d.sections.find(s=>s.id==='glimpse');if(gl){
      const dg=defaultState(a).sections.find(s=>s.id==='glimpse');gl.galleryGroups=normalizeGroupArray(gl.galleryGroups,dg.galleryGroups,'gg');
      gl.images=(Array.isArray(gl.images)?gl.images:[]).map((x,i)=>Object.assign({id:x.id||`img${i+1}`,title:`Image ${i+1}`,image:'',socialHandle:'',groupId:gl.galleryGroups[0]?.id||'',status:true,weight:100},x,{id:x.id||`img${i+1}`}));
    }
    const ct=d.sections.find(s=>s.id==='contact');if(ct){
      const dc=defaultState(a).sections.find(s=>s.id==='contact');ct.contactGroups=normalizeGroupArray(ct.contactGroups,dc.contactGroups,'cg');
      let contacts=Array.isArray(ct.contacts)?ct.contacts:[];
      if(!contacts.length&&(ct.email||ct.phone||ct.address))contacts=[{name:'Awards Helpdesk',email:ct.email||'',phone:ct.phone||'',company:'ETB2B Awards',designation:ct.address||'',groupId:ct.contactGroups[0]?.id||'',status:true}];
      ct.contacts=(contacts.length?contacts:dc.contacts).map((x,i)=>Object.assign({id:x.id||`ct${i+1}`,name:'Contact',email:'',phone:'',company:'',designation:'',groupId:ct.contactGroups[0]?.id||'',status:true},x,{id:x.id||`ct${i+1}`}));ct.showGroupHeadings=ct.showGroupHeadings!==false;
    }
    d.sections.forEach(sec=>{if(sec.showInNav==null){const legacy=raw.nav?.visible&&Object.prototype.hasOwnProperty.call(raw.nav.visible,sec.id)?raw.nav.visible[sec.id]:defaultState(a).nav.visible[sec.id];sec.showInNav=legacy!==false;}});
    d.sections=[...d.sections.filter(s=>s.enabled!==false),...d.sections.filter(s=>s.enabled===false)];
    const fallbackOrder=defaultState(a).nav.order||[];const incomingOrder=Array.isArray(raw.nav?.order)?raw.nav.order:[];d.nav.order=[...incomingOrder,...fallbackOrder.filter(x=>!incomingOrder.includes(x))];
    if(raw.primary)d.theme.primary=raw.primary;if(raw.accent)d.theme.accent=raw.accent;if(raw.template)d.theme.preset=raw.template==='luxury'?'awards-night':raw.template;if(raw.headingFont)d.theme.font=raw.headingFont;if(raw.cornerStyle)d.theme.radius=raw.cornerStyle;
    d.published=!!raw.published;d.updatedAt=raw.updatedAt||null;return d;
  }
  function sectionClass(s){return `public-section section-${esc(s.id||'generic')} design-${esc(s.theme||'classic')}`}
  function sectionHead(s,kicker){return `<div class="public-section-head"><small>${esc(kicker||s.label)}</small><h2>${esc(s.title||s.label)}</h2></div>`}
  function listCards(items){return `<div class="public-card-grid">${lines(items).map((x,i)=>`<article><span>${String(i+1).padStart(2,'0')}</span><b>${esc(x)}</b></article>`).join('')}</div>`}
  function speakerAvatar(p){if(p.photo)return `<div class="speaker-photo"><img src="${esc(p.photo)}" alt="${esc(p.name)}"></div>`;return `<div class="speaker-avatar">${esc((p.name||'S').split(' ').map(x=>x[0]).slice(0,2).join(''))}</div>`}
  function renderSpeakers(s){
    const allGroups=s.speakerGroups||[];const groups=allGroups.filter(g=>g.active!==false);const activeIds=new Set(groups.map(g=>g.id));const knownIds=new Set(allGroups.map(g=>g.id));const active=(s.speakers||[]).filter(p=>p.status!==false&&(!p.groupId||!knownIds.has(p.groupId)||activeIds.has(p.groupId)));
    if(!active.length)return '<div class="public-empty">Speakers will be announced soon.</div>';
    const grouped=groups.map(g=>({g,people:active.filter(p=>(p.groupId||groups[0]?.id)===g.id)})).filter(x=>x.people.length);
    const ungrouped=active.filter(p=>!groups.some(g=>g.id===p.groupId));if(ungrouped.length)grouped.push({g:{id:'other',name:'Speakers'},people:ungrouped});
    return grouped.map(({g,people})=>`<div class="public-speaker-group">${s.showGroupHeadings!==false&&grouped.length>1?`<h3>${esc(g.name)}</h3>`:''}<div class="public-speakers">${people.map(p=>`<article>${speakerAvatar(p)}<b>${esc(p.name)}</b><span>${esc(p.role)}</span><small>${esc(p.company)}</small></article>`).join('')}</div></div>`).join('');
  }
  function renderAgenda(s,state){
    const speakers=state.sections.find(x=>x.id==='speakers')?.speakers||[];const speakerMap=Object.fromEntries(speakers.map(x=>[x.id,x]));const groups=Object.fromEntries((s.agendaGroups||[]).map(x=>[x.id,x]));
    const activeGroupIds=new Set((s.agendaGroups||[]).filter(g=>g.active!==false).map(g=>g.id));const knownGroupIds=new Set((s.agendaGroups||[]).map(g=>g.id));const items=(s.agenda||[]).filter(x=>x.status!==false&&(!x.groupId||!knownGroupIds.has(x.groupId)||activeGroupIds.has(x.groupId)));if(!items.length)return '<div class="public-empty">Agenda will be announced soon.</div>';
    return `<div class="public-agenda">${items.map((x,i)=>{const names=(x.speakerIds||[]).map(id=>speakerMap[id]?.name).filter(Boolean);const t=x.start?niceTime(x.start):x.time||'';return `<article><time>${esc(t)}</time><span>${String(i+1).padStart(2,'0')}</span><div class="agenda-copy"><b>${esc(x.title)}</b>${groups[x.groupId]?.name?`<small class="agenda-group">${esc(groups[x.groupId].name)}</small>`:''}${x.summary?`<p>${esc(x.summary)}</p>`:''}${names.length?`<small class="agenda-speakers">With ${esc(names.join(', '))}</small>`:''}</div></article>`}).join('')}</div>`;
  }
  function renderGallery(s){
    const activeGroupIds=new Set((s.galleryGroups||[]).filter(g=>g.active!==false).map(g=>g.id));const knownGroupIds=new Set((s.galleryGroups||[]).map(g=>g.id));const imgs=(s.images||[]).filter(x=>x.status!==false&&x.image&&(!x.groupId||!knownGroupIds.has(x.groupId)||activeGroupIds.has(x.groupId)));if(!imgs.length)return `<div class="public-glimpse"><div><p>${esc(s.body)}</p></div><div class="glimpse-grid"><span></span><span></span><span></span></div></div>`;
    return `<div class="public-gallery-intro"><p>${esc(s.body)}</p></div><div class="public-gallery-grid">${imgs.map((x,i)=>`<figure><img src="${esc(x.image)}" alt="${esc(x.title||'Event image')}"><figcaption><b>${esc(x.title||'Event highlight')}</b>${x.socialHandle?`<span>${esc(x.socialHandle)}</span>`:''}</figcaption></figure>`).join('')}</div>`;
  }
  function renderContacts(s){
    const allGroups=s.contactGroups||[];const groups=allGroups.filter(g=>g.active!==false);const activeIds=new Set(groups.map(g=>g.id));const knownIds=new Set(allGroups.map(g=>g.id));const contacts=(s.contacts||[]).filter(c=>c.status!==false&&(!c.groupId||!knownIds.has(c.groupId)||activeIds.has(c.groupId)));if(!contacts.length)return '<div class="public-empty">Contact details will be available soon.</div>';
    const grouped=groups.map(g=>({g,items:contacts.filter(c=>(c.groupId||groups[0]?.id)===g.id)})).filter(x=>x.items.length);const other=contacts.filter(c=>!groups.some(g=>g.id===c.groupId));if(other.length)grouped.push({g:{name:'Contact'},items:other});
    return grouped.map(({g,items})=>`<div class="public-contact-group">${s.showGroupHeadings!==false&&grouped.length>1?`<h3>${esc(g.name)}</h3>`:''}<div class="public-contact">${items.map(c=>`<article><div class="contact-person"><b>${esc(c.name)}</b>${c.designation?`<span>${esc(c.designation)}</span>`:''}${c.company?`<small>${esc(c.company)}</small>`:''}</div>${c.email?`<a href="mailto:${esc(c.email)}"><small>Email</small><b>${esc(c.email)}</b></a>`:''}${c.phone?`<a href="tel:${esc(c.phone)}"><small>Phone</small><b>${esc(c.phone)}</b></a>`:''}</article>`).join('')}</div></div>`).join('');
  }
  function renderSection(s,state){if(!s.enabled)return'';const id=`section-${s.id}`;
    if(s.id==='overview'||s.id==='eventDescription')return `<section id="${id}" class="${sectionClass(s)}">${sectionHead(s)}<div class="public-prose">${esc(s.body)}</div></section>`;
    if(s.id==='keypoints'||s.id==='who'||s.id==='why')return `<section id="${id}" class="${sectionClass(s)}">${sectionHead(s)}${listCards(s.items)}</section>`;
    if(s.id==='speakers')return `<section id="${id}" class="${sectionClass(s)}">${sectionHead(s)}${renderSpeakers(s)}</section>`;
    if(s.id==='agenda')return `<section id="${id}" class="${sectionClass(s)}">${sectionHead(s)}${renderAgenda(s,state)}</section>`;
    if(s.id==='resources')return `<section id="${id}" class="${sectionClass(s)}">${sectionHead(s)}<div class="public-resources">${(s.resources||[]).map(r=>`<a href="${esc(r.url||'#')}" target="_blank" rel="noopener"><span>↗</span><b>${esc(r.title)}</b><small>Open resource</small></a>`).join('')}</div></section>`;
    if(s.id==='glimpse')return `<section id="${id}" class="${sectionClass(s)}">${sectionHead(s)}${renderGallery(s)}</section>`;
    if(s.id==='contact')return `<section id="${id}" class="${sectionClass(s)}">${sectionHead(s)}${renderContacts(s)}</section>`;
    if(s.id==='custom')return `<section id="${id}" class="${sectionClass(s)} custom-code-section">${sectionHead(s)}<div class="custom-code-output">${s.html||''}</div></section>`;
    return'';
  }
  function heroForm(state,cta){if(!state.form.showOnBanner)return `<div class="hero-cta-only"><a class="public-primary-cta ${cta.mode==='closed'?'disabled':''}" href="${cta.mode==='nominate'?'nominate.html':cta.mode==='closed'?'#':'#interest'}" data-hero-cta>${esc(cta.label)}</a><small>${esc(cta.sub)}</small></div>`;
    const f=state.form.fields||{};const fields=[];
    if(f.name)fields.push('<label><span>Name</span><input name="name" placeholder="Your name" required></label>');if(f.email)fields.push('<label><span>Work email</span><input name="email" type="email" placeholder="name@company.com" required></label>');if(f.mobile)fields.push('<label><span>Mobile</span><input name="mobile" placeholder="+91" required></label>');if(f.company)fields.push('<label><span>Company</span><input name="company" placeholder="Company name"></label>');if(f.designation)fields.push('<label><span>Designation</span><input name="designation" placeholder="Your role"></label>');
    return `<form class="hero-register" data-public-interest-form data-cta-mode="${cta.mode}"><div class="hero-register-title"><small>${cta.mode==='nominate'?'NOMINATIONS ARE OPEN':'STAY IN THE LOOP'}</small><b>${esc(cta.mode==='nominate'?'Start your nomination':state.form.title)}</b><span>${esc(cta.sub)}</span></div><div class="hero-register-fields">${fields.join('')}</div><button type="submit" ${cta.mode==='closed'?'disabled':''}>${esc(cta.label)} <span>→</span></button><small class="hero-consent">By continuing, you agree to receive award-related updates.</small></form>`;
  }
  function iconSvg(type){
    if(type==='location')return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="10" r="2.2" fill="currentColor"/></svg>`;
    if(type==='calendar')return `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M7 3v5M17 3v5M3.5 10h17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 14h2M12 14h2M16 14h1M8 17h2M12 17h2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`;
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h12v17H6z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
  }
  function themeVars(state){
    const navColor=state.nav.background||'#4b0d13',navOpacity=Math.max(12,Math.min(100,Number(state.nav.opacity||88))),navText=state.nav.textColor||'#ffffff';
    const vars=[`--p:${esc(state.theme.primary)}`,`--a:${esc(state.theme.accent)}`,`--surface:${esc(state.theme.surface)}`,`--overlay:${Number(state.header.overlay||58)/100}`,`--illustration-size:${Number(state.header.illustrationSize||48)}%`,`--branding-width:${Math.max(30,Math.min(100,Number(state.header.brandingWidth||84)))}%`,`--hero-min-height:${Math.max(540,Math.min(920,Number(state.header.heroHeight||690)))}px`,`--nav-color:${esc(navColor)}`,`--nav-opacity:${navOpacity/100}`,`--nav-text:${esc(navText)}`];
    const heroImage=state.header.desktopImage||'',mobileImage=state.header.mobileImage||'';
    if(heroImage)vars.push(`--hero-image:url('${heroImage.replace(/'/g,"%27")}')`);if(mobileImage)vars.push(`--hero-image-mobile:url('${mobileImage.replace(/'/g,"%27")}')`);
    return vars.join(';');
  }
  function publicPageHref(id){return({categories:'nominate.html',jury:'jury.html',guidelines:'entry-guidelines.html',criteria:'judging-criteria.html',terms:'terms.html',faq:'faq.html',contact:'contact.html',previous:'previous-edition.html',rewards:'rewards.html'})[id]||'website-preview.html'}
  function navItems(a,state,opts={}){
    const current=opts.currentPage||'home';const homeHref=current==='home'?'#home':'website-preview.html';
    const items=[{id:'home',label:'Home',href:homeHref,type:'home',active:current==='home'}];
    (state.sections||[]).filter(s=>s.enabled!==false&&s.showInNav!==false&&s.id!=='custom').forEach(s=>items.push({id:'section:'+s.id,label:s.navLabel||s.label,href:current==='home'?'#section-'+s.id:'website-preview.html#section-'+s.id,type:'section',active:false}));
    (state.publicPages||[]).filter(pg=>pg.enabled!==false&&pg.showInNav!==false).forEach(pg=>items.push({id:'page:'+pg.id,label:pg.navLabel||pg.label,href:publicPageHref(pg.id),type:'page',active:current===pg.id}));
    const map=Object.fromEntries(items.map(i=>[i.id,i]));const order=Array.isArray(state.nav.order)?state.nav.order:[];const ordered=[];order.forEach(id=>{if(map[id]&&!ordered.some(x=>x.id===id))ordered.push(map[id])});items.forEach(i=>{if(!ordered.some(x=>x.id===i.id))ordered.push(i)});return ordered;
  }
  function navigationMarkup(a,state,cta,opts={}){
    const logo=a?.logoData||state.header.thumbnailImage||'et-logo.jpg';
    const sponsor=state.header.sponsorLogo?`<div class="public-presented-by"><small>Presented by</small><img src="${esc(state.header.sponsorLogo)}" alt="Sponsor logo"></div>`:'';
    const items=navItems(a,state,opts), primary=items.slice(0,7), overflow=items.slice(7);
    const link=i=>`<a class="${i.active?'active':''}" href="${i.href}" data-nav-id="${esc(i.id)}">${esc(i.label)}</a>`;
    const more=overflow.length?`<details class="public-more"><summary>More <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></summary><div>${overflow.map(link).join('')}</div></details>`:'';
    const navLinks=primary.map(link).join('')+more;
    const navStyle=state.nav.style||'transparent',twoRow=state.nav.twoRow!==false;
    const current=opts.currentPage||'home';
    // Keep the public header focused on brand + navigation. Primary CTA lives in the hero,
    // so it never crowds the premium nav or reappears in compact sticky mode.
    const inner=`<div class="public-nav-primary"><a class="public-brand" href="website-preview.html"><img src="${esc(logo)}" alt="Logo"><span><b>${esc(a?.name||'ETB2B Awards')}</b><small>ETB2B Awards</small></span></a>${sponsor}<div class="public-nav-awards-pill"><span>ET B2B</span><b>Awards</b></div>${twoRow?'':`<nav class="public-nav-inline">${navLinks}</nav>`}</div>${twoRow?`<div class="public-nav-secondary"><nav>${navLinks}</nav></div>`:''}`;
    return `<header class="public-nav nav-${esc(navStyle)} ${twoRow?'two-row':'one-row'} ${state.nav.sticky?'sticky':''}" data-public-nav>${inner}</header>`;
  }
  function bindNavigation(root,opts={}){
    const nav=root?.querySelector?.('[data-public-nav]');if(!nav||opts.builder)return;
    let ticking=false;
    const update=()=>{
      const y=window.scrollY||document.documentElement.scrollTop||0;
      // At the top show the full premium header. After scrolling, keep a compact nav
      // permanently visible instead of hiding it based on scroll direction.
      nav.classList.toggle('is-condensed',y>=72);
      nav.classList.remove('is-away');
      ticking=false;
    };
    window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(update);ticking=true}},{passive:true});
    window.addEventListener('resize',()=>{if(!ticking){requestAnimationFrame(update);ticking=true}},{passive:true});
    update();
    nav.querySelectorAll('details.public-more').forEach(d=>{d.addEventListener('toggle',()=>{if(d.open)document.querySelectorAll('details.public-more[open]').forEach(x=>{if(x!==d)x.open=false})})});
  }
  function renderNav(host,a,state,opts={}){if(!host)return;const cta=ctaFor(a||{});host.innerHTML=navigationMarkup(a,state,cta,opts);bindNavigation(host,opts)}
  function render(container,a,state,opts={}){
    if(!container)return;
    const cta=ctaFor(a||{});
    const visibleSections=(state.sections||[]).filter(s=>s.enabled);
    const bottomSponsor=state.header.bottomSponsor?`<div class="public-powered-by"><small>Powered by</small><img src="${esc(state.header.bottomSponsor)}" alt="Sponsor logo"></div>`:'';
    const brandStrip=state.header.brandingBanner?`<div class="public-brand-strip"><img src="${esc(state.header.brandingBanner)}" alt="Award branding strip"></div>`:'';
    const heroIdentity=state.header.illustrationImage?`<div class="hero-branding-mark"><img src="${esc(state.header.illustrationImage)}" alt="${esc(a?.name||'Award')} branding"></div>`:`<h1>${esc(a?.name||'Your Award')}</h1>`;
    const heroPos=esc(state.header.heroPosition||'center');
    const nav=navigationMarkup(a,state,cta,{builder:opts.builder,currentPage:'home'});
    container.innerHTML=`<div class="public-site preset-${esc(state.theme.preset)} font-${esc(state.theme.font)} radius-${esc(state.theme.radius)} ${opts.builder?'builder-site-preview':''}" style="${themeVars(state)}">${brandStrip}${nav}<section class="public-hero hero-${esc(state.header.design)} hero-pos-${heroPos}" id="home"><div class="hero-overlay"></div><div class="hero-content"><div class="hero-copy"><small class="hero-kicker">${esc((a?.eventCategory||'ETB2B AWARDS').toUpperCase())}</small>${heroIdentity}<p>${esc(a?.description||'Recognising excellence, innovation and measurable impact.')}</p><div class="hero-meta"><span><i class="meta-icon">${iconSvg('location')}</i><b>${esc([a?.venue,a?.city].filter(Boolean).join(', ')||'Venue to be announced')}</b></span><span><i class="meta-icon">${iconSvg('calendar')}</i><b>${esc(a?.hasEventDates?niceDate(a.eventStart):'Event date to be announced')}</b></span>${a?.hasNominationDates?`<span><i class="meta-icon">${iconSvg('nomination')}</i><b>Nominations: ${esc(niceDate(a.nominationStart))} – ${esc(niceDate(a.nominationEnd))}</b></span>`:''}</div></div><div id="interest" class="hero-form-wrap">${heroForm(state,cta)}</div></div></section><main class="public-main">${visibleSections.map(s=>renderSection(s,state)).join('')}</main><section class="public-final-cta"><small>ETB2B AWARDS</small><h2>${esc(cta.mode==='nominate'?'Ready to make your work count?':'Be part of the next edition')}</h2><p>${esc(cta.sub)}</p><a href="${cta.mode==='nominate'?'nominate.html':cta.mode==='closed'?'#':'#interest'}" data-hero-cta>${esc(cta.label)} →</a></section><footer class="public-footer"><span>© ${new Date().getFullYear()} ${esc(a?.name||'ETB2B Awards')}</span>${bottomSponsor}<span>Powered by ETB2B Awards · Vikas Mishra</span></footer></div>`;
    if(opts.builder){container.querySelectorAll('a').forEach(x=>x.addEventListener('click',e=>e.preventDefault()));container.querySelectorAll('form').forEach(f=>f.addEventListener('submit',e=>e.preventDefault()));}
    else bindNavigation(container,opts);
  }
  window.ETB2BSite={defaultState,normalizeState,render,renderNav,navigationMarkup,navItems,publicPageHref,themeVars,bindNavigation,ctaFor,niceDate,niceTime,lines,uid};
})();
