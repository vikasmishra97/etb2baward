(function(){
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const fmt=n=>Number(n||0).toLocaleString('en-IN');
  const slugify=v=>String(v||'demo').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'demo';
  const toast=msg=>{const t=$('toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1900)};
  const savedAward=(()=>{try{return JSON.parse(localStorage.getItem('etb2b_awards_new_award')||'null')}catch(e){return null}})();
  const award=savedAward||{name:'India FinTech Awards 2027',slug:'india-fintech-awards-2027',currency:'INR',deadline:'2027-03-31'};
  const awardSlug=award.slug||slugify(award.name);
  const categoryKey='etb2b_awards_categories_'+awardSlug;
  let categories=(()=>{try{return JSON.parse(localStorage.getItem(categoryKey)||'[]')}catch(e){return []}})();
  if(!categories.length)categories=[{name:'Best FinTech Startup'},{name:'Best Digital Banking Innovation'},{name:'Best Payments Solution'},{name:'FinTech Leader of the Year'},{name:'Best AI in Financial Services'}];
  const categoryNames=categories.map(c=>c.name).filter(Boolean);
  const campaignKey='etb2b_awards_campaigns_'+awardSlug;

  $('sideAwardName').textContent=award.name||'Untitled Award';
  $('crumbAward').textContent=award.name||'Untitled Award';
  $('previewAwardFrom').textContent=award.name||'ETB2B Awards Award';
  $('previewAwardFoot').textContent=award.name||'ETB2B Awards Award';
  $('previewWaAward').textContent=(award.name||'ETB2B Awards Award').replace(/\s+20\d\d$/,'');

  const defaultCampaigns=[
    {id:'c1',name:'Early bird ends tonight',goal:'deadline',audience:'Registered, no entry',audienceCount:1584,channels:['email','whatsapp'],status:'sent',sent:1584,open:52.4,click:18.7,conversions:47,revenue:131600,when:'12 Mar · 5:30 PM'},
    {id:'c2',name:'Finish your nomination',goal:'incomplete',audience:'Entry started, incomplete',audienceCount:296,channels:['email'],status:'sent',sent:296,open:61.8,click:29.4,conversions:38,revenue:106400,when:'10 Mar · 10:00 AM'},
    {id:'c3',name:'Complete your payment',goal:'payment',audience:'Submitted, payment pending',audienceCount:18,channels:['email','whatsapp'],status:'scheduled',sent:0,open:0,click:0,conversions:0,revenue:0,when:'Tomorrow · 10:00 AM'},
    {id:'c4',name:'Best AI category spotlight',goal:'category',audience:'AI & data prospects',audienceCount:421,channels:['email'],status:'draft',sent:0,open:0,click:0,conversions:0,revenue:0,when:'Edited 2 hrs ago'},
    {id:'c5',name:'Welcome back, 2026 entrants',goal:'nomination',audience:'Past-year entrants',audienceCount:2184,channels:['email'],status:'sent',sent:2184,open:43.1,click:11.5,conversions:29,revenue:81200,when:'04 Mar · 11:30 AM'},
    {id:'c6',name:'7 days left to enter',goal:'deadline',audience:'High-intent prospects',audienceCount:852,channels:['email','whatsapp'],status:'sent',sent:852,open:49.8,click:16.2,conversions:31,revenue:86800,when:'01 Mar · 4:00 PM'}
  ];
  let campaigns=(()=>{try{return JSON.parse(localStorage.getItem(campaignKey)||'null')}catch(e){return null}})()||defaultCampaigns;
  let currentStep=1,selectedGoal='incomplete',selectedAudience={key:'incomplete',name:'Entry started, incomplete',count:296},activeField=null,activeDetailId=null;

  const opportunitySets=[
    [
      {goal:'incomplete',icon:'☷',title:'Recover incomplete entries',desc:'296 people have already started an entry and are your highest-intent recoverable audience.',metric:'296',label:'people',badge:'HIGH INTENT',priority:true},
      {goal:'payment',icon:'₹',title:'Recover pending payments',desc:'18 submissions are complete but unpaid. Remove friction and send the payment link directly.',metric:'₹36K',label:'recoverable',badge:'REVENUE',priority:true},
      {goal:'category',icon:'▦',title:'Promote Best AI',desc:'Interest in your lowest-demand category is 40% below your strongest category.',metric:'421',label:'relevant prospects',badge:'GROWTH'},
      {goal:'deadline',icon:'◷',title:'Prepare deadline push',desc:'Build the final-week campaign now so it is ready before the entry deadline.',metric:'7 days',label:'campaign window',badge:'PLAN AHEAD'}
    ],
    [
      {goal:'nomination',icon:'↗',title:'Re-engage past entrants',desc:'Past entrants already understand your award and need less education to return.',metric:'2,184',label:'past entrants',badge:'WARM AUDIENCE',priority:true},
      {goal:'incomplete',icon:'☷',title:'Nudge high-score starters',desc:'Focus first on entrants with intent scores above 90 and recent form activity.',metric:'96',label:'avg intent',badge:'HIGH INTENT',priority:true},
      {goal:'category',icon:'▦',title:'Category spotlight',desc:'Pair a category-specific proof point with a clear eligibility message.',metric:'44%',label:'current interest',badge:'AWARENESS'},
      {goal:'deadline',icon:'◷',title:'Early-bird reminder',desc:'Send an urgency message to registered users before the next price change.',metric:'1,590',label:'registered users',badge:'PRICE URGENCY'}
    ]
  ];
  let opportunitySet=0;

  const goalConfig={
    incomplete:{name:'Finish incomplete entries',campaign:'Finish your nomination',audience:{key:'incomplete',name:'Entry started, incomplete',count:296},subject:'{{first_name}}, your nomination is almost ready',heading:'Your nomination is almost ready',email:'Hi {{first_name}},\n\nYou have already started your nomination for '+award.name+'. Your progress is saved, so you can continue exactly where you left off.\n\nComplete the remaining questions before {{deadline}} to make sure {{company}} is considered.',wa:'Hi {{first_name}} — your '+award.name+' nomination is still saved. You can pick up where you left off and submit before {{deadline}}: {{entry_link}}',cta:'Continue nomination →',rate:.128,hint:'High-intent audience. Keep the message focused on completing the entry.'},
    payment:{name:'Recover pending payments',campaign:'Complete your payment',audience:{key:'payment',name:'Submitted, payment pending',count:18},subject:'Payment pending for your {{award_name}} entry',heading:'Your entry is submitted — one step remains',email:'Hi {{first_name}},\n\nYour {{category}} entry for '+award.name+' has been submitted successfully. Payment is the final step required to confirm the entry for judging.\n\nUse the secure payment link below to complete it.',wa:'Hi {{first_name}}, your '+award.name+' entry is submitted and waiting for payment. Complete payment here to confirm it for judging: {{entry_link}}',cta:'Complete payment →',rate:.44,hint:'Very high intent. Make payment completion the only primary action.'},
    nomination:{name:'Drive new nominations',campaign:'Nominations are open',audience:{key:'registered',name:'Registered, no entry',count:1590},subject:'Nominations are open for '+award.name,heading:'Put your best work forward',email:'Hi {{first_name}},\n\nNominations are now open for '+award.name+'. If {{company}} has created standout work this year, now is the time to put it forward.\n\nExplore the categories and start an entry before {{deadline}}.',wa:'Hi {{first_name}}, nominations are open for '+award.name+'. Explore the categories and start an entry for {{company}} before {{deadline}}: {{entry_link}}',cta:'Start a nomination →',rate:.073,hint:'Use clear category relevance and credibility to turn awareness into an entry start.'},
    category:{name:'Promote a category',campaign:'Category spotlight: '+(categoryNames[categoryNames.length-1]||'Featured category'),audience:{key:'category',name:(categoryNames[categoryNames.length-1]||'Featured category')+' prospects',count:421},subject:'Could {{company}} be a contender for {{category}}?',heading:'A category built for work like yours',email:'Hi {{first_name}},\n\nWe thought {{category}} in '+award.name+' may be especially relevant to {{company}}.\n\nThe category recognises measurable innovation and impact. Review the criteria and see whether your work is a fit before {{deadline}}.',wa:'Hi {{first_name}}, {{category}} in '+award.name+' may be a strong fit for {{company}}. Review the criteria and enter before {{deadline}}: {{entry_link}}',cta:'View category →',rate:.061,hint:'Category campaigns work best when the audience is tightly matched to eligibility.'},
    deadline:{name:'Deadline reminder',campaign:'Final deadline reminder',audience:{key:'deadline',name:'Registered + high-intent audience',count:1896},subject:'Final reminder: '+award.name+' closes {{deadline}}',heading:'The entry deadline is approaching',email:'Hi {{first_name}},\n\nThere is still time to enter '+award.name+', but the deadline is approaching.\n\nIf {{company}} plans to participate, start or finish your nomination before {{deadline}}.',wa:'Final reminder, {{first_name}}: '+award.name+' entries close {{deadline}}. Start or finish your nomination here: {{entry_link}}',cta:'Enter before the deadline →',rate:.094,hint:'Urgency is strongest when the exact deadline is visible in the subject and CTA.'},
    custom:{name:'Custom campaign',campaign:'Untitled campaign',audience:{key:'all',name:'All contacts',count:14842},subject:'A message from '+award.name,heading:'A message from '+award.name,email:'Hi {{first_name}},\n\nWrite your campaign message here.',wa:'Hi {{first_name}}, write your WhatsApp campaign message here.',cta:'Learn more →',rate:.04,hint:'Choose a tighter audience whenever possible to improve relevance and conversion.'},
    winner:{name:'Past winner re-engagement',campaign:'Welcome back, past winners',audience:{key:'winners',name:'Past winners',count:114},subject:'A new year of '+award.name+' is open',heading:'We would love to welcome you back',email:'Hi {{first_name}},\n\nAs a previous winner or finalist, you helped set the standard for '+award.name+'. Entries are now open for the new edition, and we would love to see what {{company}} has built since then.',wa:'Hi {{first_name}}, entries are open for the new edition of '+award.name+'. We would love to welcome {{company}} back: {{entry_link}}',cta:'Explore this year’s categories →',rate:.11,hint:'Past winners are a premium audience. Keep the tone personal and recognition-led.'}
  };
  const audienceOptions=[
    {key:'incomplete',name:'Entry started, incomplete',count:296,desc:'Highest intent · started a nomination'},
    {key:'payment',name:'Submitted, payment pending',count:18,desc:'Revenue recovery · entry complete'},
    {key:'registered',name:'Registered, no entry',count:1590,desc:'Warm audience · no entry started'},
    {key:'past',name:'Past-year entrants',count:2184,desc:'Previous award participants'},
    {key:'high',name:'High-intent prospects',count:1942,desc:'Intent score 75 or higher'},
    {key:'all',name:'All contacts',count:14842,desc:'Use carefully for broad announcements'}
  ];

  function persist(){localStorage.setItem(campaignKey,JSON.stringify(campaigns));}
  function replaceTokens(text){return String(text||'').replace(/{{first_name}}/g,'Riya').replace(/{{company}}/g,'NovaPay Labs').replace(/{{category}}/g,categoryNames[0]||'Best FinTech Startup').replace(/{{deadline}}/g,formatDeadline()).replace(/{{entry_link}}/g,'award.link/continue').replace(/{{award_name}}/g,award.name||'ETB2B Awards Award')}
  function formatDeadline(){const raw=award.deadline||award.closeDate||'2027-03-31';const d=new Date(raw+'T00:00:00');return isNaN(d)?'31 March':d.toLocaleDateString('en-IN',{day:'numeric',month:'long'})}
  function statusBadge(s){return s==='sent'?'<span class="badge green">Sent</span>':s==='scheduled'?'<span class="badge orange">Scheduled</span>':'<span class="badge">Draft</span>'}
  function channelHtml(channels){return `<div class="cp-channels">${channels.includes('email')?'<span class="cp-channel-pill">✉</span>':''}${channels.includes('whatsapp')?'<span class="cp-channel-pill">W</span>':''}</div>`}
  function campaignIcon(goal){return ({incomplete:'☷',payment:'₹',nomination:'↗',category:'▦',deadline:'◷',custom:'◇',winner:'🏆'}[goal]||'✉')}

  function renderOpportunities(){const data=opportunitySets[opportunitySet];$('opportunityGrid').innerHTML=data.map(o=>`<article class="cp-opportunity ${o.priority?'priority':''}"><div class="cp-opportunity-head"><span class="cp-opportunity-icon">${o.icon}</span><span class="cp-opportunity-badge">${esc(o.badge)}</span></div><h3>${esc(o.title)}</h3><p>${esc(o.desc)}</p><div class="cp-opportunity-metric"><div><b>${esc(o.metric)}</b><small>${esc(o.label)}</small></div><button class="cp-text-btn" data-preset="${esc(o.goal)}">Create →</button></div></article>`).join('');bindPresetButtons()}
  function renderCampaigns(){
    const q=$('campaignSearch').value.trim().toLowerCase(),status=$('campaignStatus').value;
    const rows=campaigns.filter(c=>(!q||(c.name+' '+c.audience).toLowerCase().includes(q))&&(status==='all'||c.status===status));
    $('campaignRows').innerHTML=rows.map(c=>{const perf=c.sent?Math.max(c.open||0,c.click||0):0;return `<tr><td><div class="cp-campaign-name"><span class="cp-campaign-channel-icon">${campaignIcon(c.goal)}</span><div><b>${esc(c.name)}</b><small>${esc(c.when||'Saved recently')}</small></div></div></td><td><div class="cp-audience-cell"><b>${esc(c.audience)}</b><small>${fmt(c.audienceCount)} recipients</small></div></td><td>${channelHtml(c.channels||[])}</td><td><div class="cp-perf"><div class="cp-perf-top"><span>${c.status==='sent'?'Open rate':'Not sent'}</span><b>${c.status==='sent'?(c.open||0).toFixed(1)+'%':'—'}</b></div><div class="progress"><span style="width:${Math.min(100,perf)}%"></span></div></div></td><td><div class="cp-conv"><b>${fmt(c.conversions||0)}</b><small>${c.revenue?'₹'+fmt(Math.round(c.revenue/1000))+'K influenced':'No attribution yet'}</small></div></td><td>${statusBadge(c.status)}</td><td><button class="cp-row-action" data-view-campaign="${esc(c.id)}">•••</button></td></tr>`}).join('')||'<tr><td colspan="7"><div class="empty"><b>No campaigns found</b><div style="margin-top:5px">Try another search or create a campaign.</div></div></td></tr>';
    $('campaignCount').textContent=`${rows.length} of ${campaigns.length} campaigns`;
    document.querySelectorAll('[data-view-campaign]').forEach(b=>b.addEventListener('click',()=>openDetail(b.dataset.viewCampaign)));
  }
  function bindPresetButtons(){document.querySelectorAll('[data-preset]').forEach(b=>{if(b.dataset.bound)return;b.dataset.bound='1';b.addEventListener('click',()=>openComposer(b.dataset.preset))})}

  function readPreparedAudience(){
    const selected=(()=>{try{return JSON.parse(localStorage.getItem('etb2b_awards_selected_audience')||'null')}catch(e){return null}})();
    const ids=(()=>{try{return JSON.parse(localStorage.getItem('etb2b_awards_selected_leads')||'[]')}catch(e){return []}})();
    if(ids&&ids.length)return {key:'selected',name:`Selected contacts (${ids.length})`,count:ids.length,prepared:true,meta:'Prepared in Audience & Leads'};
    if(selected&&selected.award===awardSlug)return {key:selected.segmentKey||'selected',name:selected.segmentName||'Prepared audience',count:selected.count||0,prepared:true,meta:'Prepared in Audience & Leads'};
    return null;
  }
  function clearPreparedAudience(){localStorage.removeItem('etb2b_awards_selected_audience');localStorage.removeItem('etb2b_awards_selected_leads')}
  function renderAudienceOptions(){
    const prepared=readPreparedAudience();
    if(prepared){selectedAudience=prepared;$('readyAudience').hidden=false;$('readyAudienceName').textContent=prepared.name;$('readyAudienceMeta').textContent=`${fmt(prepared.count)} contacts · ${prepared.meta}`}
    else $('readyAudience').hidden=true;
    $('audienceOptions').innerHTML=audienceOptions.map(a=>`<button class="cp-audience-option ${!prepared&&selectedAudience.key===a.key?'active':''}" data-audience="${esc(a.key)}"><b>${esc(a.name)} <span>${fmt(a.count)}</span></b><small>${esc(a.desc)}</small></button>`).join('');
    document.querySelectorAll('[data-audience]').forEach(b=>b.addEventListener('click',()=>{const a=audienceOptions.find(x=>x.key===b.dataset.audience);if(!a)return;clearPreparedAudience();selectedAudience={...a};renderAudienceOptions();updateAudienceEstimate();updatePreview()}));
    updateAudienceEstimate();
  }
  function updateAudienceEstimate(){
    $('recipientEstimate').textContent=fmt(selectedAudience.count||0);$('reviewRecipients').textContent=fmt(selectedAudience.count||0);
    const cfg=goalConfig[selectedGoal]||goalConfig.custom;$('audienceHint').textContent=cfg.hint;
    const rate=cfg.rate||.04;$('reviewConversions').textContent=fmt(Math.max(1,Math.round((selectedAudience.count||0)*rate)));
  }

  function openComposer(goal){
    selectedGoal=goalConfig[goal]?goal:'custom';currentStep=1;
    const prepared=readPreparedAudience();selectedAudience=prepared||{...goalConfig[selectedGoal].audience};
    applyGoalConfig(selectedGoal,true);renderAudienceOptions();showStep(1);updatePreview();
    $('campaignDrawer').classList.add('open');$('campaignDrawer').setAttribute('aria-hidden','false');
  }
  function closeComposer(){$('campaignDrawer').classList.remove('open');$('campaignDrawer').setAttribute('aria-hidden','true')}
  function applyGoalConfig(goal,resetMessage){
    selectedGoal=goal;document.querySelectorAll('[data-goal]').forEach(b=>b.classList.toggle('active',b.dataset.goal===goal));
    const cfg=goalConfig[goal]||goalConfig.custom;
    if(!readPreparedAudience())selectedAudience={...cfg.audience};
    $('campaignName').value=cfg.campaign;
    if(resetMessage){$('emailSubject').value=cfg.subject;$('emailSubjectB').value='';$('enableAb').checked=false;$('emailSubjectB').disabled=true;$('emailBody').value=cfg.email;$('whatsappBody').value=cfg.wa}
    updateAudienceEstimate();updatePreview();
  }
  function showStep(step){
    currentStep=Math.max(1,Math.min(4,step));
    document.querySelectorAll('.cp-step-panel').forEach(p=>p.classList.toggle('active',Number(p.dataset.step)===currentStep));
    document.querySelectorAll('[data-step-jump]').forEach(b=>{const n=Number(b.dataset.stepJump);b.classList.toggle('active',n===currentStep);b.classList.toggle('done',n<currentStep)});
    const names=['Goal','Audience','Message','Delivery'];$('composerStepLabel').textContent=`Step ${currentStep} of 4 · ${names[currentStep-1]}`;
    $('composerBack').disabled=currentStep===1;$('composerNext').textContent=currentStep===4?(document.querySelector('input[name=delivery]:checked').value==='schedule'?'Schedule campaign':'Launch campaign'):'Continue →';
    updatePreview();
  }
  function channelsLabel(){const out=[];if($('channelEmail').checked)out.push('Email');if($('channelWhatsapp').checked)out.push('WhatsApp');return out.join(' + ')||'No channel'}
  function validateStep(){
    if(currentStep===1&&!$('campaignName').value.trim()){toast('Give your campaign a name');return false}
    if(currentStep===2&&!(selectedAudience.count>0)){toast('Choose an audience');return false}
    if(currentStep===3&&!$('channelEmail').checked&&!$('channelWhatsapp').checked){toast('Choose at least one channel');return false}
    if(currentStep===3&&$('channelEmail').checked&&!$('emailSubject').value.trim()){toast('Add an email subject');return false}
    if(currentStep===4&&document.querySelector('input[name=delivery]:checked').value==='schedule'&&!$('scheduleDate').value){toast('Choose a schedule date');return false}
    return true
  }
  function updatePreview(){
    const subject=$('emailSubject').value||goalConfig[selectedGoal].subject;
    const body=$('emailBody').value||goalConfig[selectedGoal].email;
    const wa=$('whatsappBody').value||goalConfig[selectedGoal].wa;
    $('previewSubject').textContent=replaceTokens(subject);$('previewEmailHeading').textContent=goalConfig[selectedGoal].heading;$('previewEmailBody').textContent=replaceTokens(body);$('previewWaBody').textContent=replaceTokens(wa);$('previewEmailCta').textContent=goalConfig[selectedGoal].cta;
    $('waCount').textContent=`${$('whatsappBody').value.length} / 600`;$('reviewChannels').textContent=channelsLabel();
    const score=messageReadiness();$('messageScore').textContent=score+'%';$('messageScoreBar').style.width=score+'%';$('messageScore').style.color=score>=85?'var(--success)':score>=65?'var(--warn)':'var(--danger)';
    const checks=[];checks.push($('emailSubject').value.length<=55?'Subject is easy to scan':'Shorten the email subject');checks.push(/{{first_name}}|{{company}}/.test(body+wa)?'Personalization is included':'Add a personalization token');checks.push(/{{entry_link}}/.test(body+wa)?'One clear conversion link':'Add the award entry link');
    $('previewChecks').innerHTML=checks.map(x=>`<li>${esc(x)}</li>`).join('');
    $('messageChecks').innerHTML=[{good:$('emailSubject').value.length<=55,title:'Subject length',text:$('emailSubject').value.length+' characters'},{good:/{{first_name}}|{{company}}/.test(body+wa),title:'Personalized',text:'Uses entrant context'},{good:/{{entry_link}}/.test(body+wa),title:'CTA ready',text:'Tracks award conversion'}].map(x=>`<div class="cp-smart-check ${x.good?'':'warn'}"><span>${x.good?'✓':'!'}</span><div><b>${x.title}</b><small>${x.text}</small></div></div>`).join('');
  }
  function messageReadiness(){let s=55;if($('campaignName').value.trim())s+=8;if($('emailSubject').value.trim())s+=8;if($('emailBody').value.length>80)s+=8;if($('whatsappBody').value.length>35)s+=6;if(/{{first_name}}|{{company}}/.test($('emailBody').value+$('whatsappBody').value))s+=7;if(/{{entry_link}}/.test($('emailBody').value+$('whatsappBody').value))s+=8;return Math.min(100,s)}
  function generateMessage(){
    const cfg=goalConfig[selectedGoal]||goalConfig.custom;const tone=$('campaignTone').value;
    $('emailSubject').value=cfg.subject;
    let email=cfg.email,wa=cfg.wa;
    if(tone==='Warm & encouraging'){email=email.replace('Hi {{first_name}},','Hi {{first_name}},\n\nYou’re close — and we’d love to see your entry across the finish line.');wa=wa.replace('Hi {{first_name}}','Hi {{first_name}} 👋')}
    if(tone==='Urgent & concise'){email=email.split('\n\n').slice(0,3).join('\n\n')+'\n\nPlease act before {{deadline}}.';wa='Reminder: '+wa}
    if(tone==='Premium & editorial'){email=email.replace('Hi {{first_name}},','Dear {{first_name}},').replace('Complete','Confirm');}
    $('emailBody').value=email;$('whatsappBody').value=wa;updatePreview();toast('Award Copilot generated the campaign')
  }
  function saveDraft(){
    const now=new Date();const draft={id:'c'+Date.now(),name:$('campaignName').value.trim()||'Untitled campaign',goal:selectedGoal,audience:selectedAudience.name,audienceCount:selectedAudience.count,channels:[$('channelEmail').checked?'email':null,$('channelWhatsapp').checked?'whatsapp':null].filter(Boolean),status:'draft',sent:0,open:0,click:0,conversions:0,revenue:0,when:'Edited just now',subject:$('emailSubject').value,email:$('emailBody').value,whatsapp:$('whatsappBody').value};campaigns.unshift(draft);persist();renderCampaigns();toast('Campaign saved as draft');return draft;
  }
  function launchCampaign(){
    if(!validateStep())return;
    const delivery=document.querySelector('input[name=delivery]:checked').value;const scheduled=delivery==='schedule';
    const c={id:'c'+Date.now(),name:$('campaignName').value.trim(),goal:selectedGoal,audience:selectedAudience.name,audienceCount:selectedAudience.count,channels:[$('channelEmail').checked?'email':null,$('channelWhatsapp').checked?'whatsapp':null].filter(Boolean),status:scheduled?'scheduled':'sent',sent:scheduled?0:selectedAudience.count,open:scheduled?0:46.2,click:scheduled?0:15.1,conversions:scheduled?0:Math.max(1,Math.round(selectedAudience.count*(goalConfig[selectedGoal].rate||.04))),revenue:scheduled?0:Math.max(0,Math.round(selectedAudience.count*(goalConfig[selectedGoal].rate||.04)*2000)),when:scheduled?`${$('scheduleDate').value} · ${$('scheduleTime').value}`:'Just now',subject:$('emailSubject').value,email:$('emailBody').value,whatsapp:$('whatsappBody').value};
    campaigns.unshift(c);persist();renderCampaigns();clearPreparedAudience();closeComposer();toast(scheduled?'Campaign scheduled':'Campaign launched in demo mode');updateKpis();
  }
  function updateKpis(){const sent=campaigns.reduce((a,c)=>a+(c.sent||0),0),conv=campaigns.reduce((a,c)=>a+(c.conversions||0),0);$('sentKpi').textContent=fmt(sent);$('recoveredKpi').textContent=fmt(conv)}

  function openDetail(id){
    const c=campaigns.find(x=>x.id===id);if(!c)return;activeDetailId=id;
    $('detailName').textContent=c.name;$('detailMeta').textContent=`${c.audience} · ${channelNames(c.channels)} · ${c.when}`;$('detailSent').textContent=fmt(c.sent||0);$('detailOpen').textContent=c.sent?(c.open||0).toFixed(1)+'%':'—';$('detailClicks').textContent=c.sent?(c.click||0).toFixed(1)+'%':'—';$('detailConv').textContent=fmt(c.conversions||0);
    const opened=Math.round((c.sent||0)*(c.open||0)/100),clicked=Math.round((c.sent||0)*(c.click||0)/100);$('detailFunnel').innerHTML=[['Sent',c.sent||0],['Opened',opened],['Clicked',clicked],['Converted',c.conversions||0]].map(([n,v])=>`<div><span>${n}</span><b>${fmt(v)}</b></div>`).join('');
    $('detailEmailBar').style.width=Math.min(100,c.open||0)+'%';$('detailWaBar').style.width=Math.min(100,c.channels.includes('whatsapp')?72:0)+'%';$('detailEmailText').textContent=c.channels.includes('email')?(c.open||0).toFixed(1)+'% open':'Not used';$('detailWaText').textContent=c.channels.includes('whatsapp')?'72% read':'Not used';
    $('detailInsight').textContent=c.status==='draft'?'This campaign has not launched yet. Tighten the audience and generate the message before scheduling it.':c.status==='scheduled'?'This campaign is ready to go. Frequency guard will skip anyone contacted too recently.':c.goal==='incomplete'?'This audience is converting well. Consider an automation that sends the same reminder 72 hours after an entry becomes inactive.':c.goal==='payment'?'Payment campaigns perform best when the payment link is the single action and invoice support is easy to find.':'The campaign is contributing to award activity. Compare its conversion rate with other lifecycle segments before scaling.';
    $('detailDrawer').classList.add('open');$('detailDrawer').setAttribute('aria-hidden','false')
  }
  function channelNames(ch){return (ch||[]).map(x=>x==='email'?'Email':'WhatsApp').join(' + ')||'No channel'}
  function closeDetail(){$('detailDrawer').classList.remove('open');$('detailDrawer').setAttribute('aria-hidden','true')}

  function openTemplateModal(){$('templateModal').classList.add('open');$('templateModal').setAttribute('aria-hidden','false')}
  function closeTemplateModal(){$('templateModal').classList.remove('open');$('templateModal').setAttribute('aria-hidden','true')}

  $('createCampaign').addEventListener('click',()=>openComposer('custom'));$('createFromBottom').addEventListener('click',()=>openComposer('custom'));$('templateLibrary').addEventListener('click',openTemplateModal);
  $('refreshIdeas').addEventListener('click',()=>{opportunitySet=(opportunitySet+1)%opportunitySets.length;renderOpportunities();toast('Growth ideas refreshed')});
  $('campaignSearch').addEventListener('input',renderCampaigns);$('campaignStatus').addEventListener('change',renderCampaigns);
  document.querySelectorAll('[data-close-drawer]').forEach(x=>x.addEventListener('click',closeComposer));
  document.querySelectorAll('[data-goal]').forEach(b=>b.addEventListener('click',()=>{applyGoalConfig(b.dataset.goal,true);renderAudienceOptions()}));
  $('clearReadyAudience').addEventListener('click',()=>{clearPreparedAudience();selectedAudience={...goalConfig[selectedGoal].audience};renderAudienceOptions();toast('Prepared audience cleared')});
  document.querySelectorAll('[data-step-jump]').forEach(b=>b.addEventListener('click',()=>showStep(Number(b.dataset.stepJump))));
  $('composerBack').addEventListener('click',()=>showStep(currentStep-1));
  $('composerNext').addEventListener('click',()=>{if(!validateStep())return;if(currentStep<4)showStep(currentStep+1);else launchCampaign()});
  $('saveCampaignDraft').addEventListener('click',()=>{saveDraft();closeComposer()});
  $('generateMessage').addEventListener('click',generateMessage);
  ['campaignName','emailSubject','emailSubjectB','emailBody','whatsappBody'].forEach(id=>$(id).addEventListener('input',()=>{activeField=$(id);updatePreview()}));
  $('campaignTone').addEventListener('change',updatePreview);
  $('enableAb').addEventListener('change',()=>{$('emailSubjectB').disabled=!$('enableAb').checked;if($('enableAb').checked&&!$('emailSubjectB').value)$('emailSubjectB').value='Your '+award.name+' entry is waiting';updatePreview()});
  ['channelEmail','channelWhatsapp'].forEach(id=>$(id).addEventListener('change',()=>{$('emailFields').hidden=!$('channelEmail').checked;$('whatsappFields').hidden=!$('channelWhatsapp').checked;updatePreview()}));
  document.querySelectorAll('[data-token]').forEach(b=>b.addEventListener('click',()=>{const field=activeField&&['emailSubject','emailBody','whatsappBody'].includes(activeField.id)?activeField:$('emailBody');const s=field.selectionStart??field.value.length,e=field.selectionEnd??field.value.length;field.value=field.value.slice(0,s)+b.dataset.token+field.value.slice(e);field.focus();field.selectionStart=field.selectionEnd=s+b.dataset.token.length;updatePreview()}));
  document.querySelectorAll('input[name=delivery]').forEach(r=>r.addEventListener('change',()=>{const scheduled=document.querySelector('input[name=delivery]:checked').value==='schedule';$('scheduleFields').hidden=!scheduled;document.querySelectorAll('.cp-delivery-choice label').forEach(l=>l.classList.toggle('active',l.contains(document.querySelector('input[name=delivery]:checked'))));$('composerNext').textContent=scheduled?'Schedule campaign':'Launch campaign'}));
  document.querySelectorAll('[data-preview]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-preview]').forEach(x=>x.classList.toggle('active',x===b));const email=b.dataset.preview==='email';$('emailPreview').hidden=!email;$('whatsappPreview').hidden=email}));
  document.querySelectorAll('[data-close-detail]').forEach(x=>x.addEventListener('click',closeDetail));
  $('duplicateCampaign').addEventListener('click',()=>{const c=campaigns.find(x=>x.id===activeDetailId);if(!c)return;campaigns.unshift({...c,id:'c'+Date.now(),name:c.name+' · Copy',status:'draft',sent:0,open:0,click:0,conversions:0,revenue:0,when:'Edited just now'});persist();renderCampaigns();closeDetail();toast('Campaign duplicated')});
  $('detailCreateFollowup').addEventListener('click',()=>{const c=campaigns.find(x=>x.id===activeDetailId);closeDetail();openComposer(c&&goalConfig[c.goal]?c.goal:'custom')});
  document.querySelectorAll('[data-close-modal]').forEach(x=>x.addEventListener('click',closeTemplateModal));
  document.querySelectorAll('[data-template]').forEach(b=>b.addEventListener('click',()=>{closeTemplateModal();openComposer(b.dataset.template)}));

  $('openCopilot').addEventListener('click',()=>$('copilotPanel').classList.toggle('open'));$('closeCopilot').addEventListener('click',()=>$('copilotPanel').classList.remove('open'));
  const copilotAnswers={next:'Payment recovery is the highest-value next campaign: 18 submitted entries are unpaid, representing about ₹36,000 in recoverable fees. After that, target the 296 incomplete entries.',channel:'Use email for detail and WhatsApp for urgency. For high-intent recovery audiences, using both channels is appropriate; for cold prospects, start with email.',category:`${categoryNames[categoryNames.length-1]||'Your lowest-demand category'} currently has the weakest audience interest. Use a category-specific campaign rather than a broad nomination message.`,frequency:'Your current demo frequency is healthy. Keep the 24-hour frequency guard on, and move recurring follow-up into Automations instead of repeatedly sending one-off campaigns.'};
  document.querySelectorAll('[data-copilot-q]').forEach(b=>b.addEventListener('click',()=>{$('copilotAnswer').textContent=copilotAnswers[b.dataset.copilotQ]||copilotAnswers.next}));

  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeComposer();closeDetail();closeTemplateModal();$('copilotPanel').classList.remove('open')}});

  const tomorrow=new Date(Date.now()+86400000);$('scheduleDate').value=tomorrow.toISOString().slice(0,10);
  renderOpportunities();renderCampaigns();updateKpis();bindPresetButtons();
  const prepared=readPreparedAudience();if(prepared){toast(`${prepared.name} is ready for a campaign`);setTimeout(()=>openComposer(prepared.key==='payment'?'payment':prepared.key==='incomplete'?'incomplete':'custom'),500)}
})();
