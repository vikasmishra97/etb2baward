(() => {
  const JUDGE_KEY='etb2b_awards_judges_v3', SESSION_KEY='etb2b_jury_session_v1', LEVEL_KEY='etb2b_awards_jury_levels_v1', SCORE_KEY='etb2b_awards_scoring_v11', REVIEW_KEY='etb2b_jury_reviews_v1';
  const $=s=>document.querySelector(s);
  const session=(()=>{try{return JSON.parse(localStorage.getItem(SESSION_KEY))}catch{return null}})();
  const judges=(()=>{try{return JSON.parse(localStorage.getItem(JUDGE_KEY))||[]}catch{return []}})();
  const jury=session&&judges.find(j=>String(j.id)===String(session.juryId));
  if(!jury||jury.enabled===false){window.location.replace('jury-login.html');return}
  const levels=(()=>{try{return JSON.parse(localStorage.getItem(LEVEL_KEY))||[]}catch{return []}})();
  const level=levels.find(x=>Number(x.level)===Number(jury.level||1))||{name:`Jury Level ${jury.level||1}`,type:'evaluation',juryEvaluate:true,showPreviousScores:false};
  const scoring=(()=>{try{return JSON.parse(localStorage.getItem(SCORE_KEY))||null}catch{return null}})();
  const criteria=scoring?.criteria?.length?scoring.criteria:[{id:1,name:'Innovation',description:'Originality and differentiation',weight:30,scale:10},{id:2,name:'Market Impact',description:'Customer and industry impact',weight:25,scale:10},{id:3,name:'Execution',description:'Quality of implementation',weight:25,scale:10},{id:4,name:'Scalability',description:'Potential for sustainable growth',weight:20,scale:10}];
  let reviews=(()=>{try{return JSON.parse(localStorage.getItem(REVIEW_KEY))||{}}catch{return {}}})();
  let currentEntry=null;
  const names=['NovaPay Technologies','FlowMoney Labs','CredAxis','FinEdge Systems','PayOrbit','LendSphere','DataMint AI','SecurePay Labs','CapitalBridge','NextLedger'];
  const esc=s=>String(s??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
  function entries(){
    const cats=(jury.categories||[]).filter(c=>(level.categories||jury.categories||[]).includes(c));let out=[];let n=0;
    cats.forEach((cat,ci)=>{for(let i=0;i<4;i++){n++;out.push({id:`L${jury.level||1}-${ci+1}-${i+1}`,category:cat,name:names[(ci*3+i)%names.length],code:`IFT-${String(2000+n).padStart(4,'0')}`})}});
    return out;
  }
  function key(e){return `${jury.id}:${e.id}`}
  function render(){
    const es=entries(),submitted=es.filter(e=>reviews[key(e)]?.status==='submitted').length;
    $('#juryWelcome').textContent=jury.name;$('#juryMeta').textContent=`${jury.role||'Jury Member'} · ${jury.company||'Independent'}`;$('#juryLevelPill').textContent=level.name||`Jury Level ${jury.level||1}`;$('#roundPurpose').textContent=level.type==='verification'?'Verification / eligibility':level.type==='final'?'Final jury decision':'Evaluation / scoring';
    $('#assignedStat').textContent=es.length;$('#submittedStat').textContent=submitted;$('#pendingStat').textContent=es.length-submitted;$('#categoriesStat').textContent=(jury.categories||[]).length;
    $('#juryEntries').innerHTML=es.length?es.map(e=>{const r=reviews[key(e)];return `<article class="entry"><div><small>${esc(e.category)}</small><h3>${esc(e.name)}</h3><p>${esc(e.code)} · ${r?.status==='submitted'?'Evaluation submitted':r?'Draft saved':'Assigned to you'}</p></div>${r?.status==='submitted'?`<span class="done">✓ Submitted · ${Number(r.total||0).toFixed(1)}/10</span>`:`<button data-review="${esc(e.id)}">${r?'Continue':'Review entry'} →</button>`}</article>`}).join(''):'<div class="empty">No categories or nominations are assigned to your account.</div>';
  }
  function openScore(id){
    currentEntry=entries().find(e=>e.id===id);if(!currentEntry)return;
    const prev=reviews[key(currentEntry)]||{scores:{},comments:''};
    $('#scoreCategory').textContent=currentEntry.category;$('#scoreTitle').textContent=currentEntry.name;$('#juryComments').value=prev.comments||'';
    $('#criteriaList').innerHTML=criteria.map(c=>`<div class="criterion"><div><b>${esc(c.name)} · ${Number(c.weight||0)}%</b><small>${esc(c.description||'')}</small></div><input type="number" min="0" max="${Number(c.scale||10)}" step="0.5" value="${prev.scores?.[c.id]??''}" data-criterion="${c.id}" data-scale="${Number(c.scale||10)}" placeholder="/${Number(c.scale||10)}"></div>`).join('');
    $('#scoreModal').classList.add('open');
  }
  function save(status){if(!currentEntry)return;const scores={};let valid=true;document.querySelectorAll('[data-criterion]').forEach(i=>{if(i.value===''){if(status==='submitted')valid=false;return}scores[i.dataset.criterion]=Number(i.value)});if(!valid){alert('Please score every criterion before submitting.');return}let total=0;criteria.forEach(c=>{const raw=Number(scores[c.id]??0),scale=Number(c.scale||10);total+=(raw/scale)*(Number(c.weight||0)/100)*10});reviews[key(currentEntry)]={status,scores,comments:$('#juryComments').value.trim(),total,updatedAt:new Date().toISOString()};localStorage.setItem(REVIEW_KEY,JSON.stringify(reviews));$('#scoreModal').classList.remove('open');render()}
  $('#juryEntries').addEventListener('click',e=>{const b=e.target.closest('[data-review]');if(b)openScore(b.dataset.review)});$('#closeScore').addEventListener('click',()=>$('#scoreModal').classList.remove('open'));$('#saveDraftScore').addEventListener('click',()=>save('draft'));$('#submitScore').addEventListener('click',()=>save('submitted'));$('#juryLogout').addEventListener('click',()=>{localStorage.removeItem(SESSION_KEY);location.href='jury-login.html'});$('#scoringGuide').addEventListener('click',()=>alert(criteria.map(c=>`${c.name}: ${c.weight}%`).join('\n')));$('#conflictsHelp').addEventListener('click',()=>alert('If you have a conflict of interest with an assigned nomination, contact the award administrator before reviewing it.'));
  render();
})();
