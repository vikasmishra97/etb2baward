/* AwardFlow shared shell, navigation and lifecycle UX (V19) */
(function(){
  'use strict';

  var currentPage=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  var sidebar=document.querySelector('.sidebar');
  var storedAward=safeJson('awardflow_new_award');
  var originalAward=sidebar&&sidebar.querySelector('.award-switch strong')?sidebar.querySelector('.award-switch strong').textContent.trim():'';
  var isCreatePage=currentPage==='create-award.html';
  /* Existing prototype pages carry a demo award. On the create screen, no saved award means no workspace yet. */
  var awardExists=!!storedAward || (!isCreatePage && !!originalAward && !/no award|create.*award/i.test(originalAward));
  var awardName=storedAward&&storedAward.name?storedAward.name:(awardExists?originalAward:'');

  var stageDefinitions={
    build:{label:'Build',subtitle:'Set up your award',icon:'build',description:'Create the foundation entrants will see and use.',steps:[
      {label:'Award',href:'award.html',icon:'award',desc:'Name, dates and basics'},
      {label:'Categories',href:'categories.html',icon:'categories',desc:'What people can enter'},
      {label:'Entry Form',href:'entry-form.html',icon:'form',desc:'Questions and evidence'},
      {label:'Pricing',href:'pricing.html',icon:'pricing',desc:'Fees, tax and promos'},
      {label:'Website',href:'website.html',icon:'website',desc:'Brand, preview and publish'}
    ]},
    grow:{label:'Grow',subtitle:'Get & convert entries',icon:'grow',description:'Bring in entrants, manage leads and recover incomplete entries.',steps:[
      {label:'Entries',href:'entries.html',icon:'entries',desc:'Nominations and payments'},
      {label:'Audience',href:'audience.html',icon:'audience',desc:'Segments and lead intent'},
      {label:'Campaigns',href:'campaigns.html',icon:'campaigns',desc:'Email and WhatsApp'},
      {label:'Automations',href:'automations.html',icon:'automations',desc:'Smart follow-up rules'}
    ]},
    decide:{label:'Decide',subtitle:'Judge & select',icon:'decide',description:'Run a fair judging process and finalize the best entries.',steps:[
      {label:'Judges',href:'judges.html',icon:'judges',desc:'Panel and assignments'},
      {label:'Scoring',href:'scoring.html',icon:'scoring',desc:'Criteria and fairness'},
      {label:'Shortlist',href:'shortlist.html',icon:'shortlist',desc:'Rank and lock finalists'},
      {label:'Winners',href:'winners.html',icon:'winners',desc:'Approve final decisions'}
    ]},
    celebrate:{label:'Celebrate',subtitle:'Publish & celebrate',icon:'celebrate',description:'Turn approved winners into a polished public experience.',steps:[
      {label:'Winner Gallery',href:'winner-gallery.html',icon:'gallery',desc:'Public winner stories'},
      {label:'Certificates',href:'certificates.html',icon:'certificate',desc:'Generate and verify'},
      {label:'Ceremony',href:'ceremony.html',icon:'ceremony',desc:'Guests, show and reveal'}
    ]}
  };

  var navGroups=[
    {label:'Build',stage:'build',items:stageDefinitions.build.steps},
    {label:'Grow',stage:'grow',items:stageDefinitions.grow.steps},
    {label:'Decide',stage:'decide',items:stageDefinitions.decide.steps},
    {label:'Celebrate',stage:'celebrate',items:stageDefinitions.celebrate.steps},
    {label:'Insights',items:[{label:'Reports',href:'reports.html',icon:'reports',desc:'Performance & ROI'}]}
  ];

  var pageStage=stageForPage(currentPage);
  var pageStageIndex=stageIndex(pageStage);

  if(sidebar){
    enhanceAwardSwitcher();
    renderNavigation(sidebar.querySelector('.nav'));
  }

  enhanceLifecycle();
  buildResponsiveShell();
  installSharedActions();

  function enhanceAwardSwitcher(){
    var el=sidebar.querySelector('.award-switch');
    if(!el)return;
    el.classList.add('award-switch-v19');
    if(awardExists){
      el.innerHTML=''+
        '<div class="award-switch-kicker"><small>Current award</small><span><i></i> LIVE</span></div>'+
        '<a class="award-switch-main" href="award.html"><strong id="sideAwardName">'+escapeHtml(awardName||'Current award')+'</strong><em>Open award workspace</em><b aria-hidden="true">›</b></a>'+
        '<a class="award-switch-new" href="create-award.html">'+iconSvg('plus')+'<span>Create another award</span></a>';
    }else{
      el.classList.add('empty-award');
      el.innerHTML=''+
        '<div class="award-empty-icon">'+iconSvg('award')+'</div>'+
        '<strong>No award selected</strong><p>Create an award to unlock Build, Grow, Decide and Celebrate.</p>'+
        '<a class="award-switch-create" href="create-award.html">'+iconSvg('plus')+'<span>Create award</span></a>';
    }
  }

  function renderNavigation(nav){
    if(!nav)return;
    var html='<a class="'+(currentPage==='index.html'?'active':'')+'" href="index.html">'+navIcon('home')+'<span class="nav-copy"><b>Home</b><small>Command center</small></span></a>';
    navGroups.forEach(function(group){
      html+='<div class="nav-label">'+escapeHtml(group.label)+'</div>';
      group.items.forEach(function(item){
        var active=currentPage===item.href.toLowerCase();
        html+='<a class="'+(active?'active':'')+'" href="'+item.href+'" data-workspace-link="1" data-stage="'+(group.stage||'')+'">'+navIcon(item.icon)+'<span class="nav-copy"><b>'+escapeHtml(item.label)+'</b><small>'+escapeHtml(item.desc||'')+'</small></span><span class="nav-arrow">›</span></a>';
      });
    });
    html+='<div class="nav-label nav-label-system">Workspace</div><a class="'+(currentPage==='settings.html'?'active':'')+'" href="settings.html" data-workspace-link="1">'+navIcon('settings')+'<span class="nav-copy"><b>Settings</b><small>Workspace preferences</small></span><span class="nav-arrow">›</span></a>';
    nav.innerHTML=html;
  }

  function enhanceLifecycle(){
    var oldBar=document.querySelector('.stagebar');
    if(!oldBar)return;

    var wrap=document.createElement('section');
    wrap.className='lifecycle-wrap';
    wrap.innerHTML=''+
      '<div class="lifecycle-head"><div><span>Award lifecycle</span><strong>Choose where you want to work</strong></div><p>'+iconSvg('tap')+' Click a stage to see its steps</p></div>'+
      '<div class="stagebar lifecycle-nav" role="tablist" aria-label="Award lifecycle"></div>'+
      '<div class="lifecycle-panel" aria-live="polite"></div>';
    oldBar.replaceWith(wrap);

    var nav=wrap.querySelector('.lifecycle-nav');
    var panel=wrap.querySelector('.lifecycle-panel');
    var stages=['build','grow','decide','celebrate'];
    var activeForDisplay=pageStage==='insights'||pageStage==='settings'?null:pageStage;

    nav.innerHTML=stages.map(function(key,idx){
      var s=stageDefinitions[key];
      var state='is-next',status='Next';
      if(pageStageIndex>idx || pageStage==='insights' || pageStage==='settings'){state='is-done';status='Done'}
      if(activeForDisplay===key){state='is-active';status='Current'}
      return '<button type="button" class="lifecycle-stage '+state+'" data-life-stage="'+key+'" role="tab" aria-selected="'+(activeForDisplay===key?'true':'false')+'">'+
        '<span class="lifecycle-stage-icon">'+iconSvg(s.icon)+'</span>'+
        '<span class="lifecycle-stage-copy"><b>'+s.label+'</b><small>'+s.subtitle+'</small></span>'+
        '<span class="lifecycle-stage-status">'+status+'</span><span class="lifecycle-stage-chevron">⌄</span>'+
      '</button>';
    }).join('');

    var initiallyOpen=activeForDisplay||'build';
    renderLifecyclePanel(initiallyOpen,false);

    nav.addEventListener('click',function(e){
      var btn=e.target.closest('[data-life-stage]');
      if(!btn)return;
      renderLifecyclePanel(btn.dataset.lifeStage,true);
      nav.querySelectorAll('.lifecycle-stage').forEach(function(x){x.classList.toggle('is-open',x===btn)});
    });

    function renderLifecyclePanel(key,scroll){
      var s=stageDefinitions[key];
      if(!s)return;
      nav.querySelectorAll('.lifecycle-stage').forEach(function(x){x.classList.toggle('is-open',x.dataset.lifeStage===key)});

      if(!awardExists){
        panel.innerHTML=''+
          '<div class="lifecycle-gate-inline"><span class="gate-inline-icon">'+iconSvg('lock')+'</span><div><b>Create an award first</b><p>Your workspace starts with an award. Add the name, dates and basics, then '+escapeHtml(s.label)+' will unlock automatically.</p></div><a class="btn primary" href="create-award.html">'+iconSvg('plus')+' Create award</a></div>';
      }else{
        var currentStepIndex=s.steps.findIndex(function(step){return currentPage===step.href.toLowerCase()});
        var selectedStageIndex=stageIndex(key);
        panel.innerHTML=''+
          '<div class="lifecycle-panel-head"><span class="lifecycle-panel-icon">'+iconSvg(s.icon)+'</span><div><b>'+s.label+'</b><p>'+s.description+'</p></div><span class="lifecycle-count">'+s.steps.length+' steps</span></div>'+
          '<div class="lifecycle-steps">'+s.steps.map(function(step,i){
            var cls='',state='Open';
            if(currentPage===step.href.toLowerCase()){cls='current';state='You are here'}
            else if(selectedStageIndex<pageStageIndex || (selectedStageIndex===pageStageIndex&&currentStepIndex>-1&&i<currentStepIndex)){cls='done';state='Done'}
            else if(selectedStageIndex>pageStageIndex){cls='available';state='Available'}
            return '<a class="lifecycle-step '+cls+'" href="'+step.href+'" data-workspace-link="1">'+
              '<span class="lifecycle-step-num">'+(cls==='done'?iconSvg('check'):String(i+1).padStart(2,'0'))+'</span>'+
              '<span class="lifecycle-step-icon">'+iconSvg(step.icon)+'</span>'+
              '<span class="lifecycle-step-copy"><b>'+step.label+'</b><small>'+step.desc+'</small></span>'+
              '<span class="lifecycle-step-state">'+state+'</span><span class="lifecycle-step-arrow">›</span>'+
            '</a>';
          }).join('')+'</div>';
      }
      if(scroll){setTimeout(function(){panel.scrollIntoView({behavior:'smooth',block:'nearest'})},30)}
    }
  }

  function buildResponsiveShell(){
    if(!sidebar||document.querySelector('.mobile-shell'))return;
    var activeLink=sidebar.querySelector('.nav a.active');
    var pageName=activeLink?activeLink.querySelector('.nav-copy b')&&activeLink.querySelector('.nav-copy b').textContent.trim():'AwardFlow';
    var shell=document.createElement('div');
    shell.className='mobile-shell';
    shell.innerHTML=''+
      '<header class="mobile-header">'+
        '<button class="mobile-icon-btn" type="button" data-mobile-menu aria-label="Open menu"><span></span><span></span><span></span></button>'+
        '<a class="mobile-brand" href="index.html"><span class="mobile-brandmark">A</span><span><b>AwardFlow</b><small>'+escapeHtml(pageName||'AwardFlow')+'</small></span></a>'+
        '<button class="mobile-avatar" type="button" data-toast="Profile menu">AK</button>'+
      '</header>'+
      '<div class="mobile-drawer-backdrop" data-mobile-close></div>'+
      '<aside class="mobile-drawer" aria-hidden="true">'+
        '<div class="mobile-drawer-head"><div class="mobile-brandmark">A</div><div><b>AwardFlow</b><small>Manager workspace</small></div><button type="button" data-mobile-close aria-label="Close menu">×</button></div>'+
        '<div class="mobile-drawer-award"></div>'+
        '<nav class="mobile-drawer-nav"></nav>'+
      '</aside>'+
      '<nav class="mobile-bottom-nav" aria-label="Mobile navigation">'+
        mobileNavItem('index.html','Home','home')+
        mobileNavItem('entries.html','Entries','entries')+
        mobileNavItem('campaigns.html','Grow','campaigns')+
        mobileNavItem('judges.html','Decide','decide')+
        '<button type="button" data-mobile-menu class="mobile-bottom-item"><span class="mobile-nav-icon">'+iconSvg('menu')+'</span><small>More</small></button>'+
      '</nav>';
    document.body.insertBefore(shell,document.body.firstChild);

    var drawerAward=shell.querySelector('.mobile-drawer-award');
    if(awardExists){
      drawerAward.innerHTML='<small>Current award</small><b>'+escapeHtml(awardName||'Current award')+'</b><span><i></i> LIVE</span>';
    }else{
      drawerAward.classList.add('empty');
      drawerAward.innerHTML='<small>Workspace</small><b>No award selected</b><a href="create-award.html">+ Create award</a>';
    }
    var drawerNav=shell.querySelector('.mobile-drawer-nav');
    renderNavigation(drawerNav);

    function setDrawer(open){
      shell.classList.toggle('menu-open',open);
      var drawer=shell.querySelector('.mobile-drawer');
      if(drawer)drawer.setAttribute('aria-hidden',open?'false':'true');
      document.body.classList.toggle('mobile-menu-open',open);
    }
    shell.addEventListener('click',function(e){
      if(e.target.closest('[data-mobile-menu]'))setDrawer(true);
      if(e.target.closest('[data-mobile-close]'))setDrawer(false);
    });
    document.addEventListener('keydown',function(e){if(e.key==='Escape')setDrawer(false)});
  }

  function installSharedActions(){
    document.addEventListener('click',function(e){
      var toastBtn=e.target.closest('[data-toast]');
      if(toastBtn){showToast(toastBtn.dataset.toast||'Saved')}

      var workspaceLink=e.target.closest('[data-workspace-link]');
      if(workspaceLink&&!awardExists){
        e.preventDefault();
        showAwardGate();
      }
    });
  }

  function showAwardGate(){
    var existing=document.querySelector('.award-gate');
    if(existing){existing.classList.add('open');return}
    var gate=document.createElement('div');
    gate.className='award-gate open';
    gate.innerHTML=''+
      '<div class="award-gate-backdrop" data-gate-close></div>'+
      '<div class="award-gate-card" role="dialog" aria-modal="true" aria-labelledby="awardGateTitle">'+
        '<button class="award-gate-x" type="button" data-gate-close aria-label="Close">×</button>'+
        '<span class="award-gate-icon">'+iconSvg('lock')+'</span><span class="award-gate-eyebrow">Workspace required</span>'+
        '<h2 id="awardGateTitle">Create an award first</h2><p>Build the award basics once. Then Entries, Grow, Decide and Celebrate will unlock and guide you through the next steps.</p>'+
        '<div class="award-gate-flow"><span>1</span><b>Create award</b><i>→</i><span>2</span><b>Continue lifecycle</b></div>'+
        '<div class="award-gate-actions"><button class="btn secondary" type="button" data-gate-close>Not now</button><a class="btn primary" href="create-award.html">'+iconSvg('plus')+' Create award</a></div>'+
      '</div>';
    document.body.appendChild(gate);
    gate.addEventListener('click',function(e){if(e.target.closest('[data-gate-close]'))gate.classList.remove('open')});
  }

  function showToast(message){
    var t=document.getElementById('toast');
    if(!t)return;
    t.textContent=message;t.classList.add('show');
    clearTimeout(showToast.timer);showToast.timer=setTimeout(function(){t.classList.remove('show')},1900);
  }

  function stageForPage(page){
    if(['create-award.html','award.html','categories.html','entry-form.html','pricing.html','website.html','index.html'].indexOf(page)>-1)return'build';
    if(['entries.html','audience.html','campaigns.html','automations.html'].indexOf(page)>-1)return'grow';
    if(['judges.html','scoring.html','shortlist.html','winners.html'].indexOf(page)>-1)return'decide';
    if(['winner-gallery.html','certificates.html','ceremony.html'].indexOf(page)>-1)return'celebrate';
    if(page==='reports.html')return'insights';
    if(page==='settings.html')return'settings';
    return'build';
  }
  function stageIndex(stage){return['build','grow','decide','celebrate'].indexOf(stage)}
  function safeJson(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch(e){return null}}
  function mobileNavItem(href,label,icon){
    var active=currentPage===href.toLowerCase();
    return '<a href="'+href+'" class="mobile-bottom-item'+(active?' active':'')+'" data-workspace-link="'+(href==='index.html'?'0':'1')+'"><span class="mobile-nav-icon">'+iconSvg(icon)+'</span><small>'+label+'</small></a>';
  }
  function navIcon(name){return '<span class="ico">'+iconSvg(name)+'</span>'}
  function escapeHtml(value){return String(value==null?'':value).replace(/[&<>'"]/g,function(ch){return{'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]})}

  function iconSvg(name){
    var paths={
      home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/>',
      award:'<path d="M12 3 20 8l-8 13L4 8z"/><path d="M4 8h16M8.2 8 12 3l3.8 5M8.2 8 12 21l3.8-13"/>',
      categories:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
      form:'<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
      pricing:'<path d="M7 4h10M7 8h10M8 4c0 8 8 4 8 9 0 3-2 5-6 7"/><path d="M7 12h5"/>',
      website:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.4 2.7 3.6 5.7 3.6 9S14.4 18.3 12 21M12 3C9.6 5.7 8.4 8.7 8.4 12S9.6 18.3 12 21"/>',
      entries:'<path d="M4 5h16v13H4z"/><path d="M8 5V3h8v2M8 12h8M12 8v8"/>',
      audience:'<path d="M16 20v-1.5c0-2.2-1.8-4-4-4H6c-2.2 0-4 1.8-4 4V20"/><circle cx="9" cy="7" r="4"/><path d="M22 20v-1.5c0-1.8-1.2-3.3-3-3.8M16 3.2a4 4 0 0 1 0 7.6"/>',
      campaigns:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
      automations:'<path d="m13 2-8 12h7l-1 8 8-12h-7z"/>',
      judges:'<path d="M12 3v18M6 6h12M5 6 2 12h6L5 6zm14 0-3 6h6l-3-6z"/><path d="M8 21h8"/>',
      decide:'<path d="M12 3v18M6 6h12M5 6 2 12h6L5 6zm14 0-3 6h6l-3-6z"/><path d="M8 21h8"/>',
      scoring:'<path d="m12 3 2.6 5.3 5.9.9-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.9z"/>',
      shortlist:'<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16.5 8.5"/>',
      winners:'<path d="M8 4h8v4a4 4 0 0 1-8 0V4z"/><path d="M8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 12v5M8 21h8M9 17h6"/>',
      gallery:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="2"/><path d="m4 17 5-5 4 4 2-2 5 5"/>',
      certificate:'<path d="M6 3h12v11H6z"/><path d="M9 7h6M9 10h4"/><path d="m10 14-2 7 4-2 4 2-2-7"/>',
      ceremony:'<path d="M4 20h16M6 20V8h12v12M9 8V4h6v4"/><path d="M9 13h6M12 10v6"/>',
      reports:'<path d="M4 20V10M10 20V4M16 20v-7M22 20V7"/>',
      settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1-2.8 2.8-.1-.1a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1.1 1.6V21h-4v-.1A1.8 1.8 0 0 0 8.8 19a1.8 1.8 0 0 0-2 .4l-.1.1-2.8-2.8.1-.1a1.8 1.8 0 0 0 .4-2A1.8 1.8 0 0 0 2.8 13H3V9h-.2a1.8 1.8 0 0 0 1.6-1.1 1.8 1.8 0 0 0-.4-2l-.1-.1L6.7 3l.1.1a1.8 1.8 0 0 0 2 .4A1.8 1.8 0 0 0 9.9 2H10v.1h4V2h.1a1.8 1.8 0 0 0 1.1 1.6 1.8 1.8 0 0 0 2-.4l.1-.1 2.8 2.8-.1.1a1.8 1.8 0 0 0-.4 2A1.8 1.8 0 0 0 21.2 9H21v4h.2a1.8 1.8 0 0 0-1.8 2z"/>',
      build:'<path d="m4 14 10-10 6 6-10 10H4z"/><path d="m12 6 6 6M4 20h6"/>',
      grow:'<path d="M4 18 10 12l4 4 6-8"/><path d="M15 8h5v5"/>',
      celebrate:'<path d="M8 4h8v4a4 4 0 0 1-8 0V4z"/><path d="M12 12v5M9 21h6M5 3l-2-2M19 3l2-2M4 10H1M23 10h-3"/>',
      plus:'<path d="M12 5v14M5 12h14"/>',
      check:'<path d="m5 12 4 4L19 6"/>',
      lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
      tap:'<path d="M9 11V5a2 2 0 1 1 4 0v6M13 9a2 2 0 0 1 4 0v3M17 10a2 2 0 0 1 4 0v4c0 5-3 7-7 7h-1c-2.7 0-4.4-1.1-5.8-3.1L4 13.5A2 2 0 0 1 7.2 11l1.8 2"/>',
      menu:'<path d="M4 6h16M4 12h16M4 18h16"/>'
    };
    return '<svg class="af-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name]||paths.award)+'</svg>';
  }
})();
