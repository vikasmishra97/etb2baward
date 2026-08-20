(function(){
  'use strict';
  var $=function(s){return document.querySelector(s)}, $$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};
  function safe(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch(e){return null}}
  function slugify(v){return String(v||'demo').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'demo'}
  function fmt(n){return Number(n||0).toLocaleString('en-IN')}
  function inr(n){n=Number(n||0);if(n>=10000000)return '₹'+(n/10000000).toFixed(2)+'Cr';if(n>=100000)return '₹'+(n/100000).toFixed(2)+'L';if(n>=1000)return '₹'+(n/1000).toFixed(1)+'K';return '₹'+Math.round(n)}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]})}
  function toast(msg){var t=$('#toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show')},1800)}

  var award=safe('awardflow_new_award')||{name:'India FinTech Awards 2027',slug:'india-fintech-awards-2027',currency:'INR'};
  var slug=award.slug||slugify(award.name), categoryData=safe('awardflow_categories_'+slug)||[];
  var campaigns=safe('awardflow_campaigns_'+slug);
  var ceremony=safe('awardflow.ceremony.v16');
  var winners=safe('awardflow.winners.v13');
  var shortlist=safe('awardflow.shortlist.v12');
  var scoring=safe('awardflow_scoring_v11');
  var audience=safe('awardflow_audience_'+slug);

  if($('#sideAwardName'))$('#sideAwardName').textContent=award.name||'Untitled Award';
  if($('#crumbAwardName'))$('#crumbAwardName').textContent=award.name||'Untitled Award';
  if($('#reportTitle'))$('#reportTitle').value=(award.name||'AwardFlow Award')+' · Executive Report';

  var funnelBase=[
    {key:'visitors',label:'Visitors',value:12480},
    {key:'registered',label:'Registered',value:3210},
    {key:'started',label:'Entries started',value:1620},
    {key:'submitted',label:'Submitted',value:1284},
    {key:'paid',label:'Paid',value:1126},
    {key:'shortlisted',label:'Shortlisted',value:25},
    {key:'winners',label:'Winners',value:5}
  ];
  var sourceData=[
    {name:'Website / Organic',paid:348,revenue:696000,conv:13.4},
    {name:'Email campaigns',paid:276,revenue:552000,conv:11.8},
    {name:'LinkedIn',paid:192,revenue:384000,conv:9.6},
    {name:'Past entrants',paid:148,revenue:296000,conv:17.1},
    {name:'Referral / Partner',paid:96,revenue:192000,conv:14.8},
    {name:'WhatsApp',paid:66,revenue:132000,conv:22.3}
  ];
  var categoryBase=[
    {name:'Best FinTech Startup',entries:284,revenue:568000},
    {name:'Best Digital Lending',entries:238,revenue:476000},
    {name:'Best Payments Innovation',entries:221,revenue:442000},
    {name:'Best AI in Financial Services',entries:168,revenue:336000},
    {name:'FinTech Leader of the Year',entries:123,revenue:246000}
  ];
  if(categoryData.length){categoryBase=categoryData.slice(0,5).map(function(c,i){return{name:c.name||('Category '+(i+1)),entries:[284,238,221,168,123][i]||95,revenue:([284,238,221,168,123][i]||95)*2000}})}
  var defaultCampaigns=[
    {id:'c1',name:'Early bird ends tonight',goal:'deadline',audience:'Registered, no entry',audienceCount:1584,channels:['email','whatsapp'],status:'sent',sent:1584,open:52.4,click:18.7,conversions:47,revenue:131600},
    {id:'c2',name:'Finish your nomination',goal:'incomplete',audience:'Entry started, incomplete',audienceCount:296,channels:['email'],status:'sent',sent:296,open:61.8,click:29.4,conversions:38,revenue:106400},
    {id:'c5',name:'Welcome back, 2026 entrants',goal:'nomination',audience:'Past-year entrants',audienceCount:2184,channels:['email'],status:'sent',sent:2184,open:43.1,click:11.5,conversions:29,revenue:81200},
    {id:'c6',name:'7 days left to enter',goal:'deadline',audience:'High-intent prospects',audienceCount:852,channels:['email','whatsapp'],status:'sent',sent:852,open:49.8,click:16.2,conversions:31,revenue:86800}
  ];
  if(!Array.isArray(campaigns)||!campaigns.length)campaigns=defaultCampaigns;

  function periodFactor(){var v=$('#periodSelect')?$('#periodSelect').value:'full';return v==='7'?.22:v==='14'?.38:v==='30'?.66:1}
  function activeFunnel(){var factor=periodFactor();return funnelBase.map(function(x,i){var f=i>4?1:factor;return Object.assign({},x,{value:Math.max(i>4?x.value:1,Math.round(x.value*f))})})}
  var funnelMode='volume';

  function renderFunnel(){var el=$('#lifecycleFunnel');if(!el)return;var d=activeFunnel(),max=d[0].value;el.innerHTML=d.map(function(x,i){var height=Math.max(18,Math.round((x.value/max)*138)),prev=i?d[i-1].value:d[0].value,rate=i?((x.value/Math.max(1,prev))*100):100;return '<div class="rp-funnel-step"><div class="bar-wrap"><div class="fbar" style="height:'+height+'px" title="'+esc(x.label)+': '+fmt(x.value)+'"></div></div><strong>'+(funnelMode==='volume'?fmt(x.value):rate.toFixed(1)+'%')+'</strong><small>'+esc(x.label)+'</small><em>'+(i?rate.toFixed(1)+'% step':'100% reach')+'</em></div>'}).join('');
    var foot=$('#funnelFoot');if(foot){var reg=d[1].value,start=d[2].value,sub=d[3].value,paid=d[4].value;foot.innerHTML='<span><i class="good"></i>Strongest step <b>Submitted → Paid '+((paid/sub)*100).toFixed(1)+'%</b></span><span><i class="warn"></i>Biggest leak <b>Registered → Started '+((start/reg)*100).toFixed(1)+'%</b></span>'}
  }
  function renderAcquisitionFunnel(){var el=$('#acquisitionFunnel');if(!el)return;var d=activeFunnel().slice(0,5),max=d[0].value;el.innerHTML=d.map(function(x,i){var rate=i?x.value/d[i-1].value*100:100;return '<div class="rp-acq-row"><span>'+esc(x.label)+'</span><div class="rp-progress"><i style="width:'+Math.max(3,x.value/max*100)+'%"></i></div><strong>'+fmt(x.value)+(i?' · '+rate.toFixed(1)+'%':'')+'</strong></div>'}).join('')}
  function renderSources(target){var el=$(target);if(!el)return;var arr=sourceData.slice();if(el.dataset.sorted==='revenue')arr.sort(function(a,b){return b.revenue-a.revenue});var max=Math.max.apply(null,arr.map(function(x){return x.paid}));el.innerHTML=arr.map(function(x){return '<div class="rp-source-item"><div class="rp-source-name"><b>'+esc(x.name)+'</b><small>'+fmt(x.paid)+' paid entries</small></div><div class="rp-source-bar"><i style="width:'+Math.round(x.paid/max*100)+'%"></i></div><strong>'+inr(x.revenue)+'</strong><em>'+x.conv.toFixed(1)+'% conv.</em></div>'}).join('')}
  function renderCategories(){var el=$('#categoryList');if(!el)return;var max=Math.max.apply(null,categoryBase.map(function(x){return x.entries}));el.innerHTML=categoryBase.map(function(x,i){var delta=[12,8,5,-3,2][i]||0;return '<div class="rp-category-row"><div class="top"><span><b>'+esc(x.name)+'</b><br><small>'+inr(x.revenue)+' attributed revenue</small></span><span><b>'+fmt(x.entries)+'</b><br><small>'+(delta>=0?'↑ ':'↓ ')+Math.abs(delta)+'%</small></span></div><div class="rp-progress"><i style="width:'+Math.round(x.entries/max*100)+'%"></i></div></div>'}).join('')}
  function renderCampaigns(){var el=$('#campaignTableBody');if(!el)return;var sent=campaigns.filter(function(c){return c.status==='sent'&&Number(c.sent)>0}).slice(0,6);el.innerHTML=sent.map(function(c){var eff=Number(c.sent)?Number(c.conversions||0)/Number(c.sent)*100:0,cls=eff>=8?'high':'medium';return '<tr><td class="campaign-name"><b>'+esc(c.name)+'</b><small>'+esc((c.channels||[]).join(' + ')||'email')+'</small></td><td>'+esc(c.audience||'Audience')+'</td><td>'+fmt(c.sent)+'</td><td>'+Number(c.open||0).toFixed(1)+'%</td><td>'+Number(c.click||0).toFixed(1)+'%</td><td><b>'+fmt(c.conversions||0)+'</b></td><td><b>'+inr(c.revenue||0)+'</b></td><td><span class="rp-efficiency '+cls+'">'+eff.toFixed(1)+'%</span></td></tr>'}).join('')||'<tr><td colspan="8">No sent campaigns yet.</td></tr>'}

  function linePath(values,w,h,pad){var min=0,max=Math.max.apply(null,values)*1.12;return values.map(function(v,i){var x=pad+(i*(w-pad*2)/(values.length-1)),y=h-pad-(v-min)/(max-min)*(h-pad*2);return{x:x,y:y}})}
  function renderRevenueChart(id,axisId){var svg=$(id),axis=$(axisId);if(!svg)return;var vals=[160000,310000,520000,760000,1180000,1780000,2568000], sponsor=[0,0,50000,100000,180000,300000,400000],w=720,h=250,pad=22,pts=linePath(vals,w,h,pad),pts2=linePath(sponsor,w,h,pad),path=pts.map(function(p,i){return(i?'L':'M')+p.x.toFixed(1)+' '+p.y.toFixed(1)}).join(' '),path2=pts2.map(function(p,i){return(i?'L':'M')+p.x.toFixed(1)+' '+p.y.toFixed(1)}).join(' '),area=path+' L '+pts[pts.length-1].x+' '+(h-pad)+' L '+pts[0].x+' '+(h-pad)+' Z';var grid='';[0,1,2,3,4].forEach(function(i){var y=pad+i*(h-pad*2)/4;grid+='<line class="gridline" x1="'+pad+'" y1="'+y+'" x2="'+(w-pad)+'" y2="'+y+'"></line>'});svg.innerHTML='<defs><linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7669f2" stop-opacity=".35"/><stop offset="100%" stop-color="#7669f2" stop-opacity="0"/></linearGradient></defs>'+grid+'<path class="area" d="'+area+'"></path><path class="line2" d="'+path2+'"></path><path class="line" d="'+path+'"></path>'+pts.map(function(p){return '<circle class="point" cx="'+p.x+'" cy="'+p.y+'" r="3.5"></circle>'}).join('');if(axis)axis.innerHTML=['Jan','Feb','Mar','Apr','May','Jun','Jul'].map(function(m){return '<span>'+m+'</span>'}).join('')}
  function ceremonyMetrics(){if(!ceremony)return{confirmed:412,checked:368,ready:4,total:5,cues:12};var guests=Array.isArray(ceremony.guests)?ceremony.guests:[],base=ceremony.baseRoster||{confirmed:402,checked:54},confirmed=Number(base.confirmed||0)+guests.filter(function(g){return g.rsvp==='confirmed'}).length,checked=Number(base.checked||0)+guests.filter(function(g){return g.rsvp==='confirmed'&&g.checked}).length,pres=Array.isArray(ceremony.presentations)?ceremony.presentations:[],ready=pres.filter(function(p){return !!(p.hasWinner&&p.locked&&p.verified&&p.presenter&&p.allowReveal)}).length;return{confirmed:confirmed||412,checked:checked||368,ready:ready||4,total:pres.length||5,cues:Array.isArray(ceremony.cues)?ceremony.cues.length:12}}
  function renderCeremony(){var m=ceremonyMetrics();['#celebrateGuests','#eventConfirmed'].forEach(function(s){if($(s))$(s).textContent=fmt(m.confirmed)});['#celebrateCheckins','#eventChecked'].forEach(function(s){if($(s))$(s).textContent=fmt(m.checked)});if($('#celebrateAttendance'))$('#celebrateAttendance').textContent=Math.round(m.checked/Math.max(1,m.confirmed)*100)+'%';if($('#eventReady'))$('#eventReady').textContent=m.ready+' / '+m.total;if($('#eventCues'))$('#eventCues').textContent=m.cues}
  function renderHealth(){var score=86;var m=ceremonyMetrics();if(m.ready===m.total)score+=4;if(shortlist&&shortlist.locked)score+=3;if(winners&&Array.isArray(winners.categories)&&winners.categories.every(function(c){return c.locked}))score+=3;score=Math.min(98,score);if($('#healthScore'))$('#healthScore').textContent=score+'%';if($('#healthRing'))$('#healthRing').style.background='conic-gradient(var(--brand) 0 '+score+'%,#ececf3 '+score+'% 100%)';var r=$('#healthRing strong');if(r)r.textContent=score;var el=$('#healthList');if(el){var items=[{ok:true,t:'Acquisition',d:'Traffic volume is healthy; focus on registered-user recovery.'},{ok:true,t:'Revenue',d:'Paid conversion is strong and revenue mix is stable.'},{ok:score>=90,t:'Judging & decisions',d:score>=90?'Decision workflow is well controlled.':'A small number of fairness or lock checks still need review.'},{ok:m.ready===m.total,t:'Ceremony',d:m.ready===m.total?'All award reveals are stage-ready.':(m.total-m.ready)+' award reveal'+(m.total-m.ready===1?' is':'s are')+' still protected.'}];el.innerHTML=items.map(function(x){return '<div class="'+(x.ok?'good':'warn')+'"><span>'+(x.ok?'✓':'!')+'</span><p><b>'+x.t+'</b><small>'+x.d+'</small></p></div>'}).join('')}}
  function updateTopKpis(){var d=activeFunnel(),factor=periodFactor(),entries=d[3].value,paid=d[4].value,revenue=Math.round(2568000*factor);if($('#kpiEntries'))$('#kpiEntries').textContent=fmt(entries);if($('#kpiRevenue'))$('#kpiRevenue').textContent=inr(revenue);if($('#kpiConversion'))$('#kpiConversion').textContent=(paid/d[0].value*100).toFixed(1)+'%';if($('#revenueTotalMeta'))$('#revenueTotalMeta').textContent=inr(revenue)+' total';if($('#revenueSub'))$('#revenueSub').textContent=inr(revenue/Math.max(1,paid))+' avg. per paid entry'}
  function renderAll(){renderFunnel();renderAcquisitionFunnel();renderSources('#sourceList');renderSources('#sourceListAcq');renderCategories();renderCampaigns();renderRevenueChart('#revenueChart','#revenueAxis');renderRevenueChart('#revenueChartRevenue','#revenueAxisRevenue');renderCeremony();renderHealth();updateTopKpis()}

  function activateTab(name){$$('.rp-tabs button').forEach(function(b){b.classList.toggle('active',b.dataset.tab===name)});$$('.rp-view').forEach(function(v){v.classList.toggle('active',v.dataset.view===name)});window.scrollTo({top:0,behavior:'smooth'})}
  $$('.rp-tabs button').forEach(function(b){b.addEventListener('click',function(){activateTab(b.dataset.tab)})});$$('[data-tab-jump]').forEach(function(b){b.addEventListener('click',function(){activateTab(b.dataset.tabJump)})});
  if($('#periodSelect'))$('#periodSelect').addEventListener('change',function(){renderFunnel();renderAcquisitionFunnel();updateTopKpis();toast('Report period updated')});
  if($('#toggleFunnelMode'))$('#toggleFunnelMode').addEventListener('click',function(){funnelMode=funnelMode==='volume'?'conversion':'volume';this.textContent=funnelMode==='volume'?'Show conversion':'Show volume';renderFunnel()});
  if($('#sortSources'))$('#sortSources').addEventListener('click',function(){var el=$('#sourceList');el.dataset.sorted=el.dataset.sorted==='revenue'?'':'revenue';this.textContent=el.dataset.sorted==='revenue'?'Restore source order':'Sort by revenue';renderSources('#sourceList')});
  if($('#categoryDetails'))$('#categoryDetails').addEventListener('click',function(){window.location.href='categories.html'});
  if($('#insightAction'))$('#insightAction').addEventListener('click',function(){localStorage.setItem('awardflow_selected_audience',JSON.stringify({award:slug,segmentKey:'registered',segmentName:'Registered, no entry',count:1590,createdAt:new Date().toISOString()}));window.location.href='audience.html'});
  $$('[data-recovery]').forEach(function(b){b.addEventListener('click',function(){var map={registered:['registered','Registered, no entry',1590],incomplete:['incomplete','Entry started, incomplete',296],payment:['payment','Submitted, payment pending',18],past:['past','Past-year entrants',2184]},x=map[b.dataset.recovery];localStorage.setItem('awardflow_selected_audience',JSON.stringify({award:slug,segmentKey:x[0],segmentName:x[1],count:x[2],createdAt:new Date().toISOString()}));window.location.href='audience.html'})});

  function openLayer(id){var el=$('#'+id);if(el){el.classList.add('open');el.setAttribute('aria-hidden','false')}}
  function closeLayer(id){var el=$('#'+id);if(el){el.classList.remove('open');el.setAttribute('aria-hidden','true')}}
  if($('#openExport'))$('#openExport').addEventListener('click',function(){openLayer('exportLayer')});$$('[data-close-layer]').forEach(function(x){x.addEventListener('click',function(){closeLayer(x.dataset.closeLayer)})});
  if($('#printReport'))$('#printReport').addEventListener('click',function(){window.print()});if($('#drawerPrint'))$('#drawerPrint').addEventListener('click',function(){closeLayer('exportLayer');setTimeout(function(){window.print()},100)});

  function csvRows(){var d=activeFunnel(),rows=[['AwardFlow Executive Report',award.name||'Award'],['Period',$('#periodSelect')?$('#periodSelect').selectedOptions[0].text:'Full award cycle'],[],['Lifecycle','Value']];d.forEach(function(x){rows.push([x.label,x.value])});rows.push([],['Revenue','Amount'],['Entry fees',2142000],['Sponsorship',400000],['Add-ons',26000],[],['Source','Paid entries','Revenue','Conversion %']);sourceData.forEach(function(x){rows.push([x.name,x.paid,x.revenue,x.conv])});rows.push([],['Campaign','Sent','Open %','Click %','Conversions','Revenue']);campaigns.filter(function(c){return c.status==='sent'}).forEach(function(c){rows.push([c.name,c.sent,c.open,c.click,c.conversions,c.revenue])});var m=ceremonyMetrics();rows.push([],['Ceremony','Value'],['Confirmed guests',m.confirmed],['Checked in',m.checked],['Stage-ready awards',m.ready+'/'+m.total],['Run-of-show cues',m.cues]);return rows}
  function downloadCsv(){var csv=csvRows().map(function(r){return r.map(function(v){return '"'+String(v==null?'':v).replace(/"/g,'""')+'"'}).join(',')}).join('\r\n'),blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=slug+'-executive-report.csv';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);toast('Executive report CSV downloaded')}
  if($('#downloadCsv'))$('#downloadCsv').addEventListener('click',downloadCsv);if($('#drawerCsv'))$('#drawerCsv').addEventListener('click',function(){downloadCsv();closeLayer('exportLayer')});
  if($('#shareSnapshot'))$('#shareSnapshot').addEventListener('click',function(){var text=(award.name||'AwardFlow Award')+' — '+($('#kpiEntries')?$('#kpiEntries').textContent:'1,284')+' completed entries, '+($('#kpiRevenue')?$('#kpiRevenue').textContent:'₹25.68L')+' revenue, '+($('#kpiConversion')?$('#kpiConversion').textContent:'9.0%')+' visitor-to-paid conversion.';if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){toast('Executive snapshot copied')},function(){toast(text)})}else toast(text)});
  if($('#viewRecommendations'))$('#viewRecommendations').addEventListener('click',function(){var p=$('#copilotPanel');p.classList.add('open');p.setAttribute('aria-hidden','false');$('#copilotAnswer').innerHTML='<b>Priority order:</b><br>1. Recover registered users who never started.<br>2. Clear 18 pending payments.<br>3. Resolve remaining judging variance checks.<br>4. Protect unfinished ceremony reveals before live mode.'});
  if($('#openCopilot'))$('#openCopilot').addEventListener('click',function(){var p=$('#copilotPanel');p.classList.toggle('open');p.setAttribute('aria-hidden',p.classList.contains('open')?'false':'true')});if($('#closeCopilot'))$('#closeCopilot').addEventListener('click',function(){$('#copilotPanel').classList.remove('open');$('#copilotPanel').setAttribute('aria-hidden','true')});
  var answers={biggest:'<b>Biggest growth opportunity:</b> 1,590 people registered without starting an entry. This is a warm audience with much lower acquisition cost than buying more traffic. Prioritize recovery campaigns before top-of-funnel spend.',revenue:'<b>Revenue driver:</b> Entry fees contribute 83% of current revenue. Regular-price entries outperform late entries on both volume and predictability, while sponsorship provides useful diversification.',judging:'<b>Judging health:</b> Review completion and workload balance are strong. Three scoring patterns still deserve human review, but there is no evidence that results should be automatically changed.',manager:'<b>Manager summary:</b> The award has healthy revenue and judging operations. The clearest improvement opportunity is conversion between registration and entry start. AwardFlow is also carrying winner data successfully into gallery, certificate and ceremony workflows.'};
  $$('.rp-copilot-prompts button').forEach(function(b){b.addEventListener('click',function(){$('#copilotAnswer').innerHTML=answers[b.dataset.question]||'No insight available.'})});

  renderAll();
})();
