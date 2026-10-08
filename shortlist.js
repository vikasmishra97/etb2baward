(function(){
'use strict';
const KEYS={nominations:'etb2b_awards_nominations_v1',reviews:'etb2b_jury_reviews_v1',assignments:'etb2b_awards_jury_assignments_v1',judges:'etb2b_awards_judges_v3',levels:'etb2b_awards_jury_levels_v1',rules:'etb2b_awards_scoring_v11',shortlist:'etb2b_awards.shortlist.live.v1'};
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??f}catch{return f}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const award=read('etb2b_awards_new_award',{})||{};
const awardId=String(award.slug||'demo');
let nominations=[],reviews={},assignments={},judges=[],levels=[],rules={},decisions={},category='',level='1',tab='shortlist',scoreSort='desc';
const selectedIds=new Set();
const key=(cat,lev)=>awardId+'::'+cat+'::'+lev;
const records=(cat=category)=>decisions[key(cat,level)]||{items:{},locked:false};
const idOf=n=>String(n.id??n.nominationId??'');
const number=(x,f=0)=>Number.isFinite(Number(x))?Number(x):f;
let sharedSyncPending=false;
async function refreshSharedReviews(){
 const api=window.ETB2BSharedReviews;if(!api?.enabled||sharedSyncPending)return;
 sharedSyncPending=true;
 try{
  const list=await api.listSubmitted();const map=read(KEYS.reviews,{});
  list.forEach(row=>{if(row.payload?.status==='submitted'&&String(row.payload.nominationId)===String(row.nomination_id))map[`${row.level}:${row.juror_id}:${row.nomination_id}`]=row.payload});
  reviews=map;
  // Shared data is held in memory to avoid silently overwriting existing local jury data.
  render();
  const stamp=document.querySelector('#sharedReviewState');if(stamp)stamp.textContent='Shared scores synced · '+list.length+' submissions';
 }catch(e){const stamp=document.querySelector('#sharedReviewState');if(stamp)stamp.textContent='Shared sync failed: '+e.message;}
 finally{sharedSyncPending=false}
}
function refreshData(){
  nominations=read(KEYS.nominations,[]);reviews=read(KEYS.reviews,{});assignments=read(KEYS.assignments,{});judges=read(KEYS.judges,[]);levels=read(KEYS.levels,[]);
  rules=(read(KEYS.rules,{})||{}).rules||{};
  decisions=read(KEYS.shortlist,{});
  // List every configured nomination category, even if jury reviews are still pending.
  const cats=[...new Set(nominations.map(n=>String(n.category||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  const oldCat=category; category=(oldCat==='__all__'||cats.includes(oldCat))?oldCat:'__all__';
  $('#categorySelect').innerHTML='<option value="__all__">All categories</option>'+cats.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
  $('#categorySelect').value=category;
  const options=levels.length?levels:[{level:1,name:'Jury Level 1'}];
  const existing=options.some(l=>String(l.level)===String(level));if(!existing)level=String(options[0].level);
  $('#levelSelect').innerHTML=options.map(l=>`<option value="${esc(l.level)}">${esc(l.name||'Jury Level '+l.level)}</option>`).join('');$('#levelSelect').value=level;
  render();
  refreshSharedReviews();
}
function assignedJurors(n){
 const map=assignments[String(level)]||{};
 return [...new Set((map[idOf(n)]||[]).map(String))];
}
function submitted(n){
 const nom=idOf(n), byJurorRound=new Map();
 Object.values(reviews).forEach(r=>{
  if(!r||String(r.status).toLowerCase()!=='submitted'||String(r.nominationId)!==nom||(r.category&&r.category!==n.category))return;
  const jury=String(r.juryId??r.judgeId??'');if(!jury)return;
  const round=String(r.level??'1');
  const k=round+'::'+jury, previous=byJurorRound.get(k);
  if(!previous||String(r.updatedAt||'')>=String(previous.updatedAt||''))byJurorRound.set(k,r);
 });
 return [...byJurorRound.values()].sort((a,b)=>Number(a.level||1)-Number(b.level||1));
}
function entryRows(){
 return nominations.filter(n=>category==='__all__'||n.category===category).map(n=>{
  const assigned=assignedJurors(n), history=submitted(n), current=history.filter(r=>String(r.level??'1')===String(level));
  const scores=history.map(r=>Number(r.total)*10).filter((v,i)=>Number.isFinite(v)&&history[i].total!==null&&history[i].total!==undefined);
  const avg=scores.length?scores.reduce((a,b)=>a+b,0)/scores.length:null;
  const variance=scores.length>1?Math.max(...scores)-Math.min(...scores):null;
  const required=assigned.length,assignedSet=new Set(assigned);
  const completedAssigned=current.filter(r=>assignedSet.has(String(r.juryId??r.judgeId))).length;
  const ready=required>0&&completedAssigned>=required;
  const record=records(n.category).items[idOf(n)]||{};
  return {n,id:idOf(n),locked:records(n.category).locked,reviews:history,current,count:history.length,currentCount:current.length,required,completedAssigned,avg,variance,ready,decision:record.decision||'hold',note:record.note||''};
 }).filter(e=>e.count>0).sort((a,b)=>{if(a.avg===null)return 1;if(b.avg===null)return -1;return (scoreSort==='asc'?a.avg-b.avg:b.avg-a.avg)||a.id.localeCompare(b.id)});
}
function statePersist(){localStorage.setItem(KEYS.shortlist,JSON.stringify(decisions))}
function saveDecision(e,decision,note){
 if(category==='__all__'||records().locked)return false;
 if(decision==='shortlist'&&!e.ready){alert('This nomination requires submitted reviews from all '+e.required+' currently assigned jurors at this level before it can be shortlisted.');return false}
 const k=key(category,level),r=decisions[k]||{items:{},locked:false};r.items=r.items||{};
 r.items[e.id]={decision,note:note??e.note,updatedAt:new Date().toISOString(),score:e.avg,reviewCount:e.count};decisions[k]=r;statePersist();render();return true;
}
function statusMatches(e,filter){return filter==='all'||filter==='complete'&&e.ready||filter==='pending'&&!e.ready||filter===e.decision}
function render(){
 const all=entryRows(),allCategories=category==='__all__',search=$('#scoreSearch').value.trim().toLowerCase(),status=$('#statusSelect').value;
 const rows=all.filter(e=>statusMatches(e,status)&&(!search||[e.id,e.n.nominee,e.n.company,e.n.category].some(s=>String(s||'').toLowerCase().includes(search))));
 $('#statEntries').textContent=all.length;$('#statReady').textContent=all.filter(e=>e.ready).length;$('#statPending').textContent=all.filter(e=>!e.ready).length;$('#statShortlisted').textContent=all.filter(e=>e.decision==='shortlist').length;
 $('#visibleCount').textContent=rows.length+' of '+all.length+' nominations';
 const eligible=rows.filter(e=>e.ready&&!allCategories&&!e.locked&&e.decision!=='shortlist');
 const eligibleIds=new Set(eligible.map(e=>e.id));
 for(const id of selectedIds){if(!eligibleIds.has(id))selectedIds.delete(id)}
 $('#selectedCount').textContent=selectedIds.size+' selected';
 $('#bulkShortlist').disabled=!selectedIds.size;
 $('#selectAllReady').disabled=!eligible.length;
 $('#selectAllReady').checked=eligible.length>0&&eligible.every(e=>selectedIds.has(e.id));
 $('#selectAllReady').indeterminate=selectedIds.size>0&&!$('#selectAllReady').checked;
 $('#bulkBar').classList.toggle('is-locked',allCategories||records().locked);
 $('#resultsHeading').textContent='Shortlist management';
 $('#resultsHint').textContent=allCategories?'Viewing submitted scores across all categories. Select a category to manage its shortlist.':'Review jury scores, set a decision, then lock the final shortlist.';

 $('#lockShortlist').hidden=false;$('#lockShortlist').disabled=allCategories||records().locked||!all.length||!all.some(e=>e.decision==='shortlist');
 $('#lockShortlist').textContent=records().locked?'Shortlist locked':'Lock shortlist';
 $('#publishShortlist').disabled=allCategories||!records().locked || !all.some(e=>e.decision==='shortlist');
 $('#lockStateText').textContent=allCategories?'Showing submitted nominations from all categories. Choose an individual category to shortlist, lock or publish.':records().locked?'This category and jury level are locked. Decisions are read-only.':'Category: '+(category||'None')+' · '+($('#levelSelect').selectedOptions[0]?.textContent||'')+' · Draft decisions';
 $('#liveScoreRows').innerHTML=rows.length?rows.map(e=>{
 const rank=all.indexOf(e)+1,score=e.avg===null?'—':e.avg.toFixed(1),variance=e.variance===null?'—':e.variance.toFixed(1)+' pts';
 const decision=`<select data-id="${esc(e.id)}" class="sl-inline-decision" aria-label="Decision for ${esc(e.n.nominee||e.n.company||e.id)}" ${allCategories||e.locked?'disabled':''}><option value="hold" ${e.decision==='hold'?'selected':''}>Hold</option><option value="shortlist" ${e.decision==='shortlist'?'selected':''}>Shortlist</option><option value="exclude" ${e.decision==='exclude'?'selected':''}>Exclude</option></select>`;
 return `<tr class="${e.ready?'sl-is-ready':'sl-is-pending'}"><td class="sl-check-col"><input type="checkbox" class="sl-row-check" data-select-id="${esc(e.id)}" aria-label="Select ${esc(e.n.nominee||e.n.company||e.id)}" ${selectedIds.has(e.id)?'checked':''} ${!e.ready||allCategories||e.locked||e.decision==='shortlist'?'disabled':''}></td><td><span class="sl-rank">${String(rank).padStart(2,'0')}</span></td><td><div class="sl-entry-name"><b>${esc(e.n.nominee||e.n.company||'Nomination')}</b><span class="sl-entry-meta"><span class="sl-entry-id">${esc(e.id)}</span>${allCategories?`<span class="sl-entry-category">${esc(e.n.category)}</span>`:''}${e.n.company&&e.n.company!==e.n.nominee?`<span>${esc(e.n.company)}</span>`:''}</span></div></td><td><div class="sl-score"><strong>${score}</strong><small> / 100</small><span class="sl-score-scope">All submitted levels</span></div></td><td><div class="sl-progress-top"><strong>${e.count} submitted (all levels)</strong><small class="sl-level-coverage">Level ${esc(level)}: ${e.completedAssigned}/${e.required} assigned</small><span class="sl-coverage-state ${e.ready?'ready':'pending'}">${e.ready?'Ready':'Pending'}</span></div><div class="sl-progress-track"><span style="width:${e.required?Math.min(100,e.completedAssigned/e.required*100):0}%"></span></div></td><td><span class="sl-variance">${variance}</span></td><td>${decision}</td><td><div class="sl-row-actions"><button class="btn secondary compact" data-review-id="${esc(e.id)}">Details</button>${!allCategories&&!e.locked&&e.ready&&e.decision!=='shortlist'?`<button class="btn primary compact sl-shortlist-action" data-quick-id="${esc(e.id)}">Shortlist</button>`:''}</div></td></tr>`;
 }).join(''):'<tr><td colspan="8"><div class="sl-empty-results">No nominations match these filters. Only nominations with submitted jury evaluations appear here.</div></td></tr>';
 $$('[data-select-id]').forEach(box=>box.addEventListener('change',()=>{if(box.checked)selectedIds.add(box.dataset.selectId);else selectedIds.delete(box.dataset.selectId);render()}));
 $$('[data-quick-id]').forEach(b=>b.addEventListener('click',()=>{const entry=all.find(e=>e.id===b.dataset.quickId);if(entry&&confirm('Shortlist '+(entry.n.nominee||entry.n.company||entry.id)+'?'))saveDecision(entry,'shortlist')}));
 $$('[data-review-id]').forEach(b=>b.addEventListener('click',()=>showReview(all.find(e=>e.id===b.dataset.reviewId))));
 $$('[data-id].sl-inline-decision').forEach(sel=>sel.addEventListener('change',()=>{const entry=all.find(e=>e.id===sel.dataset.id);saveDecision(entry,sel.value)}));
}
function showReview(e){if(!e)return;$('#reviewTitle').textContent=e.n.nominee||e.n.company||e.id;
 $('#reviewSubtitle').textContent=e.id+' · '+e.n.category+' · '+($('#levelSelect').selectedOptions[0]?.textContent||'');
 const criteria=new Map();e.reviews.forEach(r=>(r.criteriaSnapshot||[]).forEach(c=>{const key=String(c.id),row=criteria.get(key)||{c,values:[]};if(r.scores&&r.scores[key]!==undefined)row.values.push(number(r.scores[key]));criteria.set(key,row)}));
 const criterionHtml=[...criteria.values()].map(({c,values})=>`<div class="sl-criterion-row"><div><b>${esc(c.name)}</b><span>${number(c.weight)}% weight</span></div><strong>${values.length?(values.reduce((a,b)=>a+b,0)/values.length).toFixed(1):'—'} / ${number(c.scale,5)}</strong></div>`).join('');
 const judgeHtml=e.reviews.map(r=>{const j=judges.find(j=>String(j.id)===String(r.juryId??r.judgeId));return `<div class="sl-jury-review"><div><b>${esc(j?.name||'Juror '+(r.juryId??r.judgeId))}</b><small>Jury Level ${esc(r.level??1)} · ${esc(r.updatedAt?new Date(r.updatedAt).toLocaleString():'Submitted')}</small>${r.comments?`<p>${esc(r.comments)}</p>`:''}</div><strong>${(number(r.total)*10).toFixed(1)} / 100</strong></div>`}).join('');
 $('#reviewDetails').innerHTML=`<div class="sl-review-metrics"><div><span>Average score</span><b>${e.avg===null?'Not scored':e.avg.toFixed(1)+'/100'}</b></div><div><span>Submitted reviews</span><b>${e.count} submitted across levels</b></div><div><span>Level ${esc(level)} assignment status</span><b>${e.ready?'Ready':'Pending'}</b></div></div><h3>Criterion breakdown</h3>${criterionHtml||'<p>No submitted criterion scores yet.</p>'}<h3>Individual jury submissions</h3>${judgeHtml||'<p>Waiting for assigned jurors to submit their evaluations.</p>'}<h3>Decision note</h3><textarea id="reviewDecisionNote" rows="3" placeholder="Reason for shortlist decision..." ${category==='__all__'||e.locked?'disabled':''}>${esc(e.note)}</textarea><div class="sl-review-controls"><button class="btn secondary" data-set-decision="hold" ${category==='__all__'||e.locked?'disabled':''}>Hold</button><button class="btn secondary" data-set-decision="exclude" ${category==='__all__'||e.locked?'disabled':''}>Exclude</button><button class="btn primary" data-set-decision="shortlist" ${category==='__all__'||e.locked||!e.ready?'disabled':''}>Shortlist</button></div>`;
 $$('[data-set-decision]').forEach(b=>b.addEventListener('click',()=>{if(saveDecision(e,b.dataset.setDecision,$('#reviewDecisionNote').value.trim()))hideReview()}));
 $('#scoreReviewModal').hidden=false;document.body.classList.add('sl-modal-visible');
}
function hideReview(){$('#scoreReviewModal').hidden=true;document.body.classList.remove('sl-modal-visible')}
function lock(){const list=entryRows(),selected=list.filter(e=>e.decision==='shortlist');if(!selected.length){alert('Shortlist at least one fully reviewed nomination before locking.');return}if(selected.some(e=>!e.ready)){alert('One or more selected nominations do not meet minimum review requirements.');return}if(category==='__all__')return; if(!confirm('Lock '+selected.length+' shortlisted nominations for '+category+', Jury Level '+level+'? This cannot be undone from this page.'))return;
 const k=key(category,level);decisions[k]=decisions[k]||{items:{}};decisions[k].locked=true;decisions[k].lockedAt=new Date().toISOString();statePersist();render();}
function exportCSV(){const rows=entryRows(),cells=[['Nomination ID','Nominee','Company','Category','Level','Score /100','Submitted reviews','Required reviews','Decision']];rows.forEach(e=>cells.push([e.id,e.n.nominee||'',e.n.company||'',e.n.category,level,e.avg===null?'':e.avg.toFixed(2),e.count,e.required,e.decision]));const csv=cells.map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='etb2b-nomination-scores.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function downloadJson(filename,obj){const url=URL.createObjectURL(new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function prepareShortlistPublication(){const rec=records(),selected=entryRows().filter(e=>e.decision==='shortlist');if(category==='__all__'||!rec.locked||!selected.length){alert('Lock your shortlist before preparing publication.');return}if(selected.some(e=>!e.ready)){alert('Selected nominations must have completed the required reviews.');return}if(!confirm('Prepare '+selected.length+' shortlisted nominations for public release? This downloads a JSON file; it will NOT update GitHub automatically.'))return;downloadJson('published-shortlist.json',{type:'shortlist',awardId,category,level,generatedAt:new Date().toISOString(),items:selected.map(e=>({nominationId:e.id,name:e.n.nominee||e.n.company||'',company:e.n.company||'',category:e.n.category||category}))});alert('Public shortlist file downloaded. Commit published-shortlist.json to the deployed GitHub Pages repository next to public-shortlist.html to make the finalists visible.')}
$('#selectAllReady').addEventListener('change',e=>{const search=$('#scoreSearch').value.trim().toLowerCase(),status=$('#statusSelect').value;const eligible=entryRows().filter(x=>category!=='__all__'&&x.ready&&x.decision!=='shortlist'&&!records().locked&&statusMatches(x,status)&&(!search||[x.id,x.n.nominee,x.n.company,x.n.category].some(v=>String(v||'').toLowerCase().includes(search))));eligible.forEach(x=>e.target.checked?selectedIds.add(x.id):selectedIds.delete(x.id));render()});
$('#clearSelection').addEventListener('click',()=>{selectedIds.clear();render()});
$('#bulkShortlist').addEventListener('click',()=>{const chosen=entryRows().filter(e=>selectedIds.has(e.id)&&e.ready&&e.decision!=='shortlist');if(!chosen.length||category==='__all__'||records().locked)return;if(!confirm('Shortlist '+chosen.length+' fully reviewed nominations?'))return;const k=key(category,level),r=decisions[k]||{items:{},locked:false};r.items=r.items||{};chosen.forEach(e=>{r.items[e.id]={decision:'shortlist',note:e.note,updatedAt:new Date().toISOString(),score:e.avg,reviewCount:e.count}});decisions[k]=r;selectedIds.clear();statePersist();render()});
$('#publishShortlist').addEventListener('click',prepareShortlistPublication);
$('#quickReady').addEventListener('click',()=>{$('#statusSelect').value='complete';render()});
$('#refreshScores').addEventListener('click',refreshData);$('#saveDecisions').addEventListener('click',()=>{statePersist();alert('Shortlist decisions saved.')});$('#exportScores').addEventListener('click',exportCSV);$('#lockShortlist').addEventListener('click',lock);
$('#categorySelect').addEventListener('change',e=>{category=e.target.value;selectedIds.clear();render()});$('#levelSelect').addEventListener('change',e=>{level=e.target.value;selectedIds.clear();render()});$('#statusSelect').addEventListener('change',render);$('#scoreSearch').addEventListener('input',render);$('#scoreSort').addEventListener('change',e=>{scoreSort=e.target.value;render()});

$('#closeScoreReview').addEventListener('click',hideReview);$('#dismissScoreReview').addEventListener('click',hideReview);$('#scoreReviewModal').addEventListener('click',e=>{if(e.target.id==='scoreReviewModal')hideReview()});document.addEventListener('keydown',e=>{if(e.key==='Escape')hideReview()});
window.addEventListener('storage',e=>{if(Object.values(KEYS).includes(e.key))refreshData()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshData()});
window.addEventListener('focus',refreshData);
refreshData();
if(window.ETB2BSharedReviews?.enabled){
 (async()=>{
  const api=window.ETB2BSharedReviews;let user=await api.restore().catch(()=>null);
  if(user?.role!=='admin'){
   const shell=document.createElement('div');shell.style.cssText='position:fixed;inset:0;z-index:999999;background:rgba(12,22,40,.8);display:grid;place-items:center;padding:20px';
   shell.innerHTML='<form style="background:white;border-radius:16px;padding:26px;max-width:400px;width:100%;display:grid;gap:14px"><h2 style="margin:0">Connect live jury scores</h2><p style="margin:0;color:#526073">Admin authentication is required to view synchronized submissions.</p><input required type="email" autocomplete="username" placeholder="Admin email" style="padding:12px;border:1px solid #d8dfe8;border-radius:8px"><input required type="password" autocomplete="current-password" placeholder="Password" style="padding:12px;border:1px solid #d8dfe8;border-radius:8px"><small role="alert" style="color:#bf1323"></small><button type="submit" style="background:#ba0b20;color:white;border:0;border-radius:9px;padding:12px;font-weight:bold">Connect securely</button></form>';
   document.body.appendChild(shell);
   await new Promise(resolve=>shell.querySelector('form').addEventListener('submit',async e=>{e.preventDefault();const [email,password]=shell.querySelectorAll('input');try{user=await api.login(email.value,password.value);if(user.role!=='admin')throw Error('Admin account required');shell.remove();resolve()}catch(ex){shell.querySelector('[role=alert]').textContent=ex.message}}));
  }
  await refreshSharedReviews();
  setInterval(()=>{if(!document.hidden)refreshSharedReviews()},15000);
 })();
}
})();
