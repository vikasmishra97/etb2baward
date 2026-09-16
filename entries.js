(function(){
  const $=id=>document.getElementById(id);
  const $$=sel=>Array.from(document.querySelectorAll(sel));
  const toast=msg=>{
    const el=$('toast'); if(!el) return;
    el.textContent=msg;el.classList.add('show');clearTimeout(window.__rhToast);
    window.__rhToast=setTimeout(()=>el.classList.remove('show'),1900);
  };

  const data={
    email:[
      {id:'17008',title:'Final 48 Hours! Block Your India FinTech Awards Entry',created:'10-09-2026, 03:08 PM',scheduled:'18-09-2026, 10:45 AM',audience:'All Registered Users',batch:'Not Started',status:'scheduled'},
      {id:'16129',title:'Payment failed for India FinTech Awards 2027',created:'05-09-2026, 05:54 PM',scheduled:'—',audience:'Payment Failed - Mail to user',batch:'Not Started',status:'active'},
      {id:'16128',title:"You're registered for India FinTech Awards 2027",created:'05-09-2026, 05:54 PM',scheduled:'—',audience:'All Registered Users',batch:'Completed',status:'active'},
      {id:'15844',title:'Complete your entry before the deadline',created:'31-08-2026, 11:30 AM',scheduled:'17-09-2026, 04:00 PM',audience:'Entry started, incomplete',batch:'Queued',status:'scheduled'},
      {id:'15702',title:'Draft: jury review readiness reminder',created:'29-08-2026, 09:15 AM',scheduled:'—',audience:'Submitted entrants',batch:'Draft',status:'draft'}
    ],
    whatsapp:[
      {id:'2711',title:'Greetings from ETB2B Awards. Your award entry window closes soon. Complete your submission today: {{entry_link}}',created:'05-09-2026, 05:49 PM',scheduled:'18-09-2026, 11:00 AM',audience:'All Registered Users',batch:'Not Started',status:'scheduled'},
      {id:'2710',title:'Welcome to India FinTech Awards 2027. Your registration is confirmed. Start your entry here: {{entry_link}}',created:'05-09-2026, 05:49 PM',scheduled:'—',audience:'All Registered Users',batch:'Completed',status:'active'},
      {id:'2699',title:'Your entry is saved but incomplete. Pick up where you left off: {{entry_link}}',created:'02-09-2026, 02:18 PM',scheduled:'17-09-2026, 03:30 PM',audience:'Entry started, incomplete',batch:'Queued',status:'scheduled'},
      {id:'2672',title:'Payment pending. Complete your payment to confirm your award entry.',created:'30-08-2026, 01:42 PM',scheduled:'—',audience:'Submitted, payment pending',batch:'Draft',status:'draft'}
    ],
    sms:[
      {id:'8801',title:'ETB2B Awards: Your registration is confirmed. Start your entry: {{short_link}}',created:'05-09-2026, 05:50 PM',scheduled:'—',audience:'All Registered Users',batch:'Completed',status:'active'},
      {id:'8796',title:'48 hours left to complete your India FinTech Awards entry. Resume: {{short_link}}',created:'04-09-2026, 12:15 PM',scheduled:'18-09-2026, 10:30 AM',audience:'Entry started, incomplete',batch:'Queued',status:'scheduled'},
      {id:'8770',title:'Payment pending for your ETB2B Awards entry. Complete payment: {{short_link}}',created:'01-09-2026, 04:12 PM',scheduled:'—',audience:'Submitted, payment pending',batch:'Draft',status:'draft'}
    ]
  };

  let currentTab='email';
  let composerChannel='email';
  let composerMode='schedule';
  let selectedAudience=(()=>{try{return JSON.parse(localStorage.getItem('etb2b_awards_selected_audience')||'null')}catch(e){return null}})();
  let automationSeq=5;
  const automations=[
    {id:1,name:'Registration welcome',trigger:'When user registers',channel:'Email + WhatsApp',delay:'Immediately',template:'Registration confirmation',status:true,triggered:'1,584',conversion:'48.2% opened'},
    {id:2,name:'Start your entry',trigger:'Registered, no entry after 24 hours',channel:'WhatsApp',delay:'24 hours',template:'Start your entry',status:true,triggered:'812',conversion:'12.6% started'},
    {id:3,name:'Incomplete entry recovery',trigger:'Entry incomplete after 48 hours',channel:'Email',delay:'48 hours',template:'Complete your entry',status:true,triggered:'296',conversion:'18.9% recovered'},
    {id:4,name:'Payment recovery',trigger:'Payment pending after submission',channel:'Email + WhatsApp',delay:'1 hour',template:'Complete payment',status:false,triggered:'18',conversion:'Enable to start'}
  ];

  function hydrateAudienceContext(){
    const box=$('audienceContext');const option=$('selectedAudienceOption');
    if(!box||!option)return;
    if(!selectedAudience){box.hidden=true;option.hidden=true;return;}
    const count=Number(selectedAudience.count||selectedAudience.sampleCount||selectedAudience.contactIds?.length||0);
    const name=selectedAudience.segmentName||'Selected audience';
    const categories=Array.isArray(selectedAudience.categories)?selectedAudience.categories:[];
    box.hidden=false;
    $('audienceContextTitle').textContent=`${count.toLocaleString('en-IN')} contact${count===1?'':'s'} ready for reminders`;
    $('audienceContextText').textContent=`${name} was selected in Audience. New reminders will target this audience by default.`;
    $('audienceCategoryChips').innerHTML=categories.slice(0,5).map(c=>`<span>${String(c).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}</span>`).join('')+(categories.length>5?`<span>+${categories.length-5} more</span>`:'');
    option.hidden=false;option.textContent=`Selected from Audience · ${count.toLocaleString('en-IN')} contacts`;
  }

  function statusLabel(status){return status.charAt(0).toUpperCase()+status.slice(1);}
  function actionButtons(channel,id){
    return `<div class="rh-action-group">
      <button class="rh-icon-btn" type="button" title="Send test" data-action="send" data-channel="${channel}" data-id="${id}">➤</button>
      <button class="rh-icon-btn" type="button" title="Edit" data-action="edit" data-channel="${channel}" data-id="${id}">✎</button>
      <button class="rh-icon-btn" type="button" title="Preview" data-action="preview" data-channel="${channel}" data-id="${id}">◉</button>
    </div>`;
  }

  function renderChannel(channel){
    const tbody=$(channel+'ReminderRows'); if(!tbody) return;
    const q=(document.querySelector(`[data-channel-search="${channel}"]`)?.value||'').trim().toLowerCase();
    const filter=document.querySelector(`[data-channel-filter="${channel}"]`)?.value||'all';
    const rows=data[channel].filter(item=>{
      const searchable=(item.title+' '+item.audience+' '+item.id).toLowerCase();
      return (!q||searchable.includes(q))&&(filter==='all'||item.status===filter);
    });
    tbody.innerHTML=rows.map(item=>`<tr>
      <td>${item.id}</td>
      <td class="${channel==='email'?'subject':'content-preview'}">${item.title}</td>
      <td class="muted">${item.created}</td>
      <td>${item.scheduled}</td>
      <td>${item.audience}</td>
      <td><span class="rh-batch">${item.batch}</span></td>
      <td><span class="rh-status ${item.status}">${statusLabel(item.status)}</span></td>
      <td>${actionButtons(channel,item.id)}</td>
    </tr>`).join('') || `<tr><td colspan="8"><div class="rh-empty">No reminders match your search or filter.</div></td></tr>`;
  }

  function switchTab(tab){
    currentTab=tab;
    $$('[data-reminder-tab]').forEach(btn=>{
      const active=btn.dataset.reminderTab===tab;btn.classList.toggle('active',active);btn.setAttribute('aria-selected',String(active));
    });
    $$('[data-reminder-panel]').forEach(panel=>panel.classList.toggle('active',panel.dataset.reminderPanel===tab));
  }

  function openDrawer(id){
    $('reminderOverlay').classList.add('open');$(id).classList.add('open');$(id).setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
  }
  function closeDrawers(){
    $('reminderOverlay').classList.remove('open');
    $$('.rh-drawer.open').forEach(d=>{d.classList.remove('open');d.setAttribute('aria-hidden','true');});
    const chooser=$('channelChooser');if(chooser){chooser.classList.remove('open');chooser.setAttribute('aria-hidden','true');}
    document.body.style.overflow='';
  }
  function openChannelChooser(){
    const chooser=$('channelChooser');if(!chooser)return;
    const hint=$('channelChooserAudienceHint');
    if(hint){
      if(selectedAudience){const count=Number(selectedAudience.count||selectedAudience.sampleCount||selectedAudience.contactIds?.length||0);hint.textContent=`Choose a channel for ${selectedAudience.segmentName||'your selected audience'} · ${count.toLocaleString('en-IN')} contact${count===1?'':'s'}.`;}
      else hint.textContent='Choose a channel. You can select the target audience in the next step.';
    }
    chooser.classList.add('open');chooser.setAttribute('aria-hidden','false');$('reminderOverlay').classList.add('open');document.body.style.overflow='hidden';
  }

  function defaultCopy(channel){
    const map={
      email:{subject:'Complete your India FinTech Awards entry',message:`<p>Hi {{name}},</p><p>Your registration for <strong>India FinTech Awards 2027</strong> is confirmed. Your entry is still waiting to be completed.</p><p><a href="{{entry_link}}" style="display:inline-block;background:#d71920;color:#ffffff;text-decoration:none;padding:11px 18px;border-radius:7px;font-weight:700;">Continue your entry</a></p><p>Regards,<br><strong>ETB2B Awards Team</strong></p>`},
      whatsapp:{subject:'',message:'Hi {{name}}, your India FinTech Awards 2027 registration is confirmed. Complete your entry here: {{entry_link}}'},
      sms:{subject:'',message:'ETB2B Awards: Complete your India FinTech Awards 2027 entry here: {{short_link}}'}
    }; return map[channel];
  }

  function stripHtml(html){
    const node=document.createElement('div');node.innerHTML=html||'';return (node.textContent||node.innerText||'').trim();
  }
  function syncEmailEditorFromMessage(){
    const editor=$('emailRichEditor'),source=$('emailHtmlSource');if(!editor||!source)return;
    const html=$('composerMessage').value||'';editor.innerHTML=html;source.value=html;
  }
  function syncEmailEditorToMessage(){
    const editor=$('emailRichEditor'),source=$('emailHtmlSource');if(!editor||!source)return;
    const sourceMode=!source.hidden;const html=sourceMode?source.value:editor.innerHTML;
    $('composerMessage').value=html;if(!sourceMode)source.value=html;
  }
  function setEmailEditorMode(mode){
    const editor=$('emailRichEditor'),source=$('emailHtmlSource');if(!editor||!source)return;
    if(mode==='html'){syncEmailEditorToMessage();source.value=$('composerMessage').value;editor.hidden=true;source.hidden=false;}
    else{$('composerMessage').value=source.value||$('composerMessage').value;editor.innerHTML=$('composerMessage').value;source.hidden=true;editor.hidden=false;}
    $$('[data-editor-mode]').forEach(b=>b.classList.toggle('active',b.dataset.editorMode===mode));
    updateMessageHealth();
  }

  function configureComposer(channel,item,mode='schedule'){
    composerChannel=channel;composerMode=mode;
    const label={email:'Email',whatsapp:'WhatsApp',sms:'SMS'}[channel];
    const mailerMode=mode==='mailer'&&channel==='email'&&!item;
    $('composerKicker').textContent=mailerMode?'MAILER STUDIO':item?'EDIT REMINDER':`SCHEDULE ${label.toUpperCase()}`;
    $('composerTitle').textContent=mailerMode?'Create mailer':(item?'Edit ':'Schedule ')+label;
    const singleLeadName=selectedAudience&&Number(selectedAudience.count||0)===1&&Array.isArray(selectedAudience.contactNames)&&selectedAudience.contactNames[0]?selectedAudience.contactNames[0]:'';
    const channelSubtitle={email:'Create an email reminder with subject, template and rich HTML content.',whatsapp:'Choose a WhatsApp template, review the message and schedule it.',sms:'Write a short SMS reminder, review the segment length and schedule it.'}[channel];
    $('composerSubtitle').textContent=mailerMode?'Create an AI-assisted email, choose the audience and schedule when ready.':item?'Update the message, audience or schedule.':singleLeadName?`Ready for ${singleLeadName}. Review the ${label} reminder and choose a time.`:channelSubtitle;
    $('scheduleReminder').textContent=mailerMode?'Schedule mailer':item?'Save changes':`Schedule ${label}`;
    $$('.email-only').forEach(el=>el.hidden=channel!=='email');
    $$('.sms-only').forEach(el=>el.hidden=channel!=='sms');
    $$('.non-email-message').forEach(el=>el.hidden=channel==='email');
    $('messageLabel').textContent=channel==='whatsapp'?'WhatsApp message':'SMS message';
    $('composerSender').value=channel==='sms'?'ETB2B':'ETB2B Awards';
    const copy=defaultCopy(channel);
    $('composerSubject').value=item&&channel==='email'?item.title:copy.subject;
    $('composerMessage').value=item&&channel!=='email'?item.title:copy.message;
    if(item&&channel==='email') $('composerMessage').value=copy.message;
    if(item?.audience&&Array.from($('composerAudience').options).some(o=>o.value===item.audience)) $('composerAudience').value=item.audience;
    else if(selectedAudience&&!$('selectedAudienceOption').hidden) $('composerAudience').value='selected';
    else $('composerAudience').value='All Registered Users';
    $('composerSchedule').value='';
    $('composerTemplate').value='';
    $('customTemplateNameWrap').hidden=true;
    $('customTemplateName').value='';
    if(channel==='email'){
      $('emailHtmlSource').hidden=true;$('emailRichEditor').hidden=false;
      $$('[data-editor-mode]').forEach(b=>b.classList.toggle('active',b.dataset.editorMode==='visual'));
      syncEmailEditorFromMessage();
    }
    updateMessageHealth();
    openDrawer('reminderComposer');
  }

  function updateMessageHealth(){
    if(composerChannel==='email') syncEmailEditorToMessage();
    const raw=$('composerMessage').value||'';
    const text=composerChannel==='email'?stripHtml(raw):raw;
    if(composerChannel==='sms'){
      const segments=Math.max(1,Math.ceil(text.length/160));
      $('channelMessageHealth').textContent=`${text.length} characters · ${segments} SMS segment${segments>1?'s':''}. AI recommends staying within 160 characters where possible.`;
    }else if(composerChannel==='whatsapp'){
      $('channelMessageHealth').textContent=`${text.length} characters · Template variables detected: ${(text.match(/{{/g)||[]).length}. Keep approved WhatsApp variables unchanged.`;
    }else{
      $('messageHealth').textContent=`${text.length} characters · ${(raw.match(/{{/g)||[]).length} personalisation variable${(raw.match(/{{/g)||[]).length===1?'':'s'} detected · Email-safe HTML supported.`;
    }
  }


  function aiGenerate(){
    const goal=($('aiGoal').value||'remind registered users to complete their entry').trim();
    if(composerChannel==='email'){
      $('composerSubject').value='Action needed: complete your India FinTech Awards entry';
      $('composerMessage').value=`<p>Hi {{name}},</p><p>A quick reminder to ${goal.replace(/^to\s+/,'')}. Your saved progress is ready when you return.</p><p><a href="{{entry_link}}" style="display:inline-block;background:#d71920;color:#ffffff;text-decoration:none;padding:11px 18px;border-radius:7px;font-weight:700;">Continue your entry</a></p><p>Regards,<br><strong>ETB2B Awards Team</strong></p>`;
      syncEmailEditorFromMessage();
      $('subjectScore').textContent='AI subject score: 88 / 100 · Clear action + award context';
    }else if(composerChannel==='whatsapp'){
      $('composerMessage').value=`Hi {{name}}, a quick reminder to ${goal.replace(/^to\s+/,'')}. Continue here: {{entry_link}}`;
    }else{
      $('composerMessage').value=`ETB2B Awards: Reminder to ${goal.replace(/^to\s+/,'')}. Continue: {{short_link}}`;
    }
    updateMessageHealth();toast('AI draft generated');
  }


  function generateAutoJourney(){
    const goal=($('autoAiGoal').value||'welcome new users after registration').trim();
    const g=goal.toLowerCase();
    let preset={trigger:'registered',channel:'Email + WhatsApp',delay:'Immediately',name:'Registration welcome',template:'Registration confirmation'};
    if(/payment|unpaid|checkout/.test(g)) preset={trigger:'payment',channel:'Email + WhatsApp',delay:'1 hour',name:'Payment recovery',template:'Complete payment'};
    else if(/incomplete|finish|resume/.test(g)) preset={trigger:'incomplete',channel:'Email',delay:'48 hours',name:'Incomplete entry recovery',template:'Complete your entry'};
    else if(/no entry|not started|start entry|registered/.test(g)&&!/welcome|confirm/.test(g)) preset={trigger:'noentry',channel:'WhatsApp',delay:'24 hours',name:'Start your entry',template:'Start your entry'};
    else if(/deadline|last day|48 hour|closing/.test(g)) preset={trigger:'deadline',channel:'Email + WhatsApp',delay:'Immediately',name:'Deadline countdown',template:'Complete your entry'};
    $('autoTrigger').value=preset.trigger;$('autoChannel').value=preset.channel;$('autoDelay').value=preset.delay;$('autoName').value=preset.name;$('autoTemplate').value=preset.template;
    updateAutomationPreview();toast('AI journey suggestion applied');
  }

  function renderAutomations(){
    $('automationGrid').innerHTML=automations.map(a=>`<article class="rh-auto-card ${a.status?'':'off'}" data-auto-id="${a.id}">
      <div class="rh-auto-top"><div class="rh-auto-title"><span class="rh-auto-icon">⚡</span><div><b>${a.name}</b><span>${a.trigger}</span></div></div><button class="rh-toggle ${a.status?'on':''}" type="button" data-toggle-auto="${a.id}" aria-label="Toggle ${a.name}"><i></i></button></div>
      <div class="rh-auto-flowline"><strong>${a.trigger}</strong><span>→</span><span>${a.delay}</span><span class="rh-channel-pill">${a.channel}</span></div>
      <div class="rh-auto-meta"><span><b>${a.triggered}</b> triggered</span><span>•</span><span>${a.conversion}</span><button class="rh-icon-btn" type="button" title="Edit journey" data-edit-auto="${a.id}" style="margin-left:auto">✎</button></div>
    </article>`).join('');
  }

  function configureAutomation(auto){
    if(auto){
      $('autoName').value=auto.name;$('autoChannel').value=auto.channel;$('autoDelay').value=auto.delay;
      const triggerMap={'When user registers':'registered','Registered, no entry after 24 hours':'noentry','Entry incomplete after 48 hours':'incomplete','Payment pending after submission':'payment'};
      $('autoTrigger').value=triggerMap[auto.trigger]||'registered';$('autoTemplate').value=auto.template;
    }else{
      $('autoTrigger').value='registered';$('autoChannel').value='Email';$('autoDelay').value='Immediately';$('autoName').value='Registration welcome';$('autoTemplate').value='Registration confirmation';
    }
    updateAutomationPreview();openDrawer('automationComposer');
  }

  function updateAutomationPreview(){
    const triggerText={registered:'When a user registers',noentry:'If no entry is started after 24 hours',incomplete:'If an entry is incomplete after 48 hours',payment:'When payment is pending after submission',deadline:'3 days before the entry deadline'}[$('autoTrigger').value];
    $('autoPreviewTitle').textContent=triggerText;
    $('autoPreviewText').textContent=`Send “${$('autoTemplate').value}” by ${$('autoChannel').value} ${$('autoDelay').value.toLowerCase()}.`;
  }

  function openComposerFromAudience(){
    const params=new URLSearchParams(location.search);
    const requested=params.get('compose');
    if(!['email','whatsapp','sms'].includes(requested))return;
    switchTab(requested);
    configureComposer(requested);
    if(selectedAudience&&Number(selectedAudience.count||0)===1){
      const name=Array.isArray(selectedAudience.contactNames)?selectedAudience.contactNames[0]:'';
      if(name) $('smartSendText').textContent=`Smart: Today, 4:30 PM for ${name}`;
    }
    params.delete('compose');
    params.delete('source');
    const clean=params.toString();
    history.replaceState({},'',location.pathname+(clean?'?'+clean:'')+location.hash);
  }

  // initial render
  ['email','whatsapp','sms'].forEach(renderChannel);renderAutomations();hydrateAudienceContext();

  $$('[data-reminder-tab]').forEach(btn=>btn.addEventListener('click',()=>switchTab(btn.dataset.reminderTab)));
  $$('[data-channel-search]').forEach(input=>input.addEventListener('input',()=>renderChannel(input.dataset.channelSearch)));
  $$('[data-channel-filter]').forEach(sel=>sel.addEventListener('change',()=>renderChannel(sel.dataset.channelFilter)));
  $$('[data-open-composer]').forEach(btn=>btn.addEventListener('click',()=>configureComposer(btn.dataset.openComposer)));

  $('heroScheduleBtn').addEventListener('click',openChannelChooser);
  $('openAiComposer').addEventListener('click',()=>{configureComposer(currentTab==='automations'?'email':currentTab);setTimeout(()=>$('aiGoal').focus(),240);});
  $('closeChannelChooser').addEventListener('click',closeDrawers);
  $$('[data-choose-channel]').forEach(btn=>btn.addEventListener('click',()=>{const channel=btn.dataset.chooseChannel;$('channelChooser').classList.remove('open');$('channelChooser').setAttribute('aria-hidden','true');switchTab(channel);configureComposer(channel);}));
  $('closeReminderComposer').addEventListener('click',closeDrawers);$('closeAutomationComposer').addEventListener('click',closeDrawers);$('reminderOverlay').addEventListener('click',closeDrawers);
  $('generateAiCopy').addEventListener('click',aiGenerate);
  $('composerMessage').addEventListener('input',updateMessageHealth);
  $('emailRichEditor').addEventListener('input',updateMessageHealth);
  $('emailHtmlSource').addEventListener('input',()=>{$('composerMessage').value=$('emailHtmlSource').value;updateMessageHealth();});
  $$('[data-editor-mode]').forEach(btn=>btn.addEventListener('click',()=>setEmailEditorMode(btn.dataset.editorMode)));
  $$('[data-editor-command]').forEach(btn=>btn.addEventListener('click',()=>{setEmailEditorMode('visual');$('emailRichEditor').focus();document.execCommand(btn.dataset.editorCommand,false,null);updateMessageHealth();}));
  $$('[data-insert-variable]').forEach(btn=>btn.addEventListener('click',()=>{setEmailEditorMode('visual');$('emailRichEditor').focus();document.execCommand('insertText',false,btn.dataset.insertVariable);updateMessageHealth();}));
  $$('[data-editor-action]').forEach(btn=>btn.addEventListener('click',()=>{
    setEmailEditorMode('visual');$('emailRichEditor').focus();
    if(btn.dataset.editorAction==='link'){const url=prompt('Paste the destination URL');if(url)document.execCommand('createLink',false,url);}
    if(btn.dataset.editorAction==='image'){const url=prompt('Paste a public HTTPS image URL');if(url)document.execCommand('insertImage',false,url);}
    updateMessageHealth();
  }));
  $('composerTemplate').addEventListener('change',()=>{
    const custom=$('composerTemplate').value==='Custom template';$('customTemplateNameWrap').hidden=!custom;
    if(custom)setTimeout(()=>$('customTemplateName').focus(),60);
  });
  $('improveSubject').addEventListener('click',()=>{$('composerSubject').value='Final reminder: complete your India FinTech Awards entry';$('subjectScore').textContent='AI subject score: 92 / 100 · Strong urgency without spam signals';toast('Subject improved');});
  $('applySmartTime').addEventListener('click',()=>{$('composerSchedule').value='2026-09-17T10:45';toast('Smart send time applied');});
  $('saveReminderDraft').addEventListener('click',()=>{closeDrawers();toast('Reminder saved as draft');});
  $('scheduleReminder').addEventListener('click',()=>{if(composerChannel==='email')syncEmailEditorToMessage();const target=$('composerAudience').value==='selected'&&selectedAudience?(selectedAudience.segmentName||'selected audience'):$('composerAudience').value;closeDrawers();toast(`${composerMode==='mailer'?'Mailer':composerChannel==='whatsapp'?'WhatsApp':composerChannel.toUpperCase()} scheduled for ${target}`);});

  $$('[data-smart-schedule]').forEach(btn=>btn.addEventListener('click',()=>{configureComposer(btn.dataset.smartSchedule);setTimeout(()=>$('applySmartTime').click(),120);}));
  $$('[data-ai-review]').forEach(btn=>btn.addEventListener('click',()=>{configureComposer(btn.dataset.aiReview);setTimeout(aiGenerate,120);}));

  document.addEventListener('click',e=>{
    const action=e.target.closest('[data-action]');
    if(action){
      const channel=action.dataset.channel;const item=data[channel].find(x=>x.id===action.dataset.id);if(!item)return;
      if(action.dataset.action==='edit') configureComposer(channel,item);
      if(action.dataset.action==='send') toast(`Test ${channel} queued for ${item.id}`);
      if(action.dataset.action==='preview') toast(`Preview opened for ${item.id}`);
      return;
    }
    const toggle=e.target.closest('[data-toggle-auto]');
    if(toggle){const a=automations.find(x=>x.id===Number(toggle.dataset.toggleAuto));a.status=!a.status;renderAutomations();toast(`${a.name} ${a.status?'activated':'paused'}`);return;}
    const edit=e.target.closest('[data-edit-auto]');if(edit){configureAutomation(automations.find(x=>x.id===Number(edit.dataset.editAuto)));}
  });

  $('openAutoJourney').addEventListener('click',()=>{switchTab('automations');configureAutomation();});
  $('openMailerStudio').addEventListener('click',()=>{switchTab('email');configureComposer('email',null,'mailer');setTimeout(()=>$('aiGoal').focus(),220);});
  $('clearAudienceContext').addEventListener('click',()=>{localStorage.removeItem('etb2b_awards_selected_audience');localStorage.removeItem('etb2b_awards_selected_leads');selectedAudience=null;hydrateAudienceContext();toast('Audience selection cleared');});
  $('generateAutoJourney').addEventListener('click',generateAutoJourney);
  $('createAutomation').addEventListener('click',()=>configureAutomation());
  $('addDefaultWhatsapp').addEventListener('click',()=>{switchTab('automations');configureAutomation({name:'Registration welcome',trigger:'When user registers',channel:'WhatsApp',delay:'Immediately',template:'Registration confirmation'});});
  $('createSuggestedAutomation').addEventListener('click',()=>{configureAutomation({name:'Start your entry',trigger:'Registered, no entry after 24 hours',channel:'WhatsApp',delay:'24 hours',template:'Start your entry'});});
  ['autoTrigger','autoChannel','autoDelay','autoTemplate'].forEach(id=>$(id).addEventListener('change',updateAutomationPreview));
  $('saveAutoDraft').addEventListener('click',()=>{closeDrawers();toast('Automation saved as draft');});
  $('activateAutomation').addEventListener('click',()=>{
    automations.push({id:automationSeq++,name:$('autoName').value||'New automation',trigger:$('autoPreviewTitle').textContent,channel:$('autoChannel').value,delay:$('autoDelay').value,template:$('autoTemplate').value,status:true,triggered:'0',conversion:'New journey'});
    renderAutomations();closeDrawers();toast('Automation activated');
  });

  openComposerFromAudience();
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawers();});
})();
