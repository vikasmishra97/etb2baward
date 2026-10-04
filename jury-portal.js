(() => {
  const JUDGE_KEY='etb2b_awards_judges_v3', SESSION_KEY='etb2b_jury_session_v1', LEVEL_KEY='etb2b_awards_jury_levels_v1', SCORE_KEY='etb2b_awards_scoring_v11', REVIEW_KEY='etb2b_jury_reviews_v1', NOM_KEY='etb2b_awards_nominations_v1', ASSIGN_KEY='etb2b_awards_jury_assignments_v1';
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)], read=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v??f}catch{return f}};
  const esc=s=>String(s??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
  const session=read(SESSION_KEY,null), judges=read(JUDGE_KEY,[]), jury=session&&judges.find(j=>String(j.id)===String(session.juryId));
  if(!jury||jury.enabled===false){window.location.replace('jury-login.html');return}

  const award=read('etb2b_awards_new_award',{})||{};
  const levels=read(LEVEL_KEY,[]), levelNo=Number(jury.level||1), level=levels.find(x=>Number(x.level)===levelNo)||{name:`Jury Level ${levelNo}`,type:'evaluation',categories:jury.categories||[]};
  const starters=read('etb2b_public_nomination_starters',[]);
  const nominations=read(NOM_KEY,[]), assignments=read(ASSIGN_KEY,{}), scoring=read(SCORE_KEY,null);
  const slug=award.slug||nominations.find(n=>n.awardSlug)?.awardSlug||starters.find(n=>n.slug)?.slug||'demo';
  const reportKey=`etb2b_public_nomination_reports_${slug}`;
  const reports=read(reportKey,[]);
  let reviews=read(REVIEW_KEY,{}), currentEntry=null, currentCriteria=[], activeTab='pending';

  function reportForNomination(n){
    const id=String(n.id||n.nominationId||'');
    let r=reports.find(x=>String(x.nominationId||'')===id);
    if(!r&&n.reportId)r=reports.find(x=>String(x.id)===String(n.reportId));
    if(!r&&n.categoryId)r=reports.find(x=>String(x.categoryId)===String(n.categoryId)&&(!n.email||String(x.email||'').toLowerCase()===String(n.email||'').toLowerCase()));
    return r||null;
  }
  function nominationById(id){
    const direct=nominations.find(n=>String(n.id||n.nominationId)===String(id));
    if(direct)return direct;
    const s=starters.find(n=>String(n.id||n.nominationId)===String(id));
    if(s)return {id:s.nominationId||s.id,nominationId:s.nominationId||s.id,awardSlug:s.slug,categoryId:s.categoryId,category:s.category,company:s.company||s.name,nominee:s.entrantName||s.name,email:s.email,designation:s.designation,appliedFor:s.appliedFor||s.applied_for||'',reportId:s.reportId,submission:'Submitted',payment:'Paid'};
    const r=reports.find(x=>String(x.nominationId||'')===String(id));
    if(r)return {id:r.nominationId,nominationId:r.nominationId,awardSlug:r.awardSlug,categoryId:r.categoryId,category:r.category,company:r.company,nominee:r.entrantName||r.company,email:r.email,designation:r.designation,appliedFor:r.appliedFor||r.applied_for||'',reportId:r.id,submission:'Submitted',payment:'Paid'};
    return null;
  }
  function entries(){
    const map=assignments[String(levelNo)]||{};
    return Object.keys(map).filter(id=>(map[id]||[]).map(String).includes(String(jury.id))).map(id=>{
      const n=nominationById(id)||{id,category:'Uncategorised',company:'Entrant',nominee:'Entrant'};
      const report=reportForNomination(n);
      return {id:String(n.id||n.nominationId||id),category:n.category||report?.category||'Uncategorised',categoryId:n.categoryId||report?.categoryId||'',name:n.nominee||report?.entrantName||n.company||'Entrant',company:n.company||report?.company||'',email:n.email||report?.email||'',designation:n.designation||report?.designation||'',appliedFor:n.appliedFor||report?.appliedFor||report?.applied_for||'',code:String(n.id||n.nominationId||id),report};
    });
  }
  function key(e){return `${jury.id}:${e.id}`}
  function criteriaForCategory(category){
    const all=scoring?.criteria?.length?scoring.criteria:[];
    const filtered=all.filter(c=>!Array.isArray(c.categories)||!c.categories.length||c.categories.includes(category));
    if(filtered.length)return filtered;
    return [
      {id:'fallback-1',name:'Innovation',description:'Originality and differentiation',weight:30,scale:10},
      {id:'fallback-2',name:'Market Impact',description:'Customer and industry impact',weight:25,scale:10},
      {id:'fallback-3',name:'Execution',description:'Quality of implementation',weight:25,scale:10},
      {id:'fallback-4',name:'Scalability',description:'Potential for sustainable growth',weight:20,scale:10}
    ];
  }
  function statusFor(e){return reviews[key(e)]?.status||'pending'}
  function renderFilters(es){
    const select=$('#reviewCategoryFilter'),old=select.value||'all',cats=[...new Set(es.map(e=>e.category).filter(Boolean))];
    select.innerHTML='<option value="all">All categories</option>'+cats.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
    select.value=[...select.options].some(o=>o.value===old)?old:'all';
  }
  function render(){
    const es=entries(),submitted=es.filter(e=>statusFor(e)==='submitted').length,pending=es.length-submitted;
    $('#awardName').textContent=(award.name||'ETB2B Awards').toUpperCase();$('#juryWelcome').textContent=jury.name;$('#juryMeta').textContent=`${jury.role||'Jury Member'} · ${jury.company||'Independent'}`;$('#juryLevelPill').textContent=level.name||`Jury Level ${levelNo}`;$('#roundPurpose').textContent=level.type==='verification'?'Verification / eligibility':level.type==='final'?'Final jury decision':'Evaluation / scoring';
    $('#assignedStat').textContent=es.length;$('#submittedStat').textContent=submitted;$('#pendingStat').textContent=pending;$('#categoriesStat').textContent=new Set(es.map(e=>e.category)).size;$('#pendingTabCount').textContent=pending;$('#submittedTabCount').textContent=submitted;
    renderFilters(es);
    const q=($('#reviewSearch').value||'').toLowerCase().trim(),cat=$('#reviewCategoryFilter').value;
    let rows=es.filter(e=>activeTab==='submitted'?statusFor(e)==='submitted':statusFor(e)!=='submitted');
    if(cat!=='all')rows=rows.filter(e=>e.category===cat);
    if(q)rows=rows.filter(e=>`${e.id} ${e.category} ${e.name} ${e.company}`.toLowerCase().includes(q));
    $('#juryEntries').innerHTML=rows.length?`<div class="listing-summary"><b>${rows.length}</b> nomination${rows.length===1?'':'s'} in this view</div><div class="listing-wrap"><table class="jury-table"><thead><tr><th>S No.</th><th>Nomination ID</th><th>Category</th><th>Nominee</th><th>Company</th><th>Designation</th><th>Status</th><th>Actions</th></tr></thead><tbody>${rows.map((e,i)=>{const r=reviews[key(e)],submitted=r?.status==='submitted',draft=!!r&&!submitted;const statusClass=submitted?'submitted':draft?'draft':'pending',statusLabel=submitted?'Submitted':draft?'Draft saved':'Pending';return `<tr><td class="jury-serial">${i+1}.</td><td><span class="jury-nid">${esc(e.code)}</span></td><td class="jury-cat"><span>${esc(e.category)}</span></td><td><div class="jury-name"><b>${esc(e.name)}</b>${e.email?`<small>${esc(e.email)}</small>`:''}</div></td><td class="jury-company">${esc(e.company||'—')}</td><td class="jury-designation">${esc(e.designation||e.appliedFor||'—')}</td><td><span class="jury-review-status ${statusClass}">${statusLabel}</span></td><td>${submitted?`<button data-review="${esc(e.id)}" class="jury-action-btn secondary">View submission</button>`:`<button data-review="${esc(e.id)}" class="jury-action-btn">${draft?'Continue':'Evaluate'} →</button>`}</td></tr>`}).join('')}</tbody></table></div>`:`<div class="empty">No ${activeTab} nominations match this view.</div>`;
  }
  function fallbackSections(e){
    const r=e.report;if(r?.fields?.length)return [{title:'Submitted nomination form',help:'Captured from the nomination submission.',fields:r.fields.map(f=>({label:f.label,value:f.value,help:f.help||''}))}];
    return [{title:'Nomination details',help:'Detailed answers are not available for this older/demo nomination.',fields:[{label:'Nominee / Entrant',value:e.name},{label:'Company',value:e.company},{label:'Category',value:e.category},{label:'Nomination ID',value:e.id}]}];
  }
  function responseSectionsFor(e){
    const r=e.report;
    if(Array.isArray(r?.responseSections)&&r.responseSections.length)return r.responseSections;
    if(Array.isArray(r?.formSnapshot?.sections)&&r.formSnapshot.sections.length)return r.formSnapshot.sections;
    return fallbackSections(e);
  }
  function renderSubmittedForm(e){
    const sections=responseSectionsFor(e),hasDetailed=!!(e.report?.responseSections?.length||e.report?.formSnapshot?.sections?.length||e.report?.fields?.length);
    let html='';
    if(!hasDetailed)html+='<div class="fallback-note"><b>Prototype fallback:</b> this nomination was created before full response snapshots were enabled. New paid submissions will show every submitted question and answer here automatically.</div>';
    html+=sections.map((sec,i)=>`<section class="form-section"><div class="form-section-head"><span>SECTION ${i+1}</span><h3>${esc(sec.title||`Section ${i+1}`)}</h3>${sec.help?`<p>${esc(sec.help)}</p>`:''}</div>${(sec.fields||[]).map(f=>`<div class="answer-row"><label>${esc(f.label||'Field')}</label><div class="answer-value ${String(f.value||'').trim()?'':'empty'}">${String(f.value||'').trim()?esc(f.value):'No answer provided'}</div>${f.help?`<small>${esc(f.help)}</small>`:''}</div>`).join('')}</section>`).join('');
    $('#submittedFormBody').innerHTML=html;
  }
  function renderCriteria(prev){
    $('#criteriaList').innerHTML=currentCriteria.map(c=>{
      const scale=Math.max(1,Number(c.scale||scoring?.rules?.scoreScale||5)),value=prev.scores?.[c.id]??'';
      const opts=scale<=10?`<div class="score-options">${Array.from({length:scale+1},(_,i)=>`<label><input type="radio" name="criterion-${esc(c.id)}" value="${i}" data-criterion="${esc(c.id)}" data-scale="${scale}" ${String(value)===String(i)?'checked':''}><span>${i}</span></label>`).join('')}</div>`:`<div class="criterion-number"><input type="number" min="0" max="${scale}" step="0.5" value="${esc(value)}" data-criterion="${esc(c.id)}" data-scale="${scale}" placeholder="Score out of ${scale}"></div>`;
      return `<div class="criterion"><div class="criterion-top"><div><b>${esc(c.name)}</b><small>${esc(c.description||'')}</small></div><span class="weight">${Number(c.weight||0)}%</span></div>${opts}</div>`;
    }).join('');
    $('#scoreGuideText').innerHTML=`<b>Scoring:</b> ${currentCriteria.map(c=>`${esc(c.name)} ${Number(c.weight||0)}%`).join(' · ')}`;
    updateWeightedScore();
  }
  function selectedScores(){const scores={};$$('[data-criterion]').forEach(i=>{if(i.type==='radio'&&!i.checked)return;if(i.value!=='')scores[i.dataset.criterion]=Number(i.value)});return scores}
  function calculateTotal(scores){let total=0;currentCriteria.forEach(c=>{const raw=Number(scores[c.id]??0),scale=Number(c.scale||scoring?.rules?.scoreScale||5)||5;total+=(raw/scale)*(Number(c.weight||0)/100)*10});return total}
  function updateWeightedScore(){const total=calculateTotal(selectedScores());$('#weightedScore').textContent=`${total.toFixed(1)} / 10`}
  function openScore(id){
    currentEntry=entries().find(e=>e.id===id);if(!currentEntry)return;
    const prev=reviews[key(currentEntry)]||{scores:{},comments:''};currentCriteria=criteriaForCategory(currentEntry.category);
    $('#scoreCategory').textContent=`${currentEntry.category} · ${currentEntry.code}`;$('#scoreTitle').textContent=currentEntry.name;$('#scoreMeta').textContent=[currentEntry.company,currentEntry.designation,currentEntry.email].filter(Boolean).join(' · ');$('#juryComments').value=prev.comments||'';
    renderSubmittedForm(currentEntry);renderCriteria(prev);$('#reviewShell').classList.add('open');$('#reviewShell').setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
  }
  function closeScore(){$('#reviewShell').classList.remove('open');$('#reviewShell').setAttribute('aria-hidden','true');document.body.style.overflow='';currentEntry=null;currentCriteria=[]}
  function save(status){
    if(!currentEntry)return;const scores=selectedScores();
    if(status==='submitted'&&currentCriteria.some(c=>scores[c.id]===undefined)){alert('Please score every criterion before submitting.');return}
    const total=calculateTotal(scores);
    reviews[key(currentEntry)]={status,scores,comments:$('#juryComments').value.trim(),total,updatedAt:new Date().toISOString(),nominationId:currentEntry.id,category:currentEntry.category,level:levelNo,juryId:jury.id,criteriaSnapshot:currentCriteria.map(c=>({id:c.id,name:c.name,description:c.description||'',weight:Number(c.weight||0),scale:Number(c.scale||5)}))};
    localStorage.setItem(REVIEW_KEY,JSON.stringify(reviews));closeScore();render();alert(status==='submitted'?'Evaluation submitted successfully.':'Draft saved successfully.');
  }

  $('#juryEntries').addEventListener('click',e=>{const b=e.target.closest('[data-review]');if(b)openScore(b.dataset.review)});
  $$('.review-tab').forEach(b=>b.addEventListener('click',()=>{$$('.review-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');activeTab=b.dataset.reviewTab;render()}));
  $('#reviewSearch').addEventListener('input',render);$('#reviewCategoryFilter').addEventListener('change',render);$('#backToReviews').addEventListener('click',closeScore);$('#saveDraftScore').addEventListener('click',()=>save('draft'));$('#saveDraftScoreBottom').addEventListener('click',()=>save('draft'));$('#submitScore').addEventListener('click',()=>save('submitted'));$('#submitScoreBottom').addEventListener('click',()=>save('submitted'));$('#criteriaList').addEventListener('change',updateWeightedScore);$('#criteriaList').addEventListener('input',updateWeightedScore);
  $('#juryLogout').addEventListener('click',()=>{localStorage.removeItem(SESSION_KEY);location.href='jury-login.html'});
  $('#scoringGuide').addEventListener('click',()=>{const cats=[...new Set(entries().map(e=>e.category))];const msg=cats.map(cat=>`${cat}\n${criteriaForCategory(cat).map(c=>`• ${c.name}: ${c.weight}%`).join('\n')}`).join('\n\n');alert(msg||'No scoring criteria are available yet.')});
  $('#conflictsHelp').addEventListener('click',()=>alert('If you have a conflict of interest with an assigned nomination, contact the award administrator before reviewing it.'));
  render();
})();
