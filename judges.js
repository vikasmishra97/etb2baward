(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const STORAGE_KEY = 'etb2b_awards_judges_v3';
  const ACTIVITY_KEY = 'etb2b_awards_judge_activity_v1';

  const categoryMeta = {
    'Best FinTech Startup': { entries:84, target:5, label:'Startup & scale-up' },
    'Best Digital Lending': { entries:63, target:4, label:'Lending & credit' },
    'Best AI in Financial Services': { entries:58, target:4, label:'AI & data' },
    'Best Payments Innovation': { entries:72, target:4, label:'Payments' }
  };

  const seedJudges = [
    {id:1,name:'Ananya Kapoor',initials:'AK',role:'Partner',company:'Vertex Ventures',expertise:['Startups','Payments'],assigned:42,reviewed:38,status:'active',conflict:0,categories:['Best FinTech Startup','Best Payments Innovation'],email:'ananya@vertex.vc',target:40,inviteExpiry:'14 days',requireConflict:true,autoReminder:true,lastReminder:null},
    {id:2,name:'Vikram Sethi',initials:'VS',role:'CFO',company:'Horizon Bank',expertise:['Lending','Risk'],assigned:48,reviewed:30,status:'active',conflict:0,categories:['Best Digital Lending'],email:'vikram@horizonbank.com',target:40,inviteExpiry:'14 days',requireConflict:true,autoReminder:true,lastReminder:null},
    {id:3,name:'Meera Nair',initials:'MN',role:'Founder',company:'FinEdge Labs',expertise:['FinTech','Startups'],assigned:24,reviewed:0,status:'inactive',conflict:0,categories:['Best FinTech Startup','Best Digital Lending'],email:'meera@finedge.io',target:30,inviteExpiry:'14 days',requireConflict:true,autoReminder:true,lastReminder:null},
    {id:4,name:'Rohit Nanda',initials:'RN',role:'Chief Data Officer',company:'AxisNova',expertise:['AI & Data','FinTech'],assigned:28,reviewed:22,status:'active',conflict:0,categories:['Best AI in Financial Services','Best FinTech Startup'],email:'rohit@axisnova.com',target:30,inviteExpiry:'14 days',requireConflict:true,autoReminder:true,lastReminder:null},
    {id:5,name:'Arjun Bose',initials:'AB',role:'VP Payments',company:'OrbitPay',expertise:['Payments','Cybersecurity'],assigned:32,reviewed:26,status:'active',conflict:1,categories:['Best Payments Innovation'],email:'arjun@orbitpay.com',target:40,inviteExpiry:'14 days',requireConflict:true,autoReminder:true,lastReminder:null},
    {id:6,name:'Priyanka Sen',initials:'PS',role:'Managing Director',company:'ScaleCraft',expertise:['Startups','Strategy'],assigned:26,reviewed:24,status:'active',conflict:0,categories:['Best FinTech Startup','Best Payments Innovation'],email:'priyanka@scalecraft.com',target:30,inviteExpiry:'14 days',requireConflict:true,autoReminder:true,lastReminder:null},
    {id:7,name:'Dev Khanna',initials:'DK',role:'Head of Credit',company:'LendOne',expertise:['Lending','Risk'],assigned:22,reviewed:18,status:'active',conflict:0,categories:['Best Digital Lending'],email:'dev@lendone.com',target:30,inviteExpiry:'14 days',requireConflict:true,autoReminder:true,lastReminder:null},
    {id:8,name:'Sana Khan',initials:'SK',role:'Cybersecurity Lead',company:'TrustGrid',expertise:['Cybersecurity','Payments'],assigned:20,reviewed:18,status:'invited',conflict:0,categories:['Best Payments Innovation'],email:'sana@trustgrid.io',target:30,inviteExpiry:'14 days',requireConflict:true,autoReminder:true,lastReminder:null}
  ];

  const clone = v => JSON.parse(JSON.stringify(v));
  function loadJudges(){
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(saved) && saved.length ? saved : clone(seedJudges);
    } catch { return clone(seedJudges); }
  }
  let judges = loadJudges();
  let currentDetailJudgeId = null;
  let currentAssignmentCategory = null;

  const toast = (msg) => {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(window.__judgeToast);
    window.__judgeToast=setTimeout(()=>t.classList.remove('show'),2200);
  };
  const save = (message) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(judges));
    renderAll();
    if (message) toast(message);
  };
  const logActivity = (type, text) => {
    let data=[];
    try { data=JSON.parse(localStorage.getItem(ACTIVITY_KEY)) || []; } catch {}
    data.unshift({type,text,at:new Date().toISOString()});
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(data.slice(0,100)));
  };
  const median = values => {
    if(!values.length) return 0;
    const s=[...values].sort((a,b)=>a-b), m=Math.floor(s.length/2);
    return s.length%2 ? s[m] : Math.round((s[m-1]+s[m])/2);
  };
  const escapeHtml = str => String(str ?? '').replace(/[&<>'"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const statusLabel = s => s==='active' ? 'Active' : s==='invited' ? 'Invitation pending' : s==='draft' ? 'Draft' : 'Not started';
  const progressClass = pct => pct===0 ? 'red' : pct<60 ? 'orange' : '';

  function categoryJudges(category){ return judges.filter(j=>j.categories.includes(category) && j.status!=='draft'); }
  function coverageScore(category){
    const meta=categoryMeta[category], count=categoryJudges(category).length;
    return Math.min(100, Math.round((count/meta.target)*100));
  }

  function renderKpis(){
    const active=judges.filter(j=>j.status==='active').length;
    const invited=judges.filter(j=>j.status==='invited').length;
    const inactive=judges.filter(j=>j.status==='inactive').length;
    const conflicts=judges.reduce((n,j)=>n+(Number(j.conflict)||0),0);
    const assigned=judges.reduce((n,j)=>n+(Number(j.assigned)||0),0);
    const reviewed=judges.reduce((n,j)=>n+(Number(j.reviewed)||0),0);
    const progress=assigned ? Math.round(reviewed/assigned*100) : 0;
    const categories=Object.keys(categoryMeta);
    const covered=categories.filter(c=>coverageScore(c)>=75).length;
    const coverage=Math.round(categories.reduce((n,c)=>n+coverageScore(c),0)/categories.length);
    const attention=inactive+conflicts+invited;

    $('#judgeCount').textContent=judges.length;
    $('#judgeCount')?.nextElementSibling && ($('#judgeCount').nextElementSibling.textContent=`${active} active · ${invited} invited${judges.some(j=>j.status==='draft')?' · '+judges.filter(j=>j.status==='draft').length+' draft':''}`);
    $('#reviewProgress').textContent=`${progress}%`;
    $('#reviewProgress')?.nextElementSibling && ($('#reviewProgress').nextElementSibling.textContent=`${reviewed} of ${assigned} reviews`);
    $('#attentionCount').textContent=attention;
    $('#attentionMeta').textContent=`${inactive} inactive · ${conflicts} conflict${conflicts===1?'':'s'} · ${invited} pending`;
    $('#coverageKpi').textContent=`${coverage}%`;
    $('#coverageMeta').textContent=`${covered} of ${categories.length} categories healthy`;
    $('#sideAttentionCount').textContent=attention;
    $('#roundReviews').textContent=`${reviewed} / ${assigned}`;
    $('#roundJudges').textContent=`${judges.filter(j=>j.assigned>0 && j.reviewed>=j.assigned).length} / ${judges.filter(j=>j.status==='active').length}`;
  }

  function renderJudges(){
    const q = ($('#judgeSearch')?.value || '').trim().toLowerCase();
    const status = $('#judgeStatusFilter')?.value || 'all';
    const category = $('#judgeCategoryFilter')?.value || 'all';
    const filtered = judges.filter(j => {
      const hay = [j.name,j.company,j.role,...(j.expertise||[])].join(' ').toLowerCase();
      return (!q || hay.includes(q)) && (status==='all'||j.status===status) && (category==='all'||j.categories.includes(category));
    });
    $('#judgeRows').innerHTML = filtered.map(j => {
      const pct = j.assigned ? Math.round(j.reviewed/j.assigned*100) : 0;
      return `<tr>
        <td><div class="judge-person"><div class="judge-avatar">${escapeHtml(j.initials)}</div><div><b>${escapeHtml(j.name)}</b><span>${escapeHtml(j.role)} · ${escapeHtml(j.company)}</span><div class="judge-status-line ${j.status}"><i></i>${statusLabel(j.status)}</div></div></div></td>
        <td><div class="expertise-tags">${(j.expertise||[]).map(x=>`<span>${escapeHtml(x)}</span>`).join('')}</div></td>
        <td><div class="judge-assigned"><b>${j.assigned}</b><span>${j.categories.length} categories</span></div></td>
        <td><div class="judge-progress-cell"><div class="judge-progress-top"><span>${j.reviewed} of ${j.assigned}</span><b>${pct}%</b></div><div class="judge-mini-progress ${progressClass(pct)}"><i style="width:${pct}%"></i></div></div></td>
        <td>${j.conflict ? `<span class="judge-conflict warn">! ${j.conflict} conflict${j.conflict>1?'s':''}</span>` : '<span class="judge-conflict">✓ Clear</span>'}</td>
        <td><button class="judge-more" data-judge="${j.id}" aria-label="Open ${escapeHtml(j.name)}">•••</button></td>
      </tr>`;
    }).join('') || `<tr><td colspan="6" class="judge-empty">No judges match these filters.</td></tr>`;
  }

  function renderCoverage(){
    const grid=$('#coverageGrid');
    grid.innerHTML=Object.entries(categoryMeta).map(([name,meta])=>{
      const members=categoryJudges(name), score=coverageScore(name);
      return `<article class="coverage-card"><div class="coverage-card-head"><div><h3>${name}</h3><p>${members.length} judges · ${meta.entries} entries</p></div><b class="coverage-score ${score<50?'danger-text':''}">${score}%</b></div><div class="coverage-people"><div class="mini-avatars">${members.slice(0,5).map(x=>`<i>${escapeHtml(x.initials)}</i>`).join('') || '<em>None</em>'}</div><small>${score<50?'Needs more judges':score<75?'Coverage needs attention':'Coverage looks good'}</small></div><button class="judge-link coverage-manage" data-assign="${escapeHtml(name)}">Manage assignments</button></article>`;
    }).join('');
  }

  function renderWorkload(){
    const sorted=[...judges].filter(j=>j.status!=='draft').sort((a,b)=>b.assigned-a.assigned);
    const max=Math.max(...sorted.map(j=>j.assigned),1);
    $('#workloadList').innerHTML=sorted.map(j=>`<div class="workload-row"><div class="judge-person"><div class="judge-avatar">${escapeHtml(j.initials)}</div><div><b>${escapeHtml(j.name)}</b><span>${escapeHtml(j.company)}</span></div></div><div class="workload-track"><i class="${j.assigned>=42?'high':''}" style="width:${Math.round(j.assigned/max*100)}%"></i></div><strong>${j.assigned}</strong></div>`).join('');

    const values=sorted.map(j=>j.assigned), med=median(values), top=sorted[0] || {assigned:0,name:'—'};
    const gap=Math.max(0, top.assigned-med);
    const score=top.assigned ? Math.max(55, Math.min(100, Math.round(100-(gap/Math.max(top.assigned,1)*70)))) : 100;
    $('#balanceScore').textContent=`${score}%`;
    $('#balanceBar').style.width=`${score}%`;
    $('#highestWorkload').textContent=top.assigned;
    $('#highestJudge').textContent=top.name;
    $('#medianWorkload').textContent=med;
    $('#balanceText').innerHTML=gap ? `Most judges are balanced, but <b>${escapeHtml(top.name)}</b> is carrying <b>${gap} more reviews</b> than the panel median.` : 'Workload is evenly distributed across the judging panel.';
  }

  function renderMatrix(){
    const tbody=$('.assignment-matrix tbody');
    if(!tbody) return;
    tbody.innerHTML=Object.entries(categoryMeta).map(([name,meta])=>{
      const members=categoryJudges(name), score=coverageScore(name);
      const risk=score<50?'Under-covered':score<75?'Watch':'Healthy';
      const riskClass=score<50?'danger':score>=75?'good':'';
      const rowClass=score<50?'risk-row':'';
      return `<tr class="${rowClass}"><td><b>${name}</b><span>${meta.label}</span></td><td>${meta.entries}</td><td><div class="mini-avatars">${members.slice(0,4).map(x=>`<i>${escapeHtml(x.initials)}</i>`).join('')}${members.length>4?`<em>+${members.length-4}</em>`:''}${!members.length?'<em>None</em>':''}</div></td><td><div class="matrix-bar ${score<50?'danger':''}"><i style="width:${score}%"></i></div><small>${members.length} judge${members.length===1?'':'s'}</small></td><td><span class="judge-pill ${riskClass}">${risk}</span></td><td><button class="judge-link" data-assign="${name}">${score<50?'Fix now':'Manage'}</button></td></tr>`;
    }).join('');
  }

  function renderAll(){ renderKpis(); renderJudges(); renderCoverage(); renderWorkload(); renderMatrix(); }
  function openDrawer(el){ if(!el)return; el.classList.add('open');el.setAttribute('aria-hidden','false'); }
  function closeDrawer(el){ if(!el)return; el.classList.remove('open');el.setAttribute('aria-hidden','true'); }
  function openModal(el){ if(!el)return; el.classList.add('open');el.setAttribute('aria-hidden','false'); }
  function closeModal(el){ if(!el)return; el.classList.remove('open');el.setAttribute('aria-hidden','true'); }

  function openDetail(id){
    const j=judges.find(x=>x.id===id); if(!j)return;
    currentDetailJudgeId=id;
    $('#detailName').textContent=j.name;
    $('#detailMeta').textContent=`${j.role} · ${j.company}`;
    const pct=j.assigned?Math.round(j.reviewed/j.assigned*100):0;
    $('#judgeDetailBody').innerHTML=`
      <div class="detail-hero"><div class="judge-avatar">${escapeHtml(j.initials)}</div><div><b>${escapeHtml(j.email)}</b><span>${(j.expertise||[]).map(escapeHtml).join(' · ')}</span></div></div>
      <div class="detail-stat-grid"><div class="detail-stat"><span>Assigned</span><b>${j.assigned}</b></div><div class="detail-stat"><span>Reviewed</span><b>${j.reviewed}</b></div><div class="detail-stat"><span>Progress</span><b>${pct}%</b></div></div>
      <div class="callout"><h3>✦ Judge insight</h3><p>${pct===0?`${escapeHtml(j.name.split(' ')[0])} has not started yet. A reminder is recommended today.`:pct<60?`${escapeHtml(j.name.split(' ')[0])} is behind the panel median. Consider a reminder or rebalancing.`:`${escapeHtml(j.name.split(' ')[0])} is on track and has a healthy review pace.`}</p></div>
      <div class="detail-section"><h3>Category assignments</h3>${j.categories.length?j.categories.map(c=>`<div class="detail-category"><b>${escapeHtml(c)}</b><span>${Math.max(1,Math.round(j.assigned/Math.max(j.categories.length,1)))} entries</span></div>`).join(''):'<div class="detail-category"><b>No categories assigned</b><span>Use Edit assignments</span></div>'}</div>
      <div class="detail-section"><h3>Conflict declaration</h3><div class="detail-category"><b>${j.conflict?`${j.conflict} declared conflict${j.conflict>1?'s':''}`:'No active conflicts'}</b><span>${j.conflict?'Needs reassignment':'Declaration completed'}</span></div></div>
      <div class="detail-section"><h3>Invitation & reminders</h3><div class="detail-category"><b>${statusLabel(j.status)}</b><span>${j.lastReminder?`Last reminder ${new Date(j.lastReminder).toLocaleString()}`:'No reminder sent yet'}</span></div></div>`;
    $('#detailReminder').dataset.name=j.name;
    openDrawer($('#detailDrawer'));
  }

  function resetInviteForm(){
    ['newJudgeName','newJudgeEmail','newJudgeCompany','newJudgeRole'].forEach(id=>{ if($('#'+id)) $('#'+id).value=''; });
    $$('#expertisePicker button').forEach(b=>b.classList.remove('active'));
    $$('#inviteCategories input').forEach(c=>c.checked=false);
    $('#targetWorkload').value='Up to 30 reviews';
    $('#inviteExpiry').value='14 days';
    $('#requireConflict').checked=true;
    $('#autoInviteReminder').checked=true;
    $('#matchText').textContent='Select expertise and ETB2B Awards will recommend categories.';
  }

  function parseTarget(){ return Number(($('#targetWorkload').value.match(/\d+/)||['30'])[0]); }
  function buildJudge(status){
    const name=$('#newJudgeName').value.trim(), email=$('#newJudgeEmail').value.trim();
    if(!name || !email) return {error:'Add judge name and email first'};
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return {error:'Enter a valid work email'};
    if(judges.some(j=>j.email.toLowerCase()===email.toLowerCase())) return {error:'A judge with this email already exists'};
    const initials=name.split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();
    const cats=$$('#inviteCategories input:checked').map(c=>c.value);
    const exp=$$('#expertisePicker button.active').map(b=>b.dataset.exp);
    return {judge:{id:Date.now(),name,initials,role:$('#newJudgeRole').value.trim()||'Industry Expert',company:$('#newJudgeCompany').value.trim()||'Independent',expertise:exp.length?exp:['FinTech'],assigned:0,reviewed:0,status,conflict:0,categories:cats,email,target:parseTarget(),inviteExpiry:$('#inviteExpiry').value,requireConflict:$('#requireConflict').checked,autoReminder:$('#autoInviteReminder').checked,lastReminder:null,createdAt:new Date().toISOString()}};
  }

  function openAssignmentEditor(category, judgeId=null){
    currentAssignmentCategory=category || null;
    const meta=category ? categoryMeta[category] : null;
    $('#assignmentTitle').textContent=category ? category : 'Edit judge assignments';
    $('#assignmentSubtitle').textContent=category ? `${meta.entries} entries · recommended ${meta.target} judges` : 'Choose categories for this judge.';
    const list=$('#assignmentEditorList');
    if(category){
      const selectedIds=new Set(categoryJudges(category).map(j=>j.id));
      list.dataset.mode='category'; list.dataset.judgeId='';
      list.innerHTML=judges.filter(j=>j.status!=='draft').map(j=>`<label class="assignment-editor-row"><input type="checkbox" value="${j.id}" ${selectedIds.has(j.id)?'checked':''}><span class="judge-avatar">${escapeHtml(j.initials)}</span><span class="assignment-person"><b>${escapeHtml(j.name)}</b><small>${escapeHtml(j.role)} · ${escapeHtml(j.company)} · ${(j.expertise||[]).map(escapeHtml).join(', ')}</small></span><span class="assignment-load">${j.assigned}/${j.target||30}</span></label>`).join('');
      const requiredReviews=meta.entries*3;
      const capacity=categoryJudges(category).reduce((n,j)=>n+(j.target||30),0);
      $('#assignmentSummary').innerHTML=`<div><span>Entries</span><b>${meta.entries}</b></div><div><span>3 reviews / entry</span><b>${requiredReviews}</b></div><div><span>Current capacity</span><b>${capacity}</b></div><div><span>Coverage</span><b>${coverageScore(category)}%</b></div>`;
    } else {
      const j=judges.find(x=>x.id===judgeId); if(!j)return;
      list.dataset.mode='judge'; list.dataset.judgeId=String(judgeId);
      list.innerHTML=Object.entries(categoryMeta).map(([name,meta])=>`<label class="assignment-editor-row category-row"><input type="checkbox" value="${escapeHtml(name)}" ${j.categories.includes(name)?'checked':''}><span class="assignment-person"><b>${escapeHtml(name)}</b><small>${meta.entries} entries · ${meta.label}</small></span><span class="assignment-load">${categoryJudges(name).length}/${meta.target} judges</span></label>`).join('');
      $('#assignmentSummary').innerHTML=`<div><span>Judge</span><b>${escapeHtml(j.name)}</b></div><div><span>Current workload</span><b>${j.assigned}</b></div><div><span>Target</span><b>${j.target||30}</b></div><div><span>Categories</span><b>${j.categories.length}</b></div>`;
    }
    openModal($('#assignmentModal'));
  }

  function saveAssignmentEditor(){
    const list=$('#assignmentEditorList'), mode=list.dataset.mode;
    if(mode==='category'){
      const category=currentAssignmentCategory;
      const selected=new Set($$('#assignmentEditorList input:checked').map(i=>Number(i.value)));
      judges.forEach(j=>{
        const has=j.categories.includes(category);
        if(selected.has(j.id) && !has) j.categories.push(category);
        if(!selected.has(j.id) && has) j.categories=j.categories.filter(c=>c!==category);
      });
      distributeCategoryWork(category);
      logActivity('assignment',`Updated ${category} assignments`);
      save(`${category} assignments saved`);
    } else if(mode==='judge'){
      const id=Number(list.dataset.judgeId), j=judges.find(x=>x.id===id); if(!j)return;
      const old=[...j.categories];
      j.categories=$$('#assignmentEditorList input:checked').map(i=>i.value);
      [...new Set([...old,...j.categories])].forEach(distributeCategoryWork);
      logActivity('assignment',`Updated assignments for ${j.name}`);
      save(`Assignments updated for ${j.name}`);
      if(currentDetailJudgeId===id) openDetail(id);
    }
    closeModal($('#assignmentModal'));
  }

  function distributeCategoryWork(category){
    const meta=categoryMeta[category], members=categoryJudges(category);
    if(!meta || !members.length) return;
    const perJudge=Math.ceil((meta.entries*3)/members.length);
    members.forEach(j=>{ j.assigned=Math.max(j.reviewed, Math.min(j.target||50, perJudge)); });
  }

  function rebalance(){
    const active=judges.filter(j=>j.status==='active' && j.categories.length);
    if(!active.length){ toast('No active judges available to rebalance'); return; }
    const total=active.reduce((n,j)=>n+j.assigned,0), target=Math.max(1,Math.round(total/active.length));
    active.forEach(j=>{ j.assigned=Math.max(j.reviewed, Math.min(j.target||50, target)); });
    logActivity('rebalance','Rebalanced judge workload');
    save('Assignments rebalanced and saved');
  }

  function smartAssign(){
    const rules={
      'Best FinTech Startup':['Startups','FinTech','Strategy'],
      'Best Digital Lending':['Lending','Risk'],
      'Best AI in Financial Services':['AI & Data','FinTech'],
      'Best Payments Innovation':['Payments','Cybersecurity']
    };
    let additions=0;
    Object.entries(categoryMeta).forEach(([category,meta])=>{
      let members=categoryJudges(category);
      if(members.length>=meta.target) return;
      const candidates=judges.filter(j=>j.status!=='draft' && !j.categories.includes(category)).map(j=>({j,score:(j.expertise||[]).filter(e=>rules[category].includes(e)).length*10 - j.assigned})).sort((a,b)=>b.score-a.score);
      for(const {j} of candidates){
        if(members.length>=meta.target) break;
        j.categories.push(category); additions++; members.push(j);
      }
      distributeCategoryWork(category);
    });
    logActivity('smart_assign',`Smart assign added ${additions} category assignments`);
    save(additions ? `Smart assign added ${additions} category assignments` : 'All categories already have healthy coverage');
  }

  renderAll();

  ['judgeSearch','judgeStatusFilter','judgeCategoryFilter'].forEach(id=>$('#'+id)?.addEventListener(id==='judgeSearch'?'input':'change',renderJudges));
  $$('.judge-view-tabs button').forEach(btn=>btn.addEventListener('click',()=>{
    $$('.judge-view-tabs button').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
    $$('.judge-view').forEach(v=>v.classList.remove('active')); $('#'+btn.dataset.view+'View').classList.add('active');
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
    const choose=contains=>{ const c=checks.find(x=>x.value.includes(contains)); if(c)c.checked=true; };
    if(exps.includes('AI & Data')) choose('AI');
    if(exps.includes('Payments')||exps.includes('Cybersecurity')) choose('Payments');
    if(exps.includes('Lending')) choose('Lending');
    if(exps.includes('Startups')||exps.includes('FinTech')) choose('Startup');
    $('#matchText').textContent=`Matched ${checks.filter(c=>c.checked).length} categories from ${exps.join(', ')} expertise.`;
    toast('Best-fit categories selected');
  });

  $('#sendInvite').addEventListener('click',()=>{
    const result=buildJudge('invited'); if(result.error){toast(result.error);return;}
    judges.push(result.judge);
    logActivity('invite',`Invited ${result.judge.name} (${result.judge.email})`);
    closeDrawer($('#inviteDrawer')); save(`Invitation saved for ${result.judge.name}`); resetInviteForm();
  });
  $('#saveDraftInvite').addEventListener('click',()=>{
    const result=buildJudge('draft'); if(result.error){toast(result.error);return;}
    judges.push(result.judge);
    logActivity('draft',`Saved judge draft for ${result.judge.name}`);
    closeDrawer($('#inviteDrawer')); save(`Judge draft saved for ${result.judge.name}`); resetInviteForm();
  });

  $('#autoBalance').addEventListener('click',rebalance);
  $('#rebalanceSide').addEventListener('click',rebalance);
  $('#smartAssign').addEventListener('click',smartAssign);
  $('#viewGaps').addEventListener('click',()=>{const b=$('[data-view="coverage"]');b.click();b.scrollIntoView({behavior:'smooth',block:'center'});});

  $('#sendReminders').addEventListener('click',()=>{
    const targets=judges.filter(j=>j.status==='invited'||j.status==='inactive');
    const now=new Date().toISOString(); targets.forEach(j=>j.lastReminder=now);
    logActivity('reminder',`Prepared reminders for ${targets.length} judges`);
    save(targets.length?`Reminder status updated for ${targets.length} judges`:'No judges currently need reminders');
  });
  document.addEventListener('click',e=>{
    const remind=e.target.closest('[data-remind]');
    if(remind){
      const name=remind.dataset.remind, j=judges.find(x=>x.name.startsWith(name));
      if(j){j.lastReminder=new Date().toISOString(); save(`Reminder status updated for ${j.name}`);} else toast(`Reminder prepared for ${name}`);
    }
    const assign=e.target.closest('[data-assign]'); if(assign) openAssignmentEditor(assign.dataset.assign);
  });

  $('#resolveConflict').addEventListener('click',()=>{
    const j=judges.find(x=>x.conflict>0);
    if(!j){toast('No unresolved conflicts');return;}
    j.conflict=Math.max(0,j.conflict-1);
    logActivity('conflict',`Resolved one conflict for ${j.name}`);
    save(`Conflict resolved for ${j.name}; entry can now be reassigned`);
  });
  $('#resendInvites').addEventListener('click',()=>{
    const pending=judges.filter(j=>j.status==='invited'); const now=new Date().toISOString(); pending.forEach(j=>j.lastReminder=now);
    logActivity('invite_resend',`Resent ${pending.length} pending invitations`);
    save(pending.length?`${pending.length} pending invitation${pending.length===1?'':'s'} marked as resent`:'No pending invitations');
  });
  $('#detailReminder').addEventListener('click',()=>{
    const j=judges.find(x=>x.id===currentDetailJudgeId); if(!j)return;
    j.lastReminder=new Date().toISOString(); logActivity('reminder',`Reminder for ${j.name}`); save(`Reminder status updated for ${j.name}`); openDetail(j.id);
  });
  $('#editAssignments').addEventListener('click',()=>{ if(currentDetailJudgeId){ closeDrawer($('#detailDrawer')); openAssignmentEditor(null,currentDetailJudgeId); } });
  $('#saveAssignments').addEventListener('click',saveAssignmentEditor);
  $$('[data-close-assignment]').forEach(b=>b.addEventListener('click',()=>closeModal($('#assignmentModal'))));

  const portal=$('#portalModal');
  const openPortal=()=>openModal(portal);
  $('#previewPortal').addEventListener('click',openPortal); $('#portalCardPreview').addEventListener('click',openPortal);
  $$('[data-close-modal]').forEach(b=>b.addEventListener('click',()=>closeModal(portal)));
  $$('.portal-entry button').forEach(b=>b.addEventListener('click',()=>toast('Judge review screen preview opened')));

  const copilot=$('#copilotPanel');
  $('#openCopilot').addEventListener('click',()=>copilot.classList.toggle('open')); $('#closeCopilot').addEventListener('click',()=>copilot.classList.remove('open'));
  const answers={
    coverage:'Open Coverage to see live category coverage. Any category below 50% should be fixed before judging starts.',
    workload:'The Workload tab is calculated from the current saved assignments. Use Rebalance assignments to redistribute workloads while preserving completed reviews.',
    inactive:'Use Send reminders to mark reminders for invited or not-started judges. When a real mail API is connected, this same action can send the email.',
    conflict:'Use Resolve on the attention card. The conflict count is saved and the panel metrics update immediately.'
  };
  $$('[data-copilot]').forEach(b=>b.addEventListener('click',()=>$('#copilotAnswer').textContent=answers[b.dataset.copilot]));

  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeDrawer($('#inviteDrawer'));closeDrawer($('#detailDrawer'));closeModal(portal);closeModal($('#assignmentModal'));copilot.classList.remove('open');}});
})();
