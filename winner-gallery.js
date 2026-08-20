(function(){
  var $=function(s){return document.querySelector(s)};
  var $$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};
  var stateKey='awardflow.gallery.v14';
  var winnersKey='awardflow.winners.v13';
  var activeFilter='all';
  var activeProfileId=null;
  var activeShareFormat='linkedin';
  var defaults={
    theme:'spotlight',layout:'grid',showFilters:true,respectEmbargo:true,indexProfiles:true,structuredData:true,
    headline:'Meet the innovators shaping the future of fintech.',
    intro:'Explore the winning companies and leaders recognized by the India FinTech Awards 2027.',
    seoTitle:'India FinTech Awards 2027 Winners',
    seoDescription:'Meet the winners of the India FinTech Awards 2027 and discover the companies and leaders shaping financial technology.',
    publishStatus:'draft',profiles:{}
  };
  var state=JSON.parse(JSON.stringify(defaults));
  var award={name:'India FinTech Awards 2027',description:'Recognising excellence and innovation across India\'s fintech ecosystem.'};
  try{var a=JSON.parse(localStorage.getItem('awardflow_new_award')||'null');if(a&&a.name)award=a;}catch(e){}

  var baseCategories=[
    {id:'startup',name:'Best FinTech Startup',finalists:[
      {id:'nova',name:'NovaPay Technologies',tag:'Digital-first payment infrastructure',award:'winner',nameVerified:true,brandVerified:true,consent:false,juryApproved:true},
      {id:'cred',name:'CredStack',tag:'Embedded credit infrastructure',award:'finalist',nameVerified:true,brandVerified:true,consent:true,juryApproved:true},
      {id:'astra',name:'AstraLedger',tag:'SME treasury automation',award:'finalist',nameVerified:true,brandVerified:false,consent:true,juryApproved:true},
      {id:'pulse',name:'PulseCredit',tag:'Alternative underwriting platform',award:'finalist',nameVerified:true,brandVerified:true,consent:true,juryApproved:false},
      {id:'finbridge',name:'FinBridge Labs',tag:'Open-finance connectivity',award:'finalist',nameVerified:true,brandVerified:true,consent:true,juryApproved:true}
    ],locked:false},
    {id:'lending',name:'Best Digital Lending',finalists:[
      {id:'clearlend',name:'ClearLend',tag:'Embedded SME credit platform',award:'winner',nameVerified:true,brandVerified:true,consent:true,juryApproved:true},
      {id:'creditnova',name:'CreditNova',tag:'Alternative risk engine',award:'finalist',nameVerified:true,brandVerified:true,consent:true,juryApproved:true},
      {id:'lendverse',name:'LendVerse',tag:'Supply-chain lending network',award:'finalist',nameVerified:true,brandVerified:true,consent:true,juryApproved:true}
    ],locked:true},
    {id:'payments',name:'Best Payments Innovation',finalists:[
      {id:'paymesh',name:'PayMesh',tag:'Programmable merchant payments',award:'winner',nameVerified:true,brandVerified:true,consent:true,juryApproved:true},
      {id:'tapgrid',name:'TapGrid',tag:'Offline-first acceptance network',award:'finalist',nameVerified:true,brandVerified:true,consent:true,juryApproved:true},
      {id:'settly',name:'Settly',tag:'Cross-border settlement layer',award:'finalist',nameVerified:true,brandVerified:true,consent:true,juryApproved:true}
    ],locked:true},
    {id:'ai',name:'Best AI in Financial Services',finalists:[
      {id:'riskmind',name:'RiskMind AI',tag:'Explainable underwriting intelligence',award:'finalist',nameVerified:true,brandVerified:true,consent:true,juryApproved:false},
      {id:'finpilot',name:'FinPilot Labs',tag:'AI operations copilot for banks',award:'finalist',nameVerified:true,brandVerified:true,consent:true,juryApproved:false},
      {id:'fraudlens',name:'FraudLens',tag:'Realtime fraud pattern detection',award:'finalist',nameVerified:true,brandVerified:true,consent:true,juryApproved:true}
    ],locked:false},
    {id:'leader',name:'FinTech Leader of the Year',finalists:[
      {id:'neha',name:'Neha Rao - Orbit Finance',tag:'Founder and CEO',award:'winner',nameVerified:true,brandVerified:true,consent:true,juryApproved:true},
      {id:'arjun',name:'Arjun Mehta - NovaPay',tag:'Co-founder',award:'finalist',nameVerified:true,brandVerified:true,consent:true,juryApproved:true}
    ],locked:true}
  ];

  function copy(obj){return JSON.parse(JSON.stringify(obj))}
  function mergeWinnerState(){
    var cats=copy(baseCategories);
    try{
      var saved=JSON.parse(localStorage.getItem(winnersKey)||'null');
      if(saved&&saved.categories){saved.categories.forEach(function(sc){var c=cats.filter(function(x){return x.id===sc.id})[0];if(!c)return;if(typeof sc.locked==='boolean')c.locked=sc.locked;if(sc.finalists)sc.finalists.forEach(function(sf){var f=c.finalists.filter(function(x){return x.id===sf.id})[0];if(!f)return;Object.keys(sf).forEach(function(k){if(k!=='id')f[k]=sf[k]})})})}
      return {categories:cats,releaseMode:saved&&saved.releaseMode||'scheduled',releaseDate:saved&&saved.releaseDate||'2027-06-15',releaseTime:saved&&saved.releaseTime||'10:00'};
    }catch(e){return {categories:cats,releaseMode:'scheduled',releaseDate:'2027-06-15',releaseTime:'10:00'}}
  }
  var winnerState=mergeWinnerState();

  function load(){try{var saved=JSON.parse(localStorage.getItem(stateKey)||'null');if(saved)Object.keys(saved).forEach(function(k){state[k]=saved[k]})}catch(e){}}
  function save(show){try{localStorage.setItem(stateKey,JSON.stringify(state));if(show)toast('Winner gallery draft saved')}catch(e){}}
  function toast(msg){var el=$('#toast');if(!el)return;el.textContent=msg;el.classList.add('show');clearTimeout(window.__wgToast);window.__wgToast=setTimeout(function(){el.classList.remove('show')},2200)}
  function initials(name){return name.split(/\s+/).map(function(x){return x.charAt(0)}).join('').replace(/[^A-Za-z]/g,'').slice(0,2).toUpperCase()||'W'}
  function recipientAwards(v){return ['winner','runner-up','gold','silver','bronze'].indexOf(v)>-1}
  function verified(f){return !!(f.nameVerified&&f.brandVerified&&f.consent&&f.juryApproved)}
  function allRecipients(){var arr=[];winnerState.categories.forEach(function(c){c.finalists.forEach(function(f){if(recipientAwards(f.award))arr.push({id:c.id+'::'+f.id,categoryId:c.id,category:c.name,locked:c.locked,name:f.name,tag:f.tag||'',award:f.award,verified:verified(f),source:f})})});return arr}
  function publicRecipients(){return allRecipients().filter(function(r){return r.locked&&r.verified})}
  function protectedRecipients(){return allRecipients().filter(function(r){return !(r.locked&&r.verified)})}
  function awardLabel(v){var m={winner:'Winner','runner-up':'Runner-up',gold:'Gold','silver':'Silver',bronze:'Bronze'};return m[v]||'Winner'}
  function profileFor(r){
    var base={headline:r.tag||('Recognized for excellence in '+r.category.toLowerCase()+'.'),story:'',website:'',media:'',quote:'',featured:false,sharing:true,seoTitle:r.name+' - '+r.category+' Winner',seoDescription:r.name+' is recognized in '+r.category+' at '+award.name+'.'};
    var p=state.profiles[r.id]||{};Object.keys(p).forEach(function(k){base[k]=p[k]});return base
  }
  function completeProfile(r){var p=profileFor(r);return !!(p.headline&&p.story&&p.seoTitle&&p.seoDescription)}
  function sampleStory(r){return r.name+' was recognized for '+(r.tag||'outstanding work in '+r.category.toLowerCase())+'. The winning entry stood out for its clear execution, measurable value, and relevance to the future of financial technology.'}
  function ensureSeedProfiles(){
    var ready=publicRecipients();ready.forEach(function(r,i){if(state.profiles[r.id])return;state.profiles[r.id]={headline:r.tag||('A standout winner in '+r.category+'.'),story:i<2?sampleStory(r):'',website:'',media:'',quote:'',featured:i===0,sharing:true,seoTitle:r.name+' - '+r.category+' Winner',seoDescription:r.name+' is recognized as '+awardLabel(r.award)+' in '+r.category+' at '+award.name+'.'}})
  }
  function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]})}
  function renderFilters(){
    var row=$('#galleryFilters');if(!state.showFilters){row.style.display='none';return}row.style.display='flex';
    var cats=publicRecipients().map(function(r){return r.category}).filter(function(v,i,a){return a.indexOf(v)===i});
    row.innerHTML='<button data-filter="all" class="'+(activeFilter==='all'?'active':'')+'">All winners</button>'+cats.map(function(c){return '<button data-filter="'+escapeHtml(c)+'" class="'+(activeFilter===c?'active':'')+'">'+escapeHtml(c)+'</button>'}).join('')
  }
  function renderCards(){
    var list=publicRecipients().filter(function(r){return activeFilter==='all'||r.category===activeFilter});
    var root=$('#winnerCards');root.className='wg-public-grid layout-'+state.layout;
    root.innerHTML=list.map(function(r){var p=profileFor(r);return '<article class="wg-winner-card '+(p.featured?'featured':'')+'" data-open-profile="'+r.id+'"><div class="wg-card-top"><div class="wg-mini-logo">'+initials(r.name)+'</div><span class="wg-card-level">'+escapeHtml(awardLabel(r.award).toUpperCase())+'</span></div><small>'+escapeHtml(r.category)+'</small><h3>'+escapeHtml(r.name)+'</h3><p>'+escapeHtml(p.headline||r.tag)+'</p><div class="wg-card-foot"><span>View winner story</span><button type="button" data-share-winner="'+r.id+'">Share</button></div></article>'}).join('');
    $('#galleryEmpty').hidden=list.length>0;$('#previewReadyCount').textContent=publicRecipients().length
  }
  function renderTheme(){var shell=$('#galleryPreview');shell.className='wg-preview-shell theme-'+state.theme;$$('#themeSegment button').forEach(function(b){b.classList.toggle('active',b.dataset.theme===state.theme)});$$('#layoutSegment button').forEach(function(b){b.classList.toggle('active',b.dataset.layout===state.layout)});$('#showFilters').checked=state.showFilters;$('#respectEmbargo').checked=state.respectEmbargo;$('#indexProfiles').checked=state.indexProfiles;$('#structuredData').checked=state.structuredData;$('#galleryHeadline').textContent=state.headline;$('#galleryIntro').textContent=state.intro;$('#seoTitle').value=state.seoTitle;$('#seoDescription').value=state.seoDescription}
  function renderQueue(){
    var all=allRecipients();var root=$('#contentQueue');
    if(!all.length){root.innerHTML='<tr><td colspan="6">No winner assignments yet. Open Winners to assign recipients.</td></tr>';return}
    root.innerHTML=all.map(function(r){var pub=r.locked&&r.verified;var complete=completeProfile(r);return '<tr><td><b>'+escapeHtml(r.category)+'</b><small>'+escapeHtml(awardLabel(r.award))+'</small></td><td><b>'+escapeHtml(r.name)+'</b><small>'+escapeHtml(r.tag)+'</small></td><td><span class="wg-status '+(r.locked?'':'protected')+'">'+(r.locked?'Locked':'Unlocked')+'</span></td><td><span class="wg-status '+(complete?'':'draft')+'">'+(complete?'Complete':'Draft')+'</span></td><td><span class="wg-status '+(pub?'':'protected')+'">'+(pub?'Public-ready':'Protected')+'</span></td><td><button class="wg-table-action" data-open-profile="'+r.id+'">Edit profile</button></td></tr>'}).join('')
  }
  function renderProtected(){var list=protectedRecipients();$('#protectedList').innerHTML=list.length?list.map(function(r){var reason=!r.locked?'Category not locked':(!r.verified?'Public verification incomplete':'Protected');return '<div><span>!</span><p><b>'+escapeHtml(r.name)+'</b><small>'+escapeHtml(r.category)+'</small></p><em>'+escapeHtml(reason)+'</em></div>'}).join(''):'<div><span>OK</span><p><b>Nothing is protected</b><small>All winner records are approved for public use.</small></p><em>Ready</em></div>'}
  function renderHealth(){
    var ready=publicRecipients(),complete=ready.filter(completeProfile).length,stories=ready.filter(function(r){return !!profileFor(r).story}).length,seo=ready.filter(function(r){var p=profileFor(r);return !!(p.seoTitle&&p.seoDescription)}).length,share=ready.filter(function(r){return profileFor(r).sharing!==false}).length;
    var denom=Math.max(1,ready.length);var score=Math.round(((complete+stories+seo+share)/(denom*4))*100);if(!ready.length)score=0;
    $('#storyHealth').textContent=score+'%';$('#storyHealthBar').style.width=score+'%';
    var checks=[['Winner stories',stories+'/'+ready.length+' have a public story',stories===ready.length],['SEO metadata',seo+'/'+ready.length+' ready for search',seo===ready.length],['Share enabled',share+'/'+ready.length+' can be shared',share===ready.length],['Profile completeness',complete+'/'+ready.length+' fully complete',complete===ready.length]];
    $('#storyHealthChecks').innerHTML=checks.map(function(x){return '<div class="wg-health-item '+(x[2]?'':'warn')+'"><span>'+(x[2]?'&#10003;':'!')+'</span><b>'+x[0]+'</b><small>'+x[1]+'</small></div>'}).join('');
    $('#profileCount').textContent=complete+' / '+ready.length;$('#shareCount').textContent=(share*2);var seoScore=Math.min(100,Math.round((score*0.6)+(state.indexProfiles?20:0)+(state.structuredData?20:0)));$('#seoReadiness').textContent=seoScore+'%';$('#seoScore').textContent=seoScore+'%'
  }
  function renderGate(){
    var ready=publicRecipients(),protectedList=protectedRecipients();var profiles=ready.filter(completeProfile).length;
    var checks=[{ok:ready.length>0,title:'Approved recipients synced',desc:ready.length+' winner records are safe to display'},{ok:protectedList.length===0,title:'All winner decisions cleared',desc:protectedList.length?protectedList.length+' records remain protected':'No protected winner records'},{ok:profiles===ready.length,title:'Winner profiles complete',desc:profiles+' of '+ready.length+' profiles ready'},{ok:state.indexProfiles&&state.structuredData,title:'Discovery settings enabled',desc:'SEO profile indexing and structured data'}];
    $('#publishGateList').innerHTML=checks.map(function(x){return '<div class="'+(x.ok?'':'warn')+'"><span>'+(x.ok?'&#10003;':'!')+'</span><p><b>'+x.title+'</b><small>'+x.desc+'</small></p></div>'}).join('');
    var release=winnerState.releaseDate||'2027-06-15';var d=release.split('-');$('#releaseDateText').textContent=(d.length===3?(d[2]+' '+['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Math.max(0,parseInt(d[1],10)-1)]+' '+d[0]):release)+', '+(winnerState.releaseTime||'10:00');$('#releaseModeText').textContent=winnerState.releaseMode==='manual'?'Manual release from Winners':'Scheduled from Winners';
    var badge=$('#publishBadge');if(state.publishStatus==='published'){badge.className='badge green';badge.textContent='Published'}else if(state.publishStatus==='scheduled'){badge.className='badge';badge.textContent='Scheduled'}else{badge.className='badge orange';badge.textContent='Preview only'}
  }
  function renderKpis(){var ready=publicRecipients(),all=winnerState.categories.length;$('#readyWinnerCount').textContent=ready.length;$('#readyWinnerSub').textContent='From '+all+' categories';var protectedCount=protectedRecipients().length;$('#copilotHeadline').textContent=ready.length+' approved winner'+(ready.length===1?' is':'s are')+' safe to publish. '+protectedCount+' recipient record'+(protectedCount===1?' remains':'s remain')+' protected.';$('#copilotDetail').textContent=protectedCount?'AwardFlow keeps unlocked categories or incomplete verification out of the public gallery while still allowing draft profile preparation.':'All winner recipients currently pass the publication gate.'}
  function renderAll(){renderTheme();renderFilters();renderCards();renderQueue();renderProtected();renderHealth();renderGate();renderKpis()}
  function findRecipient(id){return allRecipients().filter(function(r){return r.id===id})[0]||null}
  function openDrawer(id){var r=findRecipient(id);if(!r)return;activeProfileId=id;var p=profileFor(r);$('#drawerWinnerName').textContent=r.name;$('#drawerWinnerMeta').textContent=r.category+' / '+awardLabel(r.award);$('#drawerLogo').textContent=initials(r.name);$('#drawerAwardLabel').textContent=awardLabel(r.award).toUpperCase();$('#drawerCategory').textContent=r.category;$('#drawerPublicStatus').textContent=(r.locked&&r.verified)?'Public-ready':'Protected until winner checks are complete';$('#profileHeadline').value=p.headline||'';$('#profileStory').value=p.story||'';$('#profileWebsite').value=p.website||'';$('#profileMedia').value=p.media||'';$('#profileQuote').value=p.quote||'';$('#profileFeatured').checked=!!p.featured;$('#profileSharing').checked=p.sharing!==false;$('#profileSeoTitle').value=p.seoTitle||'';$('#profileSeoDescription').value=p.seoDescription||'';$('#drawerSourceBox').innerHTML='<b>Winner source:</b> '+escapeHtml(r.category)+' / '+escapeHtml(awardLabel(r.award))+'<br><b>Decision:</b> '+(r.locked?'Locked':'Not locked')+'<br><b>Public verification:</b> '+(r.verified?'Complete':'Incomplete')+'<br><br>Gallery content can be edited here, but winner decisions and verification remain controlled from the Winners page.';openLayer('profileDrawer')}
  function saveProfile(){var r=findRecipient(activeProfileId);if(!r)return;state.profiles[r.id]={headline:$('#profileHeadline').value.trim(),story:$('#profileStory').value.trim(),website:$('#profileWebsite').value.trim(),media:$('#profileMedia').value.trim(),quote:$('#profileQuote').value.trim(),featured:$('#profileFeatured').checked,sharing:$('#profileSharing').checked,seoTitle:$('#profileSeoTitle').value.trim(),seoDescription:$('#profileSeoDescription').value.trim()};save(false);closeLayer('profileDrawer');renderAll();toast('Winner profile saved')}
  function generateProfile(r){var p=profileFor(r);p.headline=p.headline||r.tag||('Award-winning work in '+r.category.toLowerCase());p.story=sampleStory(r);p.seoTitle=r.name+' - '+awardLabel(r.award)+' - '+award.name;p.seoDescription='Discover why '+r.name+' was recognized in '+r.category+' at '+award.name+'.';state.profiles[r.id]=p}
  function generateMissing(){allRecipients().forEach(function(r){if(!completeProfile(r))generateProfile(r)});save(false);renderAll();toast('Draft winner stories generated')}
  function openShare(format,id){activeShareFormat=format||'linkedin';var r=id?findRecipient(id):publicRecipients()[0];if(!r){toast('No public-ready winner to preview');return}var p=profileFor(r);$('#shareWinnerName').textContent=r.name;$('#shareCategoryName').textContent=r.category;var names={linkedin:'LinkedIn winner card',square:'Square social tile',whatsapp:'WhatsApp share card'};$('#shareModalTitle').textContent=names[activeShareFormat]||'Winner share card';$('#shareCopy').value='Congratulations to '+r.name+', '+awardLabel(r.award).toLowerCase()+' in '+r.category+' at '+award.name+'. '+(p.headline||r.tag)+' #Awards #FinTech';var preview=$('#socialPreview');preview.style.aspectRatio=activeShareFormat==='square'?'1/1':(activeShareFormat==='whatsapp'?'1.5/1':'1.91/1');openLayer('shareModal')}
  function exportCsv(){var rows=[['Category','Recipient','Award','Decision Locked','Verified','Profile Complete','Public Ready']];allRecipients().forEach(function(r){rows.push([r.category,r.name,awardLabel(r.award),r.locked?'Yes':'No',r.verified?'Yes':'No',completeProfile(r)?'Yes':'No',(r.locked&&r.verified)?'Yes':'No'])});var csv=rows.map(function(row){return row.map(function(v){return '"'+String(v).replace(/"/g,'""')+'"'}).join(',')}).join('\n');var blob=new Blob([csv],{type:'text/csv'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='awardflow-winner-gallery.csv';a.click();setTimeout(function(){URL.revokeObjectURL(url)},500)}
  function openLayer(id){var el=document.getElementById(id);if(!el)return;el.classList.add('open');el.setAttribute('aria-hidden','false')}
  function closeLayer(id){var el=document.getElementById(id);if(!el)return;el.classList.remove('open');el.setAttribute('aria-hidden','true')}
  function publish(){
    state.headline=$('#galleryHeadline').textContent.trim();state.intro=$('#galleryIntro').textContent.trim();state.seoTitle=$('#seoTitle').value.trim();state.seoDescription=$('#seoDescription').value.trim();
    var ready=publicRecipients();if(!ready.length){toast('No winner is ready for public display yet');return}
    if(state.respectEmbargo&&winnerState.releaseMode==='scheduled'){state.publishStatus='scheduled';toast('Gallery prepared and scheduled with winner embargo')}else{state.publishStatus='published';toast('Gallery marked published in this prototype')}
    save(false);renderGate()
  }

  load();ensureSeedProfiles();
  $('#sideAwardName').textContent=award.name||'India FinTech Awards 2027';$('#crumbAwardName').textContent=award.name||'India FinTech Awards 2027';$('#previewKicker').textContent=((award.name||'India FinTech Awards 2027').match(/\b20\d{2}\b/)||['2027'])[0]+' WINNERS';
  renderAll();

  document.addEventListener('click',function(e){
    var t=e.target.closest('[data-theme]');if(t){state.theme=t.dataset.theme;save(false);renderTheme();return}
    var l=e.target.closest('[data-layout]');if(l){state.layout=l.dataset.layout;save(false);renderTheme();renderCards();return}
    var f=e.target.closest('[data-filter]');if(f){activeFilter=f.dataset.filter;renderFilters();renderCards();return}
    var s=e.target.closest('[data-share-winner]');if(s){e.stopPropagation();openShare('linkedin',s.dataset.shareWinner);return}
    var p=e.target.closest('[data-open-profile]');if(p){openDrawer(p.dataset.openProfile);return}
    var sh=e.target.closest('[data-share-format]');if(sh){openShare(sh.dataset.shareFormat);return}
    var c=e.target.closest('[data-close]');if(c){closeLayer(c.dataset.close);return}
    var prompt=e.target.closest('[data-prompt]');if(prompt){var type=prompt.dataset.prompt,ready=publicRecipients(),prot=protectedRecipients();var answers={profiles:ready.filter(function(r){return !completeProfile(r)}).length+' public-ready profiles still need content. Use Generate missing profiles to create editable first drafts from verified winner data.',publish:ready.length+' winner records can be displayed safely. '+prot.length+' are protected because the decision is not locked or public verification is incomplete.',seo:'Keep one indexable profile URL per winner, use the category in the page title, and turn the winner story into unique copy rather than duplicating entry text.',sharing:'Give each winner a LinkedIn card, square tile, short suggested post, and a direct link to their profile. Generate these from the same approved profile to avoid inconsistent public copy.'};$('#copilotAnswer').textContent=answers[type]||'The gallery is ready for review.';return}
  });
  $('#showFilters').addEventListener('change',function(){state.showFilters=this.checked;save(false);renderFilters()});
  $('#respectEmbargo').addEventListener('change',function(){state.respectEmbargo=this.checked;save(false)});
  $('#indexProfiles').addEventListener('change',function(){state.indexProfiles=this.checked;save(false);renderHealth();renderGate()});
  $('#structuredData').addEventListener('change',function(){state.structuredData=this.checked;save(false);renderHealth();renderGate()});
  $('#galleryHeadline').addEventListener('input',function(){state.headline=this.textContent.trim()});
  $('#galleryIntro').addEventListener('input',function(){state.intro=this.textContent.trim()});
  $('#seoTitle').addEventListener('input',function(){state.seoTitle=this.value});
  $('#seoDescription').addEventListener('input',function(){state.seoDescription=this.value});
  $('#saveGallery').addEventListener('click',function(){state.headline=$('#galleryHeadline').textContent.trim();state.intro=$('#galleryIntro').textContent.trim();state.seoTitle=$('#seoTitle').value.trim();state.seoDescription=$('#seoDescription').value.trim();save(true)});
  $('#syncWinners').addEventListener('click',function(){winnerState=mergeWinnerState();ensureSeedProfiles();renderAll();toast('Winner decisions synced from Page 12')});
  $('#generateProfiles').addEventListener('click',generateMissing);$('#generateProfileStory').addEventListener('click',function(){var r=findRecipient(activeProfileId);if(!r)return;$('#profileStory').value=sampleStory(r);$('#profileHeadline').value=r.tag||('Recognized for standout work in '+r.category.toLowerCase());$('#profileSeoTitle').value=r.name+' - '+awardLabel(r.award)+' - '+award.name;$('#profileSeoDescription').value='Discover why '+r.name+' was recognized in '+r.category+' at '+award.name+'.';toast('Editable draft generated')});
  $('#saveProfile').addEventListener('click',saveProfile);$('#reviewProtected').addEventListener('click',function(){renderProtected();openLayer('protectedModal')});
  $('#publishGallery').addEventListener('click',publish);$('#publishFromCard').addEventListener('click',publish);$('#exportGalleryCsv').addEventListener('click',exportCsv);
  $('#openCopilot').addEventListener('click',function(){openLayer('copilotPanel')});$('#openInsightCopilot').addEventListener('click',function(){openLayer('copilotPanel');$('#copilotAnswer').textContent='Start with winner stories that explain impact in plain language, then generate share cards and profile SEO from the same approved source. This keeps every channel consistent.'});$('#closeCopilot').addEventListener('click',function(){closeLayer('copilotPanel')});
  $('#copyShareText').addEventListener('click',function(){var val=$('#shareCopy').value;if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(val).then(function(){toast('Share copy copied')})}else{toast('Share copy ready to copy')}});
  $('#regenerateShareText').addEventListener('click',function(){$('#shareCopy').value=$('#shareCopy').value.replace('Congratulations to','Celebrating').replace('#Awards #FinTech','#AwardWinner #FinTechInnovation');toast('Alternative share copy generated')});
  $('#downloadShareDemo').addEventListener('click',function(){var text='AwardFlow social card preview\n'+$('#shareWinnerName').textContent+'\n'+$('#shareCategoryName').textContent+'\n\nManager demo only.';var blob=new Blob([text],{type:'text/plain'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='winner-share-card-demo.txt';a.click();setTimeout(function(){URL.revokeObjectURL(url)},500);toast('Demo preview downloaded')});
})();
