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
  let assignments=read(ASSIGN_KEY,{});
  let progress=read(PROGRESS_KEY,{});
  let selectedLevel=1, editingJudgeId=null, assignmentTargets=[];
  write(JUDGE_KEY,judges);write(LEVEL_KEY,levels);write(NOM_KEY,nominations);write(ASSIGN_KEY,assignments);

  const currentLevel=()=>levels.find(l=>Number(l.level)===Number(selectedLevel))||levels[0];
  const levelJudges=()=>judges.filter(j=>Number(j.level||1)===Number(selectedLevel));
  const eligibleNominations=()=>{const base=nominations.filter(n=>n.submission==='Submitted'&&n.payment==='Paid'&&currentLevel().categories.includes(n.category));if(Number(selectedLevel)===1)return base;const ids=new Set(progress[`level${selectedLevel}_ids`]||[]);return base.filter(n=>ids.has(n.id))};
  const assignedIdsAt=(level,nomId)=>((assignments[String(level)]||{})[nomId]||[]).map(String);
  const assignedIdsFor=(nomId)=>assignedIdsAt(selectedLevel,nomId);
  const paidNominations=()=>nominations.filter(n=>n.submission==='Submitted'&&n.payment==='Paid');
  const isPromotedTo=(level,nomId)=>Number(level)===1 || new Set(progress[`level${level}_ids`]||[]).has(nomId);
  const nominationCountForJudge=id=>eligibleNominations().filter(n=>assignedIdsFor(n.id).includes(String(id))).length;
  const persist=()=>{write(JUDGE_KEY,judges);write(LEVEL_KEY,levels);write(NOM_KEY,nominations);write(ASSIGN_KEY,assignments);write(PROGRESS_KEY,progress)};

  function renderLevels(){
    $('#juryLevelCount').value=String(levels.length);
    $('#juryLevelTabs').innerHTML=levels.map(l=>`<button class="jury-level-tab ${Number(l.level)===Number(selectedLevel)?'active':''}" data-jury-level="${l.level}">${esc(l.name)} <small>${judges.filter(j=>Number(j.level)===Number(l.level)).length}</small></button>`).join('');
  }
  function renderConfig(){
    const l=currentLevel();
    $('#juryRoundType').value=l.type;$('#juryThreshold').value=l.threshold;
    $('#levelJuryEvaluate').checked=l.juryEvaluate!==false;$('#levelPreviousScores').checked=!!l.showPreviousScores;
    $('#juryLevelCategories').innerHTML=categories.map(c=>`<label><input type="checkbox" value="${esc(c)}" ${l.categories.includes(c)?'checked':''}> ${esc(c)}</label>`).join('');
    $('#levelJuryHeading').textContent=`${l.name} · ${levelJudges().length} jury member${levelJudges().length===1?'':'s'}`;
    $('#promoteQualified').textContent=selectedLevel<levels.length?'Promote qualified →':'Complete final round';
  }
  function renderJury(){
    const q=($('#levelJurySearch').value||'').toLowerCase().trim();
    const rows=levelJudges().filter(j=>!q||`${j.name} ${j.email} ${j.company}`.toLowerCase().includes(q));
    $('#levelJuryRows').innerHTML=rows.length?rows.map(j=>`<tr>
      <td><div class="jury-person"><span>${esc((j.name||'?').split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase())}</span><div><b>${esc(j.name)}</b><small>${esc(j.email)}</small></div></div></td>
      <td><div class="jury-category-chips">${(j.categories||[]).slice(0,2).map(c=>`<span>${esc(c.replace('Best ',''))}</span>`).join('')}${(j.categories||[]).length>2?`<em>+${j.categories.length-2}</em>`:''}</div></td>
      <td><b>${nominationCountForJudge(j.id)}</b> assigned</td>
      <td><label class="jury-status-toggle"><input type="checkbox" data-toggle-jury="${j.id}" ${j.enabled!==false?'checked':''}><span></span></label></td>
      <td><div class="jury-actions"><button data-edit-jury="${j.id}" title="Edit">Edit</button><button data-copy-login="${j.id}" title="Copy login">Login</button></div></td>
    </tr>`).join(''):`<tr><td colspan="5"><div class="empty-state">No jury members in this level yet.</div></td></tr>`;
  }
  function renderNominationFilters(){
    const f=$('#nominationCategoryFilter'), old=f.value||'all';
    f.innerHTML='<option value="all">All categories</option>'+currentLevel().categories.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
    f.value=[...f.options].some(o=>o.value===old)?old:'all';
  }
  function renderNominations(){
    const q=($('#nominationSearch').value||'').toLowerCase().trim(), cat=$('#nominationCategoryFilter').value, af=$('#nominationAssignmentFilter').value;
    let rows=paidNominations();
    rows=rows.filter(n=>!q||`${n.id} ${n.company} ${n.nominee} ${n.category}`.toLowerCase().includes(q));
    if(cat!=='all')rows=rows.filter(n=>n.category===cat);
    if(af==='assigned')rows=rows.filter(n=>levels.some(l=>assignedIdsAt(l.level,n.id).length));
    if(af==='unassigned')rows=rows.filter(n=>!levels.some(l=>assignedIdsAt(l.level,n.id).length));
    $('#nominationRows').innerHTML=rows.length?rows.map(n=>{
      const levelBadges=levels.map(l=>{
        const ids=assignedIdsAt(l.level,n.id), js=ids.map(id=>judges.find(j=>String(j.id)===id)).filter(Boolean);
        if(!ids.length)return `<span class="level-assignment-chip empty"><b>L${l.level}</b> Not assigned</span>`;
        const active=isPromotedTo(l.level,n.id);
        const names=js.map(j=>j.name).join(', ');
        return `<span class="level-assignment-chip ${active?'assigned':'planned'}" title="${esc(names)}"><b>L${l.level}</b> ${active?'Assigned':'Planned'} · ${ids.length}</span>`;
      }).join('');
      const nextLevel=levels.find(l=>!assignedIdsAt(l.level,n.id).length);
      const actionLevel=nextLevel?nextLevel.level:selectedLevel;
      const actionLabel=nextLevel?`Assign L${nextLevel.level}`:`Manage L${selectedLevel}`;
      return `<tr>
        <td><input type="checkbox" class="nomination-select" value="${esc(n.id)}"></td>
        <td><b class="nomination-id">${esc(n.id)}</b></td>
        <td><b>${esc(n.nominee||n.company)}</b><small>${esc(n.company)}</small></td>
        <td><span class="category-badge">${esc(n.category)}</span></td>
        <td><span class="paid-pill">✓ Paid & submitted</span></td>
        <td><div class="level-assignment-list">${levelBadges}</div></td>
        <td><button class="btn ghost compact" data-assign-nomination="${esc(n.id)}" data-target-level="${actionLevel}">${actionLabel}</button></td>
      </tr>`
    }).join(''):`<tr><td colspan="7"><div class="empty-state">No nominations match these filters.</div></td></tr>`;
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
    renderAiInsight();
  }
  function renderAiInsight(){
    const eligible=eligibleNominations(), unassigned=eligible.filter(n=>!assignedIdsFor(n.id).length), jurors=levelJudges().filter(j=>j.enabled!==false);
    if(!jurors.length){$('#aiHeadline').textContent='Add jury members before assigning';$('#aiInsight').textContent=`${currentLevel().name} has no active jury members. Add jury members and category access first.`;return}
    if(!unassigned.length){$('#aiHeadline').textContent='Assignment coverage is complete';$('#aiInsight').textContent=`All ${eligible.length} eligible nominations have at least one jury assignment at ${currentLevel().name}.`;return}
    const byCat={};unassigned.forEach(n=>byCat[n.category]=(byCat[n.category]||0)+1);const gap=Object.entries(byCat).sort((a,b)=>b[1]-a[1])[0];
    const loads=jurors.map(j=>({j,n:nominationCountForJudge(j.id)})).sort((a,b)=>a.n-b.n);const light=loads[0];
    $('#aiHeadline').textContent=`${unassigned.length} nominations still need jury assignment`;
    $('#aiInsight').innerHTML=`Largest gap: <b>${esc(gap?.[0]||'—')}</b> (${gap?.[1]||0} unassigned). <b>${esc(light?.j.name||'')}</b> currently has the lightest workload with ${light?.n||0} assigned.`;
  }
  function renderAll(){renderLevels();renderConfig();renderJury();renderNominationFilters();renderNominations();updateSummary()}

  function saveLevel(){const l=currentLevel();l.type=$('#juryRoundType').value;l.threshold=Math.max(0,Math.min(100,Number($('#juryThreshold').value||0)));l.categories=$$('#juryLevelCategories input:checked').map(i=>i.value);l.juryEvaluate=$('#levelJuryEvaluate').checked;l.showPreviousScores=$('#levelPreviousScores').checked;persist();renderAll();toast('Jury level saved')}
  function changeLevelCount(v){const count=Math.max(1,Math.min(5,Number(v)));while(levels.length<count){const n=levels.length+1;levels.push({level:n,name:`Jury Level ${n}`,type:n===1?'verification':n===count?'final':'evaluation',threshold:n===1?70:75,categories:[...categories],juryEvaluate:true,showPreviousScores:n>1})}if(levels.length>count){const affected=judges.some(j=>Number(j.level)>count);if(affected&&!confirm(`Jury members above Level ${count} will be moved to Level ${count}. Continue?`)){renderLevels();return}judges.forEach(j=>{if(Number(j.level)>count)j.level=count});levels=levels.slice(0,count);Object.keys(assignments).forEach(k=>{if(Number(k)>count)delete assignments[k]})}selectedLevel=Math.min(selectedLevel,count);persist();renderAll();toast(`Jury workflow set to ${count} level${count===1?'':'s'}`)}

  function openDrawer(){editingJudgeId=null;$('#juryDrawerTitle').textContent='Add jury member';$('#newJudgeName').value='';$('#newJudgeEmail').value='';$('#newJudgeCompany').value='';$('#newJudgeRole').value='';$('#newJudgeMobile').value='';$('#newJudgePassword').value='';$('#newJudgeLevel').value=String(selectedLevel);$$('#expertisePicker button').forEach(b=>b.classList.remove('active'));renderInviteCategories([]);$('#inviteDrawer').classList.add('open');$('#inviteDrawer').setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
  function closeDrawer(){$('#inviteDrawer').classList.remove('open');$('#inviteDrawer').setAttribute('aria-hidden','true');document.body.style.overflow=''}
  function renderInviteCategories(selected){$('#inviteCategories').innerHTML=categories.map(c=>`<label><input type="checkbox" value="${esc(c)}" ${selected.includes(c)?'checked':''}> ${esc(c)}</label>`).join('')}
  function editJudge(id){const j=judges.find(x=>String(x.id)===String(id));if(!j)return;editingJudgeId=j.id;$('#juryDrawerTitle').textContent='Edit jury member';$('#newJudgeName').value=j.name||'';$('#newJudgeEmail').value=j.email||'';$('#newJudgeCompany').value=j.company||'';$('#newJudgeRole').value=j.role||'';$('#newJudgeMobile').value=j.mobile||'';$('#newJudgePassword').value=j.password||'';$('#newJudgeLevel').value=String(j.level||1);$$('#expertisePicker button').forEach(b=>b.classList.toggle('active',(j.expertise||[]).includes(b.dataset.exp)));renderInviteCategories(j.categories||[]);$('#requireConflict').checked=j.requireConflict!==false;$('#inviteDrawer').classList.add('open');$('#inviteDrawer').setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
  function saveJudge(){const name=$('#newJudgeName').value.trim(),email=$('#newJudgeEmail').value.trim().toLowerCase(),password=$('#newJudgePassword').value.trim();if(!name)return toast('Enter jury member name');if(!/^\S+@\S+\.\S+$/.test(email))return toast('Enter a valid email');if(!password)return toast('Create a jury login password');const duplicate=judges.find(j=>j.email.toLowerCase()===email&&String(j.id)!==String(editingJudgeId));if(duplicate)return toast('This email is already used by another jury member');const data={name,email,password,company:$('#newJudgeCompany').value.trim()||'Independent',role:$('#newJudgeRole').value.trim()||'Jury Member',mobile:$('#newJudgeMobile').value.trim(),level:Number($('#newJudgeLevel').value||1),expertise:$$('#expertisePicker button.active').map(b=>b.dataset.exp),categories:$$('#inviteCategories input:checked').map(i=>i.value),enabled:true,status:'active',requireConflict:$('#requireConflict').checked};if(editingJudgeId){Object.assign(judges.find(j=>String(j.id)===String(editingJudgeId)),data)}else judges.push({id:Date.now(),...data});persist();selectedLevel=data.level;closeDrawer();renderAll();toast(editingJudgeId?'Jury member updated':'Jury member created')}

  function renderAssignmentPicker(){
    const targetLevel=Number($('#assignmentTargetLevel').value||selectedLevel);
    const nom=assignmentTargets.length===1?nominations.find(n=>n.id===assignmentTargets[0]):null;
    const jurors=judges.filter(j=>Number(j.level||1)===targetLevel&&j.enabled!==false);
    const common=jurors.filter(j=>assignmentTargets.every(id=>assignedIdsAt(targetLevel,id).includes(String(j.id)))).map(j=>String(j.id));
    const promoted=assignmentTargets.every(id=>isPromotedTo(targetLevel,id));
    $('#assignmentLevelNote').innerHTML=targetLevel===1
      ?'<b>Level 1 assignment</b><span>Available immediately to the selected jury member(s).</span>'
      : promoted
        ?`<b>Level ${targetLevel} is active</b><span>These nomination(s) have qualified for this level.</span>`
        :`<b>Planned Level ${targetLevel} assignment</b><span>Saved now, but hidden from the jury portal until the nomination qualifies from the previous level.</span>`;
    $('#nominationJuryPicker').innerHTML=jurors.length?jurors.map(j=>{
      const categoryOk=!nom||(j.categories||[]).includes(nom.category);
      const load=paidNominations().filter(n=>assignedIdsAt(targetLevel,n.id).includes(String(j.id))).length;
      return `<label class="assignment-editor-row"><input type="checkbox" value="${j.id}" ${common.includes(String(j.id))?'checked':''}><span class="judge-avatar">${esc(j.name.split(/\s+/).map(x=>x[0]).join('').slice(0,2))}</span><span class="assignment-person"><b>${esc(j.name)}</b><small>${esc(j.company)} · ${nom?(categoryOk?'Category matched':'Category not assigned'):`${load} nominations assigned at Level ${targetLevel}`}</small></span><span class="assignment-load">${load}</span></label>`
    }).join(''):`<div class="empty-state">No active jury members exist at Level ${targetLevel}. Add a jury member to this level first.</div>`;
  }
  function openAssign(ids,targetLevel=selectedLevel){
    assignmentTargets=[...new Set(ids)];if(!assignmentTargets.length)return toast('Select at least one nomination');
    const nom=assignmentTargets.length===1?nominations.find(n=>n.id===assignmentTargets[0]):null;
    $('#assignNominationTitle').textContent=nom?`Assign ${nom.id}`:`Assign ${assignmentTargets.length} nominations`;
    $('#assignNominationSubtitle').textContent=nom?`${nom.company} · ${nom.category}`:'Choose the jury level and jury member(s) for the selected nominations.';
    $('#assignmentTargetLevel').innerHTML=levels.map(l=>`<option value="${l.level}">${esc(l.name)}</option>`).join('');
    $('#assignmentTargetLevel').value=String(Math.min(Math.max(Number(targetLevel)||1,1),levels.length));
    renderAssignmentPicker();
    $('#assignNominationModal').classList.add('open');$('#assignNominationModal').setAttribute('aria-hidden','false');
  }
  function closeAssign(){$('#assignNominationModal').classList.remove('open');$('#assignNominationModal').setAttribute('aria-hidden','true');assignmentTargets=[]}
  function saveAssignment(){const targetLevel=Number($('#assignmentTargetLevel').value||selectedLevel), selected=$$('#nominationJuryPicker input:checked').map(i=>String(i.value));if(!selected.length)return toast('Select at least one jury member');if(!assignments[String(targetLevel)])assignments[String(targetLevel)]={};const count=assignmentTargets.length;assignmentTargets.forEach(id=>assignments[String(targetLevel)][id]=[...selected]);persist();closeAssign();renderAll();const planned=targetLevel>1&&!assignmentTargets.every(id=>isPromotedTo(targetLevel,id));toast(`${planned?'Planned':'Active'} Level ${targetLevel} assignment saved for ${count} nomination${count===1?'':'s'}`)}

  function aiAssign(){const jurors=levelJudges().filter(j=>j.enabled!==false);if(!jurors.length)return toast('Add active jury members first');const unassigned=eligibleNominations().filter(n=>!assignedIdsFor(n.id).length);if(!unassigned.length)return toast('All eligible nominations are already assigned');if(!assignments[String(selectedLevel)])assignments[String(selectedLevel)]={};let count=0;unassigned.forEach(n=>{const candidates=jurors.filter(j=>(j.categories||[]).includes(n.category));const pool=candidates.length?candidates:jurors;pool.sort((a,b)=>{const ae=(a.expertise||[]).filter(x=>(categoryExpertise[n.category]||[]).includes(x)).length,be=(b.expertise||[]).filter(x=>(categoryExpertise[n.category]||[]).includes(x)).length;return (be-ae)||(nominationCountForJudge(a.id)-nominationCountForJudge(b.id))});assignments[String(selectedLevel)][n.id]=[String(pool[0].id)];count++});persist();renderAll();toast(`AI assigned ${count} nomination${count===1?'':'s'}`)}

  function copyLogin(id){const j=judges.find(x=>String(x.id)===String(id));if(!j)return;const text=`Jury Login\nURL: ${location.href.replace(/judges\.html.*$/,'jury-login.html')}\nEmail: ${j.email}\nPassword: ${j.password}`;navigator.clipboard?.writeText(text).then(()=>toast('Jury login copied')).catch(()=>prompt('Copy jury login:',text))}
  function promote(){const eligible=eligibleNominations(), threshold=Number(currentLevel().threshold||70), reviews=read(REVIEW_KEY,{});const qualifiedIds=[];eligible.forEach(n=>{const vals=Object.values(reviews).filter(r=>r&&r.status==='submitted'&&r.nominationId===n.id&&Number(r.level||selectedLevel)===Number(selectedLevel)).map(r=>Number(r.total||0));if(!vals.length)return;const pct=(vals.reduce((a,b)=>a+b,0)/vals.length)*10;if(pct>=threshold)qualifiedIds.push(n.id)});if(!qualifiedIds.length)return toast('No nominations have submitted scores meeting this level threshold yet');progress[`level${selectedLevel}_qualified`]=qualifiedIds.length;progress[`level${selectedLevel}_qualified_ids`]=qualifiedIds;if(selectedLevel<levels.length){progress[`level${selectedLevel+1}_available`]=qualifiedIds.length;progress[`level${selectedLevel+1}_ids`]=qualifiedIds;persist();selectedLevel++;renderAll();toast(`${qualifiedIds.length} qualified nomination${qualifiedIds.length===1?'':'s'} promoted to ${currentLevel().name}`)}else{progress.final_ids=qualifiedIds;persist();toast(`Final round completed for ${qualifiedIds.length} qualified nomination${qualifiedIds.length===1?'':'s'}`)}}

  $('#juryLevelTabs').addEventListener('click',e=>{const b=e.target.closest('[data-jury-level]');if(b){selectedLevel=Number(b.dataset.juryLevel);renderAll()}});
  $('#juryLevelCount').addEventListener('change',e=>changeLevelCount(e.target.value));$('#saveJuryLevel').addEventListener('click',saveLevel);$('#promoteQualified').addEventListener('click',promote);
  $('#inviteJudge').addEventListener('click',openDrawer);$('#addJuryFromList').addEventListener('click',openDrawer);$$('[data-close-drawer]').forEach(b=>b.addEventListener('click',closeDrawer));$('#sendInvite').addEventListener('click',saveJudge);
  $('#generateJuryPassword').addEventListener('click',()=>{$('#newJudgePassword').value=`ET${Math.random().toString(36).slice(2,8).toUpperCase()}#${String(new Date().getFullYear()).slice(-2)}`});
  $$('#expertisePicker button').forEach(b=>b.addEventListener('click',()=>b.classList.toggle('active')));
  $('#matchCategories').addEventListener('click',()=>{const exps=$$('#expertisePicker button.active').map(b=>b.dataset.exp);if(!exps.length)return toast('Select expertise first');$$('#inviteCategories input').forEach(i=>i.checked=(categoryExpertise[i.value]||[]).some(x=>exps.includes(x)));$('#matchText').textContent='Recommended categories selected from jury expertise.';toast('AI category match applied')});
  $('#levelJurySearch').addEventListener('input',renderJury);$('#levelJuryRows').addEventListener('click',e=>{const edit=e.target.closest('[data-edit-jury]'),copy=e.target.closest('[data-copy-login]'),toggle=e.target.closest('[data-toggle-jury]');if(edit)editJudge(edit.dataset.editJury);if(copy)copyLogin(copy.dataset.copyLogin);if(toggle){const j=judges.find(x=>String(x.id)===String(toggle.dataset.toggleJury));if(j){j.enabled=toggle.checked;persist();renderAll()}}});
  $('#nominationSearch').addEventListener('input',renderNominations);$('#nominationCategoryFilter').addEventListener('change',renderNominations);$('#nominationAssignmentFilter').addEventListener('change',renderNominations);$('#clearNominationFilters').addEventListener('click',()=>{$('#nominationSearch').value='';$('#nominationCategoryFilter').value='all';$('#nominationAssignmentFilter').value='all';renderNominations()});
  $('#nominationRows').addEventListener('click',e=>{const b=e.target.closest('[data-assign-nomination]');if(b)openAssign([b.dataset.assignNomination],Number(b.dataset.targetLevel||selectedLevel))});$('#assignSelectedBtn').addEventListener('click',()=>openAssign($$('.nomination-select:checked').map(i=>i.value),selectedLevel));$('#selectAllNominations').addEventListener('change',e=>$$('.nomination-select').forEach(i=>i.checked=e.target.checked));
  $$('[data-close-assignment]').forEach(b=>b.addEventListener('click',closeAssign));$('#assignmentTargetLevel').addEventListener('change',renderAssignmentPicker);$('#saveNominationAssignment').addEventListener('click',saveAssignment);
  $('#aiAutoAssign').addEventListener('click',aiAssign);$('#aiRefresh').addEventListener('click',()=>{renderAiInsight();toast('Copilot insight refreshed')});$('#openJuryLogin').addEventListener('click',()=>window.open('jury-login.html','_blank'));
  $('#importJury').addEventListener('click',()=>$('#importJuryFile').click());$('#importJuryFile').addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{const lines=String(r.result).split(/\r?\n/).filter(Boolean);let added=0;lines.slice(1).forEach(line=>{const [name,email,company,role,level]=line.split(',').map(x=>x?.trim());if(name&&email&&!judges.some(j=>j.email.toLowerCase()===email.toLowerCase())){judges.push({id:Date.now()+added,name,email,company:company||'Independent',role:role||'Jury Member',level:Number(level||selectedLevel),password:`ET${Math.random().toString(36).slice(2,8).toUpperCase()}#`,expertise:[],categories:[...currentLevel().categories],enabled:true,status:'active',requireConflict:true});added++}});persist();renderAll();toast(`${added} jury member${added===1?'':'s'} imported`)};r.readAsText(f);e.target.value=''});

  renderAll();
})();
