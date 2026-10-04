(() => {
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const JUDGE_KEY='etb2b_awards_judges_v3', LEVEL_KEY='etb2b_awards_jury_levels_v1', NOM_KEY='etb2b_awards_nominations_v1', ASSIGN_KEY='etb2b_awards_jury_assignments_v1', PROGRESS_KEY='etb2b_awards_jury_progress_v1', REVIEW_KEY='etb2b_jury_reviews_v1';
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const read=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v??f}catch{return f}};
  const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const toast=m=>{const t=$('#toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(t._x);t._x=setTimeout(()=>t.classList.remove('show'),2400)};

  const categories=['Best FinTech Startup','Best Digital Lending','Best Payments Innovation','Best AI in Financial Services'];
  const categoryExpertise={
    'Best FinTech Startup':['Startups','FinTech'],
    'Best Digital Lending':['Lending','FinTech'],
    'Best Payments Innovation':['Payments','Cybersecurity','FinTech'],
    'Best AI in Financial Services':['AI & Data','FinTech']
  };

  const seedJudges=[
    {id:101,name:'Ananya Kapoor',email:'ananya@vertex.vc',company:'Vertex Ventures',role:'Partner',mobile:'',password:'Jury@101',level:1,expertise:['Startups','Payments'],categories:['Best FinTech Startup','Best Payments Innovation'],enabled:true,status:'active',requireConflict:true},
    {id:102,name:'Vikram Sethi',email:'vikram@horizonbank.com',company:'Horizon Bank',role:'CFO',mobile:'',password:'Jury@102',level:1,expertise:['Lending','FinTech'],categories:['Best Digital Lending'],enabled:true,status:'active',requireConflict:true},
    {id:103,name:'Rohit Nanda',email:'rohit@axisnova.com',company:'AxisNova',role:'CTO',mobile:'',password:'Jury@103',level:1,expertise:['AI & Data','Cybersecurity'],categories:['Best AI in Financial Services'],enabled:true,status:'active',requireConflict:true},
    {id:104,name:'Priyanka Sen',email:'priyanka@scalecraft.com',company:'ScaleCraft',role:'Founder',mobile:'',password:'Jury@104',level:2,expertise:['Startups','FinTech'],categories:['Best FinTech Startup'],enabled:true,status:'active',requireConflict:true}
  ];
  const seedLevels=[
    {level:1,name:'Jury Level 1',type:'verification',threshold:70,categories:[...categories],juryEvaluate:true,showPreviousScores:false},
    {level:2,name:'Jury Level 2',type:'evaluation',threshold:75,categories:[...categories],juryEvaluate:true,showPreviousScores:false},
    {level:3,name:'Jury Level 3',type:'final',threshold:80,categories:[...categories],juryEvaluate:true,showPreviousScores:true}
  ];
  const seedNominations=[
    {id:'IFT-2027-001',company:'NovaPay Technologies',nominee:'NovaPay Technologies',category:'Best FinTech Startup',submission:'Submitted',payment:'Paid'},
    {id:'IFT-2027-002',company:'FlowMoney Labs',nominee:'FlowMoney Labs',category:'Best Payments Innovation',submission:'Submitted',payment:'Paid'},
    {id:'IFT-2027-003',company:'CredAxis Finance',nominee:'CredAxis Finance',category:'Best Digital Lending',submission:'Submitted',payment:'Paid'},
    {id:'IFT-2027-004',company:'DataMint AI',nominee:'DataMint AI',category:'Best AI in Financial Services',submission:'Submitted',payment:'Paid'},
    {id:'IFT-2027-005',company:'PayOrbit Systems',nominee:'PayOrbit Systems',category:'Best Payments Innovation',submission:'Submitted',payment:'Paid'},
    {id:'IFT-2027-006',company:'LendSphere',nominee:'LendSphere',category:'Best Digital Lending',submission:'Submitted',payment:'Paid'},
    {id:'IFT-2027-007',company:'CapitalBridge',nominee:'CapitalBridge',category:'Best FinTech Startup',submission:'Submitted',payment:'Paid'},
    {id:'IFT-2027-008',company:'FinEdge Systems',nominee:'FinEdge Systems',category:'Best FinTech Startup',submission:'Submitted',payment:'Paid'},
    {id:'IFT-2027-009',company:'SecurePay Labs',nominee:'SecurePay Labs',category:'Best Payments Innovation',submission:'Submitted',payment:'Paid'},
    {id:'IFT-2027-010',company:'NeuralLedger',nominee:'NeuralLedger',category:'Best AI in Financial Services',submission:'Submitted',payment:'Paid'},
    {id:'IFT-2027-011',company:'CreditSpring',nominee:'CreditSpring',category:'Best Digital Lending',submission:'Submitted',payment:'Paid'},
    {id:'IFT-2027-012',company:'ScaleMint',nominee:'ScaleMint',category:'Best FinTech Startup',submission:'Submitted',payment:'Paid'}
  ];

  let judges=read(JUDGE_KEY,null)||seedJudges;
  let levels=read(LEVEL_KEY,null)||seedLevels;
  let nominations=read(NOM_KEY,null)||seedNominations;

  // Keep the Jury paid-nomination report in sync with the product's main
  // nomination report. A nomination enters this pool only after the form is
  // completed and payment has been received.
  const activeAward=read('etb2b_awards_new_award',{})||{};
  const slugify=v=>String(v||'demo').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'demo';
  const activeAwardSlug=activeAward.slug||slugify(activeAward.name);
  const nominationReportKey=`etb2b_public_nomination_reports_${activeAwardSlug}`;

  function normalisePaidNomination(n){
    if(!n||typeof n!=='object')return null;
    const status=String(n.status||'').toLowerCase();
    const paymentStatus=String(n.paymentStatus||'').toLowerCase();
    const paid=!!n.paid||!!n.paymentId||paymentStatus==='paid'||paymentStatus==='completed'||paymentStatus==='success';
    const formSubmitted=status==='submitted'||!!n.formCompleted;
    if(!paid||!formSubmitted)return null;
    const id=String(n.nominationId||n.id||'').trim();
    if(!id)return null;
    return {
      id,
      company:n.company||n.name||'Entrant',
      nominee:n.entrantName||n.name||n.company||'Entrant',
      category:n.category||'Uncategorised',
      submission:'Submitted',
      payment:'Paid',
      paymentId:n.paymentId||'',
      email:n.email||'',
      mobile:n.mobile||'',
      submittedAt:n.submittedAt||n.updatedAt||n.createdAt||''
    };
  }

  function syncPaidSubmittedFromReports(){
    const reportRows=read(nominationReportKey,[]);
    const starterRows=read('etb2b_public_nomination_starters',[]);
    const live=[...(Array.isArray(reportRows)?reportRows:[]),...(Array.isArray(starterRows)?starterRows:[])]
      .map(normalisePaidNomination).filter(Boolean);
    if(!live.length)return false;

    const byId=new Map(nominations.map(n=>[String(n.id),n]));
    live.forEach(n=>{
      byId.set(String(n.id),Object.assign({},byId.get(String(n.id))||{},n));
      if(n.category&&!categories.includes(n.category))categories.push(n.category);
    });
    nominations=[...byId.values()];
    levels.forEach(l=>{
      if(!Array.isArray(l.categories))l.categories=[];
      categories.forEach(c=>{if(!l.categories.includes(c))l.categories.push(c)});
    });
    return true;
  }

  syncPaidSubmittedFromReports();
  let assignments=read(ASSIGN_KEY,{});
  let progress=read(PROGRESS_KEY,{});
  let selectedLevel=1, editingJudgeId=null, assignmentTargets=[], assignmentLevel=1, assignmentMode='assign';
  write(JUDGE_KEY,judges);write(LEVEL_KEY,levels);write(NOM_KEY,nominations);write(ASSIGN_KEY,assignments);

  const currentLevel=()=>levels.find(l=>Number(l.level)===Number(selectedLevel))||levels[0];
  const levelJudges=()=>judges.filter(j=>Number(j.level||1)===Number(selectedLevel));
  const eligibleNominations=()=>{const base=nominations.filter(n=>n.submission==='Submitted'&&n.payment==='Paid'&&currentLevel().categories.includes(n.category));if(Number(selectedLevel)===1)return base;const ids=new Set(progress[`level${selectedLevel}_ids`]||[]);return base.filter(n=>ids.has(n.id))};
  // Common paid/submitted pool used by the reporting + assignment desk.
  // This intentionally does not depend on the currently selected jury level.
  const paidSubmittedNominations=()=>nominations.filter(n=>n.submission==='Submitted'&&n.payment==='Paid');
  const assignedIdsFor=(nomId)=>((assignments[String(selectedLevel)]||{})[nomId]||[]).map(String);
  const hasAnyAssignment=(nomId)=>levels.some(l=>assignmentIdsAtLevel(l.level,nomId).length>0);
  const nominationCountForJudge=id=>eligibleNominations().filter(n=>assignedIdsFor(n.id).includes(String(id))).length;
  const persist=()=>{write(JUDGE_KEY,judges);write(LEVEL_KEY,levels);write(NOM_KEY,nominations);write(ASSIGN_KEY,assignments);write(PROGRESS_KEY,progress)};

  function categoryMultiParts(type){
    const invite=type==='invite';
    return {
      wrap:$(invite?'#inviteCategoryMulti':'#levelCategoryMulti'),
      trigger:$(invite?'#inviteCategoryTrigger':'#levelCategoryTrigger'),
      menu:$(invite?'#inviteCategoryMenu':'#levelCategoryMenu'),
      search:$(invite?'#inviteCategorySearch':'#levelCategorySearch'),
      selectAll:$(invite?'#inviteCategorySelectAll':'#levelCategorySelectAll'),
      list:$(invite?'#inviteCategories':'#juryLevelCategories'),
      summary:$(invite?'#inviteCategorySummary':'#levelCategorySummary')
    };
  }
  function updateCategoryMultiSummary(type){
    const p=categoryMultiParts(type);if(!p.list||!p.summary)return;
    const boxes=[...p.list.querySelectorAll('input[type="checkbox"]')], checked=boxes.filter(i=>i.checked);
    p.summary.textContent=!checked.length?'None selected':checked.length===boxes.length&&boxes.length?`All selected (${checked.length})`:`${checked.length} selected`;
    if(p.selectAll){p.selectAll.checked=!!boxes.length&&checked.length===boxes.length;p.selectAll.indeterminate=checked.length>0&&checked.length<boxes.length}
  }
  function categoryTypeFromWrap(wrap){
    return wrap?.id==='inviteCategoryMulti'||wrap?.classList.contains('drawer-multiselect')?'invite':'level';
  }
  function closeCategoryMultis(except=null){
    document.querySelectorAll('.category-multiselect.open').forEach(w=>{
      if(w===except)return;
      w.classList.remove('open');
      w.querySelector('.category-multiselect-trigger')?.setAttribute('aria-expanded','false');
    });
  }
  function initCategoryMulti(type){
    const p=categoryMultiParts(type);if(!p.wrap||!p.trigger||!p.list)return;
    p.trigger.setAttribute('aria-haspopup','listbox');
    p.trigger.setAttribute('aria-expanded',p.wrap.classList.contains('open')?'true':'false');
    updateCategoryMultiSummary(type);
  }
  // One delegated controller handles both the Round Setup and Add Jury Member pickers.
  // It survives re-renders because it does not bind directly to replaced DOM nodes.
  document.addEventListener('click',e=>{
    const trigger=e.target.closest('.category-multiselect-trigger');
    if(trigger){
      e.preventDefault();e.stopPropagation();
      const wrap=trigger.closest('.category-multiselect');
      if(!wrap)return;
      const opening=!wrap.classList.contains('open');
      closeCategoryMultis(wrap);
      wrap.classList.toggle('open',opening);
      trigger.setAttribute('aria-expanded',opening?'true':'false');
      if(opening){
        const search=wrap.querySelector('.category-search input, input[id$="CategorySearch"]');
        setTimeout(()=>search?.focus(),0);
      }
      return;
    }
    if(!e.target.closest('.category-multiselect'))closeCategoryMultis();
  });
  document.addEventListener('input',e=>{
    const search=e.target.closest('.category-search input, input[id$="CategorySearch"]');
    if(!search)return;
    const wrap=search.closest('.category-multiselect');if(!wrap)return;
    const q=search.value.toLowerCase().trim();
    wrap.querySelectorAll('.category-multiselect-list label').forEach(l=>{
      const label=(l.dataset.categoryLabel||l.textContent||'').toLowerCase();
      l.style.display=!q||label.includes(q)?'flex':'none';
    });
  });
  document.addEventListener('change',e=>{
    const wrap=e.target.closest('.category-multiselect');if(!wrap)return;
    const type=categoryTypeFromWrap(wrap);
    if(e.target.matches('[id$="CategorySelectAll"], .category-select-all input')){
      wrap.querySelectorAll('.category-multiselect-list input[type="checkbox"]').forEach(i=>{
        const row=i.closest('label');if(!row||row.style.display!=='none')i.checked=e.target.checked;
      });
    }
    if(e.target.matches('input[type="checkbox"]'))updateCategoryMultiSummary(type);
  });
  function selectedNominationIds(){return $$('.nomination-select:checked').map(i=>i.value)}
  function updateSelectionBar(){const ids=selectedNominationIds(),bar=$('#selectionActionBar');if(!bar)return;$('#selectedNominationCount').textContent=ids.length;bar.classList.toggle('show',ids.length>0);bar.setAttribute('aria-hidden',ids.length?'false':'true');const all=$$('.nomination-select');if($('#selectAllNominations')){$('#selectAllNominations').checked=all.length>0&&ids.length===all.length;$('#selectAllNominations').indeterminate=ids.length>0&&ids.length<all.length}}
  function clearNominationSelection(){$$('.nomination-select').forEach(i=>i.checked=false);if($('#selectAllNominations'))$('#selectAllNominations').checked=false;updateSelectionBar()}
  function unassignSelected(){const ids=selectedNominationIds();if(!ids.length)return toast('Select at least one nomination');openUnassign(ids)}
  function openJuryLogin(id){const j=judges.find(x=>String(x.id)===String(id));if(!j)return;const url=`jury-login.html?email=${encodeURIComponent(j.email)}`;const w=window.open(url,'_blank');if(!w)location.href=url}
  function renderLevels(){
    $('#juryLevelCount').value=String(levels.length);
    $('#juryLevelTabs').innerHTML=levels.map(l=>`<button class="jury-level-tab ${Number(l.level)===Number(selectedLevel)?'active':''}" data-jury-level="${l.level}">${esc(l.name)} <small>${judges.filter(j=>Number(j.level)===Number(l.level)).length}</small></button>`).join('');
  }
  function renderConfig(){
    const l=currentLevel();
    $('#juryRoundType').value=l.type;$('#juryThreshold').value=l.threshold;
    $('#levelJuryEvaluate').checked=l.juryEvaluate!==false;$('#levelPreviousScores').checked=!!l.showPreviousScores;
    $('#juryLevelCategories').innerHTML=categories.map(c=>`<label data-category-label="${esc(c.toLowerCase())}"><input type="checkbox" value="${esc(c)}" ${l.categories.includes(c)?'checked':''}> <span>${esc(c)}</span></label>`).join('');
    updateCategoryMultiSummary('level');
    $('#levelJuryHeading').textContent=`${l.name} · ${levelJudges().length} jury member${levelJudges().length===1?'':'s'}`;
    $('#promoteQualified').textContent=selectedLevel<levels.length?'Promote qualified →':'Complete final round';
  }
  let showAllJury=false;
  function renderJury(){
    const q=($('#levelJurySearch').value||'').toLowerCase().trim();
    const rows=levelJudges().filter(j=>!q||`${j.name} ${j.email} ${j.company}`.toLowerCase().includes(q));
    const visibleRows=(q||showAllJury)?rows:rows.slice(0,5);
    const moreCount=Math.max(0,rows.length-visibleRows.length);
    const memberRows=visibleRows.map(j=>`<tr>
      <td><div class="jury-person"><span>${esc((j.name||'?').split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase())}</span><div><b>${esc(j.name)}</b><small>${esc(j.email)}</small></div></div></td>
      <td><div class="jury-category-chips">${(j.categories||[]).slice(0,2).map(c=>`<span>${esc(c.replace('Best ',''))}</span>`).join('')}${(j.categories||[]).length>2?`<em>+${j.categories.length-2}</em>`:''}</div></td>
      <td><b>${nominationCountForJudge(j.id)}</b> assigned</td>
      <td><label class="jury-status-toggle"><input type="checkbox" data-toggle-jury="${j.id}" ${j.enabled!==false?'checked':''}><span></span></label></td>
      <td><div class="jury-actions" aria-label="Jury actions">
        <button class="jury-icon-btn" data-edit-jury="${j.id}" title="Edit jury member" aria-label="Edit jury member"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4l11-11-4-4L4 16v4Zm13.5-16.5 3 3 1-1a1.4 1.4 0 0 0 0-2l-1-1a1.4 1.4 0 0 0-2 0l-1 1Z"/></svg></button>
        <button class="jury-icon-btn login-jury-btn" data-open-login="${j.id}" title="Open jury login" aria-label="Open jury login"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 17v-2h4V9h-4V7l-5 5 5 5Zm4-13h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5v-2h5V6h-5V4Z"/></svg></button>
        <button class="jury-icon-btn copy-login-btn" data-copy-login="${j.id}" title="Copy login credentials" aria-label="Copy login credentials"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3Zm2 0h3a2 2 0 0 1 2 2v3h3V5h-8v3Zm3 2H5v8h8v-8Z"/></svg></button>
      </div></td>
    </tr>`).join('');
    const toggleRow=rows.length>5&&!q?`<tr class="jury-more-row"><td colspan="5"><button class="jury-more-btn" data-toggle-jury-list="1">${showAllJury?'Show less':`View ${moreCount} more jury member${moreCount===1?'':'s'}`}</button></td></tr>`:'';
    $('#levelJuryRows').innerHTML=rows.length?memberRows+toggleRow:`<tr><td colspan="5"><div class="empty-state">No jury members in this level yet.</div></td></tr>`;
  }
  function renderNominationFilters(){
    const f=$('#nominationCategoryFilter'), old=f.value||'all';
    const reportCategories=[...new Set(paidSubmittedNominations().map(n=>n.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    f.innerHTML='<option value="all">All categories</option>'+reportCategories.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
    f.value=[...f.options].some(o=>o.value===old)?old:'all';
  }
  function assignmentHistory(nomId){
    return levels.map(l=>{const ids=((assignments[String(l.level)]||{})[nomId]||[]).map(String);return {level:l.level,assigned:ids.length,names:ids.map(id=>judges.find(j=>String(j.id)===id)?.name).filter(Boolean)}});
  }
  function renderNominations(){
    const q=($('#nominationSearch').value||'').toLowerCase().trim(), cat=$('#nominationCategoryFilter').value, af=$('#nominationAssignmentFilter').value;
    let rows=paidSubmittedNominations();
    rows=rows.filter(n=>!q||`${n.id} ${n.company} ${n.nominee} ${n.category} ${n.email||''}`.toLowerCase().includes(q));
    if(cat!=='all')rows=rows.filter(n=>n.category===cat);
    if(af==='assigned')rows=rows.filter(n=>hasAnyAssignment(n.id));
    if(af==='unassigned')rows=rows.filter(n=>!hasAnyAssignment(n.id));
    $('#nominationRows').innerHTML=rows.length?rows.map(n=>{
      const history=assignmentHistory(n.id);
      const historyHtml=history.map(h=>`<span class="assignment-level-badge ${h.assigned?'assigned':''}">L${h.level} ${h.assigned?`Assigned · ${h.assigned}`:'Not assigned'}</span>`).join('');
      const assignedHistory=history.filter(h=>h.assigned);
      const assignmentHtml=assignedHistory.length?`<div class="assignment-history-list">${assignedHistory.map(h=>`<div class="assignment-history-row"><span class="assignment-history-level">L${h.level}</span><div class="assigned-jury-list">${h.names.map(name=>`<span>${esc(name)}</span>`).join('')||'<span>Assigned jury</span>'}</div></div>`).join('')}</div>`:'<span class="unassigned-pill">Not assigned to any level</span>';
      return `<tr>
      <td><input type="checkbox" class="nomination-select" value="${esc(n.id)}"></td>
      <td><b class="nomination-id">${esc(n.id)}</b><div class="assignment-level-strip">${historyHtml}</div></td>
      <td><b>${esc(n.nominee||n.company)}</b><small>${esc(n.company)}${n.email?` · ${esc(n.email)}`:''}</small></td>
      <td><span class="category-badge">${esc(n.category)}</span></td>
      <td><span class="paid-pill">✓ Paid & submitted</span></td>
      <td>${assignmentHtml}</td>
      <td><button class="btn premium-secondary compact" data-assign-nomination="${esc(n.id)}">${assignedHistory.length?'Manage':'Assign'}</button></td>
    </tr>`}).join(''):`<tr><td colspan="7"><div class="empty-state">No paid & submitted nominations match these filters.</div></td></tr>`;
  }

  function bestJurorForCategory(category){
    const jurors=levelJudges().filter(j=>j.enabled!==false);
    if(!jurors.length)return null;
    return [...jurors].sort((a,b)=>{
      const ac=(a.categories||[]).includes(category)?3:0, bc=(b.categories||[]).includes(category)?3:0;
      const ae=(a.expertise||[]).filter(x=>(categoryExpertise[category]||[]).includes(x)).length, be=(b.expertise||[]).filter(x=>(categoryExpertise[category]||[]).includes(x)).length;
      return (bc+be)-(ac+ae) || nominationCountForJudge(a.id)-nominationCountForJudge(b.id);
    })[0];
  }
  function renderCategoryIntelligence(){
    const grid=$('#categoryIntelligenceGrid');if(!grid)return;
    const paid=paidSubmittedNominations();
    const reportCategories=[...new Set(paid.map(n=>n.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    grid.innerHTML=reportCategories.map(cat=>{
      const rows=paid.filter(n=>n.category===cat);
      const assignedAny=rows.filter(n=>hasAnyAssignment(n.id)).length;
      const unassigned=rows.length-assignedAny;
      const pct=rows.length?Math.round(assignedAny/rows.length*100):100;
      const levelDetails=levels.map(l=>{
        const count=rows.filter(n=>assignmentIdsAtLevel(l.level,n.id).length).length;
        const complete=rows.length>0&&count===rows.length;
        const partial=count>0&&!complete;
        return {level:l.level,count,complete,partial};
      });
      const levelStats=levelDetails.map(x=>`<div class="ai-round-chip ${x.complete?'complete':x.partial?'partial':'empty'}"><span class="ai-round-code">L${x.level}</span><span class="ai-round-count"><b>${x.count}</b>/${rows.length}</span><span class="ai-round-state" aria-hidden="true">${x.complete?'✓':x.partial?'◐':'○'}</span></div>`).join('');
      const nextGap=levelDetails.find(x=>!x.complete);
      const aiLabel=unassigned?'Needs assignment':nextGap?`Level ${nextGap.level} needs coverage`:'Fully covered';
      const aiText=unassigned?`${unassigned} paid nomination${unassigned===1?' is':'s are'} not assigned to any jury yet.`:nextGap?`${rows.length-nextGap.count} nomination${rows.length-nextGap.count===1?'':'s'} still need Level ${nextGap.level} jury assignment.`:'All paid nominations have jury coverage across every configured level.';
      const aiTone=unassigned?'attention':nextGap?'watch':'ready';
      return `<article class="category-intel-card report-category-card ai-report-card compact-ai-report-card">
        <div class="compact-ai-head">
          <div class="compact-ai-title"><span class="ai-category-orb" aria-hidden="true">✦</span><h3>${esc(cat)}</h3></div>
          <span class="ai-paid-pill"><b>${rows.length}</b> paid</span>
        </div>
        <div class="compact-ai-coverage">
          <div class="compact-ai-coverage-top"><strong>${pct}%</strong><span>${assignedAny} assigned · ${unassigned} open</span></div>
          <div class="ai-coverage-track"><span style="width:${pct}%"></span></div>
        </div>
        <div class="compact-ai-insight ${aiTone}" title="${esc(aiText)}"><span aria-hidden="true">✦</span><b>${esc(aiLabel)}</b></div>
        <div class="compact-ai-rounds">${levelStats}</div>
        <button class="category-view-btn compact-ai-view" data-view-category="${esc(cat)}" title="Open ${rows.length} nomination${rows.length===1?'':'s'}"><span>View</span><b>${rows.length}</b><span aria-hidden="true">→</span></button>
      </article>`;
    }).join('')||'<div class="empty-state">No paid & submitted nominations yet.</div>';
  }

  function updateRoundStatus(){
    const title=$('#roundStatusTitle'), text=$('#roundStatusText');if(!title||!text)return;
    const cats=currentLevel().categories.length, jurors=levelJudges().length;
    if(!cats){title.textContent='Select categories';text.textContent='This round needs at least one category.'}
    else if(!jurors){title.textContent='Add jury members';text.textContent='Round settings are ready; jury access is still empty.'}
    else{title.textContent='Round configured';text.textContent=`${cats} categor${cats===1?'y':'ies'} · ${jurors} jury member${jurors===1?'':'s'}.`}
  }
  function updateSummary(){
    const eligible=eligibleNominations(), assigned=eligible.filter(n=>assignedIdsFor(n.id).length).length, unassigned=eligible.length-assigned, health=eligible.length?Math.round(assigned/eligible.length*100):100;
    $('#summaryJurors').textContent=judges.length;$('#summaryJurorsMeta').textContent=`${levelJudges().length} in selected level`;
    $('#summaryEligible').textContent=eligible.length;$('#summaryAssigned').textContent=assigned;$('#summaryAssignedMeta').textContent=`${health}% assignment coverage`;
    $('#summaryAttention').textContent=unassigned;$('#summaryAttentionMeta').textContent=unassigned?'Unassigned nominations':'All nominations assigned';
    $('#healthEligible').textContent=eligible.length;$('#healthAssigned').textContent=assigned;$('#healthUnassigned').textContent=unassigned;$('#assignmentHealthScore').textContent=`${health}%`;
    $('#assignmentHealthRing').style.setProperty('--p',`${health}%`);
    $('#healthTitle').textContent=health===100?'Assignment complete':health>=70?'Almost ready':'Needs assignment';
    $('#healthText').textContent=unassigned?`${unassigned} paid nomination${unassigned===1?' is':'s are'} still unassigned at ${currentLevel().name}.`:'Every eligible nomination has at least one jury member.';
    const tip=$('#healthAiTip');if(tip)tip.textContent=unassigned?`AI can match the ${unassigned} open nomination${unassigned===1?'':'s'} using category expertise and current workload.`:'AI check: workload is covered. Review scoring criteria before opening the round.';
    renderAiInsight();updateRoundStatus();
  }
  function renderAiInsight(){
    const eligible=eligibleNominations(), unassigned=eligible.filter(n=>!assignedIdsFor(n.id).length), jurors=levelJudges().filter(j=>j.enabled!==false);
    if(!jurors.length){$('#aiHeadline').textContent='Build the jury team for this round';$('#aiInsight').textContent=`${currentLevel().name} has no active jury members. Add experts and AI can match them by category.`;return}
    if(!unassigned.length){$('#aiHeadline').textContent='This round is fully assigned';$('#aiInsight').textContent=`All ${eligible.length} eligible nominations have jury coverage. Copilot recommends reviewing workload and scoring criteria next.`;return}
    const byCat={};unassigned.forEach(n=>byCat[n.category]=(byCat[n.category]||0)+1);const gap=Object.entries(byCat).sort((a,b)=>b[1]-a[1])[0];
    const loads=jurors.map(j=>({j,n:nominationCountForJudge(j.id)})).sort((a,b)=>a.n-b.n);const light=loads[0], suggested=gap?bestJurorForCategory(gap[0]):light?.j;
    $('#aiHeadline').textContent=`${unassigned.length} nominations need assignment`;
    $('#aiInsight').innerHTML=`Priority: <b>${esc(gap?.[0]||'—')}</b> has ${gap?.[1]||0} open. Best current fit: <b>${esc(suggested?.name||light?.j.name||'—')}</b>. Lowest workload: ${esc(light?.j.name||'—')} (${light?.n||0}).`;
  }
  function renderAll(){renderLevels();renderConfig();renderJury();renderNominationFilters();renderNominations();renderCategoryIntelligence();updateSummary();initCategoryMulti('level');initCategoryMulti('invite');updateSelectionBar()}

  function saveLevel(){const l=currentLevel();l.type=$('#juryRoundType').value;l.threshold=Math.max(0,Math.min(100,Number($('#juryThreshold').value||0)));l.categories=$$('#juryLevelCategories input:checked').map(i=>i.value);l.juryEvaluate=$('#levelJuryEvaluate').checked;l.showPreviousScores=$('#levelPreviousScores').checked;persist();renderAll();toast('Jury level saved')}
  function changeLevelCount(v){const count=Math.max(1,Math.min(5,Number(v)));while(levels.length<count){const n=levels.length+1;levels.push({level:n,name:`Jury Level ${n}`,type:n===1?'verification':n===count?'final':'evaluation',threshold:n===1?70:75,categories:[...categories],juryEvaluate:true,showPreviousScores:n>1})}if(levels.length>count){const affected=judges.some(j=>Number(j.level)>count);if(affected&&!confirm(`Jury members above Level ${count} will be moved to Level ${count}. Continue?`)){renderLevels();return}judges.forEach(j=>{if(Number(j.level)>count)j.level=count});levels=levels.slice(0,count);Object.keys(assignments).forEach(k=>{if(Number(k)>count)delete assignments[k]})}selectedLevel=Math.min(selectedLevel,count);persist();renderAll();toast(`Jury workflow set to ${count} level${count===1?'':'s'}`)}

  function openDrawer(){editingJudgeId=null;$('#juryDrawerTitle').textContent='Add jury member';$('#newJudgeName').value='';$('#newJudgeEmail').value='';$('#newJudgeCompany').value='';$('#newJudgeRole').value='';$('#newJudgeMobile').value='';$('#newJudgePassword').value='';$('#newJudgeLevel').value=String(selectedLevel);$$('#expertisePicker button').forEach(b=>b.classList.remove('active'));renderInviteCategories([]);$('#inviteDrawer').classList.add('open');$('#inviteDrawer').setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
  function closeDrawer(){$('#inviteDrawer').classList.remove('open');$('#inviteDrawer').setAttribute('aria-hidden','true');document.body.style.overflow=''}
  function renderInviteCategories(selected){$('#inviteCategories').innerHTML=categories.map(c=>`<label data-category-label="${esc(c.toLowerCase())}"><input type="checkbox" value="${esc(c)}" ${selected.includes(c)?'checked':''}> <span>${esc(c)}</span></label>`).join('');updateCategoryMultiSummary('invite')}
  function editJudge(id){const j=judges.find(x=>String(x.id)===String(id));if(!j)return;editingJudgeId=j.id;$('#juryDrawerTitle').textContent='Edit jury member';$('#newJudgeName').value=j.name||'';$('#newJudgeEmail').value=j.email||'';$('#newJudgeCompany').value=j.company||'';$('#newJudgeRole').value=j.role||'';$('#newJudgeMobile').value=j.mobile||'';$('#newJudgePassword').value=j.password||'';$('#newJudgeLevel').value=String(j.level||1);$$('#expertisePicker button').forEach(b=>b.classList.toggle('active',(j.expertise||[]).includes(b.dataset.exp)));renderInviteCategories(j.categories||[]);$('#requireConflict').checked=j.requireConflict!==false;$('#inviteDrawer').classList.add('open');$('#inviteDrawer').setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
  function saveJudge(){const name=$('#newJudgeName').value.trim(),email=$('#newJudgeEmail').value.trim().toLowerCase(),password=$('#newJudgePassword').value.trim();if(!name)return toast('Enter jury member name');if(!/^\S+@\S+\.\S+$/.test(email))return toast('Enter a valid email');if(!password)return toast('Create a jury login password');const duplicate=judges.find(j=>j.email.toLowerCase()===email&&String(j.id)!==String(editingJudgeId));if(duplicate)return toast('This email is already used by another jury member');const data={name,email,password,company:$('#newJudgeCompany').value.trim()||'Independent',role:$('#newJudgeRole').value.trim()||'Jury Member',mobile:$('#newJudgeMobile').value.trim(),level:Number($('#newJudgeLevel').value||1),expertise:$$('#expertisePicker button.active').map(b=>b.dataset.exp),categories:$$('#inviteCategories input:checked').map(i=>i.value),enabled:true,status:'active',requireConflict:$('#requireConflict').checked};if(editingJudgeId){Object.assign(judges.find(j=>String(j.id)===String(editingJudgeId)),data)}else judges.push({id:Date.now(),...data});persist();selectedLevel=data.level;closeDrawer();renderAll();toast(editingJudgeId?'Jury member updated':'Jury member created')}

  function assignmentIdsAtLevel(level,nomId){return (((assignments[String(level)]||{})[nomId])||[]).map(String)}
  function assignmentLoadForJudgeAtLevel(judgeId,level){const map=assignments[String(level)]||{};return Object.values(map).filter(ids=>(ids||[]).map(String).includes(String(judgeId))).length}
  function ensureAssignmentWarning(){
    const body=$('#assignNominationModal .assignment-editor-body');if(!body)return null;
    let warning=$('#assignmentRemovalWarning');
    if(!warning){warning=document.createElement('div');warning.id='assignmentRemovalWarning';warning.className='assignment-removal-warning';body.insertBefore(warning,body.firstChild)}
    return warning;
  }
  function renderAssignmentJuryPicker(){
    const nom=assignmentTargets.length===1?nominations.find(n=>n.id===assignmentTargets[0]):null;
    const allLevelJurors=judges.filter(j=>Number(j.level||1)===Number(assignmentLevel));
    const warning=ensureAssignmentWarning();
    const saveBtn=$('#saveNominationAssignment');
    const head=$('.assignment-jury-head span');
    const count=$('#assignmentJuryCount');
    const hint=$('#assignmentLevelHint');
    let jurors=[];
    if(assignmentMode==='unassign'){
      const assignedSet=new Set();
      assignmentTargets.forEach(id=>assignmentIdsAtLevel(assignmentLevel,id).forEach(jid=>assignedSet.add(String(jid))));
      jurors=allLevelJurors.filter(j=>assignedSet.has(String(j.id)));
      if(warning){warning.style.display='flex';warning.innerHTML='<span class="assignment-warning-icon">!</span><div><b>Removing jury access</b><p>Selected jury members will lose these nominations from their jury queue at this level. Any saved draft or submitted score by those jury members for the selected nominations will also be removed from active scoring.</p></div>'}
      if(saveBtn){saveBtn.textContent='Confirm unassignment';saveBtn.classList.add('danger-action')}
      if(head)head.textContent='Currently assigned jury members';
      if(count)count.textContent=`${jurors.length} assigned at Level ${assignmentLevel}`;
      if(hint)hint.textContent='Choose the level first, then select only the jury members you want to remove.';
    }else{
      jurors=allLevelJurors.filter(j=>j.enabled!==false);
      if(warning)warning.style.display='none';
      if(saveBtn){saveBtn.textContent='Save assignment';saveBtn.classList.remove('danger-action')}
      if(head)head.textContent='Jury members';
      if(count)count.textContent=`${jurors.length} available at Level ${assignmentLevel}`;
      if(hint)hint.textContent=assignmentLevel>1?'You can pre-assign this level now. Jurors will only see nominations after they qualify from the previous level.':'Level 1 assignments are visible to the selected jurors immediately.';
    }
    const common=jurors.filter(j=>assignmentTargets.every(id=>assignmentIdsAtLevel(assignmentLevel,id).includes(String(j.id)))).map(j=>String(j.id));
    $('#nominationJuryPicker').innerHTML=jurors.length?jurors.map(j=>{
      const categoryOk=!nom||(j.categories||[]).includes(nom.category);
      const load=assignmentLoadForJudgeAtLevel(j.id,assignmentLevel);
      const assignedToCount=assignmentTargets.filter(id=>assignmentIdsAtLevel(assignmentLevel,id).includes(String(j.id))).length;
      if(assignmentMode==='unassign')return `<label class="assignment-editor-row remove-choice"><input type="checkbox" value="${j.id}"><span class="judge-avatar">${esc(j.name.split(/\s+/).map(x=>x[0]).join('').slice(0,2))}</span><span class="assignment-person"><b>${esc(j.name)}</b><small>${esc(j.company)} · Assigned to ${assignedToCount}/${assignmentTargets.length} selected nomination${assignmentTargets.length===1?'':'s'} · Level ${assignmentLevel}</small></span><span class="assignment-remove-tag">Remove</span></label>`;
      return `<label class="assignment-editor-row ${categoryOk?'recommended':''}"><input type="checkbox" value="${j.id}" ${common.includes(String(j.id))?'checked':''}><span class="judge-avatar">${esc(j.name.split(/\s+/).map(x=>x[0]).join('').slice(0,2))}</span><span class="assignment-person"><b>${esc(j.name)}${categoryOk&&nom?'<span class="assignment-recommend">✦ AI match</span>':''}</b><small>${esc(j.company)} · ${categoryOk?'Category matched':'Category not assigned'} · Level ${assignmentLevel}</small></span><span class="assignment-load" title="Assignments at this level">${load}</span></label>`
    }).join(''):`<div class="empty-state">${assignmentMode==='unassign'?`No jury members are assigned to the selected nomination${assignmentTargets.length===1?'':'s'} at Jury Level ${assignmentLevel}.`:`No active jury members exist at Jury Level ${assignmentLevel}. Add a jury member to this level first.`}</div>`;
  }
  function openAssign(ids){
    assignmentMode='assign';assignmentTargets=[...new Set(ids)];if(!assignmentTargets.length)return toast('Select at least one nomination');
    const firstTarget=assignmentTargets[0];
    const firstOpenLevel=assignmentTargets.length===1?levels.find(l=>assignmentIdsAtLevel(l.level,firstTarget).length===0):null;
    assignmentLevel=Number(firstOpenLevel?.level||selectedLevel);
    const nom=assignmentTargets.length===1?nominations.find(n=>n.id===assignmentTargets[0]):null;
    $('#assignNominationTitle').textContent=nom?`Assign ${nom.id}`:`Assign ${assignmentTargets.length} nominations`;
    $('#assignNominationSubtitle').textContent=nom?`${nom.company} · ${nom.category}`:'Choose a jury level first, then select the jury members for these nominations.';
    const levelSelect=$('#assignmentLevelSelect');
    levelSelect.innerHTML=levels.map(l=>`<option value="${l.level}">${esc(l.name||`Jury Level ${l.level}`)} · ${judges.filter(j=>Number(j.level||1)===Number(l.level)&&j.enabled!==false).length} jury</option>`).join('');
    levelSelect.value=String(assignmentLevel);renderAssignmentJuryPicker();
    $('#assignNominationModal').classList.add('open');$('#assignNominationModal').setAttribute('aria-hidden','false')
  }
  function openUnassign(ids){
    assignmentMode='unassign';assignmentTargets=[...new Set(ids)];if(!assignmentTargets.length)return toast('Select at least one nomination');
    const firstAssignedLevel=levels.find(l=>assignmentTargets.some(id=>assignmentIdsAtLevel(l.level,id).length));
    if(!firstAssignedLevel){assignmentTargets=[];assignmentMode='assign';return toast('Selected nominations have no jury assignments to remove')}
    assignmentLevel=Number(firstAssignedLevel.level);
    $('#assignNominationTitle').textContent=`Unassign jury from ${assignmentTargets.length} nomination${assignmentTargets.length===1?'':'s'}`;
    $('#assignNominationSubtitle').textContent='Choose the jury level and the specific jury members you want to remove.';
    const levelSelect=$('#assignmentLevelSelect');
    levelSelect.innerHTML=levels.map(l=>{const assigned=assignmentTargets.reduce((n,id)=>n+assignmentIdsAtLevel(l.level,id).length,0);return `<option value="${l.level}" ${assigned?'':'disabled'}>${esc(l.name||`Jury Level ${l.level}`)} · ${assigned} assignment${assigned===1?'':'s'}</option>`}).join('');
    levelSelect.value=String(assignmentLevel);renderAssignmentJuryPicker();
    $('#assignNominationModal').classList.add('open');$('#assignNominationModal').setAttribute('aria-hidden','false')
  }
  function closeAssign(){$('#assignNominationModal').classList.remove('open');$('#assignNominationModal').setAttribute('aria-hidden','true');assignmentTargets=[];assignmentLevel=selectedLevel;assignmentMode='assign';const b=$('#saveNominationAssignment');if(b){b.textContent='Save assignment';b.classList.remove('danger-action')}}
  function saveAssignment(){
    const selected=$$('#nominationJuryPicker input:checked').map(i=>String(i.value));if(!selected.length)return toast(assignmentMode==='unassign'?'Select at least one jury member to remove':'Select at least one jury member');
    if(assignmentMode==='unassign'){
      const levelMap=assignments[String(assignmentLevel)]||{};
      const affected=assignmentTargets.reduce((n,id)=>n+selected.filter(jid=>(levelMap[id]||[]).map(String).includes(jid)).length,0);
      if(!affected)return toast('Selected jury members are not assigned to these nominations at this level');
      const ok=confirm(`Confirm unassignment?\n\nThis will remove ${affected} jury assignment${affected===1?'':'s'} from Jury Level ${assignmentLevel}. The selected juror(s) will no longer see these nominations in their jury portal. Any saved draft or submitted score from those juror(s) for these nominations will also be removed from active scoring.`);
      if(!ok)return;
      assignmentTargets.forEach(id=>{
        const remaining=(levelMap[id]||[]).map(String).filter(jid=>!selected.includes(jid));
        if(remaining.length)levelMap[id]=remaining;else delete levelMap[id];
      });
      const reviews=read(REVIEW_KEY,{});
      Object.keys(reviews).forEach(k=>{const r=reviews[k];if(!r)return;const judgeId=String(k).split(':')[0];if(selected.includes(judgeId)&&assignmentTargets.includes(String(r.nominationId))&&Number(r.level||assignmentLevel)===Number(assignmentLevel))delete reviews[k]});
      write(REVIEW_KEY,reviews);persist();const count=assignmentTargets.length;closeAssign();renderAll();clearNominationSelection();toast(`Jury removed from ${count} nomination${count===1?'':'s'} at Level ${assignmentLevel}`);return;
    }
    if(!assignments[String(assignmentLevel)])assignments[String(assignmentLevel)]={};
    const count=assignmentTargets.length;assignmentTargets.forEach(id=>assignments[String(assignmentLevel)][id]=[...selected]);persist();
    const levelName=levels.find(l=>Number(l.level)===Number(assignmentLevel))?.name||`Jury Level ${assignmentLevel}`;
    closeAssign();renderAll();clearNominationSelection();toast(`${count} nomination${count===1?'':'s'} assigned to ${selected.length} jury member${selected.length===1?'':'s'} in ${levelName}`)
  }

  function aiAssign(){const jurors=levelJudges().filter(j=>j.enabled!==false);if(!jurors.length)return toast('Add active jury members first');const unassigned=eligibleNominations().filter(n=>!assignedIdsFor(n.id).length);if(!unassigned.length)return toast('All eligible nominations are already assigned');if(!assignments[String(selectedLevel)])assignments[String(selectedLevel)]={};let count=0;unassigned.forEach(n=>{const candidates=jurors.filter(j=>(j.categories||[]).includes(n.category));const pool=candidates.length?candidates:jurors;pool.sort((a,b)=>{const ae=(a.expertise||[]).filter(x=>(categoryExpertise[n.category]||[]).includes(x)).length,be=(b.expertise||[]).filter(x=>(categoryExpertise[n.category]||[]).includes(x)).length;return (be-ae)||(nominationCountForJudge(a.id)-nominationCountForJudge(b.id))});assignments[String(selectedLevel)][n.id]=[String(pool[0].id)];count++});persist();renderAll();toast(`AI assigned ${count} nomination${count===1?'':'s'}`)}

  function copyLogin(id){const j=judges.find(x=>String(x.id)===String(id));if(!j)return;const text=`Jury Login\nURL: ${location.href.replace(/judges\.html.*$/,'jury-login.html')}\nEmail: ${j.email}\nPassword: ${j.password}`;navigator.clipboard?.writeText(text).then(()=>toast('Jury login copied')).catch(()=>prompt('Copy jury login:',text))}
  function promote(){const eligible=eligibleNominations(), threshold=Number(currentLevel().threshold||70), reviews=read(REVIEW_KEY,{});const qualifiedIds=[];eligible.forEach(n=>{const vals=Object.values(reviews).filter(r=>r&&r.status==='submitted'&&r.nominationId===n.id&&Number(r.level||selectedLevel)===Number(selectedLevel)).map(r=>Number(r.total||0));if(!vals.length)return;const pct=(vals.reduce((a,b)=>a+b,0)/vals.length)*10;if(pct>=threshold)qualifiedIds.push(n.id)});if(!qualifiedIds.length)return toast('No nominations have submitted scores meeting this level threshold yet');progress[`level${selectedLevel}_qualified`]=qualifiedIds.length;progress[`level${selectedLevel}_qualified_ids`]=qualifiedIds;if(selectedLevel<levels.length){progress[`level${selectedLevel+1}_available`]=qualifiedIds.length;progress[`level${selectedLevel+1}_ids`]=qualifiedIds;persist();selectedLevel++;renderAll();toast(`${qualifiedIds.length} qualified nomination${qualifiedIds.length===1?'':'s'} promoted to ${currentLevel().name}`)}else{progress.final_ids=qualifiedIds;persist();toast(`Final round completed for ${qualifiedIds.length} qualified nomination${qualifiedIds.length===1?'':'s'}`)}}

  $('#juryLevelTabs').addEventListener('click',e=>{const b=e.target.closest('[data-jury-level]');if(b){selectedLevel=Number(b.dataset.juryLevel);showAllJury=false;renderAll()}});
  $('#categoryIntelligenceGrid')?.addEventListener('click',e=>{const b=e.target.closest('[data-view-category]');if(!b)return;$('#nominationCategoryFilter').value=b.dataset.viewCategory;renderNominations();$('#paidSubmittedSection')?.scrollIntoView({behavior:'smooth',block:'start'});});
  $('#juryLevelCount').addEventListener('change',e=>changeLevelCount(e.target.value));$('#saveJuryLevel').addEventListener('click',saveLevel);$('#promoteQualified').addEventListener('click',promote);
  $('#inviteJudge').addEventListener('click',openDrawer);$('#addJuryFromList').addEventListener('click',openDrawer);$$('[data-close-drawer]').forEach(b=>b.addEventListener('click',closeDrawer));$('#sendInvite').addEventListener('click',saveJudge);
  $('#generateJuryPassword').addEventListener('click',()=>{$('#newJudgePassword').value=`ET${Math.random().toString(36).slice(2,8).toUpperCase()}#${String(new Date().getFullYear()).slice(-2)}`});
  $$('#expertisePicker button').forEach(b=>b.addEventListener('click',()=>b.classList.toggle('active')));
  $('#levelJurySearch').addEventListener('input',renderJury);$('#levelJuryRows').addEventListener('click',e=>{const more=e.target.closest('[data-toggle-jury-list]'),edit=e.target.closest('[data-edit-jury]'),copy=e.target.closest('[data-copy-login]'),login=e.target.closest('[data-open-login]'),toggle=e.target.closest('[data-toggle-jury]');if(more){showAllJury=!showAllJury;renderJury();return}if(edit)editJudge(edit.dataset.editJury);if(copy)copyLogin(copy.dataset.copyLogin);if(login)openJuryLogin(login.dataset.openLogin);if(toggle){const j=judges.find(x=>String(x.id)===String(toggle.dataset.toggleJury));if(j){j.enabled=toggle.checked;persist();renderAll()}}});
  $('#nominationSearch').addEventListener('input',renderNominations);$('#nominationCategoryFilter').addEventListener('change',renderNominations);$('#nominationAssignmentFilter').addEventListener('change',renderNominations);$('#clearNominationFilters').addEventListener('click',()=>{$('#nominationSearch').value='';$('#nominationCategoryFilter').value='all';$('#nominationAssignmentFilter').value='all';renderNominations()});
  $('#nominationRows').addEventListener('click',e=>{const b=e.target.closest('[data-assign-nomination]');if(b)openAssign([b.dataset.assignNomination]);if(e.target.matches('.nomination-select'))updateSelectionBar()});$('#assignSelectedBtn').addEventListener('click',()=>openAssign(selectedNominationIds()));$('#selectAllNominations').addEventListener('change',e=>{$$('.nomination-select').forEach(i=>i.checked=e.target.checked);updateSelectionBar()});$('#stickyAssignJury')?.addEventListener('click',()=>openAssign(selectedNominationIds()));$('#stickyUnassignJury')?.addEventListener('click',unassignSelected);$('#stickyClearSelection')?.addEventListener('click',clearNominationSelection);
  $$('[data-close-assignment]').forEach(b=>b.addEventListener('click',closeAssign));$('#saveNominationAssignment').addEventListener('click',saveAssignment);$('#assignmentLevelSelect')?.addEventListener('change',e=>{assignmentLevel=Number(e.target.value||selectedLevel);renderAssignmentJuryPicker()});
  $('#aiAutoAssign').addEventListener('click',aiAssign);$('#aiRefresh').addEventListener('click',()=>{renderAiInsight();toast('Copilot insight refreshed')});$('#openJuryLogin').addEventListener('click',()=>window.open('jury-login.html','_blank'));
  $('#importJury').addEventListener('click',()=>$('#importJuryFile').click());$('#importJuryFile').addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{const lines=String(r.result).split(/\r?\n/).filter(Boolean);let added=0;lines.slice(1).forEach(line=>{const [name,email,company,role,level]=line.split(',').map(x=>x?.trim());if(name&&email&&!judges.some(j=>j.email.toLowerCase()===email.toLowerCase())){judges.push({id:Date.now()+added,name,email,company:company||'Independent',role:role||'Jury Member',level:Number(level||selectedLevel),password:`ET${Math.random().toString(36).slice(2,8).toUpperCase()}#`,expertise:[],categories:[...currentLevel().categories],enabled:true,status:'active',requireConflict:true});added++}});persist();renderAll();toast(`${added} jury member${added===1?'':'s'} imported`)};r.readAsText(f);e.target.value=''});

  // If payment is completed in another browser tab, refresh the common paid
  // nomination report here immediately without requiring a page reload.
  window.addEventListener('storage',e=>{
    if(e.key!==nominationReportKey&&e.key!=='etb2b_public_nomination_starters')return;
    if(syncPaidSubmittedFromReports()){write(NOM_KEY,nominations);renderAll()}
  });

  renderAll();
})();
