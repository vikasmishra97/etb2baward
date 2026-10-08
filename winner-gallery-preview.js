(function(){
  var $=function(s){return document.querySelector(s)};
  var state={theme:'spotlight',layout:'grid',showFilters:true,headline:'Meet the innovators shaping the future of fintech.',intro:'Explore the winning companies and leaders recognized by the India FinTech Awards 2027.',publishStatus:'draft',profiles:{}};
  // Public data is loaded ONLY from the deployed Winners Management export.
  // No localStorage or seed data: a visitor must never see unapproved demo winners.
  var award={name:'ETB2B Awards'};
  var categories=[];
  var loaded=false;
  var publishError=false;
  var publishedAt='';
  function normalizeAward(value){var v=String(value||'').toLowerCase().trim();return {'winner':'winner','runner-up':'runner-up','runner up':'runner-up','gold':'gold','silver':'silver','bronze':'bronze'}[v]||null}
  function loadPublished(){
    return fetch('published-winners.json?ts='+Date.now(),{cache:'no-store'}).then(function(response){if(!response.ok)throw Error('No published winner file');return response.json()}).then(function(data){
      if(!data||data.type!=='winners'||!Array.isArray(data.categories))throw Error('Invalid winner publication');
      var next=[];
      data.categories.forEach(function(c,ci){
        if(!c||!Array.isArray(c.recipients))return;
        var finalists=[];
        c.recipients.forEach(function(f,fi){
          var title=normalizeAward(f.award);
          if(!title||typeof f.name!=='string'||!f.name.trim())return;
          finalists.push({id:String(f.id||ci+'-'+fi),name:f.name.trim(),tag:String(f.tag||''),award:title});
        });
        if(finalists.length)next.push({id:String(c.id||ci),name:String(c.category||'Award category'),locked:true,finalists:finalists});
      });
      categories=next;award.name=typeof data.awardName==='string'&&data.awardName.trim()?data.awardName:'ETB2B Awards';
      publishedAt=String(data.generatedAt||'');loaded=true;publishError=false;render();
    }).catch(function(){categories=[];loaded=false;publishError=true;render()})
  }
  function initials(name){return name.split(/\s+/).map(function(x){return x.charAt(0)}).join('').replace(/[^A-Za-z]/g,'').slice(0,2).toUpperCase()||'W'}
  function awardLabel(v){var m={winner:'Winner','runner-up':'Runner-up',gold:'Gold',silver:'Silver',bronze:'Bronze'};return m[v]||'Winner'}
  function esc(s){return String(s||'').replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]})}
  function verified(f){return true} // Publication feed contains only approved recipients; source approvals are enforced before export.
  function recipients(){var arr=[];categories.forEach(function(c){c.finalists.forEach(function(f){if(['winner','runner-up','gold','silver','bronze'].indexOf(f.award)>-1&&c.locked&&verified(f))arr.push({id:c.id+'::'+f.id,category:c.name,name:f.name,tag:f.tag||'',award:f.award})})});return arr}
  function profileFor(r){return {headline:r.tag||r.category,story:r.tag||('Recipient of '+awardLabel(r.award)+' in '+r.category+'.'),website:'',quote:'',featured:false}}
  var active='all';var current=null;
  function render(){var list=recipients();$('#wgpAwardName').textContent=award.name;$('#wgpFooterAward').textContent=award.name;$('#wgpKicker').textContent=((award.name.match(/\b20\d{2}\b/)||['2027'])[0])+' AWARDS • WINNERS';/* Public announcement copy is controlled by the page; do not use older internal gallery headline settings. */$('#wgpCount').textContent=list.length;$('#wgpStatus').textContent=loaded?'Officially published winners':'Announcement not published';$('#wgpSite').className='wgp-site theme-'+state.theme;var cats=list.map(function(r){return r.category}).filter(function(v,i,a){return a.indexOf(v)===i});$('#wgpFilters').style.display=state.showFilters?'flex':'none';$('#wgpFilters').innerHTML='<button data-filter="all" class="'+(active==='all'?'active':'')+'">All winners</button>'+cats.map(function(c){return '<button data-filter="'+esc(c)+'" class="'+(active===c?'active':'')+'">'+esc(c)+'</button>'}).join('');var shown=list.filter(function(r){return active==='all'||r.category===active});var root=$('#wgpGrid');root.className='wgp-grid layout-'+state.layout;root.innerHTML=shown.map(function(r){var p=profileFor(r);return '<article class="wgp-card '+(p.featured?'featured':'')+'" data-profile="'+r.id+'"><div class="wgp-card-head"><div class="wgp-logo">'+initials(r.name)+'</div><span class="wgp-level">'+esc(awardLabel(r.award).toUpperCase())+'</span></div><small>'+esc(r.category)+'</small><h2>'+esc(r.name)+'</h2><p>'+esc(p.headline)+'</p><em>Read winner story</em></article>'}).join('');$('#wgpEmpty').hidden=shown.length>0;var empty=$('#wgpEmpty');if(!shown.length){empty.querySelector('b').textContent=publishError?'Winners have not been published yet.':'No announced recipients in this category.';empty.querySelector('p').textContent=publishError?'Approved winners will appear here after the publication file is deployed.':'Try another category.'}}
  function find(id){return recipients().filter(function(r){return r.id===id})[0]||null}
  function openProfile(id){var r=find(id);if(!r)return;current=r;var p=profileFor(r);$('#wgpModalLogo').textContent=initials(r.name);$('#wgpModalLevel').textContent=awardLabel(r.award).toUpperCase();$('#wgpModalName').textContent=r.name;$('#wgpModalCategory').textContent=r.category;$('#wgpModalStory').textContent=p.story;var q=$('#wgpModalQuote');q.hidden=!p.quote;q.textContent=p.quote;var link=$('#wgpWebsiteLink');link.hidden=!p.website;if(p.website)link.href=p.website;$('#wgpModal').classList.add('open');$('#wgpModal').setAttribute('aria-hidden','false')}
  function close(){var m=$('#wgpModal');m.classList.remove('open');m.setAttribute('aria-hidden','true')}
  function toast(msg){var t=$('#wgpToast');t.textContent=msg;t.classList.add('show');clearTimeout(window.__wgp);window.__wgp=setTimeout(function(){t.classList.remove('show')},1800)}
  document.addEventListener('click',function(e){var f=e.target.closest('[data-filter]');if(f){active=f.dataset.filter;render();return}var p=e.target.closest('[data-profile]');if(p){openProfile(p.dataset.profile);return}if(e.target.closest('[data-close]')){close();return}});
  $('#wgpShareBtn').addEventListener('click',function(){var val=location.href+(current?'#'+current.id:'');if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(val).then(function(){toast('Profile link copied')});else toast('Profile link ready to copy')});
  render();loadPublished();
})();
