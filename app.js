(function(){
  const STORAGE_PREFIX='etb2b_';

  // Prototype flow only:
  // no authentication state, email, profile or portal selection is stored.
  // The login page appears only when opened directly or when Sign out is clicked.

  function safe(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}

  function toast(message){
    const t=document.getElementById('toast');
    if(!t) return;
    t.textContent=message||'Saved';
    t.classList.add('show');
    clearTimeout(window.__etToastTimer);
    window.__etToastTimer=setTimeout(()=>t.classList.remove('show'),1900);
  }

  const icons={
    home:'<path d="M3 10.8 12 3l9 7.8"/><path d="M5.5 9.7V21h13V9.7"/><path d="M9.5 21v-6h5v6"/>',
    award:'<circle cx="12" cy="8" r="5"/><path d="M8.7 12.1 7 21l5-2.6L17 21l-1.7-8.9"/><path d="m10.2 8 1.2 1.2L14 6.7"/>',
    grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    form:'<path d="M7 3h10a2 2 0 0 1 2 2v16H5V5a2 2 0 0 1 2-2Z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    rupee:'<path d="M6 4h12M6 8h12M7 4c6 0 7 8 0 8h2l8 8"/>',
    website:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 20V9"/>',
    entries:'<path d="M4 5h16v14H4z"/><path d="M4 13h4l2 3h4l2-3h4"/><path d="M8 8h8"/>',
    users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    zap:'<path d="M13 2 4 14h8l-1 8 9-12h-8l1-8Z"/>',
    judges:'<path d="m14 5 5 5M12 7l5 5M4 20l7-7M3 21l4-1-3-3-1 4Z"/><path d="M14.5 4.5 17 2l5 5-2.5 2.5"/>',
    star:'<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2L5.8 21 7 14.2 2 9.3l6.9-1L12 2Z"/>',
    shortlist:'<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3 6 1.3 1.3L6.8 4.8M3 12l1.3 1.3 2.5-2.5M3 18l1.3 1.3 2.5-2.5"/>',
    trophy:'<path d="M8 4h8v4a4 4 0 0 1-8 0V4Z"/><path d="M8 6H4v1a5 5 0 0 0 5 5M16 6h4v1a5 5 0 0 1-5 5M12 12v5M8 21h8M9 17h6v4"/>',
    sparkle:'<path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z"/><path d="m5 14 .8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14ZM19 12l.7 1.8 1.8.7-1.8.7L19 17l-.7-1.8-1.8-.7 1.8-.7L19 12Z"/>',
    certificate:'<path d="M6 3h12a2 2 0 0 1 2 2v12H4V5a2 2 0 0 1 2-2Z"/><path d="M8 7h8M8 11h5"/><circle cx="12" cy="17" r="3"/><path d="m10.2 19.4-.7 2.6 2.5-1 2.5 1-.7-2.6"/>',
    ceremony:'<path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3Z"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"/>',
    report:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    chevron:'<path d="m9 18 6-6-6-6"/>',
    collapse:'<path d="M15 18 9 12l6-6"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
    check:'<path d="m5 12 4 4L19 6"/>'
  };

  function icon(name,cls=''){
    return `<svg class="ui-icon ${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[name]||icons.star}</svg>`;
  }

  const navIconByHref={
    'index.html':'home','award.html':'award','categories.html':'grid','entry-form.html':'form','pricing.html':'rupee','website.html':'website','entries.html':'entries','audience.html':'users','campaigns.html':'mail','automations.html':'zap','judges.html':'judges','scoring.html':'star','shortlist.html':'shortlist','winners.html':'trophy','winner-gallery.html':'sparkle','certificates.html':'certificate','ceremony.html':'ceremony','reports.html':'report','settings.html':'settings'
  };

  function updateAwardName(name){
    if(!name) return;
    document.querySelectorAll('.award-switch strong,#sideAwardName,#crumbAward,#crumbAwardName').forEach(el=>{el.textContent=name});
    document.querySelectorAll('.crumb').forEach(el=>{
      if(el.textContent.includes('India FinTech Awards 2027')) el.textContent=el.textContent.replace('India FinTech Awards 2027',name);
    });
  }

  function buildAwardMenu(sidebar,awardSwitch){
    if(!sidebar || !awardSwitch || sidebar.querySelector('.award-menu')) return;
    const stored=localStorage.getItem(STORAGE_PREFIX+'current_award')||awardSwitch.querySelector('strong')?.textContent||'India FinTech Awards 2027';
    updateAwardName(stored);

    const meta=document.createElement('div');
    meta.className='award-switch-meta';
    meta.innerHTML='<span class="award-live-dot"></span><span>Live award</span><span class="award-switch-arrow">'+icon('chevron')+'</span>';
    awardSwitch.appendChild(meta);
    awardSwitch.setAttribute('role','button');
    awardSwitch.setAttribute('tabindex','0');
    awardSwitch.setAttribute('aria-expanded','false');

    const menu=document.createElement('div');
    menu.className='award-menu';
    menu.innerHTML=`
      <div class="award-menu-head"><span>Your awards</span><a href="create-award.html">${icon('plus')} New</a></div>
      <button class="award-option active" data-award="India FinTech Awards 2027"><span class="award-option-mark live"></span><span><b>India FinTech Awards 2027</b><small>Live · Entries open</small></span>${icon('check','award-check')}</button>
      <button class="award-option" data-award="ET Healthcare Awards 2027"><span class="award-option-mark draft"></span><span><b>ET Healthcare Awards 2027</b><small>Draft · 62% setup</small></span>${icon('check','award-check')}</button>
      <button class="award-option" data-award="ET DesignScape Awards 2026"><span class="award-option-mark closed"></span><span><b>ET DesignScape Awards 2026</b><small>Closed · Archive</small></span>${icon('check','award-check')}</button>
      <div class="award-menu-foot"><a href="settings.html">Manage award workspace <span>→</span></a></div>`;
    awardSwitch.insertAdjacentElement('afterend',menu);

    menu.querySelectorAll('.award-option').forEach(btn=>{
      if(btn.dataset.award===stored){
        menu.querySelectorAll('.award-option').forEach(x=>x.classList.remove('active'));
        btn.classList.add('active');
      }
      btn.addEventListener('click',e=>{
        e.stopPropagation();
        const name=btn.dataset.award;
        localStorage.setItem(STORAGE_PREFIX+'current_award',name);
        updateAwardName(name);
        menu.querySelectorAll('.award-option').forEach(x=>x.classList.toggle('active',x===btn));
        menu.classList.remove('open');
        awardSwitch.classList.remove('open');
        awardSwitch.setAttribute('aria-expanded','false');
        toast(`Switched to ${name}`);
      });
    });

    const toggle=()=>{
      const open=!menu.classList.contains('open');
      menu.classList.toggle('open',open);
      awardSwitch.classList.toggle('open',open);
      awardSwitch.setAttribute('aria-expanded',String(open));
    };
    awardSwitch.addEventListener('click',toggle);
    awardSwitch.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});
    document.addEventListener('click',e=>{
      if(!awardSwitch.contains(e.target)&&!menu.contains(e.target)){
        menu.classList.remove('open');awardSwitch.classList.remove('open');awardSwitch.setAttribute('aria-expanded','false');
      }
    });
  }

  function enhanceSidebar(){
    const sidebar=document.querySelector('.sidebar');
    const app=document.querySelector('.app');
    if(!sidebar||!app) return;

    const brand=sidebar.querySelector('.brand');
    if(brand && !brand.querySelector('.brand-copy')){
      const b=brand.querySelector('b');
      if(b){
        const wrap=document.createElement('div'); wrap.className='brand-copy';
        b.parentNode.insertBefore(wrap,b); wrap.appendChild(b);
        const sub=document.createElement('span'); sub.textContent='AWARDS OPERATING SYSTEM'; wrap.appendChild(sub);
      }
      const collapse=document.createElement('button');
      collapse.className='sidebar-collapse';collapse.type='button';collapse.setAttribute('aria-label','Collapse navigation');collapse.innerHTML=icon('collapse');
      brand.appendChild(collapse);
      collapse.addEventListener('click',()=>{
        const compact=!app.classList.contains('nav-compact');
        app.classList.toggle('nav-compact',compact);
        localStorage.setItem(STORAGE_PREFIX+'nav_compact',compact?'1':'0');
      });
    }
    if(localStorage.getItem(STORAGE_PREFIX+'nav_compact')==='1') app.classList.add('nav-compact');

    const awardSwitch=sidebar.querySelector('.award-switch');
    if(awardSwitch && !sidebar.querySelector('.new-award-cta,.nav-create-award')){
      const cta=document.createElement('a');
      cta.className='new-award-cta';cta.href='create-award.html';
      cta.innerHTML=`<span class="new-award-icon">${icon('plus')}</span><span><b>Create new award</b><small>Launch another program</small></span><span class="new-award-arrow">→</span>`;
      awardSwitch.parentNode.insertBefore(cta,awardSwitch);
    }
    buildAwardMenu(sidebar,awardSwitch);

    const nav=sidebar.querySelector('.nav');
    if(nav){
      nav.querySelectorAll('a').forEach(a=>{
        const href=(a.getAttribute('href')||'').split('/').pop();
        const ico=a.querySelector('.ico');
        if(ico){ ico.innerHTML=icon(navIconByHref[href]||'star'); }
        const label=a.querySelector('span:last-child')?.textContent?.trim()||'';
        a.dataset.navLabel=label;
      });

      const saved={};
      try{Object.assign(saved,JSON.parse(localStorage.getItem(STORAGE_PREFIX+'nav_groups')||'{}'));}catch(e){}
      nav.querySelectorAll('.nav-label').forEach((label,i)=>{
        if(label.dataset.enhanced) return;
        label.dataset.enhanced='1';
        const key=(label.textContent||`group-${i}`).trim().toLowerCase();
        label.dataset.groupKey=key;
        label.setAttribute('role','button');label.setAttribute('tabindex','0');
        label.innerHTML=`<span>${label.textContent.trim()}</span><span class="nav-label-chevron">${icon('chevron')}</span>`;
        const children=[];
        let n=label.nextElementSibling;
        while(n && !n.classList.contains('nav-label')){ if(n.matches('a')) children.push(n); n=n.nextElementSibling; }
        const containsActive=children.some(a=>a.classList.contains('active'));
        let collapsed=!!saved[key] && !containsActive;
        const apply=()=>{
          label.classList.toggle('collapsed',collapsed);
          children.forEach(a=>a.classList.toggle('nav-item-hidden',collapsed));
          label.setAttribute('aria-expanded',String(!collapsed));
        };
        apply();
        const toggle=()=>{collapsed=!collapsed;saved[key]=collapsed;localStorage.setItem(STORAGE_PREFIX+'nav_groups',JSON.stringify(saved));apply();};
        label.addEventListener('click',toggle);
        label.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});
      });
    }

    const topbar=document.querySelector('.topbar');
    if(topbar && !topbar.querySelector('.mobile-nav-toggle')){
      const mobile=document.createElement('button');mobile.className='mobile-nav-toggle';mobile.type='button';mobile.setAttribute('aria-label','Open navigation');mobile.innerHTML=icon('menu');
      topbar.insertBefore(mobile,topbar.firstChild);
      mobile.addEventListener('click',()=>document.body.classList.toggle('mobile-nav-open'));
      sidebar.addEventListener('click',e=>{if(window.innerWidth<=820 && e.target.closest('.nav a')) document.body.classList.remove('mobile-nav-open');});
    }

    const avatar=document.querySelector('.topbar .avatar');
    if(avatar && !document.querySelector('.topbar-user-name')){
      const adminName=document.createElement('span');
      adminName.className='topbar-user-name';
      adminName.textContent='Admin';
      avatar.insertAdjacentElement('beforebegin',adminName);
    }
    if(avatar && !document.querySelector('.profile-menu')){
      avatar.textContent='A';
      avatar.setAttribute('role','button');
      avatar.setAttribute('tabindex','0');
      avatar.title='Admin';
      const profile=document.createElement('div');
      profile.className='profile-menu';
      profile.innerHTML=`<div class="profile-head"><span class="profile-avatar">A</span><span><b>Admin</b><small>Admin ID login</small></span></div><a href="portal-select.html">Switch portal</a><a href="settings.html">Workspace settings</a><button type="button" id="profileSignOut">Sign out</button>`;
      document.body.appendChild(profile);
      const toggleProfile=()=>profile.classList.toggle('open');
      avatar.addEventListener('click',toggleProfile);
      avatar.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleProfile();}});
      profile.querySelector('#profileSignOut').addEventListener('click',()=>{
        location.href='login.html';
      });
      document.addEventListener('click',e=>{if(!avatar.contains(e.target)&&!profile.contains(e.target)) profile.classList.remove('open');});
    }

    const crumb=document.querySelector('.topbar .crumb');
    if(crumb && !document.querySelector('.topbar .portal-switcher')){
      const portalWrap=document.createElement('div');
      portalWrap.className='portal-switcher';
      portalWrap.innerHTML=`<button type="button" class="portal-switch-btn" aria-haspopup="true" aria-expanded="false"><span>Login Portal · </span><b>ETB2B</b><span class="portal-caret">▾</span></button><div class="portal-switch-menu"><div class="portal-switch-title">Switch portal</div><button type="button" data-portal="ET Retail">ET Retail</button><button type="button" data-portal="ET Auto">ET Auto</button><button type="button" data-portal="ET HealthWorld">ET HealthWorld</button><button type="button" data-portal="ET Telecom">ET Telecom</button><button type="button" data-portal="ET EnergyWorld">ET EnergyWorld</button><button type="button" data-portal="ET CIO">ET CIO</button><button type="button" data-portal="ET HRWorld">ET HRWorld</button><button type="button" data-portal="ET BFSI">ET BFSI</button><a href="portal-select.html">View all portals →</a></div>`;
      crumb.insertAdjacentElement('afterend',portalWrap);
      const switchBtn=portalWrap.querySelector('.portal-switch-btn');
      const switchMenu=portalWrap.querySelector('.portal-switch-menu');
      const closePortal=()=>{portalWrap.classList.remove('open');switchBtn.setAttribute('aria-expanded','false');};
      switchBtn.addEventListener('click',e=>{e.stopPropagation();const open=portalWrap.classList.toggle('open');switchBtn.setAttribute('aria-expanded',String(open));});
      switchMenu.addEventListener('click',e=>{const option=e.target.closest('[data-portal]');if(!option)return;switchBtn.querySelector('b').textContent=option.dataset.portal;closePortal();toast(`Switched to ${option.dataset.portal}`);});
      document.addEventListener('click',e=>{if(!portalWrap.contains(e.target))closePortal();});
    }

    const copilotBtn=[...document.querySelectorAll('.topbar [data-toast]')].find(el=>(el.textContent||'').includes('Ask Award Copilot'));
    if(copilotBtn && !document.querySelector('.copilot-drawer')){
      copilotBtn.removeAttribute('data-toast');
      copilotBtn.setAttribute('aria-expanded','false');
      const overlay=document.createElement('div');
      overlay.className='copilot-overlay';
      const drawer=document.createElement('aside');
      drawer.className='copilot-drawer';
      drawer.setAttribute('aria-label','Award Copilot');
      drawer.innerHTML=`<div class="copilot-head"><div><span class="copilot-kicker">AI ASSISTANT</span><h3>Ask Award Copilot</h3></div><button type="button" class="copilot-close" aria-label="Close Copilot">×</button></div><div class="copilot-body"><div class="copilot-welcome"><div class="copilot-spark">✦</div><div><b>How can I help?</b><p>This is a working prototype panel for your awards workspace.</p></div></div><div class="copilot-suggestions"><button type="button">Summarize current entries</button><button type="button">Suggest reminder campaign</button><button type="button">Review judging readiness</button></div><div class="copilot-response" id="copilotResponse">Choose a suggestion or type a question below.</div></div><form class="copilot-compose"><input type="text" placeholder="Ask about your award..." aria-label="Ask Award Copilot"><button type="submit">Send</button></form>`;
      document.body.append(overlay,drawer);
      const openCopilot=()=>{drawer.classList.add('open');overlay.classList.add('open');copilotBtn.setAttribute('aria-expanded','true');setTimeout(()=>drawer.querySelector('input')?.focus(),120);};
      const closeCopilot=()=>{drawer.classList.remove('open');overlay.classList.remove('open');copilotBtn.setAttribute('aria-expanded','false');};
      copilotBtn.addEventListener('click',openCopilot);
      drawer.querySelector('.copilot-close').addEventListener('click',closeCopilot);
      overlay.addEventListener('click',closeCopilot);
      document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCopilot();});
      drawer.querySelectorAll('.copilot-suggestions button').forEach(btn=>btn.addEventListener('click',()=>{drawer.querySelector('#copilotResponse').textContent=`Prototype response: ${btn.textContent}. Connect the real AI/API later to generate live workspace insights.`;}));
      drawer.querySelector('.copilot-compose').addEventListener('submit',e=>{e.preventDefault();const input=drawer.querySelector('input');const q=input.value.trim();if(!q)return;drawer.querySelector('#copilotResponse').textContent=`Prototype response for: “${q}”. The UI flow is working; a live AI service can be connected later.`;input.value='';});
    }
  }

  const stageMap={
    BUILD:{href:'award.html',icon:'award',sub:'Set up your award'},
    GROW:{href:'audience.html',icon:'users',sub:'Drive entries'},
    DECIDE:{href:'judges.html',icon:'judges',sub:'Judge & shortlist'},
    CELEBRATE:{href:'winner-gallery.html',icon:'trophy',sub:'Publish winners'}
  };

  function enhanceStages(){
    document.querySelectorAll('.stagebar').forEach(bar=>{
      bar.classList.add('journey-nav');
      bar.querySelectorAll('.stage').forEach(stage=>{
        const key=(stage.textContent||'').trim().toUpperCase();
        const conf=stageMap[key]; if(!conf) return;
        stage.dataset.stageKey=key;stage.dataset.href=conf.href;
        stage.setAttribute('role','link');stage.setAttribute('tabindex','0');
        stage.setAttribute('aria-label',`${key}: ${conf.sub}`);
        stage.innerHTML=`<span class="stage-icon">${icon(conf.icon)}</span><span class="stage-copy"><b>${key}</b><small>${conf.sub}</small></span><span class="stage-arrow">→</span>`;
        const go=()=>{window.location.href=conf.href;};
        stage.addEventListener('click',go);
        stage.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}});
      });
    });
  }

  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-toast]');if(!b)return;toast(b.dataset.toast||'Saved');
  });

  function init(){enhanceSidebar();enhanceStages();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
