(()=>{
  const $=id=>document.getElementById(id);
  const savedAward=(()=>{try{return JSON.parse(localStorage.getItem('awardflow_new_award')||'null')}catch(e){return null}})();
  const awardName=savedAward?.name||'India FinTech Awards 2027';
  const awardSlug=savedAward?.slug||'india-fintech-awards-2027';
  const storeKey='awardflow_automations_'+awardSlug;
  const runsKey='awardflow_automation_runs_'+awardSlug;
  const settingsKey='awardflow_automation_settings_'+awardSlug;

  $('sideAwardName').textContent=awardName;
  $('crumbAwardName').textContent=awardName;

  const recipes=[
    {id:'incomplete-recovery',category:'entrant',icon:'↻',name:'Incomplete entry recovery',description:'Bring back entrants who started but did not submit.',trigger:'Entry incomplete for 3 days',goal:'Entry submitted',audience:'Entry started, incomplete',channels:'Email + WhatsApp',impact:'296 people · high intent',steps:[['trigger','Entry stays incomplete','3 days after last activity'],['email','Send email','Finish your nomination'],['wait','Wait','24 hours'],['whatsapp','Send WhatsApp','Quick reminder'],['goal','Stop when','Entry is submitted']]},
    {id:'payment-recovery',category:'payment',icon:'₹',name:'Payment recovery',description:'Recover submitted entries that are still awaiting payment.',trigger:'Payment pending for 6 hours',goal:'Payment received',audience:'Submitted, payment pending',channels:'Email + WhatsApp',impact:'₹36,000 recoverable',steps:[['trigger','Payment remains pending','6 hours after submission'],['email','Send email','Complete your payment'],['wait','Wait','18 hours'],['whatsapp','Send WhatsApp','Payment reminder'],['goal','Stop when','Payment is received']]},
    {id:'deadline-countdown',category:'entrant',icon:'◷',name:'Deadline countdown',description:'Create urgency at 7, 3 and 1 day before entries close.',trigger:'Deadline approaching',goal:'Entry submitted',audience:'Registered + incomplete',channels:'Email + WhatsApp',impact:'1,886 reachable contacts',steps:[['trigger','Deadline is','7 days away'],['email','Send email','7 days left'],['wait','Wait','4 days'],['email','Send email','3 days left'],['wait','Wait','2 days'],['whatsapp','Send WhatsApp','Last day reminder'],['goal','Stop when','Entry is submitted']]},
    {id:'registration-welcome',category:'entrant',icon:'★',name:'Registration welcome',description:'Guide new registrants directly to their first nomination.',trigger:'Person registers',goal:'Entry started',audience:'New registrations',channels:'Email',impact:'Always-on onboarding',steps:[['trigger','Person','Registers'],['email','Send email','Welcome + start entry link'],['goal','Stop when','Entry is started']]},
    {id:'judge-inactivity',category:'judge',icon:'♟',name:'Judge inactivity reminder',description:'Nudge judges who have not started assigned reviews.',trigger:'No scoring activity for 5 days',goal:'Review activity resumed',audience:'Inactive judges',channels:'Email',impact:'4 judges currently at risk',steps:[['trigger','Judge has no activity','5 days'],['email','Send email','Your reviews are waiting'],['wait','Wait','2 days'],['email','Send email','Second reminder'],['goal','Stop when','Judge scores an entry']]},
    {id:'winner-celebration',category:'winner',icon:'🏆',name:'Winner celebration pack',description:'Prepare winner communications as soon as results are confirmed.',trigger:'Winner confirmed',goal:'Winner notified',audience:'Confirmed winners',channels:'Email + assets',impact:'Certificate + social + email',steps:[['trigger','Winner status','Confirmed'],['email','Send email','Congratulations'],['action','Generate assets','Certificate + social creative'],['goal','Mark complete','Winner notified']]},
    {id:'past-entrant-return',category:'entrant',icon:'↗',name:'Past entrant re-engagement',description:'Invite previous participants to return for the new edition.',trigger:'New award opens',goal:'New entry started',audience:'Past-year entrants',channels:'Email',impact:'2,184 previous entrants',steps:[['trigger','Award status','Entries open'],['email','Send email','We are back'],['wait','Wait','5 days'],['email','Send email','Category suggestions'],['goal','Stop when','New entry is started']]}
  ];

  const defaultAutomations=[
    {id:'a1',recipeId:'registration-welcome',name:'Registration welcome',description:'Guide new registrants to start their first entry.',status:'active',attention:false,trigger:'Immediately after registration',audience:'New registrations',channels:'Email',goal:'Entry started',processed:682,converted:431,revenue:0,lastRun:'8 min ago',steps:recipes.find(r=>r.id==='registration-welcome').steps,guard:true,quiet:true},
    {id:'a2',recipeId:'incomplete-recovery',name:'Incomplete entry recovery',description:'Recover entrants who have not finished their form.',status:'active',attention:false,trigger:'Incomplete for 3 days',audience:'Entry started, incomplete',channels:'Email + WhatsApp',goal:'Entry submitted',processed:296,converted:38,revenue:76000,lastRun:'24 min ago',steps:recipes.find(r=>r.id==='incomplete-recovery').steps,guard:true,quiet:true},
    {id:'a3',recipeId:'payment-recovery',name:'Payment recovery',description:'Recover submitted entries waiting for payment.',status:'paused',attention:false,trigger:'Payment pending 6 hours',audience:'Submitted, payment pending',channels:'Email + WhatsApp',goal:'Payment received',processed:0,converted:0,revenue:0,lastRun:'Not running',steps:recipes.find(r=>r.id==='payment-recovery').steps,guard:true,quiet:true},
    {id:'a4',recipeId:'deadline-countdown',name:'Deadline countdown',description:'7-day, 3-day and last-day deadline sequence.',status:'active',attention:false,trigger:'Based on entry deadline',audience:'Registered + incomplete',channels:'Email + WhatsApp',goal:'Entry submitted',processed:914,converted:67,revenue:134000,lastRun:'2 hr ago',steps:recipes.find(r=>r.id==='deadline-countdown').steps,guard:true,quiet:true},
    {id:'a5',recipeId:'judge-inactivity',name:'Judge inactivity reminder',description:'Remind judges who have not started their reviews.',status:'active',attention:true,trigger:'No scoring for 5 days',audience:'Inactive judges',channels:'Email',goal:'Review activity resumed',processed:14,converted:8,revenue:0,lastRun:'Yesterday',steps:recipes.find(r=>r.id==='judge-inactivity').steps,guard:true,quiet:false},
    {id:'a6',recipeId:'winner-celebration',name:'Winner celebration pack',description:'Notify winners and generate their celebration assets.',status:'active',attention:false,trigger:'Winner confirmed',audience:'Confirmed winners',channels:'Email + assets',goal:'Winner notified',processed:12,converted:12,revenue:0,lastRun:'3 days ago',steps:recipes.find(r=>r.id==='winner-celebration').steps,guard:true,quiet:true},
    {id:'a7',recipeId:'past-entrant-return',name:'Past entrant re-engagement',description:'Invite last year’s entrants to return.',status:'active',attention:false,trigger:'Award opens',audience:'Past-year entrants',channels:'Email',goal:'Entry started',processed:500,converted:79,revenue:108000,lastRun:'5 days ago',steps:recipes.find(r=>r.id==='past-entrant-return').steps,guard:true,quiet:true}
  ];

  let automations=(()=>{try{return JSON.parse(localStorage.getItem(storeKey)||'null')}catch(e){return null}})()||defaultAutomations;
  let recentRuns=(()=>{try{return JSON.parse(localStorage.getItem(runsKey)||'null')}catch(e){return null}})()||[
    {id:1,name:'Incomplete entry recovery',detail:'Email sent to Riya Mehta',status:'sent',time:'8 min ago'},
    {id:2,name:'Registration welcome',detail:'Email sent to Arjun Rao',status:'sent',time:'14 min ago'},
    {id:3,name:'Deadline countdown',detail:'WhatsApp skipped · Frequency Guard',status:'skipped',time:'31 min ago'},
    {id:4,name:'Judge inactivity reminder',detail:'Reminder sent to jury member',status:'sent',time:'2 hr ago'},
    {id:5,name:'Incomplete entry recovery',detail:'Stopped · entry was submitted',status:'sent',time:'3 hr ago'}
  ];
  let settings=(()=>{try{return JSON.parse(localStorage.getItem(settingsKey)||'null')}catch(e){return null}})()||{frequencyGuard:true,quietHours:true};
  let activeFilter='all';
  let searchTerm='';
  let activeAutomationId=null;
  let libraryFilter='all';

  function persist(){localStorage.setItem(storeKey,JSON.stringify(automations));localStorage.setItem(runsKey,JSON.stringify(recentRuns));localStorage.setItem(settingsKey,JSON.stringify(settings));}
  function toast(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2200)}
  function formatNumber(n){return new Intl.NumberFormat('en-IN').format(n||0)}
  function formatMoneyShort(n){if(!n)return'₹0';if(n>=100000)return'₹'+(n/100000).toFixed(n%100000?2:0)+'L';if(n>=1000)return'₹'+(n/1000).toFixed(n%1000?1:0)+'K';return'₹'+formatNumber(n)}
  function iconFor(a){const recipe=recipes.find(r=>r.id===a.recipeId);return recipe?.icon||'⚡'}

  function updateStats(){
    const active=automations.filter(a=>a.status==='active').length;
    const processed=automations.reduce((s,a)=>s+(a.processed||0),0);
    const converted=automations.reduce((s,a)=>s+(a.converted||0),0);
    const revenue=automations.reduce((s,a)=>s+(a.revenue||0),0);
    $('activeAutomationCount').textContent=active;
    $('processedCount').textContent=formatNumber(processed);
    $('conversionCount').textContent=formatNumber(converted);
    $('revenueRecovered').textContent=formatMoneyShort(revenue);
    $('filterAllCount').textContent=automations.length;
    $('filterActiveCount').textContent=active;
    $('filterPausedCount').textContent=automations.filter(a=>a.status==='paused').length;
    $('filterAttentionCount').textContent=automations.filter(a=>a.attention).length;
  }

  function renderRecommended(){
    const featured=['incomplete-recovery','payment-recovery','judge-inactivity'];
    $('recommendedRecipes').innerHTML=featured.map(id=>{
      const r=recipes.find(x=>x.id===id);const existing=automations.find(a=>a.recipeId===id);const isOn=existing?.status==='active';
      return `<article class="at-recipe"><div class="at-recipe-top"><span class="at-recipe-icon">${r.icon}</span><div><h3>${r.name}</h3><p>${r.description}</p></div><span class="badge ${isOn?'green':''}">${isOn?'ON':'RECOMMENDED'}</span></div><div class="at-recipe-flow"><span>${r.steps[0][1]}</span><em>→</em><span>${r.steps[1][0]==='email'?'Email':r.steps[1][1]}</span><em>→</em><span>${r.goal}</span></div><div class="at-recipe-foot"><small>${r.impact}</small><button class="btn ${isOn?'secondary':'primary'}" data-recipe-action="${id}">${isOn?'View flow':'Enable'}</button></div></article>`
    }).join('');
  }

  function filteredAutomations(){return automations.filter(a=>{
    const matchesFilter=activeFilter==='all'||(activeFilter==='attention'?a.attention:a.status===activeFilter);
    const hay=(a.name+' '+a.description+' '+a.audience+' '+a.trigger).toLowerCase();
    return matchesFilter&&hay.includes(searchTerm.toLowerCase());
  })}

  function renderAutomations(){
    const rows=filteredAutomations();
    $('automationList').innerHTML=rows.length?rows.map(a=>{
      const rate=a.processed?Math.round((a.converted/a.processed)*100):0;
      return `<div class="at-auto-row" data-automation-id="${a.id}">
        <div class="at-auto-title"><span class="at-auto-icon">${iconFor(a)}</span><div><b>${a.name}</b><small>${a.description}</small></div></div>
        <div class="at-auto-meta"><label>Trigger</label><b>${a.trigger}</b></div>
        <div class="at-auto-meta"><label>Audience</label><b>${a.audience}</b></div>
        <div class="at-auto-result"><b>${a.converted||0}</b><small>${a.processed?rate+'% goal rate':'No runs yet'}</small></div>
        <div class="at-auto-status"><button class="at-toggle ${a.status==='active'?'on':''}" aria-label="Toggle ${a.name}" data-toggle-id="${a.id}"></button><button class="at-more-btn" data-open-id="${a.id}">•••</button></div>
      </div>`
    }).join(''):'<div class="at-empty">No automations match this view.</div>';
    updateStats();renderRecommended();
  }

  function renderRuns(){
    $('recentRuns').innerHTML=recentRuns.length?recentRuns.slice(0,7).map(r=>`<div class="at-run"><span class="at-run-icon ${r.status==='skipped'?'skipped':''}">${r.status==='skipped'?'—':'✓'}</span><div><b>${r.name}</b><p>${r.detail}</p></div><time>${r.time}</time></div>`).join(''):'<div class="at-empty" style="padding:18px">No recent demo runs.</div>';
  }

  function openDrawer(id){
    const a=automations.find(x=>x.id===id)||automations.find(x=>x.recipeId===id);
    if(!a)return;
    activeAutomationId=a.id;
    $('drawerTitle').textContent=a.name;
    $('drawerDescription').textContent=a.description;
    $('drawerEyebrow').textContent=(a.status==='active'?'ACTIVE':'PAUSED')+' AUTOMATION';
    $('drawerSummary').innerHTML=`<div><small>TRIGGER</small><b>${a.trigger}</b></div><div><small>AUDIENCE</small><b>${a.audience}</b></div><div><small>GOAL</small><b>${a.goal}</b></div>`;
    $('drawerFlow').innerHTML=(a.steps||[]).map((s,i)=>{
      const type=s[0],label=s[1],detail=s[2];let icon='⚡';
      if(type==='email')icon='✉'; else if(type==='whatsapp')icon='W'; else if(type==='wait')icon='◷'; else if(type==='goal')icon='✓'; else if(type==='action')icon='✦';
      const className=['email','whatsapp','wait','goal'].includes(type)?type:'';
      return `<div class="at-flow-node"><span class="at-flow-icon ${className}">${icon}</span><div><b>${label}</b><p>${detail}</p><small>${type==='goal'?'Person exits the flow immediately':'Step '+(i+1)}</small></div>${type==='goal'?'<span class="badge green">STOP RULE</span>':''}</div>`
    }).join('');
    const rate=a.processed?Math.round((a.converted/a.processed)*100):0;
    $('drawerPerformance').innerHTML=`<div><small>PEOPLE ENTERED</small><b>${formatNumber(a.processed||0)}</b><span>Last 30 days</span></div><div><small>GOAL COMPLETED</small><b>${formatNumber(a.converted||0)}</b><span>${rate}% goal rate</span></div><div><small>REVENUE</small><b>${formatMoneyShort(a.revenue||0)}</b><span>Attributed</span></div>`;
    $('drawerActiveToggle').checked=a.status==='active';
    $('drawerGuardToggle').checked=a.guard!==false;
    $('drawerQuietToggle').checked=a.quiet!==false;
    $('automationDrawer').classList.add('open');$('automationDrawer').setAttribute('aria-hidden','false');
  }
  function closeDrawer(){$('automationDrawer').classList.remove('open');$('automationDrawer').setAttribute('aria-hidden','true');activeAutomationId=null}

  function openModal(id){$(id).classList.add('open');$(id).setAttribute('aria-hidden','false')}
  function closeModal(id){$(id).classList.remove('open');$(id).setAttribute('aria-hidden','true')}

  function enableRecipe(recipeId){
    let a=automations.find(x=>x.recipeId===recipeId);const r=recipes.find(x=>x.id===recipeId);if(!r)return;
    if(a){a.status='active';a.attention=false;toast(`${a.name} turned on`)}else{
      a={id:'a'+Date.now(),recipeId:r.id,name:r.name,description:r.description,status:'active',attention:false,trigger:r.trigger,audience:r.audience,channels:r.channels,goal:r.goal,processed:0,converted:0,revenue:0,lastRun:'Not run yet',steps:r.steps,guard:true,quiet:true};automations.unshift(a);toast(`${r.name} added and turned on`)
    }
    persist();renderAutomations();return a;
  }

  function renderLibrary(){
    const list=recipes.filter(r=>libraryFilter==='all'||r.category===libraryFilter);
    $('libraryGrid').innerHTML=list.map(r=>{const existing=automations.find(a=>a.recipeId===r.id);const on=existing?.status==='active';return `<article class="at-library-card" data-category="${r.category}"><div><span class="at-recipe-icon">${r.icon}</span><div><h3>${r.name}</h3><p>${r.description}</p></div></div><div class="at-library-meta"><span>${r.trigger}</span><span>${r.channels}</span><span>Stop: ${r.goal}</span></div><button class="btn ${on?'secondary':'primary'}" data-library-enable="${r.id}">${on?'View automation':'Use this recipe'}</button></article>`}).join('');
  }

  $('automationFilters').addEventListener('click',e=>{const b=e.target.closest('button[data-filter]');if(!b)return;activeFilter=b.dataset.filter;[...$('automationFilters').querySelectorAll('button')].forEach(x=>x.classList.toggle('active',x===b));renderAutomations()});
  $('automationSearch').addEventListener('input',e=>{searchTerm=e.target.value.trim();renderAutomations()});
  $('automationList').addEventListener('click',e=>{
    const toggle=e.target.closest('[data-toggle-id]');if(toggle){e.stopPropagation();const a=automations.find(x=>x.id===toggle.dataset.toggleId);if(!a)return;a.status=a.status==='active'?'paused':'active';persist();renderAutomations();toast(`${a.name} ${a.status==='active'?'turned on':'paused'}`);return}
    const open=e.target.closest('[data-open-id]');if(open){e.stopPropagation();openDrawer(open.dataset.openId);return}
    const row=e.target.closest('[data-automation-id]');if(row)openDrawer(row.dataset.automationId);
  });

  $('recommendedRecipes').addEventListener('click',e=>{const b=e.target.closest('[data-recipe-action]');if(!b)return;const existing=automations.find(a=>a.recipeId===b.dataset.recipeAction);if(existing?.status==='active')openDrawer(existing.id);else{const a=enableRecipe(b.dataset.recipeAction);if(a)setTimeout(()=>openDrawer(a.id),150)}});
  $('enablePaymentRecipe').addEventListener('click',()=>{const a=enableRecipe('payment-recovery');if(a)setTimeout(()=>openDrawer(a.id),160)});
  document.addEventListener('click',e=>{const b=e.target.closest('[data-open-automation]');if(b){const a=automations.find(x=>x.recipeId===b.dataset.openAutomation);if(a)openDrawer(a.id);else{const created=enableRecipe(b.dataset.openAutomation);if(created)openDrawer(created.id)}}});

  document.querySelectorAll('[data-close-drawer]').forEach(el=>el.addEventListener('click',closeDrawer));
  $('drawerActiveToggle').addEventListener('change',()=>{});
  $('saveAutomationBtn').addEventListener('click',()=>{const a=automations.find(x=>x.id===activeAutomationId);if(!a)return;a.status=$('drawerActiveToggle').checked?'active':'paused';a.guard=$('drawerGuardToggle').checked;a.quiet=$('drawerQuietToggle').checked;if(a.quiet)a.attention=false;persist();renderAutomations();closeDrawer();toast('Automation changes saved')});
  $('duplicateAutomationBtn').addEventListener('click',()=>{const a=automations.find(x=>x.id===activeAutomationId);if(!a)return;const clone=JSON.parse(JSON.stringify(a));clone.id='a'+Date.now();clone.name=a.name+' copy';clone.status='paused';clone.processed=0;clone.converted=0;clone.revenue=0;clone.lastRun='Not run yet';automations.unshift(clone);persist();renderAutomations();closeDrawer();toast('Automation duplicated as paused')});
  $('testAutomationBtn').addEventListener('click',()=>{const a=automations.find(x=>x.id===activeAutomationId);if(!a)return;recentRuns.unshift({id:Date.now(),name:a.name,detail:'Test completed · no real message sent',status:'sent',time:'Just now'});persist();renderRuns();toast('Test run completed successfully')});

  $('libraryBtn').addEventListener('click',()=>{renderLibrary();openModal('libraryModal')});$('viewAllRecipes').addEventListener('click',()=>{renderLibrary();openModal('libraryModal')});
  $('libraryTabs').addEventListener('click',e=>{const b=e.target.closest('button[data-library-filter]');if(!b)return;libraryFilter=b.dataset.libraryFilter;[...$('libraryTabs').querySelectorAll('button')].forEach(x=>x.classList.toggle('active',x===b));renderLibrary()});
  $('libraryGrid').addEventListener('click',e=>{const b=e.target.closest('[data-library-enable]');if(!b)return;const existing=automations.find(a=>a.recipeId===b.dataset.libraryEnable);closeModal('libraryModal');if(existing?.status==='active')setTimeout(()=>openDrawer(existing.id),120);else{const a=enableRecipe(b.dataset.libraryEnable);if(a)setTimeout(()=>openDrawer(a.id),160)}});
  document.querySelectorAll('[data-close-modal]').forEach(el=>el.addEventListener('click',()=>closeModal(el.dataset.closeModal)));

  $('createAutomationBtn').addEventListener('click',()=>openModal('createModal'));
  $('showAiBuilderBtn').addEventListener('click',()=>{$('aiPromptBox').hidden=false;$('aiAutomationPrompt').focus()});
  $('cancelAiBuilderBtn').addEventListener('click',()=>{$('aiPromptBox').hidden=true});
  function syncStop(){const goal=$('newAutomationGoal').value;const map={entry:'Stop when entry is submitted',payment:'Stop when payment is received',registration:'Stop when an entry is started',judge:'Stop when judging activity resumes',winner:'Stop when winner is notified'};$('newStopCondition').textContent=map[goal]||'Stop when goal is complete'}
  $('newAutomationGoal').addEventListener('change',syncStop);
  $('generateAutomationBtn').addEventListener('click',()=>{
    const p=$('aiAutomationPrompt').value.toLowerCase();
    if(p.includes('payment')){$('newAutomationName').value='Smart payment recovery';$('newAutomationGoal').value='payment';$('newAutomationAudience').selectedIndex=1;$('newTrigger').selectedIndex=1;$('newDelay').value='6';$('firstTemplate').value='Complete your payment';$('secondTemplate').value='Payment reminder'}
    else if(p.includes('judge')){$('newAutomationName').value='Judge inactivity recovery';$('newAutomationGoal').value='judge';$('newAutomationAudience').selectedIndex=3;$('newTrigger').selectedIndex=3;$('newDelay').value='120';$('firstTemplate').value='Your reviews are waiting';$('secondChannel').value='Email';$('secondTemplate').value='Final jury reminder'}
    else{$('newAutomationName').value='Incomplete entry recovery';$('newAutomationGoal').value='entry';$('newAutomationAudience').selectedIndex=0;$('newTrigger').selectedIndex=0;$('newDelay').value=p.includes('2 day')?'48':'72';$('firstTemplate').value='Finish your nomination';$('secondTemplate').value='Quick reminder'}
    syncStop();$('aiPromptBox').hidden=true;toast('Copilot generated a recommended flow')
  });
  $('saveNewAutomationBtn').addEventListener('click',()=>{
    const name=$('newAutomationName').value.trim();if(!name){toast('Add an automation name first');$('newAutomationName').focus();return}
    const goalValue=$('newAutomationGoal').value;const goalMap={entry:'Entry submitted',payment:'Payment received',registration:'Entry started',judge:'Review activity resumed',winner:'Winner notified'};
    const delay=$('newDelay').selectedOptions[0].text;const trigger=$('newTrigger').value+' · '+delay;
    const steps=[['trigger',$('newTrigger').value,delay],[$('firstChannel').value==='Email'?'email':'whatsapp','Send '+$('firstChannel').value,$('firstTemplate').value||'Message'],['wait','Wait',$('betweenDelay').selectedOptions[0].text.replace('Wait ','')],[$('secondChannel').value==='Email'?'email':'whatsapp','Send '+$('secondChannel').value,$('secondTemplate').value||'Follow-up'],['goal','Stop when',goalMap[goalValue]]];
    const a={id:'a'+Date.now(),recipeId:null,name,description:'Custom workflow created for '+$('newAutomationAudience').value+'.',status:'active',attention:false,trigger,audience:$('newAutomationAudience').value,channels:$('firstChannel').value+' + '+$('secondChannel').value,goal:goalMap[goalValue],processed:0,converted:0,revenue:0,lastRun:'Not run yet',steps,guard:true,quiet:true};
    automations.unshift(a);persist();renderAutomations();closeModal('createModal');toast('Automation created and turned on');setTimeout(()=>openDrawer(a.id),160)
  });

  $('frequencyGuard').checked=settings.frequencyGuard;$('quietHours').checked=settings.quietHours;
  $('frequencyGuard').addEventListener('change',e=>{settings.frequencyGuard=e.target.checked;persist();toast(`Frequency Guard ${e.target.checked?'enabled':'disabled'}`)});
  $('quietHours').addEventListener('change',e=>{settings.quietHours=e.target.checked;persist();toast(`Quiet hours ${e.target.checked?'enabled':'disabled'}`)});
  $('clearRunsBtn').addEventListener('click',()=>{recentRuns=[];persist();renderRuns();toast('Demo activity cleared')});

  $('copilotBtn').addEventListener('click',()=>{$('copilotPanel').classList.toggle('open')});$('closeCopilotBtn').addEventListener('click',()=>$('copilotPanel').classList.remove('open'));
  document.querySelectorAll('[data-copilot-question]').forEach(b=>b.addEventListener('click',()=>{
    const answers={recovery:'Start with payment recovery. Those 18 people have already submitted, so they are your highest-intent audience and represent about ₹36,000 in recoverable revenue. Next, keep incomplete-entry recovery active for the 296 people who have already started.',frequency:'Your Frequency Guard is set to 24 hours, which is a good default. Keep WhatsApp quiet hours on and use goal-based stop rules so entrants leave a workflow immediately after submitting or paying.',judge:'Use a light-touch sequence: email after 5 days of inactivity, wait 2 days, then send one final reminder. Stop immediately when the judge scores any assigned entry.'};$('copilotAnswer').textContent=answers[b.dataset.copilotQuestion]||answers.recovery
  }));

  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeDrawer();['libraryModal','createModal'].forEach(id=>closeModal(id));$('copilotPanel').classList.remove('open')}});

  renderAutomations();renderRuns();renderLibrary();syncStop();
})();
