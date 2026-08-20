(function(){
  const $=id=>document.getElementById(id);
  const toast=msg=>{const t=$('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)};
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const slugify=v=>String(v||'demo').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'demo';
  const fmt=n=>Number(n||0).toLocaleString('en-IN');

  const savedAward=(()=>{try{return JSON.parse(localStorage.getItem('etb2b_awards_new_award')||'null')}catch(e){return null}})();
  const award=savedAward||{name:'India FinTech Awards 2027',slug:'india-fintech-awards-2027',currency:'INR'};
  const awardSlug=award.slug||slugify(award.name);
  const categoryKey='etb2b_awards_categories_'+awardSlug;
  let categories=(()=>{try{return JSON.parse(localStorage.getItem(categoryKey)||'[]')}catch(e){return []}})();
  if(!categories.length)categories=[
    {name:'Best FinTech Startup'},{name:'Best Digital Banking Innovation'},{name:'Best Payments Solution'},{name:'FinTech Leader of the Year'},{name:'Best AI in Financial Services'}
  ];
  const categoryNames=categories.map(c=>c.name).filter(Boolean);
  const storeKey='etb2b_awards_audience_'+awardSlug;
  const segmentKey='etb2b_awards_segments_'+awardSlug;

  $('sideAwardName').textContent=award.name||'Untitled Award';
  $('crumbAward').textContent=award.name||'Untitled Award';

  const defaultLeads=[
    {id:'l1',name:'Riya Mehta',email:'riya@novapay.demo',phone:'+91 98765 21001',company:'NovaPay Labs',companySize:'Growth',category:'Best FinTech Startup',lifecycle:'started',score:96,source:'Website',lastActivity:'18 min ago',channels:['E','W'],tags:['High intent','Startup'],note:'Interested in the startup category. Asked about supporting-deck requirements.'},
    {id:'l2',name:'Arjun Rao',email:'arjun@orbitbank.demo',phone:'+91 98765 21002',company:'Orbit Digital Bank',companySize:'Enterprise',category:'Best Digital Banking Innovation',lifecycle:'registered',score:84,source:'Referral',lastActivity:'1 hr ago',channels:['E','W'],tags:['Enterprise','Warm'],note:''},
    {id:'l3',name:'Meera Shah',email:'meera@fluxmoney.demo',phone:'+91 98765 21003',company:'FluxMoney',companySize:'Growth',category:'Best Payments Solution',lifecycle:'submitted_unpaid',score:99,source:'Website',lastActivity:'2 hrs ago',channels:['E','W'],tags:['Payment pending','Urgent'],note:'Submission completed; finance team needs invoice.'},
    {id:'l4',name:'Kabir Sen',email:'kabir@latticeai.demo',phone:'+91 98765 21004',company:'Lattice AI Finance',companySize:'Startup',category:'Best AI in Financial Services',lifecycle:'prospect',score:78,source:'LinkedIn',lastActivity:'Today',channels:['E'],tags:['AI','Prospect'],note:''},
    {id:'l5',name:'Ananya Iyer',email:'ananya@crestpay.demo',phone:'+91 98765 21005',company:'CrestPay',companySize:'Enterprise',category:'Best Payments Solution',lifecycle:'past_entrant',score:81,source:'Past award',lastActivity:'Yesterday',channels:['E','W'],tags:['2026 entrant','Enterprise'],note:'Entered last year and reached shortlist.'},
    {id:'l6',name:'Dev Malhotra',email:'dev@ledgerloop.demo',phone:'+91 98765 21006',company:'LedgerLoop',companySize:'Growth',category:'Best FinTech Startup',lifecycle:'winner',score:88,source:'Past award',lastActivity:'Yesterday',channels:['E','W'],tags:['Past winner','VIP'],note:'2026 category winner.'},
    {id:'l7',name:'Sara Khan',email:'sara@mintgrid.demo',phone:'+91 98765 21007',company:'MintGrid',companySize:'Startup',category:'Best FinTech Startup',lifecycle:'started',score:92,source:'Website',lastActivity:'Yesterday',channels:['E','W'],tags:['High intent','Incomplete'],note:''},
    {id:'l8',name:'Neil Fernandes',email:'neil@bluevault.demo',phone:'+91 98765 21008',company:'BlueVault Finance',companySize:'Enterprise',category:'Best Digital Banking Innovation',lifecycle:'paid',score:100,source:'Partner list',lastActivity:'2 days ago',channels:['E'],tags:['Submitted','Paid'],note:''},
    {id:'l9',name:'Tara Joshi',email:'tara@quantleaf.demo',phone:'+91 98765 21009',company:'QuantLeaf',companySize:'Growth',category:'Best AI in Financial Services',lifecycle:'registered',score:69,source:'CSV Import',lastActivity:'2 days ago',channels:['E'],tags:['Imported','Warm'],note:''},
    {id:'l10',name:'Vikram Sethi',email:'vikram@harborpay.demo',phone:'+91 98765 21010',company:'HarborPay',companySize:'Enterprise',category:'Best Payments Solution',lifecycle:'prospect',score:41,source:'CSV Import',lastActivity:'3 days ago',channels:['E'],tags:['Imported'],note:''},
    {id:'l11',name:'Ishita Bose',email:'ishita@prismbank.demo',phone:'+91 98765 21011',company:'Prism Bank',companySize:'Enterprise',category:'FinTech Leader of the Year',lifecycle:'started',score:89,source:'Referral',lastActivity:'3 days ago',channels:['E','W'],tags:['Leadership','High intent'],note:''},
    {id:'l12',name:'Rohan Kapoor',email:'rohan@paynorth.demo',phone:'+91 98765 21012',company:'PayNorth',companySize:'Growth',category:'Best Payments Solution',lifecycle:'registered',score:63,source:'Website',lastActivity:'4 days ago',channels:['E','W'],tags:['Registered'],note:''},
    {id:'l13',name:'Naina Verma',email:'naina@spirecredit.demo',phone:'+91 98765 21013',company:'SpireCredit',companySize:'Startup',category:'Best FinTech Startup',lifecycle:'prospect',score:74,source:'LinkedIn',lastActivity:'5 days ago',channels:['E'],tags:['Startup','Prospect'],note:''},
    {id:'l14',name:'Aditya Menon',email:'aditya@clearledger.demo',phone:'+91 98765 21014',company:'ClearLedger',companySize:'Growth',category:'Best AI in Financial Services',lifecycle:'submitted_unpaid',score:94,source:'Website',lastActivity:'5 days ago',channels:['E','W'],tags:['Payment pending'],note:''},
    {id:'l15',name:'Pooja Nair',email:'pooja@bridgefin.demo',phone:'+91 98765 21015',company:'BridgeFin',companySize:'Enterprise',category:'Best Digital Banking Innovation',lifecycle:'past_entrant',score:72,source:'Past award',lastActivity:'1 week ago',channels:['E'],tags:['2026 entrant'],note:''},
    {id:'l16',name:'Siddharth Jain',email:'sid@pulsepay.demo',phone:'+91 98765 21016',company:'PulsePay',companySize:'Startup',category:'Best FinTech Startup',lifecycle:'started',score:86,source:'Partner list',lastActivity:'1 week ago',channels:['E','W'],tags:['Incomplete','Partner'],note:''},
    {id:'l17',name:'Ayesha Thomas',email:'ayesha@vectorbank.demo',phone:'+91 98765 21017',company:'Vector Bank',companySize:'Enterprise',category:'FinTech Leader of the Year',lifecycle:'prospect',score:58,source:'Event',lastActivity:'1 week ago',channels:['E'],tags:['Event lead'],note:''},
    {id:'l18',name:'Kunal Bhatt',email:'kunal@zenithrisk.demo',phone:'+91 98765 21018',company:'Zenith RiskTech',companySize:'Growth',category:'Best AI in Financial Services',lifecycle:'registered',score:76,source:'Website',lastActivity:'1 week ago',channels:['E','W'],tags:['Registered','AI'],note:''}
  ];

  let leads=(()=>{try{return JSON.parse(localStorage.getItem(storeKey)||'null')}catch(e){return null}})()||defaultLeads;
  let customSegments=(()=>{try{return JSON.parse(localStorage.getItem(segmentKey)||'[]')}catch(e){return []}})();
  let activeSegment='all';
  let activeLeadId=null;
  let selectedIds=new Set();
  let importBuffer=[];

  const segmentDefs=[
    {key:'all',name:'All contacts',count:14842,icon:'◎',tone:'',desc:'Everyone connected to this award.',hint:'Master audience'},
    {key:'registered',name:'Registered, no entry',count:1590,icon:'→',tone:'hot',desc:'Registered but have not started an entry.',hint:'High priority'},
    {key:'incomplete',name:'Entry started, incomplete',count:296,icon:'!',tone:'urgent',desc:'Started a form but have not submitted.',hint:'Highest intent'},
    {key:'unpaid',name:'Submitted, payment pending',count:18,icon:'₹',tone:'urgent',desc:'Completed the form but payment is outstanding.',hint:'Revenue recovery'},
    {key:'past',name:'Past-year entrants',count:2184,icon:'↺',tone:'',desc:'People who entered a previous edition.',hint:'Warm audience'},
    {key:'winners',name:'Past winners',count:114,icon:'★',tone:'vip',desc:'Previous winners and shortlisted contacts.',hint:'VIP'},
    {key:'enterprise',name:'High-value companies',count:386,icon:'◆',tone:'growth',desc:'Enterprise contacts with strong intent.',hint:'ABM opportunity'},
    {key:'startup',name:'Startup prospects',count:742,icon:'↗',tone:'growth',desc:'Prospects interested in startup categories.',hint:'Growth segment'}
  ];

  const lifecycleLabels={prospect:'Prospect',registered:'Registered',started:'Entry started',submitted_unpaid:'Submitted · unpaid',paid:'Paid / complete',past_entrant:'Past entrant',winner:'Past winner'};
  const segmentMatches=(lead,key,rules)=>{
    if(rules){
      if(rules.lifecycle!=='all'&&lead.lifecycle!==rules.lifecycle)return false;
      if(Number(lead.score||0)<Number(rules.intent||0))return false;
      if(rules.category!=='all'&&lead.category!==rules.category)return false;
      if(rules.source!=='all'&&lead.source!==rules.source)return false;
      return true;
    }
    if(key==='all')return true;
    if(key==='registered')return lead.lifecycle==='registered';
    if(key==='incomplete')return lead.lifecycle==='started';
    if(key==='unpaid')return lead.lifecycle==='submitted_unpaid';
    if(key==='past')return lead.lifecycle==='past_entrant'||lead.lifecycle==='winner';
    if(key==='winners')return lead.lifecycle==='winner';
    if(key==='enterprise')return lead.companySize==='Enterprise'&&lead.score>=70;
    if(key==='startup')return /startup/i.test(lead.category)||lead.companySize==='Startup';
    return true;
  };

  function persist(){localStorage.setItem(storeKey,JSON.stringify(leads));localStorage.setItem(segmentKey,JSON.stringify(customSegments));}
  function initials(name){return String(name||'?').split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase()}
  function intentClass(score){return score>=75?'high':score>=45?'medium':'low'}
  function activeDef(){return segmentDefs.find(s=>s.key===activeSegment)||customSegments.find(s=>s.key===activeSegment)||segmentDefs[0]}
  function activeRules(){const s=customSegments.find(x=>x.key===activeSegment);return s?s.rules:null}

  function populateCategoryControls(){
    ['categoryFilter','newLeadCategory','segmentCategory'].forEach(id=>{
      const el=$(id);if(!el)return;
      const current=el.value;
      if(id==='categoryFilter')el.innerHTML='<option value="all">All categories</option>'+categoryNames.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');
      else if(id==='segmentCategory')el.innerHTML='<option value="all">Any category interest</option>'+categoryNames.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');
      else el.innerHTML=categoryNames.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');
      if([...el.options].some(o=>o.value===current))el.value=current;
    });
  }

  function renderSegments(){
    const all=[...segmentDefs,...customSegments];
    $('segmentGrid').innerHTML=all.map(s=>`<button class="au-segment-card ${s.tone||''} ${s.key===activeSegment?'active':''}" data-segment="${esc(s.key)}">
      <div class="au-seg-top"><span class="au-seg-icon">${esc(s.icon||'◇')}</span><strong class="au-seg-count">${fmt(s.count)}</strong></div>
      <b>${esc(s.name)}</b><p>${esc(s.desc||'Custom audience segment.')}</p><footer><span>${esc(s.hint||'Custom rules')}</span><em>View →</em></footer>${s.custom?'<span class="au-custom-badge">CUSTOM</span>':''}
    </button>`).join('');
    document.querySelectorAll('[data-segment]').forEach(b=>b.addEventListener('click',()=>selectSegment(b.dataset.segment,true)));
  }

  function filteredLeads(){
    const q=$('contactSearch').value.trim().toLowerCase();
    const life=$('lifecycleFilter').value;
    const intent=$('intentFilter').value;
    const cat=$('categoryFilter').value;
    const rules=activeRules();
    return leads.filter(l=>{
      if(!segmentMatches(l,activeSegment,rules))return false;
      if(q&&!(l.name+' '+l.email+' '+l.company).toLowerCase().includes(q))return false;
      if(life!=='all'&&l.lifecycle!==life)return false;
      if(intent==='high'&&l.score<75)return false;
      if(intent==='medium'&&(l.score<45||l.score>=75))return false;
      if(intent==='low'&&l.score>=45)return false;
      if(cat!=='all'&&l.category!==cat)return false;
      return true;
    }).sort((a,b)=>b.score-a.score);
  }

  function renderTable(){
    const rows=filteredLeads();
    const def=activeDef();
    $('contactsTitle').textContent=def.name||'Contacts';
    $('contactsSubtitle').textContent=activeSegment==='all'?'A sample of your full award audience.':`${fmt(def.count||rows.length)} contacts in this audience · showing matching sample records.`;
    $('contactRows').innerHTML=rows.map(l=>`<tr data-lead-row="${esc(l.id)}">
      <td class="au-check"><input class="au-row-check" type="checkbox" data-select-id="${esc(l.id)}" ${selectedIds.has(l.id)?'checked':''}></td>
      <td><div class="au-contact-cell"><span class="au-contact-avatar">${esc(initials(l.name))}</span><div><b>${esc(l.name)}</b><small>${esc(l.email)}</small></div></div></td>
      <td><div class="au-company-cell"><b>${esc(l.company)}</b><small>${esc(l.companySize||'Company')}</small></div></td>
      <td><span class="au-life ${esc(l.lifecycle)}">${esc(lifecycleLabels[l.lifecycle]||l.lifecycle)}</span></td>
      <td>${esc(l.category)}</td>
      <td><div class="au-intent ${intentClass(l.score)}"><b>${l.score}</b><span class="au-intent-track"><i style="width:${Math.max(0,Math.min(100,l.score))}%"></i></span></div></td>
      <td>${esc(l.source)}</td>
      <td><span>${esc(l.lastActivity)}</span><div class="au-channel">${(l.channels||[]).map(c=>`<i title="${c==='W'?'WhatsApp':'Email'}">${esc(c)}</i>`).join('')}</div></td>
      <td><button class="au-row-action" data-open-lead="${esc(l.id)}" aria-label="Open lead">•••</button></td>
    </tr>`).join('')||`<tr><td colspan="9"><div class="empty"><b>No matching contacts</b><div style="margin-top:6px">Try clearing a filter or choosing another segment.</div></div></td></tr>`;
    $('tableCount').textContent=`Showing ${rows.length} sample contact${rows.length===1?'':'s'}${def.count?` · audience size ${fmt(def.count)}`:''}`;
    $('selectAll').checked=rows.length>0&&rows.every(l=>selectedIds.has(l.id));
    document.querySelectorAll('[data-open-lead]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();openLead(b.dataset.openLead)}));
    document.querySelectorAll('.au-row-check').forEach(c=>c.addEventListener('change',()=>{if(c.checked)selectedIds.add(c.dataset.selectId);else selectedIds.delete(c.dataset.selectId);updateBulk();}));
    document.querySelectorAll('[data-lead-row]').forEach(r=>r.addEventListener('dblclick',()=>openLead(r.dataset.leadRow)));
    updateBulk();
  }

  function selectSegment(key,scroll){
    activeSegment=key;selectedIds.clear();
    $('contactSearch').value='';$('lifecycleFilter').value='all';$('intentFilter').value='all';$('categoryFilter').value='all';
    renderSegments();renderTable();
    if(scroll)$('contactsTitle').scrollIntoView({behavior:'smooth',block:'center'});
  }

  function updateBulk(){
    $('bulkCount').textContent=`${selectedIds.size} selected`;
    $('bulkBar').hidden=selectedIds.size===0;
  }

  function renderSources(){
    const data=[['Website',42],['CSV import',24],['Referral',18],['Past award',16]];
    $('sourceBars').innerHTML=data.map(([n,p])=>`<div class="au-source-row"><b>${n}</b><span><i style="width:${p}%"></i></span><em>${p}%</em></div>`).join('');
  }
  function renderDemand(){
    const fallback=[['Best FinTech Startup',84],['Best Payments Solution',72],['Digital Banking Innovation',61],['Best AI in Financial Services',44]];
    const data=categoryNames.slice(0,4).map((n,i)=>[n,[84,72,61,44][i]||38])||fallback;
    $('categoryDemand').innerHTML=(data.length?data:fallback).map(([n,p])=>`<div class="au-demand-item"><div><b>${esc(n)}</b><small>${p}% interest</small></div><div class="bar"><span style="width:${p}%"></span></div></div>`).join('');
  }

  function openLead(id){
    const l=leads.find(x=>x.id===id);if(!l)return;activeLeadId=id;
    $('drawerName').textContent=l.name;$('drawerCompany').textContent=l.company;
    $('drawerScore').textContent=l.score;$('drawerStage').textContent=lifecycleLabels[l.lifecycle]||l.lifecycle;
    $('drawerReason').textContent=l.score>=90?'Very high intent: recent entry or payment activity.':l.score>=75?'High intent: recent award engagement.':l.score>=45?'Moderate intent: nurture with relevant category content.':'Low intent: consider awareness before conversion messaging.';
    $('drawerEmail').textContent=l.email||'—';$('drawerPhone').textContent=l.phone||'—';$('drawerCategory').textContent=l.category||'—';$('drawerSource').textContent=l.source||'—';
    $('drawerTags').innerHTML=(l.tags||[]).map(t=>`<span class="au-tag">${esc(t)}</span>`).join('')||'<span class="au-tag">No tags yet</span>';
    $('drawerNote').value=l.note||'';
    const ring=document.querySelector('.au-score-ring');ring.style.background=`conic-gradient(var(--brand) ${Math.max(0,Math.min(100,l.score))}%,#ececf2 0)`;
    const timeline=buildTimeline(l);$('drawerTimeline').innerHTML=timeline.map(x=>`<div class="au-time-item"><span class="au-time-icon">${x.icon}</span><div><b>${esc(x.title)}</b><p>${esc(x.detail)}</p><small>${esc(x.when)}</small></div></div>`).join('');
    $('leadDrawer').classList.add('open');$('leadDrawer').setAttribute('aria-hidden','false');
  }
  function closeDrawer(){$('leadDrawer').classList.remove('open');$('leadDrawer').setAttribute('aria-hidden','true')}
  function buildTimeline(l){
    const events=[];
    if(l.lifecycle==='started'||l.lifecycle==='submitted_unpaid'||l.lifecycle==='paid')events.push({icon:'☷',title:'Entry activity',detail:l.lifecycle==='started'?'Started an award entry':l.lifecycle==='submitted_unpaid'?'Submitted an entry; payment is pending':'Completed and paid for an entry',when:l.lastActivity});
    if(l.lifecycle==='registered'||l.lifecycle==='started'||l.lifecycle==='submitted_unpaid'||l.lifecycle==='paid')events.push({icon:'✓',title:'Registered for the award',detail:'Created an entrant account for '+award.name,when:'Earlier'});
    events.push({icon:'✉',title:'Added to audience',detail:'Source: '+l.source,when:'Audience history'});
    return events;
  }

  function openModal(id){$(id).classList.add('open');$(id).setAttribute('aria-hidden','false')}
  function closeModal(id){$(id).classList.remove('open');$(id).setAttribute('aria-hidden','true')}

  function useSegmentForCampaign(key){
    const s=segmentDefs.find(x=>x.key===key)||customSegments.find(x=>x.key===key)||activeDef();
    localStorage.setItem('etb2b_awards_selected_audience',JSON.stringify({award:awardSlug,segmentKey:s.key,segmentName:s.name,count:s.count,createdAt:new Date().toISOString()}));
    toast(`${s.name} prepared for Campaigns`);
    setTimeout(()=>{location.href='campaigns.html'},500);
  }

  function exportRows(rows,filename){
    const headers=['name','email','company','phone','category','lifecycle','intent_score','source'];
    const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
    const csv=[headers.join(','),...rows.map(l=>[l.name,l.email,l.company,l.phone,l.category,l.lifecycle,l.score,l.source].map(q).join(','))].join('\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),500);toast('CSV exported');
  }

  function estimateSegment(){
    const life=$('segmentLifecycle').value,intent=Number($('segmentIntent').value),cat=$('segmentCategory').value,source=$('segmentSource').value;
    let factor=1;
    if(life!=='all')factor*=({prospect:.34,registered:.107,started:.02,submitted_unpaid:.004,past_entrant:.14,winner:.008}[life]||.2);
    if(intent>=90)factor*=.12;else if(intent>=75)factor*=.32;else if(intent>=45)factor*=.66;
    if(cat!=='all')factor*=.23;if(source!=='all')factor*=.25;
    const n=Math.max(3,Math.round(14842*factor));$('segmentEstimate').textContent=fmt(n);return n;
  }

  function parseCsv(text){
    const lines=String(text||'').trim().split(/\r?\n/).filter(Boolean);if(lines.length<2)return [];
    const parseLine=line=>{const out=[];let cur='',quoted=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){if(quoted&&line[i+1]==='"'){cur+='"';i++;}else quoted=!quoted;}else if(ch===','&&!quoted){out.push(cur.trim());cur='';}else cur+=ch;}out.push(cur.trim());return out};
    const headers=parseLine(lines[0]).map(h=>h.toLowerCase().replace(/[^a-z0-9]+/g,'_'));
    const alias={full_name:'name',contact_name:'name',organisation:'company',organization:'company',mobile:'phone',interest:'category'};
    return lines.slice(1,101).map((line,i)=>{const vals=parseLine(line),obj={};headers.forEach((h,idx)=>obj[alias[h]||h]=vals[idx]||'');if(!obj.name&&!obj.email)return null;return {id:'imp_'+Date.now()+'_'+i,name:obj.name||obj.email.split('@')[0],email:obj.email||'',phone:obj.phone||'',company:obj.company||'Unknown company',companySize:'Unknown',category:obj.category||categoryNames[0]||'General',lifecycle:'prospect',score:50,source:obj.source||'CSV Import',lastActivity:'Just imported',channels:['E'],tags:['Imported'],note:''}}).filter(Boolean);
  }
  function renderImportPreview(){
    $('importPreview').hidden=importBuffer.length===0;$('confirmImport').disabled=importBuffer.length===0;$('confirmImport').textContent=importBuffer.length?`Import ${importBuffer.length} contact${importBuffer.length===1?'':'s'}`:'Import contacts';
    $('importPreviewTitle').textContent=`${importBuffer.length} contact${importBuffer.length===1?'':'s'} ready`;
    $('importRows').innerHTML=importBuffer.slice(0,5).map(l=>`<tr><td>${esc(l.name)}</td><td>${esc(l.email)}</td><td>${esc(l.company)}</td><td>${esc(l.category)}</td><td>${esc(l.source)}</td></tr>`).join('');
  }

  populateCategoryControls();renderSegments();renderTable();renderSources();renderDemand();

  // Filters and table actions
  ['contactSearch','lifecycleFilter','intentFilter','categoryFilter'].forEach(id=>$(id).addEventListener(id==='contactSearch'?'input':'change',()=>{selectedIds.clear();renderTable()}));
  $('resetFilters').addEventListener('click',()=>{$('contactSearch').value='';$('lifecycleFilter').value='all';$('intentFilter').value='all';$('categoryFilter').value='all';selectedIds.clear();renderTable()});
  $('selectAll').addEventListener('change',()=>{filteredLeads().forEach(l=>$('selectAll').checked?selectedIds.add(l.id):selectedIds.delete(l.id));renderTable()});
  $('bulkExport').addEventListener('click',()=>exportRows(leads.filter(l=>selectedIds.has(l.id)),'etb2b-awards-selected-leads.csv'));
  $('bulkCampaign').addEventListener('click',()=>{localStorage.setItem('etb2b_awards_selected_leads',JSON.stringify([...selectedIds]));toast(`${selectedIds.size} contacts prepared for Campaigns`);setTimeout(()=>location.href='campaigns.html',500)});
  $('exportVisible').addEventListener('click',()=>exportRows(filteredLeads(),'etb2b-awards-audience.csv'));
  $('campaignVisible').addEventListener('click',()=>useSegmentForCampaign(activeSegment));
  $('saveAudience').addEventListener('click',()=>{persist();toast('Audience saved in this browser')});

  // Segment shortcuts
  document.querySelectorAll('[data-segment-jump]').forEach(b=>b.addEventListener('click',()=>selectSegment(b.dataset.segmentJump,true)));
  document.querySelectorAll('[data-use-segment]').forEach(b=>b.addEventListener('click',()=>useSegmentForCampaign(b.dataset.useSegment)));

  // Lead drawer
  document.querySelectorAll('[data-close-drawer]').forEach(b=>b.addEventListener('click',closeDrawer));
  $('saveLeadNote').addEventListener('click',()=>{const l=leads.find(x=>x.id===activeLeadId);if(!l)return;l.note=$('drawerNote').value.trim();persist();$('drawerSaveState').textContent='Saved just now';toast('Lead profile saved')});
  $('drawerCampaign').addEventListener('click',()=>{if(!activeLeadId)return;localStorage.setItem('etb2b_awards_selected_leads',JSON.stringify([activeLeadId]));toast('Lead prepared for Campaigns')});
  $('drawerReminder').addEventListener('click',()=>toast('Reminder draft created for this lead'));
  $('addTag').addEventListener('click',()=>{const tag=prompt('Tag name');if(!tag)return;const l=leads.find(x=>x.id===activeLeadId);if(!l)return;l.tags=l.tags||[];if(!l.tags.includes(tag))l.tags.push(tag);persist();openLead(activeLeadId);toast('Tag added')});

  // Modal open / close
  $('addLead').addEventListener('click',()=>openModal('addLeadModal'));
  $('importContacts').addEventListener('click',()=>{importBuffer=[];renderImportPreview();openModal('importModal')});
  $('createSegment').addEventListener('click',()=>{['segmentName'].forEach(id=>$(id).value='');$('segmentLifecycle').value='all';$('segmentIntent').value='0';$('segmentCategory').value='all';$('segmentSource').value='all';estimateSegment();openModal('segmentModal')});
  document.querySelectorAll('[data-close-modal]').forEach(b=>b.addEventListener('click',()=>closeModal(b.dataset.closeModal)));

  $('saveNewLead').addEventListener('click',()=>{
    const name=$('newLeadName').value.trim(),company=$('newLeadCompany').value.trim(),email=$('newLeadEmail').value.trim();
    if(!name||!company||!email){toast('Name, company and email are required');return}
    leads.unshift({id:'manual_'+Date.now(),name,company,email,phone:$('newLeadPhone').value.trim(),companySize:'Unknown',category:$('newLeadCategory').value||categoryNames[0],lifecycle:$('newLeadLifecycle').value,score:Math.max(0,Math.min(100,Number($('newLeadScore').value||50))),source:$('newLeadSource').value,lastActivity:'Just added',channels:['E'],tags:['Manual'],note:''});
    persist();closeModal('addLeadModal');['newLeadName','newLeadCompany','newLeadEmail','newLeadPhone'].forEach(id=>$(id).value='');activeSegment='all';renderSegments();renderTable();toast('Lead added to audience');
  });

  // Import
  $('csvFile').addEventListener('change',()=>{const f=$('csvFile').files[0];if(!f)return;const reader=new FileReader();reader.onload=()=>{importBuffer=parseCsv(reader.result);renderImportPreview();if(!importBuffer.length)toast('No usable rows found in this CSV')};reader.readAsText(f)});
  $('sampleImport').addEventListener('click',()=>{importBuffer=[
    {id:'imp_'+Date.now()+'_1',name:'Maya Kulkarni',email:'maya@finstride.demo',phone:'+91 98765 30001',company:'FinStride',companySize:'Growth',category:categoryNames[0],lifecycle:'prospect',score:54,source:'CSV Import',lastActivity:'Just imported',channels:['E'],tags:['Imported'],note:''},
    {id:'imp_'+Date.now()+'_2',name:'Aman Gill',email:'aman@corepay.demo',phone:'+91 98765 30002',company:'CorePay Systems',companySize:'Enterprise',category:categoryNames[1]||categoryNames[0],lifecycle:'prospect',score:57,source:'CSV Import',lastActivity:'Just imported',channels:['E'],tags:['Imported'],note:''},
    {id:'imp_'+Date.now()+'_3',name:'Leena Das',email:'leena@seedfinance.demo',phone:'+91 98765 30003',company:'Seed Finance',companySize:'Startup',category:categoryNames[0],lifecycle:'prospect',score:61,source:'CSV Import',lastActivity:'Just imported',channels:['E'],tags:['Imported'],note:''}
  ];renderImportPreview();toast('Sample import prepared')});
  $('confirmImport').addEventListener('click',()=>{if(!importBuffer.length)return;const emails=new Set(leads.map(l=>l.email.toLowerCase()));const fresh=importBuffer.filter(l=>!emails.has((l.email||'').toLowerCase()));leads=[...fresh,...leads];persist();closeModal('importModal');activeSegment='all';renderSegments();renderTable();toast(`${fresh.length} new contact${fresh.length===1?'':'s'} imported`);importBuffer=[]});
  $('downloadTemplate').addEventListener('click',()=>{const csv='name,email,company,phone,category,source\nRiya Mehta,riya@example.com,NovaPay,+91 9000000000,Best FinTech Startup,Partner list';const blob=new Blob([csv],{type:'text/csv'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='etb2b-awards-audience-template.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),500)});

  // Segment builder
  ['segmentLifecycle','segmentIntent','segmentCategory','segmentSource'].forEach(id=>$(id).addEventListener('change',estimateSegment));
  $('saveSegment').addEventListener('click',()=>{const name=$('segmentName').value.trim();if(!name){toast('Give your segment a name');return}const count=estimateSegment();const key='custom_'+Date.now();customSegments.push({key,name,count,icon:'◇',tone:'',desc:'Custom audience using your saved rules.',hint:'Custom rules',custom:true,rules:{lifecycle:$('segmentLifecycle').value,intent:Number($('segmentIntent').value),category:$('segmentCategory').value,source:$('segmentSource').value}});persist();closeModal('segmentModal');activeSegment=key;renderSegments();renderTable();toast('Custom segment created')});

  // Copilot
  $('openCopilot').addEventListener('click',()=>$('copilotPanel').classList.toggle('open'));
  $('closeCopilot').addEventListener('click',()=>$('copilotPanel').classList.remove('open'));
  document.querySelectorAll('[data-copilot-prompt]').forEach(b=>b.addEventListener('click',()=>{
    const answers={
      convert:'Prioritize the 296 people who started an entry, then the 18 submitted entries with payment pending. Keep cold acquisition running, but do not let it distract from warm recovery.',
      category:`${categoryNames[categoryNames.length-1]||'Your lowest-demand category'} has the lowest current interest signal. Promote it to relevant companies with category-specific proof points rather than a general award message.`,
      quality:'Your audience health is strong at 91%. The biggest improvement would come from adding role/seniority and phone consent to imported contacts so WhatsApp and account-based targeting are safer and more precise.'
    };
    $('copilotAnswer').textContent=answers[b.dataset.copilotPrompt];
  }));

  $('showSources').addEventListener('click',()=>toast('Source performance report is planned for Reports'));
  $('promoteLowDemand').addEventListener('click',()=>{const low=categoryNames[categoryNames.length-1]||'lowest-demand category';localStorage.setItem('etb2b_awards_selected_audience',JSON.stringify({award:awardSlug,segmentKey:'category_growth',segmentName:low+' prospects',count:421,createdAt:new Date().toISOString()}));toast(`${low} audience prepared for Campaigns`)});
})();
