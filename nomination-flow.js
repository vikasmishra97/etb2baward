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
    if(profileLine)profileLine.textContent=(profile.name||'Entrant')+' · '+(profile.company||'Company')+' · details attached automatically';

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
    renderFields(entryFields,values);
    document.getElementById('sideImportedCount').textContent=imported;
    if(imported){
      const banner=document.getElementById('importBanner');banner.hidden=false;
      document.getElementById('importBannerTitle').textContent=imported+' shared answer'+(imported===1?'':'s')+' imported';
      document.getElementById('importBannerText').textContent='Matching answers were reused from another nomination. Review them before submitting this category.';
    }
    document.getElementById('saveDraftBtn').addEventListener('click',()=>saveForm(false));
    document.getElementById('saveNextBtn').addEventListener('click',()=>saveForm(true));
    document.getElementById('nominationFields').addEventListener('input',updateConditional);
    document.getElementById('nominationFields').addEventListener('change',updateConditional);
    updateConditional();

    function renderFields(fs,vals){const box=document.getElementById('nominationFields');box.innerHTML=fs.map(f=>fieldHtml(f,vals[semantic(f)],!!(vals[semantic(f)]&&saved.answers[semantic(f)]==null))).join('')}
    function fieldHtml(f,val,wasImported){
      if(f.type==='section')return `<div class="nom-form-section"><h3>${esc(f.label)}</h3><p>${esc(f.help||'')}</p></div>`;
      const key=semantic(f),req=f.required?'<span class="nom-required"> *</span>':'',badge=wasImported?'<span class="nom-imported">✓ imported</span>':'';
      let control='';
      if(f.type==='long')control=`<textarea data-field-key="${esc(key)}" data-field-id="${esc(f.id)}" placeholder="Type your answer...">${esc(val||'')}</textarea>`;
      else if(f.type==='single')control=`<div class="nom-field-options">${(f.options||[]).map(o=>`<label><input type="radio" data-field-key="${esc(key)}" data-field-id="${esc(f.id)}" name="${esc(key)}" value="${esc(o)}" ${String(val)===String(o)?'checked':''}> ${esc(o)}</label>`).join('')}</div>`;
      else if(f.type==='multi'){const arr=Array.isArray(val)?val:[];control=`<div class="nom-field-options">${(f.options||[]).map(o=>`<label><input type="checkbox" data-field-key="${esc(key)}" data-field-id="${esc(f.id)}" value="${esc(o)}" ${arr.includes(o)?'checked':''}> ${esc(o)}</label>`).join('')}</div>`}
      else if(f.type==='file')control=`<div class="nom-file-fake"><input type="file" data-field-key="${esc(key)}" data-field-id="${esc(f.id)}"><small>${esc(val?('Previously selected: '+val):(f.fileTypes||'Upload supporting file'))}</small></div>`;
      else if(f.type==='number')control=`<input type="number" data-field-key="${esc(key)}" data-field-id="${esc(f.id)}" value="${esc(val||'')}" placeholder="0">`;
      else control=`<input type="${f.type==='url'?'url':'text'}" data-field-key="${esc(key)}" data-field-id="${esc(f.id)}" value="${esc(val||'')}" placeholder="${f.type==='url'?'https://':'Type your answer...'}">`;
      return `<div class="nom-field" data-wrap-field-id="${esc(f.id)}"><label>${esc(f.label)}${req}${badge}</label>${f.help?`<small>${esc(f.help)}</small>`:''}${control}${f.limit?`<small>Maximum ${esc(f.limit)} ${esc(f.limitUnit||'characters')}</small>`:''}</div>`;
    }
    function collect(){
      const answers={};
      fields.filter(f=>f.type!=='section').forEach(f=>{
        const key=semantic(f),profileValue=profileValueForField(f);
        if(profileValue!==null){answers[key]=profileValue;return}
        const els=[...document.querySelectorAll(`[data-field-key="${CSS.escape(key)}"]`)];
        if(f.type==='multi')answers[key]=els.filter(x=>x.checked).map(x=>x.value);
        else if(f.type==='single')answers[key]=(els.find(x=>x.checked)||{}).value||'';
        else if(f.type==='file')answers[key]=els[0]?.files?.[0]?.name||saved.answers[key]||'';
        else answers[key]=els[0]?.value?.trim?.()??'';
      });
      return answers;
    }
    function validate(answers){
      let ok=true;
      fields.filter(f=>f.type!=='section'&&!isProfileField(f)&&f.required).forEach(f=>{
        const key=semantic(f),v=answers[key],empty=Array.isArray(v)?!v.length:!String(v||'').trim();
        const wrap=document.querySelector(`[data-wrap-field-id="${CSS.escape(String(f.id))}"]`);
        if(wrap)wrap.querySelectorAll('input,textarea,select,.nom-field-options').forEach(x=>x.classList.toggle('nom-error',empty));
        if(empty)ok=false;
      });
      return ok;
    }
    function saveForm(complete){
      const answers=collect();
      if(complete&&!validate(answers)){toast('Complete the required questions');return}
      saved={categoryId:String(catId),answers,completed:complete,updatedAt:new Date().toISOString()};
      write(answerKey(catId),saved);
      upsertNominationReport(catId,answers,complete?'Form complete':'Draft saved',{formCompleted:!!complete,formCompletedAt:complete?new Date().toISOString():''});
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
    function updateConditional(){
      const current=collect();
      fields.forEach(f=>{
        if(!f.logic||!f.logic.enabled||!f.logic.fieldId)return;
        const source=fields.find(x=>String(x.id)===String(f.logic.fieldId));if(!source)return;
        const sv=current[semantic(source)],target=document.querySelector(`[data-wrap-field-id="${CSS.escape(String(f.id))}"]`);if(!target)return;
        const wanted=String(f.logic.value||''),actual=Array.isArray(sv)?sv.join(','):String(sv||'');let show=true;
        if(f.logic.operator==='equals')show=actual===wanted;
        else if(f.logic.operator==='contains')show=actual.toLowerCase().includes(wanted.toLowerCase());
        else if(f.logic.operator==='not_equals')show=actual!==wanted;
        target.hidden=!show;
      });
    }
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
