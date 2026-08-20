(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const toast = (msg) => {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(window.__judgeToast); window.__judgeToast=setTimeout(()=>t.classList.remove('show'),1900);
  };

  let judges = [
    {id:1,name:'Ananya Kapoor',initials:'AK',role:'Partner',company:'Vertex Ventures',expertise:['Startups','Payments'],assigned:42,reviewed:38,status:'active',conflict:0,categories:['Best FinTech Startup','Best Payments Innovation'],email:'ananya@vertex.vc'},
    {id:2,name:'Vikram Sethi',initials:'VS',role:'CFO',company:'Horizon Bank',expertise:['Lending','Risk'],assigned:48,reviewed:30,status:'active',conflict:0,categories:['Best Digital Lending','Financial Inclusion'],email:'vikram@horizonbank.com'},
    {id:3,name:'Meera Nair',initials:'MN',role:'Founder',company:'FinEdge Labs',expertise:['FinTech','Startups'],assigned:24,reviewed:0,status:'inactive',conflict:0,categories:['Best FinTech Startup'],email:'meera@finedge.io'},
    {id:4,name:'Rohit Nanda',initials:'RN',role:'Chief Data Officer',company:'AxisNova',expertise:['AI & Data','FinTech'],assigned:28,reviewed:22,status:'active',conflict:0,categories:['Best AI in Financial Services','Best FinTech Startup'],email:'rohit@axisnova.com'},
    {id:5,name:'Arjun Bose',initials:'AB',role:'VP Payments',company:'OrbitPay',expertise:['Payments','Cybersecurity'],assigned:32,reviewed:26,status:'active',conflict:1,categories:['Best Payments Innovation'],email:'arjun@orbitpay.com'},
    {id:6,name:'Priyanka Sen',initials:'PS',role:'Managing Director',company:'ScaleCraft',expertise:['Startups','Strategy'],assigned:26,reviewed:24,status:'active',conflict:0,categories:['Best FinTech Startup','Best Payments Innovation'],email:'priyanka@scalecraft.com'},
    {id:7,name:'Dev Khanna',initials:'DK',role:'Head of Credit',company:'LendOne',expertise:['Lending','Risk'],assigned:22,reviewed:18,status:'active',conflict:0,categories:['Best Digital Lending'],email:'dev@lendone.com'},
    {id:8,name:'Sana Khan',initials:'SK',role:'Cybersecurity Lead',company:'TrustGrid',expertise:['Cybersecurity','Payments'],assigned:20,reviewed:18,status:'invited',conflict:0,categories:['Best Payments Innovation'],email:'sana@trustgrid.io'}
  ];

  const statusLabel = s => s==='active' ? 'Active' : s==='invited' ? 'Invitation pending' : 'Not started';
  const progressClass = pct => pct===0 ? 'red' : pct<60 ? 'orange' : '';

  function renderJudges(){
    const q = ($('#judgeSearch')?.value || '').trim().toLowerCase();
    const status = $('#judgeStatusFilter')?.value || 'all';
    const category = $('#judgeCategoryFilter')?.value || 'all';
    const filtered = judges.filter(j => {
      const hay = [j.name,j.company,j.role,...j.expertise].join(' ').toLowerCase();
      return (!q || hay.includes(q)) && (status==='all'||j.status===status) && (category==='all'||j.categories.includes(category));
    });
    $('#judgeRows').innerHTML = filtered.map(j => {
      const pct = j.assigned ? Math.round(j.reviewed/j.assigned*100) : 0;
      return `<tr>
        <td><div class="judge-person"><div class="judge-avatar">${j.initials}</div><div><b>${j.name}</b><span>${j.role} · ${j.company}</span><div class="judge-status-line ${j.status}"><i></i>${statusLabel(j.status)}</div></div></div></td>
        <td><div class="expertise-tags">${j.expertise.map(x=>`<span>${x}</span>`).join('')}</div></td>
        <td><div class="judge-assigned"><b>${j.assigned}</b><span>${j.categories.length} categories</span></div></td>
        <td><div class="judge-progress-cell"><div class="judge-progress-top"><span>${j.reviewed} of ${j.assigned}</span><b>${pct}%</b></div><div class="judge-mini-progress ${progressClass(pct)}"><i style="width:${pct}%"></i></div></div></td>
        <td>${j.conflict ? '<span class="judge-conflict warn">! 1 conflict</span>' : '<span class="judge-conflict">✓ Clear</span>'}</td>
        <td><button class="judge-more" data-judge="${j.id}" aria-label="Open ${j.name}">•••</button></td>
      </tr>`;
    }).join('') || `<tr><td colspan="6" style="text-align:center;padding:30px;color:#85899b">No judges match these filters.</td></tr>`;
  }

  function renderCoverage(){
    const data=[
      ['Best FinTech Startup','5 judges · 84 entries',100,'AK,RN,PS,MN,JL'],
      ['Best Digital Lending','3 judges · 63 entries',76,'VS,DK,LM'],
      ['Best Payments Innovation','4 judges · 72 entries',92,'AK,PS,AB,SK'],
      ['Best AI in Financial Services','1 judge · 58 entries',28,'RN'],
      ['Financial Inclusion','3 judges · 41 entries',82,'VS,PG,LM'],
      ['Best InsurTech','4 judges · 37 entries',95,'JL,PG,DK,SK']
    ];
    $('#coverageGrid').innerHTML=data.map(([name,meta,score,avatars])=>`<article class="coverage-card"><div class="coverage-card-head"><div><h3>${name}</h3><p>${meta}</p></div><b class="coverage-score" style="color:${score<50?'var(--danger)':'var(--brand)'}">${score}%</b></div><div class="coverage-people"><div class="mini-avatars">${avatars.split(',').map(x=>`<i>${x}</i>`).join('')}</div><small>${score<50?'Needs 2–3 more judges':'Coverage looks good'}</small></div></article>`).join('');
  }

  function renderWorkload(){
    const sorted=[...judges].sort((a,b)=>b.assigned-a.assigned);
    const max=Math.max(...sorted.map(j=>j.assigned),1);
    $('#workloadList').innerHTML=sorted.map(j=>`<div class="workload-row"><div class="judge-person"><div class="judge-avatar">${j.initials}</div><div><b>${j.name}</b><span>${j.company}</span></div></div><div class="workload-track"><i class="${j.assigned>=42?'high':''}" style="width:${Math.round(j.assigned/max*100)}%"></i></div><strong>${j.assigned}</strong></div>`).join('');
  }

  function openDrawer(el){el.classList.add('open');el.setAttribute('aria-hidden','false')}
  function closeDrawer(el){el.classList.remove('open');el.setAttribute('aria-hidden','true')}

  function openDetail(id){
    const j=judges.find(x=>x.id===id); if(!j)return;
    $('#detailName').textContent=j.name; $('#detailMeta').textContent=`${j.role} · ${j.company}`;
    const pct=j.assigned?Math.round(j.reviewed/j.assigned*100):0;
    $('#judgeDetailBody').innerHTML=`
      <div class="detail-hero"><div class="judge-avatar">${j.initials}</div><div><b>${j.email}</b><span>${j.expertise.join(' · ')}</span></div></div>
      <div class="detail-stat-grid"><div class="detail-stat"><span>Assigned</span><b>${j.assigned}</b></div><div class="detail-stat"><span>Reviewed</span><b>${j.reviewed}</b></div><div class="detail-stat"><span>Progress</span><b>${pct}%</b></div></div>
      <div class="callout"><h3>✦ Judge insight</h3><p>${pct===0?`${j.name.split(' ')[0]} has not started yet. A reminder is recommended today.`:pct<60?`${j.name.split(' ')[0]} is behind the panel median. Consider a reminder or rebalancing.`:`${j.name.split(' ')[0]} is on track and has a healthy review pace.`}</p></div>
      <div class="detail-section"><h3>Category assignments</h3>${j.categories.map(c=>`<div class="detail-category"><b>${c}</b><span>${Math.max(8,Math.round(j.assigned/j.categories.length))} entries</span></div>`).join('')}</div>
      <div class="detail-section"><h3>Conflict declaration</h3><div class="detail-category"><b>${j.conflict?'1 declared conflict':'No active conflicts'}</b><span>${j.conflict?'NovaPay · auto-excluded':'Declaration completed'}</span></div></div>
      <div class="detail-section"><h3>Recent activity</h3><div class="detail-timeline"><div>Signed in to judge portal<span>Today · 10:42 AM</span></div><div>Saved 4 review scores<span>Yesterday · 5:18 PM</span></div><div>Accepted judging invitation<span>12 Apr 2027</span></div></div></div>`;
    $('#detailReminder').dataset.name=j.name;
    openDrawer($('#detailDrawer'));
  }

  // initial render
  renderJudges(); renderCoverage(); renderWorkload();

  ['judgeSearch','judgeStatusFilter','judgeCategoryFilter'].forEach(id=>$('#'+id)?.addEventListener(id==='judgeSearch'?'input':'change',renderJudges));

  $$('.judge-view-tabs button').forEach(btn=>btn.addEventListener('click',()=>{
    $$('.judge-view-tabs button').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
    $$('.judge-view').forEach(v=>v.classList.remove('active'));
    $('#'+btn.dataset.view+'View').classList.add('active');
  }));

  $('#judgeRows').addEventListener('click',e=>{const b=e.target.closest('[data-judge]');if(b)openDetail(Number(b.dataset.judge));});
  $('#inviteJudge').addEventListener('click',()=>openDrawer($('#inviteDrawer')));
  $$('[data-close-drawer]').forEach(b=>b.addEventListener('click',()=>closeDrawer($('#inviteDrawer'))));
  $$('[data-close-detail]').forEach(b=>b.addEventListener('click',()=>closeDrawer($('#detailDrawer'))));

  $$('#expertisePicker button').forEach(b=>b.addEventListener('click',()=>b.classList.toggle('active')));
  $('#matchCategories').addEventListener('click',()=>{
    const exps=$$('#expertisePicker button.active').map(b=>b.dataset.exp);
    if(!exps.length){toast('Select at least one expertise area');return;}
    const checks=$$('#inviteCategories input'); checks.forEach(c=>c.checked=false);
    if(exps.includes('AI & Data')) checks.find(c=>c.value.includes('AI')).checked=true;
    if(exps.includes('Payments')) checks.find(c=>c.value.includes('Payments')).checked=true;
    if(exps.includes('Lending')) checks.find(c=>c.value.includes('Lending')).checked=true;
    if(exps.includes('Startups')||exps.includes('FinTech')) checks.find(c=>c.value.includes('Startup')).checked=true;
    $('#matchText').textContent=`Matched ${checks.filter(c=>c.checked).length || 1} categories from ${exps.join(', ')} expertise.`;
    toast('Best-fit categories selected');
  });

  $('#sendInvite').addEventListener('click',()=>{
    const name=$('#newJudgeName').value.trim(); const email=$('#newJudgeEmail').value.trim();
    if(!name||!email){toast('Add judge name and email first');return;}
    const initials=name.split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();
    const cats=$$('#inviteCategories input:checked').map(c=>c.value);
    const exp=$$('#expertisePicker button.active').map(b=>b.dataset.exp);
    judges.push({id:Date.now(),name,initials,role:$('#newJudgeRole').value.trim()||'Industry Expert',company:$('#newJudgeCompany').value.trim()||'Independent',expertise:exp.length?exp:['FinTech'],assigned:0,reviewed:0,status:'invited',conflict:0,categories:cats,email});
    renderJudges();renderWorkload(); $('#judgeCount').textContent=18+(judges.length-8);
    closeDrawer($('#inviteDrawer')); toast(`Invitation sent to ${name}`);
    ['newJudgeName','newJudgeEmail','newJudgeCompany','newJudgeRole'].forEach(id=>$('#'+id).value='');
  });
  $('#saveDraftInvite').addEventListener('click',()=>toast('Judge invitation saved as draft'));

  function rebalance(){
    const high=judges.find(j=>j.name==='Vikram Sethi'); if(high)high.assigned=34;
    const spare=judges.find(j=>j.name==='Dev Khanna'); if(spare)spare.assigned=29;
    const spare2=judges.find(j=>j.name==='Priyanka Sen'); if(spare2)spare2.assigned=31;
    renderJudges();renderWorkload();
    $('#balanceScore').textContent='91%'; $('#balanceBar').style.width='91%';
    toast('Assignments rebalanced across 5 judges');
  }
  $('#autoBalance').addEventListener('click',rebalance); $('#rebalanceSide').addEventListener('click',rebalance);
  $('#smartAssign').addEventListener('click',()=>toast('Suggested 7 category assignments prepared'));
  $('#viewGaps').addEventListener('click',()=>{const b=$('[data-view="coverage"]');b.click();b.scrollIntoView({behavior:'smooth',block:'center'});});
  $('#sendReminders').addEventListener('click',()=>toast('Reminders prepared for 4 judges'));
  $$('[data-remind]').forEach(b=>b.addEventListener('click',()=>toast(`Reminder sent to ${b.dataset.remind}`)));
  $('#resolveConflict').addEventListener('click',()=>toast('Conflict opened for reassignment'));
  $('#resendInvites').addEventListener('click',()=>toast('3 invitations resent'));
  $('#detailReminder').addEventListener('click',e=>toast(`Reminder sent to ${e.currentTarget.dataset.name||'judge'}`));
  $('#editAssignments').addEventListener('click',()=>toast('Assignment editor opened'));
  $$('[data-assign]').forEach(b=>b.addEventListener('click',()=>toast(`${b.dataset.assign}: assignment editor opened`)));

  const modal=$('#portalModal');
  const openPortal=()=>{modal.classList.add('open');modal.setAttribute('aria-hidden','false')};
  const closePortal=()=>{modal.classList.remove('open');modal.setAttribute('aria-hidden','true')};
  $('#previewPortal').addEventListener('click',openPortal); $('#portalCardPreview').addEventListener('click',openPortal);
  $$('[data-close-modal]').forEach(b=>b.addEventListener('click',closePortal));

  const copilot=$('#copilotPanel');
  $('#openCopilot').addEventListener('click',()=>copilot.classList.toggle('open')); $('#closeCopilot').addEventListener('click',()=>copilot.classList.remove('open'));
  const answers={
    coverage:'Best AI in Financial Services is the priority: 58 entries are assigned to only 1 judge. I recommend adding Rohit Nanda plus 2 AI/data experts with workloads below 30.',
    workload:'Vikram Sethi is highest at 48 assigned reviews versus a panel median of 30. Moving 14 reviews to Dev and Priyanka would improve balance from 74% to about 91%.',
    inactive:'Meera Nair should be reminded first: 24 assigned reviews, 0 completed, and only 6 days remain. Three pending invitees should receive a separate acceptance reminder.',
    conflict:'Keep conflict handling automatic: judges declare conflicts before opening an entry, that entry is removed from their queue, and AwardFlow reassigns it to an eligible judge.'
  };
  $$('[data-copilot]').forEach(b=>b.addEventListener('click',()=>$('#copilotAnswer').textContent=answers[b.dataset.copilot]));

  // keyboard escape
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeDrawer($('#inviteDrawer'));closeDrawer($('#detailDrawer'));closePortal();copilot.classList.remove('open');}});
})();
