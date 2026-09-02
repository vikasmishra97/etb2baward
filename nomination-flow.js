(function(){
  const page=document.body.dataset.nominationPage;
  if(!page)return;

  const ctx=window.ETB2BPublicContext||{};
  const award=ctx.award||{};
  const slug=ctx.slug||award.slug||'demo';
  const catKey='etb2b_awards_categories_'+slug;
  const settingsKey='etb2b_awards_category_settings_'+slug;
  const selectionKey='etb2b_public_category_selection_'+slug;
  const bucketKey='etb2b_public_nomination_bucket_'+slug;
  const formKey='etb2b_awards_entry_form_'+slug;
  const profileKey='etb2b_public_nominee_profile_'+slug;
  const sharedKey='etb2b_public_shared_answers_'+slug;
  const paymentKey='etb2b_public_payment_'+slug;
  const checkoutKey='etb2b_public_checkout_selection_'+slug;
  const nominationReportKey='etb2b_public_nomination_reports_'+slug;

  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
  const symbols={INR:'₹',USD:'$',AED:'د.إ',GBP:'£',SGD:'S$'};
  const sym=symbols[award.currency]||'₹';
  const baseFee=award.entryType==='free'?0:Number(award.baseFee||0);
  const money=n=>Number(n||0)===0?'Free':sym+Number(n||0).toLocaleString('en-IN');
  const settings=read(settingsKey,{selectionMode:'multiple',maxSelections:5,autoImportAnswers:true,aiFinder:true});
  const cats=read(catKey,[]);
  const form=read(formKey,{title:'Nomination form',intro:'Tell us what makes your work exceptional.',fields:[]});
  let selected=read(selectionKey,[]).map(String);
  let bucket=read(bucketKey,{items:[]});
  let profile=read(profileKey,{name:'',email:'',company:'',designation:'',mobile:''});
  let shared=read(sharedKey,{});

  if(!form.fields||!form.fields.length){
    form.fields=[
      {id:'q1',type:'short',label:'Contact name',required:true,visibility:'all'},
      {id:'q2',type:'short',label:'Work email',required:true,visibility:'all'},
      {id:'q3',type:'short',label:'Organisation name',required:true,visibility:'all'},
      {id:'q4',type:'long',label:'Executive summary',required:true,visibility:'all',limit:300,limitUnit:'words'},
      {id:'q5',type:'long',label:'Impact & measurable results',required:true,visibility:'all',limit:500,limitUnit:'words'}
    ];
  }

  function read(k,d){try{const x=JSON.parse(localStorage.getItem(k)||'null');return x==null?d:x}catch(e){return d}}
  function write(k,v){localStorage.setItem(k,JSON.stringify(v))}
  function toast(msg){const t=document.getElementById('publicToast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
  function cat(id){return cats.find(c=>String(c.id)===String(id))||bucket.items?.find(x=>String(x.categoryId)===String(id))||{id,name:'Category',fee:baseFee}}
  function catFee(c){return c.feeMode==='custom'?Number(c.fee||0):Number(c.fee??baseFee)}
  function semantic(f){return String(f.label||f.id||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
  function visibleFields(catId){return (form.fields||[]).filter(f=>f.visibility!=='selected'||!(f.categories||[]).length||(f.categories||[]).map(String).includes(String(catId)))}
  function answerKey(catId){return 'etb2b_public_nomination_answers_'+slug+'_'+catId}

  function reportValue(v){return Array.isArray(v)?v.join(', '):String(v??'')}
  function upsertNominationReport(catId,answers,status,extra={}){
    const c=cat(catId);let rows=read(nominationReportKey,[]);if(!Array.isArray(rows))rows=[];
    const fields=visibleFields(catId).filter(f=>f.type!=='section').map(f=>({id:String(f.id||''),label:f.label||'',value:reportValue((answers||{})[semantic(f)])}));
    const base={
      id:'NREP-'+slug+'-'+String(catId),award:award.name||'ETB2B Awards',awardSlug:slug,categoryId:String(catId),category:c.name||'Category',categoryGroup:c.group||'',fee:catFee(c),
      entrantName:profile.name||'',email:profile.email||'',mobile:profile.mobile||'',company:profile.company||'',designation:profile.designation||'',
      registrationSource:profile.captureLabel||'Nominate Now',status:status||'Draft',answers:Object.assign({},answers||{}),fields,updatedAt:new Date().toISOString()
    };
    const ix=rows.findIndex(r=>r&&String(r.categoryId)===String(catId)&&String(r.email||'').toLowerCase()===String(profile.email||'').toLowerCase());
    const row=Object.assign({},ix>=0?rows[ix]:{},base,extra);if(!row.createdAt)row.createdAt=new Date().toISOString();
    if(ix>=0)rows[ix]=row;else rows.push(row);write(nominationReportKey,rows);return row;
  }

  function syncBucket(){
    const prior=Array.isArray(bucket.items)?bucket.items:[];
    const submitted=prior.filter(x=>x&&x.submitted);
    const working=selected.filter(id=>!submitted.some(x=>String(x.categoryId)===String(id))).map(id=>{
      const c=cat(id);
      const p=prior.find(x=>String(x.categoryId)===String(id))||{};
      const saved=read(answerKey(id),{});
      const completed=!!saved.completed;
      return {
        categoryId:String(id),
        name:c.name||p.name||'Category',
        group:c.group||p.group||'',
        fee:catFee(c),
        status:completed?'Form complete':(saved.answers&&Object.keys(saved.answers).length?'Draft saved':'Form not started'),
        completed,
        submitted:false,
        paymentId:p.paymentId||''
      };
    });
    bucket={award:award.name,slug,updatedAt:new Date().toISOString(),items:[...submitted,...working]};
    write(bucketKey,bucket);
    return bucket;
  }

  function updateFooter(){document.querySelectorAll('#footerAward').forEach(x=>x.textContent='© '+new Date().getFullYear()+' '+(award.name||'ETB2B Awards'))}
  function profileComplete(){return ['name','email','company','designation','mobile'].every(k=>String(profile?.[k]||'').trim())}
  function profileValueForField(f){
    const key=semantic(f);
    const map={
      'contact name':profile.name,'your name':profile.name,'name':profile.name,
      'work email':profile.email,'email':profile.email,
      'organisation name':profile.company,'organization name':profile.company,'company name':profile.company,'company':profile.company,
      'designation':profile.designation,'job title':profile.designation,'title':profile.designation,
      'mobile':profile.mobile,'mobile number':profile.mobile,'phone':profile.mobile,'phone number':profile.mobile
    };
    return Object.prototype.hasOwnProperty.call(map,key)?map[key]:null;
  }
  function isProfileField(f){return profileValueForField(f)!==null}

  updateFooter();
  syncBucket();
  if(page==='bucket')initBucket();
  if(page==='form')initForm();
  if(page==='checkout')initCheckout();
  if(page==='success')initSuccess();

  function initBucket(){
    bucket=syncBucket();
    if(!profileComplete()){location.href='nominate.html';return}
    if(!bucket.items.length){location.href='nominate.html';return}

    const common=(form.fields||[]).filter(f=>f.type!=='section'&&f.visibility!=='selected'&&!isProfileField(f)).length;
    const banner=document.getElementById('sharedAnswersBanner');
    const bannerText=document.getElementById('sharedAnswersText');
    if(bannerText)bannerText.textContent=settings.autoImportAnswers===false?'Your registration details are already attached to every nomination.':'Your registration details are attached automatically. '+common+' shared answers can also be reused across categories.';
    if(settings.autoImportAnswers===false&&banner)banner.style.opacity='.7';

    renderBucket();
    if(new URLSearchParams(location.search).get('payment')==='success'){const success=document.getElementById('paymentSuccessBanner');if(success)success.hidden=false;history.replaceState({},document.title,'nomination-bucket.html');}
    const btn=document.getElementById('proceedPayment');
    btn?.addEventListener('click',()=>{
      const ids=[...document.querySelectorAll('[data-pay-select]:checked')].map(x=>String(x.value));
      const eligible=syncBucket().items.filter(x=>ids.includes(String(x.categoryId))&&x.completed&&!x.submitted);
      if(!eligible.length){toast('Select at least one completed nomination for payment');return}
      write(checkoutKey,eligible.map(x=>String(x.categoryId)));
      location.href='payment-checkout.html';
    });
  }

  function renderBucket(){
    bucket=syncBucket();
    const submittedCount=bucket.items.filter(x=>x.submitted).length;
    const readyCount=bucket.items.filter(x=>x.completed&&!x.submitted).length;
    const draftCount=bucket.items.filter(x=>!x.completed&&!x.submitted).length;
    const count=document.getElementById('bucketCount');
    if(count)count.textContent=bucket.items.length+' total · '+submittedCount+' submitted · '+readyCount+' ready · '+draftCount+' in progress';

    const stats=document.getElementById('bucketStats');
    if(stats)stats.innerHTML=`<div><strong>${submittedCount}</strong><span>Submitted</span></div><div><strong>${readyCount}</strong><span>Ready for payment</span></div><div><strong>${draftCount}</strong><span>Draft / not started</span></div>`;

    const list=document.getElementById('bucketList');
    list.innerHTML=bucket.items.map((x,i)=>{
      const status=x.submitted?'Submitted':x.completed?'Ready for payment':x.status;
      const statusClass=x.submitted?'submitted':x.completed?'complete':'draft';
      const canPay=x.completed&&!x.submitted;
      const nominationId=x.nominationId||'';
      return `<article class="nom-bucket-row ${x.submitted?'is-submitted':''}">
        <div class="nom-pay-select-wrap">${canPay?`<label class="nom-pay-check" title="Select for payment"><input type="checkbox" data-pay-select value="${esc(x.categoryId)}"><span>✓</span></label>`:`<span class="nom-bucket-num">${String(i+1).padStart(2,'0')}</span>`}</div>
        <div class="nom-bucket-copy"><div class="nom-bucket-title-row"><h3>${esc(x.name)}</h3><span class="nom-status ${statusClass}">${esc(status.toUpperCase())}</span></div><p>${esc(x.group||'Award category')}</p>${x.submitted?`<div class="nom-submission-meta"><span>✓ Form submitted</span><span>✓ Payment completed</span>${x.paymentId?`<span>Payment: ${esc(x.paymentId)}</span>`:''}${nominationId?`<span>Nomination ID: ${esc(nominationId)}</span>`:''}</div>`:(settings.autoImportAnswers!==false?'<small class="nom-reuse-note">Smart answer reuse enabled</small>':'')}</div>
        <div class="nom-bucket-fee">${money(x.fee)}</div>
        <div class="nom-row-action">${x.submitted?'<span class="nom-submitted-lock">Completed ✓</span>':`<a href="nomination-form.html?category=${encodeURIComponent(x.categoryId)}">${x.completed?'Review form':'Fill form'} →</a>${bucket.items.filter(y=>!y.submitted).length>1?`<button type="button" data-remove-cat="${esc(x.categoryId)}">Remove</button>`:''}`}</div>
      </article>`;
    }).join('');

    list.querySelectorAll('[data-remove-cat]').forEach(b=>b.addEventListener('click',()=>{
      selected=selected.filter(id=>id!==b.dataset.removeCat);
      write(selectionKey,selected);
      renderBucket();
    }));
    list.querySelectorAll('[data-pay-select]').forEach(c=>c.addEventListener('change',updatePaymentBar));
    updatePaymentBar();
  }

  function updatePaymentBar(){
    const ids=[...document.querySelectorAll('[data-pay-select]:checked')].map(x=>String(x.value));
    const chosen=bucket.items.filter(x=>ids.includes(String(x.categoryId))&&x.completed&&!x.submitted);
    const total=chosen.reduce((n,x)=>n+Number(x.fee||0),0);
    const btn=document.getElementById('proceedPayment');
    const summary=document.getElementById('paymentSelectionSummary');
    if(summary)summary.textContent=chosen.length?chosen.length+' selected · '+money(total):'Select completed nominations to pay together';
    if(btn){btn.disabled=!chosen.length;btn.textContent=chosen.length?'Pay for '+chosen.length+' nomination'+(chosen.length===1?'':'s')+' →':'Select nominations for payment'}
  }

  function initForm(){
    bucket=syncBucket();
    const catId=new URLSearchParams(location.search).get('category')||selected[0];
    const item=bucket.items.find(x=>String(x.categoryId)===String(catId));
    if(!catId||!item||item.submitted){location.href='nomination-bucket.html';return}
    const c=cat(catId),fields=visibleFields(catId);
    document.title=(c.name||'Nomination')+' · ETB2B Awards';
    document.getElementById('formCategoryGroup').textContent=(c.group||'NOMINATION FORM').toUpperCase();
    document.getElementById('formCategoryTitle').textContent=c.name||'Category nomination';
    document.getElementById('sideCategoryName').textContent=c.name||'Category';
    document.getElementById('publicFormTitle').textContent=form.title||'Nomination form';
    document.getElementById('publicFormIntro').textContent=form.intro||'';
    const req=fields.filter(f=>f.type!=='section'&&!isProfileField(f)&&f.required).length;
    document.getElementById('sideRequiredCount').textContent=req;
    document.getElementById('sideOtherCount').textContent=Math.max(0,bucket.items.filter(x=>!x.submitted).length-1);
    document.getElementById('formQuestionCount').textContent=fields.filter(f=>f.type!=='section'&&!isProfileField(f)).length+' questions';
    const profileLine=document.getElementById('profileAttachedText');
    if(profileLine)profileLine.textContent=(profile.name||'Entrant')+' · '+(profile.company||'Company')+' · registration details attached';

    let saved=read(answerKey(catId),{answers:{}});
    saved.answers=saved.answers||{};
    let imported=0;
    const entryFields=fields.filter(f=>f.type==='section'||!isProfileField(f));
    const values={};
    fields.forEach(f=>{
      if(f.type==='section')return;
      const key=semantic(f),profileValue=profileValueForField(f);
      if(profileValue!==null){values[key]=profileValue;saved.answers[key]=profileValue;return}
      if(saved.answers[key]!=null&&saved.answers[key]!=="")values[key]=saved.answers[key];
      else if(settings.autoImportAnswers!==false&&shared[key]?.value!=null&&shared[key].value!==""){values[key]=shared[key].value;imported++}
    });
    let stateAnswers=Object.assign({},values);
    const sections=buildSections(entryFields);
    let activeStep=0;
    const touched=new Set();
    let reportTimer=null;
    function syncDraftReport(){
      clearTimeout(reportTimer);
      reportTimer=setTimeout(()=>{
        captureCurrent();
        const snapshot=collect();
        const allDone=sections.every(sectionComplete);
        upsertNominationReport(catId,snapshot,allDone?'Form complete':'Draft in progress',{formCompleted:allDone,paymentStatus:'Not paid',pendingAction:allDone?'Payment pending':'Form pending',activeSection:(sections[activeStep]&&sections[activeStep].title)||'',activeSectionIndex:activeStep+1,totalSections:sections.length,lastEditedAt:new Date().toISOString()});
      },220);
    }

    document.getElementById('sideImportedCount').textContent=imported;
    if(imported){
      const banner=document.getElementById('importBanner');banner.hidden=false;
      document.getElementById('importBannerTitle').textContent=imported+' shared answer'+(imported===1?'':'s')+' imported';
      document.getElementById('importBannerText').textContent='Matching answers were reused from another nomination. Review them before completing this category.';
    }

    renderStep();
    document.getElementById('saveDraftBtn').addEventListener('click',()=>saveForm(false));
    document.getElementById('saveNextBtn').addEventListener('click',()=>saveForm(true));
    document.getElementById('prevStepBtn').addEventListener('click',()=>{captureCurrent();if(activeStep>0){activeStep--;renderStep();scrollToForm()}});
    document.getElementById('nextStepBtn').addEventListener('click',()=>{
      captureCurrent();
      if(!validateSection(activeStep,true)){toast('Please fix the highlighted fields');return}
      if(activeStep<sections.length-1){activeStep++;renderStep();scrollToForm()}
    });
    document.getElementById('nominationFields').addEventListener('input',e=>{
      captureCurrent();
      const fieldEl=e.target.closest('[data-field-id]');
      if(fieldEl){const f=findField(fieldEl.dataset.fieldId);if(f){updateCounter(f);if(touched.has(String(f.id)))validateField(f,true)}}
      updateConditional();updateProgressUI();syncDraftReport();
    });
    document.getElementById('nominationFields').addEventListener('change',e=>{
      captureCurrent();
      const fieldEl=e.target.closest('[data-field-id]');
      if(fieldEl){const f=findField(fieldEl.dataset.fieldId);if(f){touched.add(String(f.id));validateField(f,true)}}
      updateConditional();updateProgressUI();syncDraftReport();
    });
    document.getElementById('nominationFields').addEventListener('focusout',e=>{
      const fieldEl=e.target.closest('[data-field-id]');
      if(!fieldEl)return;
      const f=findField(fieldEl.dataset.fieldId);if(!f)return;
      captureCurrent();touched.add(String(f.id));validateField(f,true);updateCounter(f);syncDraftReport();
    });

    function buildSections(fs){
      const hasSections=fs.some(f=>f.type==='section');
      if(!hasSections){
        const qs=fs.filter(f=>f.type!=='section');
        const size=4,out=[];
        for(let i=0;i<qs.length;i+=size)out.push({id:'auto-'+(out.length+1),title:out.length===0?'Your nomination':'More about your entry',help:out.length===0?'Start with the key details.':'Continue with the next set of questions.',fields:qs.slice(i,i+size)});
        return out.length?out:[{id:'auto-1',title:'Your nomination',help:'Complete the questions below.',fields:[]}];
      }
      const out=[];let current=null;let pre=[];
      fs.forEach(f=>{
        if(f.type==='section'){
          if(current)out.push(current);
          else if(pre.length)out.push({id:'intro',title:'Getting started',help:'Complete these details first.',fields:pre});
          pre=[];current={id:String(f.id||'section-'+(out.length+1)),title:f.label||('Section '+(out.length+1)),help:f.help||'Complete this section to continue.',fields:[]};
        }else if(current)current.fields.push(f);else pre.push(f);
      });
      if(current)out.push(current);else if(pre.length)out.push({id:'intro',title:'Your nomination',help:'Complete the questions below.',fields:pre});
      return out.filter(x=>x.fields.length);
    }
    function renderStep(){
      const sec=sections[activeStep]||sections[0];
      document.getElementById('formStepLabel').textContent='SECTION '+(activeStep+1)+' OF '+sections.length;
      document.getElementById('formStepTitle').textContent=sec.title;
      document.getElementById('formStepHelp').textContent=sec.help||'Complete this section to continue.';
      const box=document.getElementById('nominationFields');
      box.innerHTML=sec.fields.map(f=>fieldHtml(f,stateAnswers[semantic(f)],!!(stateAnswers[semantic(f)]&&saved.answers[semantic(f)]==null))).join('');
      document.getElementById('prevStepBtn').hidden=activeStep===0;
      document.getElementById('nextStepBtn').hidden=activeStep===sections.length-1;
      document.getElementById('saveNextBtn').hidden=activeStep!==sections.length-1;
      sec.fields.forEach(updateCounter);
      updateConditional();updateProgressUI();renderSectionNav();
    }
    function fieldHtml(f,val,wasImported){
      const key=semantic(f),req=f.required?'<span class="nom-required"> *</span>':'',badge=wasImported?'<span class="nom-imported">✓ reused</span>':'';
      let control='';
      if(f.type==='long')control=`<textarea data-field-key="${esc(key)}" data-field-id="${esc(f.id)}" placeholder="Type your answer..." aria-describedby="err-${esc(f.id)}">${esc(val||'')}</textarea>`;
      else if(f.type==='single')control=`<div class="nom-field-options" data-field-id="${esc(f.id)}">${(f.options||[]).map(o=>`<label><input type="radio" data-field-key="${esc(key)}" data-field-id="${esc(f.id)}" name="${esc(key)}" value="${esc(o)}" ${String(val)===String(o)?'checked':''}> <span>${esc(o)}</span></label>`).join('')}</div>`;
      else if(f.type==='multi'){const arr=Array.isArray(val)?val:[];control=`<div class="nom-field-options" data-field-id="${esc(f.id)}">${(f.options||[]).map(o=>`<label><input type="checkbox" data-field-key="${esc(key)}" data-field-id="${esc(f.id)}" value="${esc(o)}" ${arr.includes(o)?'checked':''}> <span>${esc(o)}</span></label>`).join('')}</div>`}
      else if(f.type==='file')control=`<div class="nom-file-fake" data-field-id="${esc(f.id)}"><input type="file" data-field-key="${esc(key)}" data-field-id="${esc(f.id)}"><small>${esc(val?('Previously selected: '+val):(f.fileTypes||'Upload supporting file'))}</small></div>`;
      else if(f.type==='number')control=`<input type="number" data-field-key="${esc(key)}" data-field-id="${esc(f.id)}" value="${esc(val||'')}" placeholder="0" aria-describedby="err-${esc(f.id)}">`;
      else {const isEmail=/email/.test(key),type=f.type==='url'?'url':isEmail?'email':'text';control=`<input type="${type}" data-field-key="${esc(key)}" data-field-id="${esc(f.id)}" value="${esc(val||'')}" placeholder="${f.type==='url'?'https://':isEmail?'name@company.com':'Type your answer...'}" aria-describedby="err-${esc(f.id)}">`}
      return `<div class="nom-field" data-wrap-field-id="${esc(f.id)}"><div class="nom-field-label-row"><label>${esc(f.label)}${req}</label>${badge}</div>${f.help?`<small class="nom-help">${esc(f.help)}</small>`:''}${control}<div class="nom-field-meta">${f.limit?`<small>Maximum ${esc(f.limit)} ${esc(f.limitUnit||'characters')}</small><small class="nom-counter" id="count-${esc(f.id)}"></small>`:'<span></span>'}</div><div class="nom-field-error" id="err-${esc(f.id)}" role="alert"></div></div>`;
    }
    function captureCurrent(){
      const sec=sections[activeStep];if(!sec)return;
      sec.fields.forEach(f=>{
        const key=semantic(f),profileValue=profileValueForField(f);
        if(profileValue!==null){stateAnswers[key]=profileValue;return}
        const els=[...document.querySelectorAll(`[data-field-key="${CSS.escape(key)}"]`)];if(!els.length)return;
        if(f.type==='multi')stateAnswers[key]=els.filter(x=>x.checked).map(x=>x.value);
        else if(f.type==='single')stateAnswers[key]=(els.find(x=>x.checked)||{}).value||'';
        else if(f.type==='file')stateAnswers[key]=els[0]?.files?.[0]?.name||stateAnswers[key]||'';
        else stateAnswers[key]=els[0]?.value??'';
      });
    }
    function collect(){
      captureCurrent();const answers={};
      fields.filter(f=>f.type!=='section').forEach(f=>{const pv=profileValueForField(f);answers[semantic(f)]=pv!==null?pv:(stateAnswers[semantic(f)]??'')});
      return answers;
    }
    function findField(id){return fields.find(f=>f.type!=='section'&&String(f.id)===String(id))}
    function shouldShow(f){
      if(!f.logic||!f.logic.enabled||!f.logic.fieldId)return true;
      const source=fields.find(x=>String(x.id)===String(f.logic.fieldId));if(!source)return true;
      const sv=stateAnswers[semantic(source)],wanted=String(f.logic.value||''),actual=Array.isArray(sv)?sv.join(','):String(sv||'');
      if(f.logic.operator==='equals')return actual===wanted;
      if(f.logic.operator==='contains')return actual.toLowerCase().includes(wanted.toLowerCase());
      if(f.logic.operator==='not_equals')return actual!==wanted;
      return true;
    }
    function valueError(f){
      if(!shouldShow(f))return '';
      const v=stateAnswers[semantic(f)],text=Array.isArray(v)?v.join(','):String(v||'').trim();
      if(f.required&&(!text||(Array.isArray(v)&&!v.length)))return 'This field is required.';
      if(!text)return '';
      const key=semantic(f);
      if(/email/.test(key)&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text))return 'Enter a valid email address.';
      if(/mobile|phone/.test(key)){const digits=text.replace(/\D/g,'');if(digits.length<8||digits.length>15)return 'Enter a valid mobile number.'}
      if(f.type==='url'){try{const u=new URL(text);if(!/^https?:$/.test(u.protocol))throw new Error()}catch(e){return 'Enter a valid URL beginning with http:// or https://.'}}
      if(f.type==='number'&&!Number.isFinite(Number(text)))return 'Enter a valid number.';
      if(f.limit){const unit=String(f.limitUnit||'characters').toLowerCase(),count=unit.includes('word')?(text.match(/\S+/g)||[]).length:text.length;if(count>Number(f.limit))return `Keep this answer within ${f.limit} ${f.limitUnit||'characters'}.`}
      return '';
    }
    function validateField(f,show){
      const err=valueError(f),wrap=document.querySelector(`[data-wrap-field-id="${CSS.escape(String(f.id))}"]`);if(!wrap)return !err;
      wrap.classList.toggle('has-error',!!err);wrap.classList.toggle('is-valid',!err&&!!String(stateAnswers[semantic(f)]||'').trim());
      const msg=wrap.querySelector('.nom-field-error');if(msg)msg.textContent=show?err:'';
      wrap.querySelectorAll('input,textarea,.nom-field-options,.nom-file-fake').forEach(x=>x.classList.toggle('nom-error',!!err));
      return !err;
    }
    function validateSection(index,show){
      const sec=sections[index];if(!sec)return true;let ok=true;
      sec.fields.forEach(f=>{if(shouldShow(f)&&!validateField(f,show))ok=false;if(show)touched.add(String(f.id))});
      return ok;
    }
    function validateAll(){
      captureCurrent();let firstBad=-1;
      sections.forEach((sec,i)=>{if(sec.fields.some(f=>shouldShow(f)&&!!valueError(f))&&firstBad<0)firstBad=i});
      if(firstBad>=0){activeStep=firstBad;renderStep();validateSection(firstBad,true);scrollToForm();return false}
      return true;
    }
    function updateCounter(f){
      if(!f.limit)return;const el=document.getElementById('count-'+f.id);if(!el)return;const text=String(stateAnswers[semantic(f)]||''),unit=String(f.limitUnit||'characters').toLowerCase(),count=unit.includes('word')?(text.trim().match(/\S+/g)||[]).length:text.length;el.textContent=count+' / '+f.limit+' '+(unit.includes('word')?'words':'characters');el.classList.toggle('is-over',count>Number(f.limit));
    }
    function updateConditional(){
      const sec=sections[activeStep];if(!sec)return;
      sec.fields.forEach(f=>{const target=document.querySelector(`[data-wrap-field-id="${CSS.escape(String(f.id))}"]`);if(target)target.hidden=!shouldShow(f)});
    }
    function sectionComplete(sec){return sec.fields.filter(shouldShow).every(f=>!valueError(f))}
    function updateProgressUI(){
      const total=Math.max(1,sections.length);
      const completed=sections.filter(sectionComplete).length;
      const currentBase=Math.min(total,Math.max(1,activeStep+1));
      const pct=Math.max(Math.round((completed/total)*100),Math.round(((currentBase-1)/total)*100));
      document.getElementById('formStepPercent').textContent=pct+'%';
      document.getElementById('formStepProgressBar').style.width=pct+'%';
      renderSectionNav();renderTopTracker();
    }
    function renderTopTracker(){
      const tracker=document.getElementById('formTopTracker');if(!tracker)return;
      tracker.innerHTML=sections.map((sec,i)=>{
        const done=sectionComplete(sec),active=i===activeStep,locked=i>activeStep&&!sections.slice(0,i).every(sectionComplete);
        return `<button type="button" data-top-step="${i}" class="${active?'active':''} ${done?'complete':''} ${locked?'locked':''}" ${locked?'disabled':''}><span>${done?'✓':i+1}</span><b>${esc(sec.title)}</b><small>${done?'Complete':active?'You are here':'Next'}</small></button>`;
      }).join('<i aria-hidden="true"></i>')+`<i aria-hidden="true"></i><div class="nom-final-step ${sections.every(sectionComplete)?'ready':''}"><span>✓</span><b>Final submission</b><small>${sections.every(sectionComplete)?'Ready for payment':'After all sections'}</small></div>`;
      tracker.querySelectorAll('[data-top-step]').forEach(btn=>btn.addEventListener('click',()=>{const target=Number(btn.dataset.topStep);if(btn.disabled)return;captureCurrent();activeStep=target;renderStep();scrollToForm()}));
    }
    function renderSectionNav(){
      const nav=document.getElementById('sectionNav');if(!nav)return;
      nav.innerHTML=sections.map((sec,i)=>{const locked=i>activeStep&&!sections.slice(0,i).every(sectionComplete);return `<button type="button" data-step-index="${i}" class="${i===activeStep?'active':''} ${sectionComplete(sec)?'complete':''} ${locked?'locked':''}" ${locked?'disabled':''}><span>${sectionComplete(sec)?'✓':i+1}</span><b>${esc(sec.title)}</b><small>${sectionComplete(sec)?'Complete':i===activeStep?'In progress':locked?'Complete previous section':'Ready'}</small></button>`}).join('');
      nav.querySelectorAll('[data-step-index]').forEach(btn=>btn.addEventListener('click',()=>{
        const target=Number(btn.dataset.stepIndex);captureCurrent();
        if(target>activeStep&&!validateSection(activeStep,true)){toast('Please complete this section first');return}
        activeStep=target;renderStep();scrollToForm();
      }));
    }
    function saveForm(complete){
      const answers=collect();
      if(complete&&!validateAll()){toast('Please fix the highlighted fields');return}
      saved={categoryId:String(catId),answers,completed:complete,updatedAt:new Date().toISOString()};
      write(answerKey(catId),saved);
      upsertNominationReport(catId,answers,complete?'Form complete':'Draft saved',{formCompleted:!!complete,formCompletedAt:complete?new Date().toISOString():'',paymentStatus:'Not paid',pendingAction:complete?'Payment pending':'Form pending',activeSection:(sections[activeStep]&&sections[activeStep].title)||'',activeSectionIndex:activeStep+1,totalSections:sections.length,lastEditedAt:new Date().toISOString()});
      if(settings.autoImportAnswers!==false){
        fields.filter(f=>f.type!=='section'&&f.type!=='file'&&!isProfileField(f)).forEach(f=>{
          const key=semantic(f),v=answers[key];
          if((Array.isArray(v)&&v.length)||(!Array.isArray(v)&&String(v||'').trim()))shared[key]={label:f.label,value:v,sourceCategoryId:String(catId),updatedAt:new Date().toISOString()};
        });
        write(sharedKey,shared);
      }
      syncBucket();toast(complete?'Nomination form completed':'Draft saved');
      if(complete){
        const next=syncBucket().items.find(x=>!x.submitted&&!x.completed&&String(x.categoryId)!==String(catId));
        setTimeout(()=>{location.href=next?'nomination-form.html?category='+encodeURIComponent(next.categoryId):'nomination-bucket.html'},550);
      }
    }
    function scrollToForm(){const card=document.querySelector('.nom-wizard-card');if(card)card.scrollIntoView({behavior:'smooth',block:'start'})}
  }

  function initCheckout(){
    bucket=syncBucket();
    const ids=read(checkoutKey,[]).map(String);
    const payable=bucket.items.filter(x=>ids.includes(String(x.categoryId))&&x.completed&&!x.submitted);
    if(!payable.length){location.href='nomination-bucket.html';return}
    document.getElementById('checkoutCount').textContent=payable.length+' nomination'+(payable.length===1?'':'s');
    document.getElementById('checkoutList').innerHTML=payable.map(x=>`<div class="checkout-item"><div><b>${esc(x.name)}</b><small>Form complete · ready to submit</small></div><span>${money(x.fee)}</span></div>`).join('');
    const subtotal=payable.reduce((n,x)=>n+Number(x.fee||0),0),taxPercent=Number(award.taxPercent??18),tax=subtotal>0?Math.round(subtotal*taxPercent/100):0,grand=subtotal+tax;
    document.getElementById('checkoutSubtotal').textContent=money(subtotal);
    document.getElementById('checkoutTax').textContent=subtotal?money(tax)+' ('+taxPercent+'%)':money(0);
    document.getElementById('checkoutGrand').textContent=money(grand);
    let method='Card';
    document.querySelectorAll('[data-method]').forEach(b=>b.addEventListener('click',()=>{method=b.dataset.method;document.querySelectorAll('[data-method]').forEach(x=>x.classList.toggle('active',x===b))}));
    const btn=document.getElementById('paySubmitBtn');
    if(grand===0)btn.textContent='Submit selected nominations';
    btn.addEventListener('click',()=>{
      const ok=window.confirm('Final submission: once payment is completed, these nomination forms will be locked and cannot be edited. Please confirm that you have reviewed your answers.');
      if(!ok)return;
      btn.disabled=true;btn.textContent=grand?'Processing demo payment…':'Submitting…';
      const payment={id:'ETPAY-'+Date.now().toString().slice(-8),award:award.name,slug,amount:grand,subtotal,tax,method,status:'Paid',createdAt:new Date().toISOString(),categoryIds:payable.map(x=>String(x.categoryId)),categories:payable.map(x=>x.name)};
      write(paymentKey,payment);
      const starters=read('etb2b_public_nomination_starters',[]);
      const paidIds=new Set(payable.map(x=>String(x.categoryId)));
      const nominationIds={};
      payable.forEach(x=>{
        const nominationId='ET-'+Date.now().toString().slice(-6)+'-'+Math.random().toString(36).slice(2,6).toUpperCase();
        nominationIds[String(x.categoryId)]=nominationId;
        if(!starters.some(s=>s.paymentId===payment.id&&s.category===x.name))starters.push({id:nominationId,award:award.name,slug,categoryId:String(x.categoryId),category:x.name,name:profile.company||profile.name||'Entrant',entrantName:profile.name||'',company:profile.company||'',email:profile.email||'',mobile:profile.mobile||'',designation:profile.designation||'',status:'Submitted',paymentId:payment.id,amount:x.fee,createdAt:new Date().toISOString()});
        const savedAnswers=read(answerKey(x.categoryId),{}).answers||{};
        upsertNominationReport(x.categoryId,savedAnswers,'Submitted',{formCompleted:true,paid:true,paymentStatus:'Paid',paymentId:payment.id,paymentMethod:method,amount:x.fee,taxPercent,nominationId,submittedAt:new Date().toISOString()});
      });
      write('etb2b_public_nomination_starters',starters);
      bucket.items=bucket.items.map(x=>paidIds.has(String(x.categoryId))?Object.assign({},x,{status:'Submitted',submitted:true,completed:true,paymentId:payment.id,nominationId:nominationIds[String(x.categoryId)],submittedAt:new Date().toISOString()}):x);
      write(bucketKey,bucket);
      selected=selected.filter(id=>!paidIds.has(String(id)));
      write(selectionKey,selected);
      write(checkoutKey,[]);
      setTimeout(()=>location.href='nomination-bucket.html?payment=success',700);
    });
  }

  function initSuccess(){
    const payment=read(paymentKey,null);
    const count=payment?.categories?.length||0;
    document.getElementById('successText').textContent=payment?count+' nomination'+(count===1?'':'s')+' submitted successfully. Confirmation '+payment.id+' · '+money(payment.amount)+'.':'Your nomination has been submitted successfully.';
  }
})();
