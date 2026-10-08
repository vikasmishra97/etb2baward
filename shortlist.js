(function(){
'use strict';
const KEYS={nominations:'etb2b_awards_nominations_v1',reviews:'etb2b_jury_reviews_v1',assignments:'etb2b_awards_jury_assignments_v1',judges:'etb2b_awards_judges_v3',levels:'etb2b_awards_jury_levels_v1',rules:'etb2b_awards_scoring_v11',shortlist:'etb2b_awards.shortlist.live.v1'};
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??f}catch{return f}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const award=read('etb2b_awards_new_award',{})||{};
const awardId=String(award.slug||'demo');
let nominations=[],reviews={},assignments={},judges=[],levels=[],rules={},decisions={},category='',level='1',tab='shortlist';
const selectedIds=new Set();
const key=(cat,lev)=>awardId+'::'+cat+'::'+lev;
const records=()=>decisions[key(category,level)]||{items:{},locked:false};
const idOf=n=>String(n.id??n.nominationId??'');
const number=(x,f=0)=>Number.isFinite(Number(x))?Number(x):f;
function refreshData(){
  nominations=read(KEYS.nominations,[]);reviews=read(KEYS.reviews,{});assignments=read(KEYS.assignments,{});judges=read(KEYS.judges,[]);levels=read(KEYS.levels,[]);
  rules=(read(KEYS.rules,{})||{}).rules||{};
  decisions=read(KEYS.shortlist,{});
  const cats=[...new Set(nominations.filter(n=>n.submission==='Submitted'&&n.payment==='Paid').map(n=>n.category).filter(Boolean))];
  const oldCat=category; category=cats.includes(oldCat)?oldCat:(cats[0]||'');
  $('#categorySelect').innerHTML=cats.length?cats.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join(''):'<option value="">No submitted nominations</option>';
  $('#categorySelect').value=category;
  const options=levels.length?levels:[{level:1,name:'Jury Level 1'}];
  const existing=options.some(l=>String(l.level)===String(level));if(!existing)level=String(options[0].level);
  $('#levelSelect').innerHTML=options.map(l=>`<option value="${esc(l.level)}">${esc(l.name||'Jury Level '+l.level)}</option>`).join('');$('#levelSelect').value=level;
  render();
}
function assignedJurors(n){
 const map=assignments[String(level)]||{};
 return [...new Set((map[idOf(n)]||[]).map(String))];
}
function submitted(n){
 const nom=idOf(n), byJuror=new Map();
 // Submissions are stored by juror + nomination, and include their original level.
 // Keep valid submitted history even if a juror was subsequently reassigned.
 Object.values(reviews).forEach(r=>{
  if(!r||String(r.status).toLowerCase()!=='submitted'||String(r.nominationId)!==nom||String(r.level)!==String(level)|| (r.category&&r.category!==n.category))return;
  const id=String(r.juryId??r.judgeId??'');if(!id)return;
  const previous=byJuror.get(id);
  if(!previous||String(r.updatedAt||'')>=String(previous.updatedAt||''))byJuror.set(id,r);
 });
 return [...byJuror.values()];
}
function entryRows(){
 return nominations.filter(n=>n.submission==='Submitted'&&n.payment==='Paid'&&n.category===category).map(n=>{
  const assigned=assignedJurors(n),arr=submitted(n),scores=arr.map(r=>number(r.total)*10),avg=scores.length?scores.reduce((a,b)=>a+b,0)/scores.length:null;
  const variance=scores.length>1?Math.max(...scores)-Math.min(...scores):null;
  const required=assigned.length;
  const assignedSet=new Set(assigned);
  const completedAssigned=arr.filter(r=>assignedSet.has(String(r.juryId??r.judgeId))).length;
  const ready=required>0&&completedAssigned>=required;
  const record=records().items[idOf(n)]||{};
  return {n,id:idOf(n),reviews:arr,count:arr.length,required,completedAssigned,avg,variance,ready,decision:record.decision||'hold',note:record.note||''};
 }).sort((a,b)=>(b.avg??-1)-(a.avg??-1)||a.id.localeCompare(b.id));
}
function statePersist(){localStorage.setItem(KEYS.shortlist,JSON.stringify(decisions))}
function saveDecision(e,decision,note){
 if(records().locked)return false;
 if(decision==='shortlist'&&!e.ready){alert('This nomination requires submitted reviews from all '+e.required+' currently assigned jurors at this level before it can be shortlisted.');return false}
 const k=key(category,level),r=decisions[k]||{items:{},locked:false};r.items=r.items||{};
 r.items[e.id]={decision,note:note??e.note,updatedAt:new Date().toISOString(),score:e.avg,reviewCount:e.count};decisions[k]=r;statePersist();render();return true;
}
function statusMatches(e,filter){return filter==='all'||filter==='complete'&&e.ready||filter==='pending'&&!e.ready||filter===e.decision}
function render(){
 const all=entryRows(),search=$('#scoreSearch').value.trim().toLowerCase(),status=$('#statusSelect').value;
 const rows=all.filter(e=>statusMatches(e,status)&&(!search||[e.id,e.n.nominee,e.n.company,e.n.category].some(s=>String(s||'').toLowerCase().includes(search))));
 $('#statEntries').textContent=all.length;$('#statReady').textContent=all.filter(e=>e.ready).length;$('#statPending').textContent=all.filter(e=>!e.ready).length;$('#statShortlisted').textContent=all.filter(e=>e.decision==='shortlist').length;
 $('#visibleCount').textContent=rows.length+' of '+all.length+' nominations';
 const eligible=rows.filter(e=>e.ready&&!records().locked&&e.decision!=='shortlist');
 const eligibleIds=new Set(eligible.map(e=>e.id));
 for(const id of selectedIds){if(!eligibleIds.has(id))selectedIds.delete(id)}
 $('#selectedCount').textContent=selectedIds.size+' selected';
 $('#bulkShortlist').disabled=!selectedIds.size;
 $('#selectAllReady').disabled=!eligible.length;
 $('#selectAllReady').checked=eligible.length>0&&eligible.every(e=>selectedIds.has(e.id));
 $('#selectAllReady').indeterminate=selectedIds.size>0&&!$('#selectAllReady').checked;
 $('#bulkBar').classList.toggle('is-locked',records().locked);
 $('#resultsHeading').textContent='Shortlist management';
 $('#resultsHint').textContent='Review jury scores, set a decision, then lock the final shortlist.';

 $('#lockShortlist').hidden=false;$('#lockShortlist').disabled=records().locked||!all.length||!all.some(e=>e.decision==='shortlist');
 $('#lockShortlist').textContent=records().locked?'Shortlist locked':'Lock shortlist';
 $('#publishShortlist').disabled=!records().locked || !all.some(e=>e.decision==='shortlist');
 $('#lockStateText').textContent=records().locked?'This category and jury level are locked. Decisions are read-only.':'Category: '+(category||'None')+' · '+($('#levelSelect').selectedOptions[0]?.textContent||'')+' · Draft decisions';
 $('#liveScoreRows').innerHTML=rows.length?rows.map(e=>{
 const rank=all.indexOf(e)+1,score=e.avg===null?'—':e.avg.toFixed(1),variance=e.variance===null?'—':e.variance.toFixed(1)+' pts';
 const decision=`<select data-id="${esc(e.id)}" class="sl-inline-decision" aria-label="Decision for ${esc(e.n.nominee||e.n.company||e.id)}" ${records().locked?'disabled':''}><option value="hold" ${e.decision==='hold'?'selected':''}>Hold</option><option value="shortlist" ${e.decision==='shortlist'?'selected':''}>Shortlist</option><option value="exclude" ${e.decision==='exclude'?'selected':''}>Exclude</option></select>`;
 return `<tr class="${e.ready?'sl-is-ready':'sl-is-pending'}"><td class="sl-check-col"><input type="checkbox" class="sl-row-check" data-select-id="${esc(e.id)}" aria-label="Select ${esc(e.n.nominee||e.n.company||e.id)}" ${selectedIds.has(e.id)?'checked':''} ${!e.ready||records().locked||e.decision==='shortlist'?'disabled':''}></td><td><span class="sl-rank">${String(rank).padStart(2,'0')}</span></td><td><div class="sl-entry-name"><b>${esc(e.n.nominee||e.n.company||'Nomination')}</b><span class="sl-entry-meta"><span class="sl-entry-id">${esc(e.id)}</span>${e.n.company&&e.n.company!==e.n.nominee?`<span>${esc(e.n.company)}</span>`:''}</span></div></td><td><div class="sl-score"><strong>${score}</strong><small> / 100</small></div></td><td><div class="sl-progress-top"><strong>${e.count} submitted · ${e.required} assigned</strong><span class="sl-coverage-state ${e.ready?'ready':'pending'}">${e.ready?'Ready':'Pending'}</span></div><div class="sl-progress-track"><span style="width:${e.required?Math.min(100,e.completedAssigned/e.required*100):0}%"></span></div></td><td><span class="sl-variance">${variance}</span></td><td>${decision}</td><td><div class="sl-row-actions"><button class="btn secondary compact" data-review-id="${esc(e.id)}">Details</button>${!records().locked&&e.ready&&e.decision!=='shortlist'?`<button class="btn primary compact sl-shortlist-action" data-quick-id="${esc(e.id)}">Shortlist</button>`:''}</div></td></tr>`;
 }).join(''):'<tr><td colspan="8"><div class="sl-empty-results">No nominations match these filters. Submitted and paid nominations from Judges will appear here.</div></td></tr>';
 $$('[data-select-id]').forEach(box=>box.addEventListener('change',()=>{if(box.checked)selectedIds.add(box.dataset.selectId);else selectedIds.delete(box.dataset.selectId);render()}));
 $$('[data-quick-id]').forEach(b=>b.addEventListener('click',()=>{const entry=all.find(e=>e.id===b.dataset.quickId);if(entry&&confirm('Shortlist '+(entry.n.nominee||entry.n.company||entry.id)+'?'))saveDecision(entry,'shortlist')}));
 $$('[data-review-id]').forEach(b=>b.addEventListener('click',()=>showReview(all.find(e=>e.id===b.dataset.reviewId))));
 $$('[data-id].sl-inline-decision').forEach(sel=>sel.addEventListener('change',()=>{const entry=all.find(e=>e.id===sel.dataset.id);saveDecision(entry,sel.value)}));
}
function showReview(e){if(!e)return;$('#reviewTitle').textContent=e.n.nominee||e.n.company||e.id;
 $('#reviewSubtitle').textContent=e.id+' · '+e.n.category+' · '+($('#levelSelect').selectedOptions[0]?.textContent||'');
 const criteria=new Map();e.reviews.forEach(r=>(r.criteriaSnapshot||[]).forEach(c=>{const key=String(c.id),row=criteria.get(key)||{c,values:[]};if(r.scores&&r.scores[key]!==undefined)row.values.push(number(r.scores[key]));criteria.set(key,row)}));
 const criterionHtml=[...criteria.values()].map(({c,values})=>`<div class="sl-criterion-row"><div><b>${esc(c.name)}</b><span>${number(c.weight)}% weight</span></div><strong>${values.length?(values.reduce((a,b)=>a+b,0)/values.length).toFixed(1):'—'} / ${number(c.scale,5)}</strong></div>`).join('');
 const judgeHtml=e.reviews.map(r=>{const j=judges.find(j=>String(j.id)===String(r.juryId??r.judgeId));return `<div class="sl-jury-review"><div><b>${esc(j?.name||'Juror '+(r.juryId??r.judgeId))}</b><small>${esc(r.updatedAt?new Date(r.updatedAt).toLocaleString():'Submitted')}</small>${r.comments?`<p>${esc(r.comments)}</p>`:''}</div><strong>${(number(r.total)*10).toFixed(1)} / 100</strong></div>`}).join('');
 $('#reviewDetails').innerHTML=`<div class="sl-review-metrics"><div><span>Average score</span><b>${e.avg===null?'Not scored':e.avg.toFixed(1)+'/100'}</b></div><div><span>Submitted reviews</span><b>${e.count} submitted · ${e.required} assigned</b></div><div><span>Assignment status</span><b>${e.ready?'Ready':'Pending'}</b></div></div><h3>Criterion breakdown</h3>${criterionHtml||'<p>No submitted criterion scores yet.</p>'}<h3>Individual jury submissions</h3>${judgeHtml||'<p>Waiting for assigned jurors to submit their evaluations.</p>'}<h3>Decision note</h3><textarea id="reviewDecisionNote" rows="3" placeholder="Reason for shortlist decision..." ${records().locked?'disabled':''}>${esc(e.note)}</textarea><div class="sl-review-controls"><button class="btn secondary" data-set-decision="hold" ${records().locked?'disabled':''}>Hold</button><button class="btn secondary" data-set-decision="exclude" ${records().locked?'disabled':''}>Exclude</button><button class="btn primary" data-set-decision="shortlist" ${records().locked||!e.ready?'disabled':''}>Shortlist</button></div>`;
 $$('[data-set-decision]').forEach(b=>b.addEventListener('click',()=>{if(saveDecision(e,b.dataset.setDecision,$('#reviewDecisionNote').value.trim()))hideReview()}));
 $('#scoreReviewModal').hidden=false;document.body.classList.add('sl-modal-visible');
}
function hideReview(){$('#scoreReviewModal').hidden=true;document.body.classList.remove('sl-modal-visible')}
function lock(){const list=entryRows(),selected=list.filter(e=>e.decision==='shortlist');if(!selected.length){alert('Shortlist at least one fully reviewed nomination before locking.');return}if(selected.some(e=>!e.ready)){alert('One or more selected nominations do not meet minimum review requirements.');return}if(!confirm('Lock '+selected.length+' shortlisted nominations for '+category+', Jury Level '+level+'? This cannot be undone from this page.'))return;
 const k=key(category,level);decisions[k]=decisions[k]||{items:{}};decisions[k].locked=true;decisions[k].lockedAt=new Date().toISOString();statePersist();render();}
function exportCSV(){const rows=entryRows(),cells=[['Nomination ID','Nominee','Company','Category','Level','Score /100','Submitted reviews','Required reviews','Decision']];rows.forEach(e=>cells.push([e.id,e.n.nominee||'',e.n.company||'',category,level,e.avg===null?'':e.avg.toFixed(2),e.count,e.required,e.decision]));const csv=cells.map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='etb2b-nomination-scores.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function downloadJson(filename,obj){const url=URL.createObjectURL(new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function prepareShortlistPublication(){const rec=records(),selected=entryRows().filter(e=>e.decision==='shortlist');if(!rec.locked||!selected.length){alert('Lock your shortlist before preparing publication.');return}if(selected.some(e=>!e.ready)){alert('Selected nominations must have completed the required reviews.');return}if(!confirm('Prepare '+selected.length+' shortlisted nominations for public release? This downloads a JSON file; it will NOT update GitHub automatically.'))return;downloadJson('published-shortlist.json',{type:'shortlist',awardId,category,level,generatedAt:new Date().toISOString(),items:selected.map(e=>({nominationId:e.id,name:e.n.nominee||e.n.company||'',company:e.n.company||'',category:e.n.category||category}))});alert('Public shortlist file downloaded. Commit published-shortlist.json to the deployed GitHub Pages repository next to public-shortlist.html to make the finalists visible.')}
$('#selectAllReady').addEventListener('change',e=>{const search=$('#scoreSearch').value.trim().toLowerCase(),status=$('#statusSelect').value;const eligible=entryRows().filter(x=>x.ready&&x.decision!=='shortlist'&&!records().locked&&statusMatches(x,status)&&(!search||[x.id,x.n.nominee,x.n.company,x.n.category].some(v=>String(v||'').toLowerCase().includes(search))));eligible.forEach(x=>e.target.checked?selectedIds.add(x.id):selectedIds.delete(x.id));render()});
$('#clearSelection').addEventListener('click',()=>{selectedIds.clear();render()});
$('#bulkShortlist').addEventListener('click',()=>{const chosen=entryRows().filter(e=>selectedIds.has(e.id)&&e.ready&&e.decision!=='shortlist');if(!chosen.length||records().locked)return;if(!confirm('Shortlist '+chosen.length+' fully reviewed nominations?'))return;const k=key(category,level),r=decisions[k]||{items:{},locked:false};r.items=r.items||{};chosen.forEach(e=>{r.items[e.id]={decision:'shortlist',note:e.note,updatedAt:new Date().toISOString(),score:e.avg,reviewCount:e.count}});decisions[k]=r;selectedIds.clear();statePersist();render()});
$('#publishShortlist').addEventListener('click',prepareShortlistPublication);
$('#quickReady').addEventListener('click',()=>{$('#statusSelect').value='complete';render()});
$('#refreshScores').addEventListener('click',refreshData);$('#saveDecisions').addEventListener('click',()=>{statePersist();alert('Shortlist decisions saved.')});$('#exportScores').addEventListener('click',exportCSV);$('#lockShortlist').addEventListener('click',lock);
$('#categorySelect').addEventListener('change',e=>{category=e.target.value;selectedIds.clear();render()});$('#levelSelect').addEventListener('change',e=>{level=e.target.value;selectedIds.clear();render()});$('#statusSelect').addEventListener('change',render);$('#scoreSearch').addEventListener('input',render);

$('#closeScoreReview').addEventListener('click',hideReview);$('#dismissScoreReview').addEventListener('click',hideReview);$('#scoreReviewModal').addEventListener('click',e=>{if(e.target.id==='scoreReviewModal')hideReview()});document.addEventListener('keydown',e=>{if(e.key==='Escape')hideReview()});
window.addEventListener('storage',e=>{if(Object.values(KEYS).includes(e.key))refreshData()});
refreshData();
})();
