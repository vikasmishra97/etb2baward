(function(){
  const STORAGE_KEY='awardflow_scoring_v11';
  const defaultCriteria=[
    {id:1,name:'Innovation',description:'Originality, differentiation and strength of the underlying idea.',weight:30,scale:10,comment:false},
    {id:2,name:'Market Impact',description:'Evidence of customer, commercial or wider industry impact.',weight:25,scale:10,comment:false},
    {id:3,name:'Execution',description:'Quality of delivery, traction, operations and implementation.',weight:25,scale:10,comment:false},
    {id:4,name:'Scalability',description:'Potential for sustainable growth and repeatable expansion.',weight:20,scale:10,comment:false}
  ];
  let state={criteria:defaultCriteria,rules:{blind:false,mandatory:true,editable:true,hideAverages:true,minReviews:3,tieBreak:'Innovation',scoreScale:10,normalization:false},overrides:{'Best Payments Innovation':'Regulatory readiness'}};
  let editingId=null;

  const $=s=>document.querySelector(s);
  const $$=s=>Array.from(document.querySelectorAll(s));
  function toast(message){const t=$('#toast');if(!t)return;t.textContent=message;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
  function load(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));if(saved&&saved.criteria)state=Object.assign(state,saved)}catch(e){}}
  function persist(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
  function totalWeight(){return state.criteria.reduce((sum,c)=>sum+Number(c.weight||0),0)}
  function escapeHtml(s){return String(s).replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]))}

  function renderCriteria(){
    const list=$('#criteriaList');
    list.innerHTML=state.criteria.map((c,index)=>`<div class="sc-criterion" data-id="${c.id}" draggable="true">
      <div class="sc-drag" title="Drag to reorder">::</div>
      <div class="sc-criterion-info"><b>${escapeHtml(c.name)}</b><span>${escapeHtml(c.description)}</span></div>
      <div class="sc-criterion-weight"><div class="sc-range"><i style="width:${Math.min(100,c.weight*2.5)}%"></i></div><label class="sc-weight-edit"><input data-weight="${c.id}" type="number" min="0" max="100" value="${c.weight}"><span>%</span></label></div>
      <div class="sc-criterion-scale"><b>${c.scale===100?'0-100':'1-'+c.scale}</b><span>${c.comment?'Comment required':'Score scale'}</span></div>
      <button class="sc-criterion-menu" data-edit="${c.id}" title="Edit criterion">...</button>
    </div>`).join('');
    updateWeightUI();
    bindDrag();
  }

  function updateWeightUI(){
    const total=totalWeight();
    $('#criteriaCount').textContent=state.criteria.length;
    $('#weightTotal').textContent=total+'%';
    $('#weightPill').textContent=total+' / 100';
    $('#weightBar').style.width=Math.min(total,100)+'%';
    $('#weightStatus').textContent=total===100?'Ready to judge':(total<100?(100-total)+'% still unassigned':(total-100)+'% over limit');
    $('#weightPill').classList.toggle('bad',total!==100);
    $('#weightBar').classList.toggle('bad',total!==100);
  }

  function syncRulesToUI(){
    $('#blindJudging').checked=!!state.rules.blind;
    $('#mandatoryComments').checked=state.rules.mandatory!==false;
    $('#editableScores').checked=state.rules.editable!==false;
    $('#hideAverages').checked=state.rules.hideAverages!==false;
    $('#minimumReviews').value=String(state.rules.minReviews||3);
    $('#tieBreak').value=state.rules.tieBreak||'Innovation';
    $('#scoreScale').value=String(state.rules.scoreScale||10);
    $('#normalization').checked=!!state.rules.normalization;
    updateNormalization();
  }

  function openDrawer(el){el.classList.add('open');el.setAttribute('aria-hidden','false')}
  function closeDrawer(el){el.classList.remove('open');el.setAttribute('aria-hidden','true')}
  function openModal(el){el.classList.add('open');el.setAttribute('aria-hidden','false')}
  function closeModal(el){el.classList.remove('open');el.setAttribute('aria-hidden','true')}

  function startAddCriterion(){
    editingId=null;
    $('#criterionDrawerTitle').textContent='Add criterion';
    $('#saveCriterion').textContent='Add criterion';
    $('#criterionName').value='';
    $('#criterionDescription').value='';
    $('#criterionWeight').value='20';
    $('#criterionScale').value='10';
    $('#criterionComment').checked=false;
    updateCriterionPreview();
    openDrawer($('#criterionDrawer'));
  }

  function startEditCriterion(id){
    const c=state.criteria.find(x=>x.id===id);if(!c)return;
    editingId=id;
    $('#criterionDrawerTitle').textContent='Edit '+c.name;
    $('#saveCriterion').textContent='Save criterion';
    $('#criterionName').value=c.name;
    $('#criterionDescription').value=c.description;
    $('#criterionWeight').value=c.weight;
    $('#criterionScale').value=String(c.scale);
    $('#criterionComment').checked=!!c.comment;
    updateCriterionPreview();
    openDrawer($('#criterionDrawer'));
  }

  function updateCriterionPreview(){
    const name=$('#criterionName').value.trim()||'This criterion';
    const desc=$('#criterionDescription').value.trim()||'Judges will see your guidance beside the scoring control.';
    $('#criterionPreview').textContent=name+': '+desc;
  }

  function saveCriterion(){
    const name=$('#criterionName').value.trim();
    const description=$('#criterionDescription').value.trim();
    const weight=Math.max(0,Number($('#criterionWeight').value||0));
    const scale=Number($('#criterionScale').value||10);
    const comment=$('#criterionComment').checked;
    if(!name){toast('Add a criterion name');return}
    if(editingId){
      const c=state.criteria.find(x=>x.id===editingId);Object.assign(c,{name,description,weight,scale,comment});
    }else{
      state.criteria.push({id:Date.now(),name,description,weight,scale,comment});
    }
    persist();renderCriteria();closeDrawer($('#criterionDrawer'));toast(editingId?'Criterion updated':'Criterion added');
  }

  function bindDrag(){
    let dragged=null;
    $$('.sc-criterion').forEach(row=>{
      row.addEventListener('dragstart',()=>{dragged=Number(row.dataset.id);row.style.opacity='.45'});
      row.addEventListener('dragend',()=>{row.style.opacity='';dragged=null});
      row.addEventListener('dragover',e=>e.preventDefault());
      row.addEventListener('drop',e=>{
        e.preventDefault();const target=Number(row.dataset.id);if(!dragged||dragged===target)return;
        const from=state.criteria.findIndex(c=>c.id===dragged);const to=state.criteria.findIndex(c=>c.id===target);
        const moved=state.criteria.splice(from,1)[0];state.criteria.splice(to,0,moved);persist();renderCriteria();toast('Criterion order updated');
      });
    });
  }

  function renderJudgePreview(){
    const wrap=$('#judgeCriteriaPreview');
    wrap.innerHTML=state.criteria.map(c=>`<div class="sc-judge-criterion" data-preview-id="${c.id}"><div class="sc-judge-criterion-head"><b>${escapeHtml(c.name)}</b><span>${c.weight}% weight</span></div><p>${escapeHtml(c.description)}</p><div class="sc-score-buttons">${Array.from({length:10},(_,i)=>`<button data-score="${i+1}" data-criterion="${c.id}" class="${i===7?'active':''}">${i+1}</button>`).join('')}</div></div>`).join('');
    updateJudgeTotal();
  }

  function updateJudgeTotal(){
    let weighted=0,total=0;
    state.criteria.forEach(c=>{
      const active=document.querySelector(`[data-preview-id="${c.id}"] .sc-score-buttons button.active`);
      const score=active?Number(active.dataset.score):8;
      weighted+=score*c.weight;total+=c.weight;
    });
    const avg=total?weighted/total:0;
    $('#judgePreviewTotal').textContent=avg.toFixed(1)+' / 10';
  }

  function updateNormalization(){
    const on=$('#normalization').checked;
    state.rules.normalization=on;
    $('.sc-mini-toggle span').textContent=on?'On':'Off';
    $('#normalizedValue').textContent=on?'8.18':'8.10';
    $('#normalizedText').textContent=on?'Adjusted for judge severity':'Enable to preview';
  }

  function openOverride(category,button){
    $('#overrideTitle').textContent='Customize '+category;
    $('#overrideCriterion').value=state.overrides[category]||'Regulatory readiness';
    $('#overrideDrawer').dataset.category=category;
    openDrawer($('#overrideDrawer'));
  }

  function saveOverride(){
    const cat=$('#overrideDrawer').dataset.category;
    const name=$('#overrideCriterion').value.trim()||'Category-specific criterion';
    state.overrides[cat]=name;persist();closeDrawer($('#overrideDrawer'));
    const btn=document.querySelector(`[data-override="${CSS.escape(cat)}"]`);
    if(btn){const row=btn.closest('.sc-category-row');const pill=row.querySelector('.sc-pill');pill.textContent='1 override';pill.classList.remove('good');btn.textContent='Edit override'}
    toast('Category override saved');
  }

  function showCopilotAnswer(type){
    const answers={
      weights:'Your weighting is balanced at 100%. Innovation at 30% is intentionally the strongest signal, while Market Impact and Execution each carry 25%. This is a clear, defensible structure for a preliminary round.',
      variance:'Panel variance is healthy at 0.7 points. Vikram averages 0.8 below the panel, but his ranking order still aligns with other judges, so monitoring is enough for now.',
      blind:'Blind judging is most useful when entrant identity could influence perception. For startup awards, consider hiding company and founder names in Round 1, then revealing identity in a finalist round where context matters.',
      ties:'Use the highest-weighted strategic criterion as the first tie-break. For this scorecard, Innovation is the clearest choice, followed by Market Impact if the tie remains.'
    };
    $('#copilotAnswer').textContent=answers[type]||answers.weights;
  }

  load();renderCriteria();syncRulesToUI();

  $('#addCriterion').addEventListener('click',startAddCriterion);
  $('[data-close-criterion]').addEventListener('click',()=>closeDrawer($('#criterionDrawer')));
  $$('#criterionDrawer [data-close-criterion]').forEach(b=>b.addEventListener('click',()=>closeDrawer($('#criterionDrawer'))));
  $('#criterionName').addEventListener('input',updateCriterionPreview);
  $('#criterionDescription').addEventListener('input',updateCriterionPreview);
  $('#saveCriterion').addEventListener('click',saveCriterion);

  $('#criteriaList').addEventListener('input',e=>{
    const input=e.target.closest('[data-weight]');if(!input)return;
    const c=state.criteria.find(x=>x.id===Number(input.dataset.weight));if(!c)return;c.weight=Math.max(0,Number(input.value||0));
    const range=input.closest('.sc-criterion-weight').querySelector('.sc-range i');range.style.width=Math.min(100,c.weight*2.5)+'%';updateWeightUI();persist();
  });
  $('#criteriaList').addEventListener('click',e=>{const b=e.target.closest('[data-edit]');if(b)startEditCriterion(Number(b.dataset.edit))});

  $$('[data-override]').forEach(b=>b.addEventListener('click',()=>openOverride(b.dataset.override,b)));
  $$('[data-close-override]').forEach(b=>b.addEventListener('click',()=>closeDrawer($('#overrideDrawer'))));
  $('#saveOverride').addEventListener('click',saveOverride);
  $('#copyMaster').addEventListener('click',()=>{state.overrides={};persist();$$('.sc-category-row').forEach(row=>{row.querySelector('.sc-pill').textContent='Master scorecard';row.querySelector('.sc-pill').classList.add('good');row.querySelector('button').textContent='Customize'});toast('Master scorecard applied to all categories')});

  ['blindJudging','mandatoryComments','editableScores','hideAverages'].forEach(id=>$('#'+id).addEventListener('change',()=>{state.rules.blind=$('#blindJudging').checked;state.rules.mandatory=$('#mandatoryComments').checked;state.rules.editable=$('#editableScores').checked;state.rules.hideAverages=$('#hideAverages').checked;persist()}));
  $('#minimumReviews').addEventListener('change',()=>{state.rules.minReviews=Number($('#minimumReviews').value);$('#reviewMinimum').textContent=state.rules.minReviews;persist();toast('Minimum review rule updated')});
  $('#tieBreak').addEventListener('change',()=>{state.rules.tieBreak=$('#tieBreak').value;persist()});
  $('#scoreScale').addEventListener('change',()=>{state.rules.scoreScale=Number($('#scoreScale').value);persist();toast('Score scale updated')});
  $('#normalization').addEventListener('change',()=>{updateNormalization();persist();toast($('#normalization').checked?'Normalization preview enabled':'Normalization disabled')});
  $('#applyTieBreak').addEventListener('click',()=>{$('#tieBreak').value='Innovation';state.rules.tieBreak='Innovation';persist();toast('Innovation set as tie-break criterion')});
  $('#runBiasCheck').addEventListener('click',()=>{openModal($('#varianceModal'));toast('Fairness check complete')});
  $('#openVariance').addEventListener('click',()=>openModal($('#varianceModal')));
  $$('[data-review-judge]').forEach(b=>b.addEventListener('click',()=>openModal($('#varianceModal'))));
  $$('[data-close-variance]').forEach(b=>b.addEventListener('click',()=>closeModal($('#varianceModal'))));

  function openScorecard(){renderJudgePreview();openModal($('#scorecardModal'))}
  $('#previewScorecard').addEventListener('click',openScorecard);
  $('#previewScorecardSide').addEventListener('click',openScorecard);
  $$('[data-close-scorecard]').forEach(b=>b.addEventListener('click',()=>closeModal($('#scorecardModal'))));
  $('#judgeCriteriaPreview').addEventListener('click',e=>{const b=e.target.closest('[data-score]');if(!b)return;b.parentElement.querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active');updateJudgeTotal()});
  $('#submitPreviewReview').addEventListener('click',()=>{closeModal($('#scorecardModal'));toast('Demo review submitted')});

  $('#saveScoring').addEventListener('click',()=>{persist();toast(totalWeight()===100?'Scoring framework saved':'Saved - weights still need to total 100%')});
  $('#manageRounds').addEventListener('click',()=>toast('Round manager opened - demo concept'));
  $('#openCopilot').addEventListener('click',()=>$('#copilotPanel').classList.add('open'));
  $('#closeCopilot').addEventListener('click',()=>$('#copilotPanel').classList.remove('open'));
  $$('.sc-copilot-prompts button').forEach(b=>b.addEventListener('click',()=>showCopilotAnswer(b.dataset.prompt)));
})();
