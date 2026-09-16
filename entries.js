(function(){
  const $=id=>document.getElementById(id);
  const rows=[...document.querySelectorAll('[data-entry-row]')];
  if(!rows.length) return;

  const state={search:'',status:'all',payment:'all',category:'all',score:'all',kpi:'all',currentEntry:null};
  const labels={draft:'Draft',submitted:'Submitted',review:'Under review',paid:'Paid',pending:'Payment pending'};

  function toast(message){
    const t=$('toast'); if(!t) return;
    t.textContent=message; t.classList.add('show');
    clearTimeout(window.__entriesToast); window.__entriesToast=setTimeout(()=>t.classList.remove('show'),2200);
  }

  function rowData(row){
    return {
      row,
      id:row.dataset.id,
      name:row.dataset.name,
      contact:row.dataset.contact,
      email:row.dataset.email,
      category:row.dataset.category,
      status:row.dataset.status,
      payment:row.dataset.payment,
      score:row.dataset.score
    };
  }

  const entries=rows.map(rowData);

  function matches(entry){
    const q=state.search.trim().toLowerCase();
    if(q && ![entry.name,entry.contact,entry.email,entry.category,labels[entry.status],labels[entry.payment]].join(' ').toLowerCase().includes(q)) return false;
    if(state.status!=='all' && entry.status!==state.status) return false;
    if(state.payment!=='all' && entry.payment!==state.payment) return false;
    if(state.category!=='all' && entry.category!==state.category) return false;
    if(state.score==='scored' && !entry.score) return false;
    if(state.score==='unscored' && entry.score) return false;
    if(state.kpi==='draft' && entry.status!=='draft') return false;
    if(state.kpi==='pending' && entry.payment!=='pending') return false;
    if(state.kpi==='submitted' && entry.status!=='submitted') return false;
    return true;
  }

  function activeFilterCount(){
    return ['status','payment','category','score'].filter(k=>state[k]!=='all').length;
  }

  function renderChips(){
    const wrap=$('entryFilterChips');
    const chips=[];
    if(state.kpi!=='all') chips.push({key:'kpi',label:state.kpi==='pending'?'Payment pending':labels[state.kpi]||state.kpi});
    if(state.status!=='all') chips.push({key:'status',label:`Status: ${labels[state.status]}`});
    if(state.payment!=='all') chips.push({key:'payment',label:`Payment: ${labels[state.payment]}`});
    if(state.category!=='all') chips.push({key:'category',label:`Category: ${state.category}`});
    if(state.score!=='all') chips.push({key:'score',label:state.score==='scored'?'Scored':'Not scored'});
    wrap.hidden=!chips.length;
    wrap.innerHTML=chips.map(c=>`<button type="button" data-remove-filter="${c.key}">${c.label}<span>×</span></button>`).join('');
  }

  function apply(){
    let visible=0;
    entries.forEach(entry=>{
      const show=matches(entry);
      entry.row.hidden=!show;
      if(show) visible++;
    });
    $('entriesResultLabel').textContent=`${visible} of ${entries.length} prototype records shown`;
    $('entriesEmpty').hidden=visible!==0;
    document.querySelector('.entries-table').hidden=visible===0;
    const count=activeFilterCount();
    const countEl=$('entryFilterCount'); countEl.textContent=count; countEl.hidden=!count;
    renderChips();
    document.querySelectorAll('[data-kpi-filter]').forEach(btn=>btn.classList.toggle('active',btn.dataset.kpiFilter===state.kpi));
    updateReminderCount();
  }

  function clearAll(){
    state.search='';state.status='all';state.payment='all';state.category='all';state.score='all';state.kpi='all';
    $('entrySearch').value='';
    syncFilterControls();
    apply();
  }

  function syncFilterControls(){
    $('filterStatus').value=state.status;
    $('filterPayment').value=state.payment;
    $('filterCategory').value=state.category;
    $('filterScore').value=state.score;
  }

  function openModal(id){
    const modal=$(id); if(!modal) return;
    modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('entry-modal-open');
    setTimeout(()=>modal.querySelector('select,input,button')?.focus(),60);
  }

  function closeModal(modal){
    if(!modal) return;
    modal.classList.remove('open');modal.setAttribute('aria-hidden','true');
    if(!document.querySelector('.entry-modal.open')) document.body.classList.remove('entry-modal-open');
  }

  function currentVisible(){return entries.filter(matches);}
  function attentionEntries(){return entries.filter(e=>e.status==='draft'||e.payment==='pending');}

  function reminderRecipients(){
    if(state.currentEntry) return [state.currentEntry];
    const scope=$('reminderScope').value;
    if(scope==='filtered') return currentVisible();
    if(scope==='all') return entries;
    return attentionEntries();
  }

  function updateReminderCount(){
    if(!$('reminderRecipientCount')) return;
    const list=reminderRecipients();
    $('reminderRecipientCount').textContent=list.length;
    $('reminderRecipientHint').textContent=state.currentEntry?`${state.currentEntry.contact} · ${state.currentEntry.email}`:(list.length?list.map(x=>x.name).slice(0,3).join(', ')+(list.length>3?` +${list.length-3} more`:''):'No eligible recipients');
    $('sendEntryReminder').disabled=list.length===0;
  }

  function setReminderTemplate(){
    const type=$('reminderType').value;
    const copy={
      incomplete:{subject:'Action needed: complete your award entry',message:'Hi {{name}},\n\nYour award entry is still incomplete. Please sign in and complete the remaining sections before the deadline.\n\nRegards,\nETB2B Awards Team'},
      payment:{subject:'Payment pending for your award entry',message:'Hi {{name}},\n\nYour award entry has been submitted, but payment is still pending. Please complete payment so the entry can progress.\n\nRegards,\nETB2B Awards Team'},
      deadline:{subject:'Reminder: award entry deadline approaching',message:'Hi {{name}},\n\nThe award entry deadline is approaching. Please review your submission and complete any pending steps in time.\n\nRegards,\nETB2B Awards Team'}
    }[type];
    $('reminderSubject').value=copy.subject;
    $('reminderMessage').value=copy.message;
  }

  function openReminder(entry){
    state.currentEntry=entry||null;
    $('entryReminderAudience').textContent=entry?`Reminder for ${entry.name}.`:'Choose who should receive this reminder.';
    $('reminderScope').disabled=!!entry;
    if(entry){
      $('reminderType').value=entry.payment==='pending'?'payment':'incomplete';
    }else{
      $('reminderScope').value='attention';
      $('reminderType').value='incomplete';
    }
    setReminderTemplate();updateReminderCount();openModal('entryReminderModal');
  }

  function openDrawer(entry){
    state.currentEntry=entry;
    $('drawerEntryName').textContent=entry.name;
    $('entryDrawerBody').innerHTML=`
      <div class="entry-detail-hero"><span class="entry-detail-avatar">${entry.name.charAt(0)}</span><div><b>${entry.contact}</b><a href="mailto:${entry.email}">${entry.email}</a></div></div>
      <div class="entry-detail-grid">
        <div><span>Category</span><b>${entry.category}</b></div>
        <div><span>Status</span><b>${labels[entry.status]||entry.status}</b></div>
        <div><span>Payment</span><b>${labels[entry.payment]||entry.payment}</b></div>
        <div><span>Score</span><b>${entry.score||'Not scored'}</b></div>
      </div>
      <div class="entry-progress-card"><div><span>Submission progress</span><b>${entry.status==='draft'?'68%':'100%'}</b></div><div class="entry-progress-track"><i style="width:${entry.status==='draft'?'68':'100'}%"></i></div><small>${entry.status==='draft'?'Entry has unfinished sections.':'Entry submission is complete.'}</small></div>
      <div class="entry-activity"><h4>Recent activity</h4><div><i></i><span><b>${entry.status==='draft'?'Draft updated':'Entry submitted'}</b><small>Latest prototype activity</small></span></div><div><i></i><span><b>${entry.payment==='pending'?'Payment is pending':'Payment confirmed'}</b><small>${entry.payment==='pending'?'Reminder recommended':'No payment action needed'}</small></span></div></div>`;
    $('entryDrawer').classList.add('open');$('entryDrawerOverlay').classList.add('open');$('entryDrawer').setAttribute('aria-hidden','false');
  }

  function closeDrawer(){
    $('entryDrawer').classList.remove('open');$('entryDrawerOverlay').classList.remove('open');$('entryDrawer').setAttribute('aria-hidden','true');state.currentEntry=null;
  }

  $('entrySearch').addEventListener('input',e=>{state.search=e.target.value;apply();});

  document.querySelectorAll('[data-kpi-filter]').forEach(btn=>btn.addEventListener('click',()=>{
    state.kpi=state.kpi===btn.dataset.kpiFilter?'all':btn.dataset.kpiFilter;
    apply();
  }));

  $('openEntryFilter').addEventListener('click',()=>{syncFilterControls();openModal('entryFilterModal');});
  $('applyEntryFilters').addEventListener('click',()=>{
    state.status=$('filterStatus').value;
    state.payment=$('filterPayment').value;
    state.category=$('filterCategory').value;
    state.score=$('filterScore').value;
    closeModal($('entryFilterModal'));apply();
  });
  $('clearEntryFilters').addEventListener('click',()=>{
    state.status='all';state.payment='all';state.category='all';state.score='all';syncFilterControls();apply();
  });
  $('clearEntriesEmpty').addEventListener('click',clearAll);

  $('entryFilterChips').addEventListener('click',e=>{
    const btn=e.target.closest('[data-remove-filter]'); if(!btn) return;
    const key=btn.dataset.removeFilter;
    state[key]='all'; if(key==='kpi') state.kpi='all';
    syncFilterControls();apply();
  });

  document.querySelectorAll('[data-close-entry-modal]').forEach(btn=>btn.addEventListener('click',()=>closeModal($('entryFilterModal'))));
  document.querySelectorAll('[data-close-reminder]').forEach(btn=>btn.addEventListener('click',()=>{closeModal($('entryReminderModal'));state.currentEntry=null;}));

  $('openBulkReminder').addEventListener('click',()=>openReminder(null));
  $('reminderScope').addEventListener('change',updateReminderCount);
  $('reminderType').addEventListener('change',setReminderTemplate);
  $('sendEntryReminder').addEventListener('click',()=>{
    const list=reminderRecipients(); if(!list.length) return;
    const count=list.length;
    closeModal($('entryReminderModal'));
    toast(`${count} reminder${count===1?'':'s'} queued in the prototype`);
    state.currentEntry=null;
  });

  $('entriesTableBody').addEventListener('click',e=>{
    const action=e.target.closest('[data-entry-action]'); if(!action) return;
    const row=action.closest('[data-entry-row]');const entry=entries.find(x=>x.row===row);if(!entry)return;
    if(action.dataset.entryAction==='remind') openReminder(entry); else openDrawer(entry);
  });

  $('closeEntryDrawer').addEventListener('click',closeDrawer);
  $('entryDrawerOverlay').addEventListener('click',closeDrawer);
  $('drawerReminderBtn').addEventListener('click',()=>{const entry=state.currentEntry;closeDrawer();openReminder(entry);});

  document.addEventListener('keydown',e=>{
    if(e.key!=='Escape') return;
    document.querySelectorAll('.entry-modal.open').forEach(closeModal);
    if($('entryDrawer').classList.contains('open')) closeDrawer();
  });

  apply();
})();
