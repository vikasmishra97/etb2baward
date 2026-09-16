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
  let savedEditorRange=null;
  let selectedAudience=(()=>{try{return JSON.parse(localStorage.getItem('etb2b_awards_selected_audience')||'null')}catch(e){return null}})();
  let automationSeq=5;
  let editingAutomationId=null;
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
    const demo=$('reminderDemoModal');if(demo){demo.classList.remove('open');demo.setAttribute('aria-hidden','true');}
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

  function saveEditorSelection(){
    const editor=$('emailRichEditor');
    const sel=window.getSelection();
    if(!editor||!sel||!sel.rangeCount)return;
    const range=sel.getRangeAt(0);
    const node=range.commonAncestorContainer.nodeType===1?range.commonAncestorContainer:range.commonAncestorContainer.parentNode;
    if(node&&editor.contains(node)) savedEditorRange=range.cloneRange();
  }

  function restoreEditorSelection(){
    const editor=$('emailRichEditor');
    if(!editor)return false;
    editor.focus();
    if(!savedEditorRange)return false;
    const sel=window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedEditorRange.cloneRange());
    return true;
  }

  function runEditorCommand(command,value=null){
    setEmailEditorMode('visual');
    restoreEditorSelection();
    try{document.execCommand('styleWithCSS',false,true);}catch(e){}
    const ok=document.execCommand(command,false,value);
    saveEditorSelection();
    updateMessageHealth();
    return ok;
  }

  function applyEditorColor(command,value){
    setEmailEditorMode('visual');
    restoreEditorSelection();
    try{document.execCommand('styleWithCSS',false,true);}catch(e){}
    let ok=document.execCommand(command,false,value);
    if(!ok&&command==='hiliteColor') ok=document.execCommand('backColor',false,value);
    saveEditorSelection();
    updateMessageHealth();
    return ok;
  }

  function escapeHtml(value){
    return String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function updateCtaPreview(){
    const text=$('ctaButtonText')?.value||'Complete your entry';
    const size=$('ctaButtonSize')?.value||'medium';
    const bg=$('ctaButtonBg')?.value||'#d71920';
    const color=$('ctaButtonColor')?.value||'#ffffff';
    const radius=$('ctaButtonRadius')?.value||'8';
    const align=$('ctaButtonAlign')?.value||'center';
    const styles={small:['9px 14px','12px'],medium:['12px 20px','14px'],large:['14px 26px','16px'],full:['13px 22px','14px']}[size]||['12px 20px','14px'];
    const preview=$('ctaButtonPreview');
    if(preview){
      preview.textContent=text;
      preview.style.background=bg;preview.style.color=color;preview.style.borderRadius=radius+'px';preview.style.padding=styles[0];preview.style.fontSize=styles[1];preview.style.display=size==='full'?'block':'inline-block';preview.style.width=size==='full'?'100%':'auto';preview.style.boxSizing='border-box';preview.style.textAlign='center';
    }
    if($('ctaButtonPreviewWrap')) $('ctaButtonPreviewWrap').style.textAlign=align;
    if($('ctaButtonBgCode')) $('ctaButtonBgCode').textContent=bg;
    if($('ctaButtonColorCode')) $('ctaButtonColorCode').textContent=color;
  }

  function openCtaBuilder(){
    saveEditorSelection();
    $('ctaBuilder').hidden=false;
    updateCtaPreview();
    setTimeout(()=>$('ctaButtonText')?.focus(),30);
  }

  function closeCtaBuilder(){if($('ctaBuilder'))$('ctaBuilder').hidden=true;}

  function insertStyledCta(){
    const text=($('ctaButtonText').value||'Complete your entry').trim();
    const url=($('ctaButtonUrl').value||'').trim();
    if(!text){toast('Add button text');return;}
    if(!/^https?:\/\//i.test(url)){toast('Add a valid http or https button URL');$('ctaButtonUrl').focus();return;}
    const size=$('ctaButtonSize').value,align=$('ctaButtonAlign').value,bg=$('ctaButtonBg').value,color=$('ctaButtonColor').value,radius=$('ctaButtonRadius').value;
    const styles={small:['9px 14px','12px'],medium:['12px 20px','14px'],large:['14px 26px','16px'],full:['13px 22px','14px']}[size]||['12px 20px','14px'];
    const display=size==='full'?'block':'inline-block';
    const width=size==='full'?'width:100%;box-sizing:border-box;':'';
    const html=`<div style="margin:20px 0;text-align:${align};"><a href="${escapeHtml(url)}" style="display:${display};${width}background:${bg};color:${color};text-decoration:none;font-weight:700;font-size:${styles[1]};line-height:1.2;padding:${styles[0]};border-radius:${radius}px;text-align:center;">${escapeHtml(text)}</a></div>`;
    setEmailEditorMode('visual');restoreEditorSelection();document.execCommand('insertHTML',false,html);saveEditorSelection();closeCtaBuilder();updateMessageHealth();toast('CTA button inserted');
  }

  function runDemoAiPreflight(){
    syncEmailEditorToMessage();
    const html=$('composerMessage').value||'';
    const text=stripHtml(html);
    const subject=($('composerSubject').value||'').trim();
    const doc=document.createElement('div');doc.innerHTML=html;
    const links=Array.from(doc.querySelectorAll('a[href]'));
    const images=Array.from(doc.querySelectorAll('img'));
    const checks=[];
    let score=42;
    const subjectOk=subject.length>=25&&subject.length<=70;
    checks.push({ok:subjectOk,label:subjectOk?'Subject length looks strong':'Keep the subject between 25 and 70 characters'});if(subjectOk)score+=16;
    const personal=/{{name}}|{{company}}/.test(html);
    checks.push({ok:personal,label:personal?'Personalisation variable detected':'Add {{name}} or {{company}} personalisation'});if(personal)score+=12;
    const ctaOk=links.length>0;
    checks.push({ok:ctaOk,label:ctaOk?'CTA/link detected':'Add at least one clear CTA or link'});if(ctaOk)score+=12;
    const bodyOk=text.length>=80;
    checks.push({ok:bodyOk,label:bodyOk?'Body has enough context':'Add more context so the reminder is clear'});if(bodyOk)score+=10;
    const imagesOk=images.every(img=>/^https:\/\//i.test(img.getAttribute('src')||''));
    checks.push({ok:imagesOk,label:images.length?(imagesOk?'Images use HTTPS URLs':'Use public HTTPS URLs for every image'):'No image delivery risks detected'});if(imagesOk)score+=8;
    score=Math.min(100,score);
    $('demoAiScore').textContent=String(score);
    $('demoAiChecks').innerHTML=checks.map(c=>`<span class="${c.ok?'ok':'warn'}"><i>${c.ok?'OK':'!'}</i>${escapeHtml(c.label)}</span>`).join('');
    return score;
  }

  function configureComposer(channel,item,mode='schedule'){
    composerChannel=channel;composerMode=mode;if(mode!=='automation')editingAutomationId=null;
    const label={email:'Email',whatsapp:'WhatsApp',sms:'SMS'}[channel];
    const mailerMode=mode==='mailer'&&channel==='email'&&!item;
    const automationMode=mode==='automation';
    const autoBlock=$('automationSettingsBlock');
    if(autoBlock) autoBlock.hidden=!automationMode;
    const delivery=$('composerDeliveryCard');
    if(delivery) delivery.hidden=automationMode;
    const recipientGrid=$('composerRecipientGrid');
    if(recipientGrid){recipientGrid.classList.toggle('automation-mode',automationMode);const audienceLabel=$('composerAudience')?.closest('label');if(audienceLabel) audienceLabel.hidden=automationMode;}

    if(automationMode){
      $('composerKicker').textContent='AUTO JOURNEY';
      $('composerTitle').textContent=editingAutomationId?'Edit automation':'Create automation';
      $('composerSubtitle').textContent='Define the trigger, then edit the message with the same tools used for scheduled reminders.';
      $('scheduleReminder').textContent=editingAutomationId?'Save automation':'Activate automation';
    }else{
      $('composerKicker').textContent=mailerMode?'MAILER STUDIO':item?'EDIT REMINDER':`SCHEDULE ${label.toUpperCase()}`;
      $('composerTitle').textContent=mailerMode?'Create mailer':(item?'Edit ':'Schedule ')+label;
      const singleLeadName=selectedAudience&&Number(selectedAudience.count||0)===1&&Array.isArray(selectedAudience.contactNames)&&selectedAudience.contactNames[0]?selectedAudience.contactNames[0]:'';
      const channelSubtitle={email:'Create an email reminder with subject, template and rich HTML content.',whatsapp:'Choose a WhatsApp template, review the message and schedule it.',sms:'Write a short SMS reminder, review the segment length and schedule it.'}[channel];
      $('composerSubtitle').textContent=mailerMode?'Create an AI-assisted email, choose the audience and schedule when ready.':item?'Update the message, audience or schedule.':singleLeadName?`Ready for ${singleLeadName}. Review the ${label} reminder and choose a time.`:channelSubtitle;
      $('scheduleReminder').textContent=mailerMode?'Schedule mailer':item?'Save changes':`Schedule ${label}`;
    }

    $$('.email-only').forEach(el=>el.hidden=channel!=='email');
    $$('.sms-only').forEach(el=>el.hidden=channel!=='sms');
    $$('.non-email-message').forEach(el=>el.hidden=channel==='email');
    $('messageLabel').textContent=channel==='whatsapp'?'WhatsApp message':'SMS message';
    $('composerSender').value=channel==='sms'?'ETB2B':'ETB2B Awards';
    const copy=defaultCopy(channel);
    $('composerSubject').value=item&&channel==='email'?item.title:copy.subject;
    $('composerMessage').value=item&&channel!=='email'?item.title:copy.message;
    if(item&&channel==='email') $('composerMessage').value=copy.message;
    if(!automationMode){
      if(item?.audience&&Array.from($('composerAudience').options).some(o=>o.value===item.audience)) $('composerAudience').value=item.audience;
      else if(selectedAudience&&!$('selectedAudienceOption').hidden) $('composerAudience').value='selected';
      else $('composerAudience').value='All Registered Users';
    }
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

  function selectedAudienceLabel(){
    if(composerMode==='automation')return $('autoPreviewTitle')?.textContent||'Triggered automatically';
    if($('composerAudience').value==='selected'&&selectedAudience){
      const count=Number(selectedAudience.count||selectedAudience.sampleCount||selectedAudience.contactIds?.length||0);
      return `${selectedAudience.segmentName||'Selected audience'}${count?` · ${count.toLocaleString('en-IN')} contact${count===1?'':'s'}`:''}`;
    }
    return $('composerAudience').value||'All Registered Users';
  }

  function closeDemoPreview(){
    const modal=$('reminderDemoModal');if(!modal)return;
    modal.classList.remove('open');modal.setAttribute('aria-hidden','true');
    if(!document.querySelector('.rh-drawer.open')&&!$('channelChooser')?.classList.contains('open')) document.body.style.overflow='';
  }

  function openReminderDemo(){
    if(composerChannel!=='email')return;
    syncEmailEditorToMessage();
    $('demoFrom').textContent=$('composerSender').value||'ETB2B Awards';
    $('demoAudience').textContent=selectedAudienceLabel();
    $('demoSubject').textContent=$('composerSubject').value||'No subject added';
    const content=$('composerMessage').value||'<p style="color:#7c8395">Your email body is empty. Return to the editor and add content before scheduling.</p>';
    const frame=$('demoEmailFrame');
    frame.srcdoc=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;background:#f3f5f8;font-family:Arial,Helvetica,sans-serif;color:#2d3345}body{padding:24px 12px}.email-shell{max-width:620px;margin:0 auto;background:#fff;border:1px solid #e5e8ef;border-radius:12px;box-shadow:0 8px 30px rgba(28,34,54,.08);overflow:hidden}.email-body{padding:28px;line-height:1.6;font-size:15px}.email-body img{max-width:100%;height:auto}.email-body a{word-break:break-word}@media(max-width:520px){body{padding:8px}.email-body{padding:20px 16px;font-size:14px}.email-shell{border-radius:8px}}</style></head><body><div class="email-shell"><div class="email-body">${content}</div></div></body></html>`;
    runDemoAiPreflight();
    const modal=$('reminderDemoModal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
    $$('[data-demo-device]').forEach(b=>b.classList.toggle('active',b.dataset.demoDevice==='desktop'));
    $('demoStage').classList.remove('mobile');
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


  function automationTriggerValue(auto){
    if(!auto)return 'registered';
    if(['registered','noentry','incomplete','payment','deadline'].includes(auto.trigger))return auto.trigger;
    const map={'When user registers':'registered','When a user registers':'registered','Registered, no entry after 24 hours':'noentry','If no entry is started after 24 hours':'noentry','Entry incomplete after 48 hours':'incomplete','If an entry is incomplete after 48 hours':'incomplete','Payment pending after submission':'payment','When payment is pending after submission':'payment','3 days before the entry deadline':'deadline'};
    return map[auto.trigger]||'registered';
  }

  function automationPrimaryChannel(channel){
    const v=String(channel||'Email');
    if(v==='SMS')return 'sms';
    if(v==='WhatsApp')return 'whatsapp';
    return 'email';
  }

  function automationCopy(auto,channel){
    const template=String(auto?.template||'Registration confirmation').toLowerCase();
    const name=String(auto?.name||'').toLowerCase();
    const key=template+' '+name;
    if(channel==='email'){
      if(/payment/.test(key)) return {subject:'Complete payment for your India FinTech Awards entry',message:`<p>Hi {{name}},</p><p>Your India FinTech Awards entry has been submitted, but the payment is still pending.</p><p><a href="{{entry_link}}" style="display:inline-block;background:#d71920;color:#ffffff;text-decoration:none;padding:11px 18px;border-radius:7px;font-weight:700;">Complete payment</a></p><p>Regards,<br><strong>ETB2B Awards Team</strong></p>`};
      if(/incomplete|complete your entry/.test(key)) return {subject:'Complete your India FinTech Awards entry',message:`<p>Hi {{name}},</p><p>Your award entry is saved but still incomplete. Continue from where you left off and submit it before the deadline.</p><p><a href="{{entry_link}}" style="display:inline-block;background:#d71920;color:#ffffff;text-decoration:none;padding:11px 18px;border-radius:7px;font-weight:700;">Continue your entry</a></p><p>Regards,<br><strong>ETB2B Awards Team</strong></p>`};
      if(/start your entry|no entry/.test(key)) return {subject:'Your India FinTech Awards entry is ready to start',message:`<p>Hi {{name}},</p><p>You are registered for India FinTech Awards 2027. Your entry has not been started yet.</p><p><a href="{{entry_link}}" style="display:inline-block;background:#d71920;color:#ffffff;text-decoration:none;padding:11px 18px;border-radius:7px;font-weight:700;">Start your entry</a></p><p>Regards,<br><strong>ETB2B Awards Team</strong></p>`};
      return {subject:'Welcome to India FinTech Awards 2027',message:`<p>Hi {{name}},</p><p>Your registration for <strong>India FinTech Awards 2027</strong> is confirmed.</p><p><a href="{{entry_link}}" style="display:inline-block;background:#d71920;color:#ffffff;text-decoration:none;padding:11px 18px;border-radius:7px;font-weight:700;">Start your entry</a></p><p>Regards,<br><strong>ETB2B Awards Team</strong></p>`};
    }
    if(channel==='whatsapp'){
      if(/payment/.test(key))return {subject:'',message:'Hi {{name}}, your India FinTech Awards entry payment is pending. Complete payment here: {{entry_link}}'};
      if(/incomplete|complete your entry/.test(key))return {subject:'',message:'Hi {{name}}, your award entry is saved but incomplete. Continue here: {{entry_link}}'};
      if(/start your entry|no entry/.test(key))return {subject:'',message:'Hi {{name}}, you are registered for India FinTech Awards 2027. Start your entry here: {{entry_link}}'};
      return {subject:'',message:'Hi {{name}}, welcome to India FinTech Awards 2027. Your registration is confirmed. Start here: {{entry_link}}'};
    }
    if(/payment/.test(key))return {subject:'',message:'ETB2B Awards: Payment is pending for your award entry. Complete it here: {{short_link}}'};
    if(/incomplete|complete your entry/.test(key))return {subject:'',message:'ETB2B Awards: Your entry is incomplete. Continue here: {{short_link}}'};
    if(/start your entry|no entry/.test(key))return {subject:'',message:'ETB2B Awards: You are registered. Start your entry here: {{short_link}}'};
    return {subject:'',message:'ETB2B Awards: Registration confirmed. Start your entry here: {{short_link}}'};
  }

  function openAutomationCenter(){
    renderAutomations();
    openDrawer('automationComposer');
  }

  function closeAutomationCenterOnly(){
    const drawer=$('automationComposer');
    if(drawer){drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');}
  }

  function openAutomationEditor(auto){
    const source=auto||{name:'Registration welcome',trigger:'registered',channel:'Email',delay:'Immediately',template:'Registration confirmation'};
    editingAutomationId=auto?.id||null;
    closeAutomationCenterOnly();
    const primary=automationPrimaryChannel(source.channel);
    configureComposer(primary,null,'automation');
    $('autoName').value=source.name||'Registration welcome';
    $('autoTrigger').value=automationTriggerValue(source);
    $('autoChannel').value=source.channel||'Email';
    $('autoDelay').value=source.delay||'Immediately';
    $('composerTemplate').value=source.template||'Registration confirmation';
    const copy=automationCopy(source,primary);
    $('composerSubject').value=source.subject||copy.subject;
    $('composerMessage').value=source.message||copy.message;
    if(primary==='email')syncEmailEditorFromMessage();
    $('composerTitle').textContent=editingAutomationId?'Edit automation':'Create automation';
    $('composerSubtitle').textContent=editingAutomationId?`Update “${source.name}” using the same editor as a scheduled ${primary==='whatsapp'?'WhatsApp':primary==='sms'?'SMS':'email'} reminder.`:'Set the trigger and build the message with the same editor used for scheduled reminders.';
    $('scheduleReminder').textContent=editingAutomationId?'Save automation':'Activate automation';
    updateAutomationPreview();updateMessageHealth();
  }

  function switchAutomationChannel(){
    if(composerMode!=='automation')return;
    const settings={name:$('autoName').value,trigger:$('autoTrigger').value,channel:$('autoChannel').value,delay:$('autoDelay').value,template:$('composerTemplate').value||'Registration confirmation'};
    const primary=automationPrimaryChannel(settings.channel);
    composerChannel=primary;
    $$('.email-only').forEach(el=>el.hidden=primary!=='email');
    $$('.sms-only').forEach(el=>el.hidden=primary!=='sms');
    $$('.non-email-message').forEach(el=>el.hidden=primary==='email');
    $('messageLabel').textContent=primary==='whatsapp'?'WhatsApp message':'SMS message';
    $('composerSender').value=primary==='sms'?'ETB2B':'ETB2B Awards';
    const copy=automationCopy(settings,primary);
    $('composerSubject').value=copy.subject;
    $('composerMessage').value=copy.message;
    if(primary==='email'){
      $('emailHtmlSource').hidden=true;$('emailRichEditor').hidden=false;
      $$('[data-editor-mode]').forEach(b=>b.classList.toggle('active',b.dataset.editorMode==='visual'));
      syncEmailEditorFromMessage();
    }
    updateAutomationPreview();updateMessageHealth();
  }

  function generateAutoJourney(){
    const goal=($('autoAiGoal').value||'welcome new users after registration').trim();
    const g=goal.toLowerCase();
    let preset={trigger:'registered',channel:'Email + WhatsApp',delay:'Immediately',name:'Registration welcome',template:'Registration confirmation'};
    if(/payment|unpaid|checkout/.test(g)) preset={trigger:'payment',channel:'Email + WhatsApp',delay:'1 hour',name:'Payment recovery',template:'Complete payment'};
    else if(/incomplete|finish|resume/.test(g)) preset={trigger:'incomplete',channel:'Email',delay:'48 hours',name:'Incomplete entry recovery',template:'Complete your entry'};
    else if(/no entry|not started|start entry|registered/.test(g)&&!/welcome|confirm/.test(g)) preset={trigger:'noentry',channel:'WhatsApp',delay:'24 hours',name:'Start your entry',template:'Start your entry'};
    else if(/deadline|last day|48 hour|closing/.test(g)) preset={trigger:'deadline',channel:'Email + WhatsApp',delay:'Immediately',name:'Deadline countdown',template:'Complete your entry'};
    openAutomationEditor(preset);toast('AI journey suggestion applied');
  }

  function renderAutomations(){
    const grid=$('automationGrid');if(!grid)return;
    grid.innerHTML=automations.map(a=>`<article class="rh-auto-card rh-auto-center-card ${a.status?'':'off'}" data-auto-id="${a.id}">
      <div class="rh-auto-top"><div class="rh-auto-title"><span class="rh-auto-icon">⚡</span><div><b>${escapeHtml(a.name)}</b><span>${escapeHtml(a.trigger)}</span></div></div><button class="rh-toggle ${a.status?'on':''}" type="button" data-toggle-auto="${a.id}" aria-label="Toggle ${escapeHtml(a.name)}"><i></i></button></div>
      <div class="rh-auto-flowline"><strong>${escapeHtml(a.trigger)}</strong><span>→</span><span>${escapeHtml(a.delay)}</span><span class="rh-channel-pill">${escapeHtml(a.channel)}</span></div>
      <div class="rh-auto-meta"><span><b>${escapeHtml(a.triggered)}</b> triggered</span><span>•</span><span>${escapeHtml(a.conversion)}</span></div>
      <div class="rh-auto-card-actions"><button class="btn secondary" type="button" data-edit-auto="${a.id}">Edit message</button><button class="rh-text-action" type="button" data-edit-auto="${a.id}">Journey settings →</button></div>
    </article>`).join('');
    const active=automations.filter(a=>a.status).length;
    if($('activeJourneyCount'))$('activeJourneyCount').textContent=String(active);
    const count=document.querySelector('.rh-auto-center-count');if(count)count.textContent=`${automations.length} journey${automations.length===1?'':'s'}`;
  }

  function configureAutomation(auto){openAutomationEditor(auto);}

  function updateAutomationPreview(){
    if(!$('autoTrigger')||composerMode!=='automation')return;
    const triggerText={registered:'When a user registers',noentry:'If no entry is started after 24 hours',incomplete:'If an entry is incomplete after 48 hours',payment:'When payment is pending after submission',deadline:'3 days before the entry deadline'}[$('autoTrigger').value];
    $('autoPreviewTitle').textContent=triggerText;
    const template=$('composerTemplate').value||'selected template';
    $('autoPreviewText').textContent=`Send “${template}” by ${$('autoChannel').value} ${$('autoDelay').value.toLowerCase()}.`;
  }

  function openComposerFromAudience(){
    const params=new URLSearchParams(location.search);
    const requested=params.get('compose');
    if(!['email','whatsapp','sms'].includes(requested))return;
    switchTab(requested);
    configureComposer(requested);
    if(selectedAudience&&Number(selectedAudience.count||0)===1){
      const name=Array.isArray(selectedAudience.contactNames)?selectedAudience.contactNames[0]:'';
      if(name) $('smartSendText').textContent=`Today · 4:30 PM · ${name}`;
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
  $('openAiComposer').addEventListener('click',()=>{configureComposer(currentTab);setTimeout(()=>$('aiGoal').focus(),240);});
  $('closeChannelChooser').addEventListener('click',closeDrawers);
  $$('[data-choose-channel]').forEach(btn=>btn.addEventListener('click',()=>{const channel=btn.dataset.chooseChannel;$('channelChooser').classList.remove('open');$('channelChooser').setAttribute('aria-hidden','true');switchTab(channel);configureComposer(channel);}));
  $('closeReminderComposer').addEventListener('click',closeDrawers);$('closeAutomationComposer').addEventListener('click',closeDrawers);$('reminderOverlay').addEventListener('click',closeDrawers);
  $('generateAiCopy').addEventListener('click',aiGenerate);
  $('composerMessage').addEventListener('input',updateMessageHealth);
  $('emailRichEditor').addEventListener('input',updateMessageHealth);
  $('emailHtmlSource').addEventListener('input',()=>{$('composerMessage').value=$('emailHtmlSource').value;updateMessageHealth();});
  $$('[data-editor-mode]').forEach(btn=>btn.addEventListener('click',()=>setEmailEditorMode(btn.dataset.editorMode)));
  $('emailRichEditor').addEventListener('mouseup',saveEditorSelection);
  $('emailRichEditor').addEventListener('keyup',saveEditorSelection);
  $('emailRichEditor').addEventListener('focus',saveEditorSelection);
  document.addEventListener('selectionchange',()=>{const sel=window.getSelection();if(sel&&sel.rangeCount&&$('emailRichEditor').contains(sel.anchorNode))saveEditorSelection();});
  $$('.rh-editor-toolbar button[data-editor-command], .rh-editor-toolbar button[data-editor-action], [data-insert-variable]').forEach(btn=>btn.addEventListener('mousedown',e=>{saveEditorSelection();e.preventDefault();}));
  $$('[data-editor-command]').forEach(btn=>btn.addEventListener('click',()=>runEditorCommand(btn.dataset.editorCommand)));
  $$('[data-insert-variable]').forEach(btn=>btn.addEventListener('click',()=>{setEmailEditorMode('visual');restoreEditorSelection();document.execCommand('insertText',false,btn.dataset.insertVariable);saveEditorSelection();updateMessageHealth();}));
  $$('[data-editor-action]').forEach(btn=>btn.addEventListener('click',()=>{
    const action=btn.dataset.editorAction;
    if(action==='button'){openCtaBuilder();return;}
    setEmailEditorMode('visual');restoreEditorSelection();
    if(action==='link'){const url=prompt('Paste the destination URL');if(url&&/^https?:\/\//i.test(url))document.execCommand('createLink',false,url);else if(url)toast('Use a valid http or https URL');}
    if(action==='image'){const url=prompt('Paste a public HTTPS image URL');if(url&&/^https:\/\//i.test(url))document.execCommand('insertImage',false,url);else if(url)toast('Images should use a public HTTPS URL');}
    if(action==='heading') document.execCommand('formatBlock',false,'h2');
    if(action==='divider') document.execCommand('insertHorizontalRule',false,null);
    saveEditorSelection();updateMessageHealth();
  }));
  $('editorFontSize')?.addEventListener('change',e=>{if(e.target.value){runEditorCommand('fontSize',e.target.value);e.target.value='';}});
  ['editorTextColor','editorHighlightColor'].forEach(id=>{
    const input=$(id);if(!input)return;
    input.addEventListener('mousedown',saveEditorSelection);
    input.addEventListener('click',saveEditorSelection);
  });
  $('editorTextColor')?.addEventListener('input',e=>{$('editorTextColorSwatch').style.background=e.target.value;applyEditorColor('foreColor',e.target.value);});
  $('editorHighlightColor')?.addEventListener('input',e=>{$('editorHighlightColorSwatch').style.background=e.target.value;applyEditorColor('hiliteColor',e.target.value);});
  ['ctaButtonText','ctaButtonSize','ctaButtonAlign','ctaButtonBg','ctaButtonColor','ctaButtonRadius'].forEach(id=>$(id)?.addEventListener(id.includes('Text')?'input':'change',updateCtaPreview));
  $('ctaButtonBg')?.addEventListener('input',updateCtaPreview);$('ctaButtonColor')?.addEventListener('input',updateCtaPreview);
  $('closeCtaBuilder')?.addEventListener('click',closeCtaBuilder);$('cancelCtaBuilder')?.addEventListener('click',closeCtaBuilder);$('insertCtaButton')?.addEventListener('click',insertStyledCta);
  $('composerTemplate').addEventListener('change',()=>{
    const custom=$('composerTemplate').value==='Custom template';$('customTemplateNameWrap').hidden=!custom;
    if(custom)setTimeout(()=>$('customTemplateName').focus(),60);
    if(composerMode==='automation')updateAutomationPreview();
  });
  $('improveSubject').addEventListener('click',()=>{$('composerSubject').value='Final reminder: complete your India FinTech Awards entry';$('subjectScore').textContent='AI subject score: 92 / 100 · Strong urgency without spam signals';toast('Subject improved');});
  $('applySmartTime').addEventListener('click',()=>{$('composerSchedule').value='2026-09-17T10:45';toast('Smart send time applied');});
  $('previewReminderDemo').addEventListener('click',openReminderDemo);
  $('closeReminderDemo').addEventListener('click',closeDemoPreview);
  $('backToEditor').addEventListener('click',closeDemoPreview);
  document.querySelector('[data-close-demo]')?.addEventListener('click',closeDemoPreview);
  $$('[data-demo-device]').forEach(btn=>btn.addEventListener('click',()=>{const mobile=btn.dataset.demoDevice==='mobile';$('demoStage').classList.toggle('mobile',mobile);$$('[data-demo-device]').forEach(b=>b.classList.toggle('active',b===btn));}));
  $('runDemoAiCheck')?.addEventListener('click',()=>{const score=runDemoAiPreflight();toast(`AI preflight score: ${score}/100`);});
  $('sendDemoTest').addEventListener('click',async()=>{
    const email=($('testEmailAddress').value||'').trim();
    const status=$('testEmailStatus');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){status.textContent='Enter a valid email address.';status.classList.add('error');$('testEmailAddress').focus();return;}
    status.classList.remove('error');
    syncEmailEditorToMessage();
    const payload={to:email,from:$('composerSender').value,subject:$('composerSubject').value,html:$('composerMessage').value,audience:selectedAudienceLabel()};
    const button=$('sendDemoTest');const original=button.textContent;button.disabled=true;button.textContent='Sending...';
    try{
      if(window.ETB2B_REMINDER_API&&typeof window.ETB2B_REMINDER_API.sendTestEmail==='function'){
        await window.ETB2B_REMINDER_API.sendTestEmail(payload);
        status.textContent=`Demo sent to ${email}.`;toast('Demo email sent');
      }else{
        window.dispatchEvent(new CustomEvent('etb2b:send-test-email',{detail:payload}));
        status.textContent='Preview request is ready. Connect ETB2B_REMINDER_API.sendTestEmail to your mail backend to deliver it.';
        toast('Test email payload prepared');
      }
    }catch(err){status.textContent='The mail service could not send this demo. Check the backend connection and try again.';status.classList.add('error');toast('Demo send failed');}
    finally{button.disabled=false;button.textContent=original;}
  });
  $('saveReminderDraft').addEventListener('click',()=>{
    if(composerMode==='automation'){closeDrawers();toast('Automation saved as draft');return;}
    closeDrawers();toast('Reminder saved as draft');
  });
  $('scheduleReminder').addEventListener('click',()=>{
    if(composerChannel==='email')syncEmailEditorToMessage();
    if(composerMode==='automation'){
      const trigger=$('autoPreviewTitle').textContent;
      const payload={name:$('autoName').value||'New automation',trigger,channel:$('autoChannel').value,delay:$('autoDelay').value,template:$('composerTemplate').value||'Custom template',status:true,triggered:'0',conversion:'New journey',subject:$('composerSubject').value,message:$('composerMessage').value};
      if(editingAutomationId){const index=automations.findIndex(a=>a.id===editingAutomationId);if(index>-1)automations[index]={...automations[index],...payload};toast('Automation updated');}
      else{automations.push({id:automationSeq++,...payload});toast('Automation activated');}
      editingAutomationId=null;renderAutomations();closeDrawers();return;
    }
    const target=$('composerAudience').value==='selected'&&selectedAudience?(selectedAudience.segmentName||'selected audience'):$('composerAudience').value;
    closeDrawers();toast(`${composerMode==='mailer'?'Mailer':composerChannel==='whatsapp'?'WhatsApp':composerChannel.toUpperCase()} scheduled for ${target}`);
  });

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
    const edit=e.target.closest('[data-edit-auto]');if(edit){openAutomationEditor(automations.find(x=>x.id===Number(edit.dataset.editAuto)));}
  });

  $('openAutoJourney').addEventListener('click',openAutomationCenter);
  $('openMailerStudio').addEventListener('click',()=>{switchTab('email');configureComposer('email',null,'mailer');setTimeout(()=>$('aiGoal').focus(),220);});
  $('clearAudienceContext').addEventListener('click',()=>{localStorage.removeItem('etb2b_awards_selected_audience');localStorage.removeItem('etb2b_awards_selected_leads');selectedAudience=null;hydrateAudienceContext();toast('Audience selection cleared');});
  $('generateAutoJourney').addEventListener('click',generateAutoJourney);
  $('createAutomation').addEventListener('click',()=>openAutomationEditor());
  $('addDefaultWhatsapp').addEventListener('click',()=>openAutomationEditor({name:'Registration welcome',trigger:'registered',channel:'WhatsApp',delay:'Immediately',template:'Registration confirmation'}));
  $('createSuggestedAutomation').addEventListener('click',()=>openAutomationEditor({name:'Start your entry',trigger:'noentry',channel:'WhatsApp',delay:'24 hours',template:'Start your entry'}));
  $('autoTrigger')?.addEventListener('change',updateAutomationPreview);
  $('autoDelay')?.addEventListener('change',updateAutomationPreview);
  $('autoChannel')?.addEventListener('change',switchAutomationChannel);

  openComposerFromAudience();
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawers();});
})();
