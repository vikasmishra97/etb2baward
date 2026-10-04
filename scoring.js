(function(){
  const STORAGE_KEY='etb2b_awards_scoring_v11';
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const read=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v??f}catch{return f}};
  const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const toast=m=>{const t=$('#toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(t._x);t._x=setTimeout(()=>t.classList.remove('show'),2200)};
  const award=read('etb2b_awards_new_award',{})||{}, slug=award.slug||'demo';
  const fallbackCats=['Best FinTech Startup','Best Digital Lending','Best Payments Innovation','Best AI in Financial Services'];
  function getCategories(){
    const subs=read('etb2b_awards_categories_'+slug,[]).filter(c=>c&&c.status!=='deleted'&&c.status!=='inactive');
    const names=subs.map(c=>c.name).filter(Boolean);
    if(names.length)return [...new Set(names)];
    const levels=read('etb2b_awards_jury_levels_v1',[]);const levelCats=levels.flatMap(l=>l.categories||[]).filter(Boolean);
    return [...new Set(levelCats.length?levelCats:fallbackCats)];
  }
  let categories=getCategories();
  const defaults=[
    {id:2843,name:'Business Impact Assessment',description:'Evaluate the measurable business, customer or organisational impact demonstrated by the entry.',weight:25,scale:5,categories:[...categories],comment:false},
    {id:2842,name:'Emerging Technologies Leveraged',description:'Assess how effectively relevant emerging technologies have been applied.',weight:20,scale:5,categories:[...categories],comment:false},
    {id:2841,name:'Scalability, Breadth and Depth of the Initiative',description:'Assess scalability, reach, repeatability and depth of implementation.',weight:20,scale:5,categories:[...categories],comment:false},
    {id:2840,name:'Novelty, Innovation, and Differentiation Created',description:'Assess originality, differentiation and innovation compared with existing approaches.',weight:20,scale:5,categories:[...categories],comment:false},
    {id:2839,name:'Business Goals and Objectives Addressed',description:'Assess alignment to clearly defined goals, objectives and intended outcomes.',weight:15,scale:5,categories:[...categories],comment:false}
  ];
  let state=read(STORAGE_KEY,null)||{criteria:defaults,rules:{mandatory:true,minReviews:3,scoreScale:5}};
  if(!Array.isArray(state.criteria))state.criteria=[];
  state.criteria=state.criteria.map(c=>({...c,categories:Array.isArray(c.categories)?c.categories:(c.category&&c.category!=='all'?[c.category]:[...categories])}));
  state.rules=state.rules||{mandatory:true,minReviews:3,scoreScale:5};
  let editingId=null;
  function persist(){write(STORAGE_KEY,state)}
  function selectedCategories(){return $$('#criteriaCategoryList input:checked').map(i=>i.value)}
  function criteriaForCategory(cat){return state.criteria.filter(c=>(c.categories||[]).includes(cat))}
  function categoryWeight(cat){return criteriaForCategory(cat).reduce((s,c)=>s+Number(c.weight||0),0)}
  function renderFilters(){const f=$('#criteriaCategoryFilter'),old=f.value||'all';f.innerHTML='<option value="all">All Categories</option>'+categories.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');f.value=[...f.options].some(o=>o.value===old)?old:'all'}
  function renderRows(){
    const q=($('#criteriaSearch').value||'').toLowerCase().trim(),cat=$('#criteriaCategoryFilter').value;
    let rows=state.criteria.filter(c=>!q||`${c.name} ${c.description||''}`.toLowerCase().includes(q));if(cat!=='all')rows=rows.filter(c=>(c.categories||[]).includes(cat));
    $('#criteriaRows').innerHTML=rows.length?rows.map((c,i)=>`<tr><td>${i+1}</td><td>${esc(c.id)}</td><td><b>${esc(c.name)}</b>${c.description?`<small>${esc(c.description)}</small>`:''}</td><td><strong>${Number(c.weight||0).toFixed(0)}%</strong></td><td><button class="criteria-category-link" data-view-cats="${c.id}">View (${(c.categories||[]).length})</button></td><td><div class="criteria-row-actions"><button data-edit="${c.id}" title="Edit">✎</button><button data-delete="${c.id}" title="Delete">🗑</button></div></td></tr>`).join(''):'<tr><td colspan="6"><div class="criteria-empty">No criteria match this view.</div></td></tr>';
  }
  function renderSummary(){
    $('#criteriaCount').textContent=state.criteria.length;
    const covered=categories.filter(c=>criteriaForCategory(c).length).length;$('#categoryCoverage').textContent=`${covered}/${categories.length}`;
    const weights=categories.map(c=>categoryWeight(c)),ready=weights.length&&weights.every(w=>w===100);$('#weightHealth').textContent=ready?'Ready':'Review';$('#weightHealth').classList.toggle('good',ready);$('#weightHealthText').textContent=ready?'Every category totals 100%':`${weights.filter(w=>w!==100).length} categor${weights.filter(w=>w!==100).length===1?'y':'ies'} need weight adjustment`;
    $('#categoryWeightGrid').innerHTML=categories.map(cat=>{const w=categoryWeight(cat),n=criteriaForCategory(cat).length,status=w===100?'ready':w>100?'over':'under';return `<article class="category-weight-tile ${status}"><div><b>${esc(cat)}</b><span>${n} criteria</span></div><strong>${w}%</strong><div class="category-weight-track"><i style="width:${Math.min(w,100)}%"></i></div><small>${w===100?'Ready for judging':w<100?`${100-w}% weight remaining`:`${w-100}% over 100`}</small></article>`}).join('')||'<div class="criteria-empty">Create categories first.</div>';
  }
  function render(){categories=getCategories();renderFilters();renderRows();renderSummary();persist()}
  function renderPicker(selected=[]){$('#criteriaCategoryList').innerHTML=categories.map(c=>`<label data-cat-label="${esc(c.toLowerCase())}"><input type="checkbox" value="${esc(c)}" ${selected.includes(c)?'checked':''}><span>${esc(c)}</span><small>${categoryWeight(c)}% configured</small></label>`).join('');updatePickerSummary()}
  function updatePickerSummary(){const boxes=$$('#criteriaCategoryList input'),checked=boxes.filter(i=>i.checked);$('#criteriaCategorySummary').textContent=!checked.length?'None selected':checked.length===boxes.length&&boxes.length?`All selected (${checked.length})`:`${checked.length} selected`;$('#criteriaSelectAll').checked=!!boxes.length&&checked.length===boxes.length;$('#criteriaSelectAll').indeterminate=checked.length>0&&checked.length<boxes.length;updateAiTip()}
  function updateAiTip(){const weight=Number($('#criterionWeight').value||0),selected=selectedCategories();if(!selected.length){$('#criterionAiTip').textContent='Select at least one category to see the weight impact.';return}const risks=selected.filter(cat=>{const current=categoryWeight(cat)-(editingId&&state.criteria.find(c=>String(c.id)===String(editingId))?.categories?.includes(cat)?Number(state.criteria.find(c=>String(c.id)===String(editingId)).weight||0):0);return current+weight>100});$('#criterionAiTip').textContent=risks.length?`Weight warning: ${risks.slice(0,2).join(', ')}${risks.length>2?` +${risks.length-2} more`:''} would exceed 100%.`:`Looks balanced for the ${selected.length} selected categor${selected.length===1?'y':'ies'}.`}
  function openDrawer(c=null){editingId=c?.id||null;$('#criterionDrawerTitle').textContent=c?'Edit Criteria':'Add Criteria';$('#criterionName').value=c?.name||'';$('#criterionWeight').value=c?.weight??'';$('#criterionDescription').value=c?.description||'';$('#criterionScale').value=String(c?.scale||5);$('#criterionComment').checked=!!c?.comment;renderPicker(c?.categories||[]);$('#criteriaCategorySearch').value='';$('#criteriaCategoryPicker').classList.remove('open');$('#criterionDrawer').classList.add('open');$('#criterionDrawer').setAttribute('aria-hidden','false');document.body.style.overflow='hidden';updateAiTip()}
  function closeDrawer(){$('#criterionDrawer').classList.remove('open');$('#criterionDrawer').setAttribute('aria-hidden','true');document.body.style.overflow=''}
  function saveCriterion(){const name=$('#criterionName').value.trim(),weight=Math.max(0,Number($('#criterionWeight').value||0)),cats=selectedCategories();if(!name)return toast('Enter criterion name');if(!weight)return toast('Enter criterion weightage');if(!cats.length)return toast('Select at least one category');const data={name,weight,description:$('#criterionDescription').value.trim(),scale:Number($('#criterionScale').value||5),categories:cats,comment:$('#criterionComment').checked};if(editingId){const c=state.criteria.find(x=>String(x.id)===String(editingId));Object.assign(c,data)}else state.criteria.push({id:Date.now(),...data});persist();closeDrawer();render();toast(editingId?'Criteria updated':'Criteria added')}
  function removeCriterion(id){const c=state.criteria.find(x=>String(x.id)===String(id));if(!c)return;if(!confirm(`Delete "${c.name}"? This will remove it from the public Criteria page and Jury Portal.`))return;state.criteria=state.criteria.filter(x=>String(x.id)!==String(id));persist();render();toast('Criteria deleted')}
  function openCategoryView(id){const c=state.criteria.find(x=>String(x.id)===String(id));if(!c)return;$('#categoryViewTitle').textContent=c.name;$('#categoryViewBody').innerHTML=`<div class="criteria-view-summary"><span>${Number(c.weight||0)}% weight</span><span>${(c.categories||[]).length} categories</span></div><div class="criteria-view-list">${(c.categories||[]).map(cat=>`<div><b>${esc(cat)}</b><span>${categoryWeight(cat)}% total category weight</span></div>`).join('')}</div>`;$('#criteriaCategoryView').classList.add('open');$('#criteriaCategoryView').setAttribute('aria-hidden','false')}
  $('#addCriterion').addEventListener('click',()=>openDrawer());$$('[data-close-criterion]').forEach(x=>x.addEventListener('click',closeDrawer));$('#saveCriterion').addEventListener('click',saveCriterion);
  $('#criteriaRows').addEventListener('click',e=>{const edit=e.target.closest('[data-edit]'),del=e.target.closest('[data-delete]'),view=e.target.closest('[data-view-cats]');if(edit)openDrawer(state.criteria.find(c=>String(c.id)===String(edit.dataset.edit)));if(del)removeCriterion(del.dataset.delete);if(view)openCategoryView(view.dataset.viewCats)});
  $('#criteriaSearch').addEventListener('input',renderRows);$('#criteriaCategoryFilter').addEventListener('change',renderRows);$('#resetCriteriaFilters').addEventListener('click',()=>{$('#criteriaSearch').value='';$('#criteriaCategoryFilter').value='all';renderRows()});
  $('#criteriaCategoryTrigger').addEventListener('click',e=>{e.stopPropagation();$('#criteriaCategoryPicker').classList.toggle('open')});$('#criteriaCategoryMenu').addEventListener('click',e=>e.stopPropagation());document.addEventListener('click',()=>$('#criteriaCategoryPicker').classList.remove('open'));
  $('#criteriaCategorySearch').addEventListener('input',e=>{const q=e.target.value.toLowerCase().trim();$$('#criteriaCategoryList label').forEach(l=>l.style.display=!q||(l.dataset.catLabel||'').includes(q)?'grid':'none')});
  $('#criteriaSelectAll').addEventListener('change',e=>{$$('#criteriaCategoryList input').forEach(i=>{if(i.closest('label').style.display!=='none')i.checked=e.target.checked});updatePickerSummary()});$('#criteriaCategoryList').addEventListener('change',updatePickerSummary);$('#criterionWeight').addEventListener('input',updateAiTip);
  $$('[data-close-category-view]').forEach(x=>x.addEventListener('click',()=>{$('#criteriaCategoryView').classList.remove('open');$('#criteriaCategoryView').setAttribute('aria-hidden','true')}));
  render();
})();