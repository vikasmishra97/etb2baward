(function(){
  var STORAGE='etb2b_awards.ceremony.v16';
  var WINNER_STORAGE='etb2b_awards.winners.v13';
  var $=function(s){return document.querySelector(s)};
  var $$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};
  function safeJson(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch(e){return null}}
  function toast(msg){var el=$('#toast');if(!el)return;el.textContent=msg;el.classList.add('show');clearTimeout(window.__ceToast);window.__ceToast=setTimeout(function(){el.classList.remove('show')},2200)}
  function uid(prefix){return prefix+'-'+Math.random().toString(36).slice(2,8)+'-'+Date.now().toString(36)}
  function escapeHtml(v){return String(v==null?'':v).replace(/[&<>'"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]})}
  function cap(v){v=String(v||'');return v.charAt(0).toUpperCase()+v.slice(1)}
  function download(name,text,type){var blob=new Blob([text],{type:type||'text/plain'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(function(){URL.revokeObjectURL(url)},500)}

  var created=safeJson('etb2b_awards_new_award')||{};
  var awardName=created.name||'India FinTech Awards 2027';
  var awardShort=awardName.replace(/\s+20\d\d\s*$/,'');

  var winnerDefaults=[
    {id:'startup',name:'Best FinTech Startup',winner:'NovaPay Technologies',award:'Winner',locked:false,verified:false,hasWinner:true},
    {id:'lending',name:'Best Digital Lending',winner:'ClearLend',award:'Winner',locked:true,verified:true,hasWinner:true},
    {id:'payments',name:'Best Payments Innovation',winner:'PayMesh',award:'Winner',locked:true,verified:true,hasWinner:true},
    {id:'ai',name:'Best AI in Financial Services',winner:'Winner not selected',award:'Winner',locked:false,verified:false,hasWinner:false},
    {id:'leader',name:'FinTech Leader of the Year',winner:'Neha Rao - Orbit Finance',award:'Winner',locked:true,verified:true,hasWinner:true}
  ];
  var winnerNames={nova:'NovaPay Technologies',clearlend:'ClearLend',paymesh:'PayMesh',riskmind:'RiskMind AI',finpilot:'FinPilot Labs',fraudlens:'FraudLens',neha:'Neha Rao - Orbit Finance',arjun:'Arjun Mehta - NovaPay'};
  var winnerAwards=['winner','runner-up','gold','silver','bronze'];

  function winnerData(){
    var result=winnerDefaults.map(function(x){return Object.assign({},x)}),saved=safeJson(WINNER_STORAGE);
    if(!saved||!saved.categories)return result;
    saved.categories.forEach(function(sc){
      var r=result.filter(function(x){return x.id===sc.id})[0];if(!r)return;
      r.locked=!!sc.locked;
      var rec=(sc.finalists||[]).filter(function(f){return winnerAwards.indexOf(f.award)>-1})[0];
      if(rec){r.hasWinner=true;r.winner=winnerNames[rec.id]||r.winner;r.award=cap(rec.award==='runner-up'?'Runner-up':rec.award);r.verified=!!(rec.nameVerified&&rec.brandVerified&&rec.consent&&rec.juryApproved)}else{r.hasWinner=false;r.winner='Winner not selected';r.verified=false}
    });
    return result;
  }

  var guestsDefault=[
    {id:'g1',first:'Neha',last:'Rao',email:'neha@orbitfinance.demo',company:'Orbit Finance',type:'Winner',rsvp:'confirmed',table:'T01',seat:'2',vip:true,checked:true,note:'Leadership award recipient. Host escort assigned.'},
    {id:'g2',first:'Anika',last:'Deshmukh',email:'anika@clearlend.demo',company:'ClearLend',type:'Winner',rsvp:'confirmed',table:'T02',seat:'3',vip:true,checked:true,note:'Best Digital Lending recipient representative.'},
    {id:'g3',first:'Rahul',last:'Sen',email:'rahul@paymesh.demo',company:'PayMesh',type:'Winner',rsvp:'confirmed',table:'T02',seat:'5',vip:true,checked:false,note:'Winner representative.'},
    {id:'g4',first:'Maya',last:'Shah',email:'maya@jury.demo',company:'Independent Jury',type:'Judge',rsvp:'confirmed',table:'T01',seat:'4',vip:true,checked:true,note:'Jury Chair and presenter.'},
    {id:'g5',first:'Aarav',last:'Kapoor',email:'aarav@etb2b_awards.demo',company:'Award Program',type:'Presenter',rsvp:'confirmed',table:'T01',seat:'1',vip:true,checked:true,note:'Opening remarks and stage presenter.'},
    {id:'g6',first:'Priya',last:'Nair',email:'priya@novabank.demo',company:'NovaBank',type:'Sponsor',rsvp:'confirmed',table:'T03',seat:'1',vip:true,checked:false,note:'Presenting sponsor.'},
    {id:'g7',first:'Vikram',last:'Iyer',email:'vikram@jury.demo',company:'FinTech Council',type:'Judge',rsvp:'confirmed',table:'T04',seat:'2',vip:false,checked:false,note:''},
    {id:'g8',first:'Kavya',last:'Desai',email:'kavya@venture.demo',company:'Frontier Ventures',type:'Guest',rsvp:'confirmed',table:'T04',seat:'6',vip:false,checked:false,note:''},
    {id:'g9',first:'Kabir',last:'Singh',email:'kabir@businessdaily.demo',company:'Business Daily',type:'Media',rsvp:'pending',table:'',seat:'',vip:false,checked:false,note:'Media accreditation pending.'},
    {id:'g10',first:'Sana',last:'Khan',email:'sana@riskmind.demo',company:'RiskMind AI',type:'Guest',rsvp:'pending',table:'',seat:'',vip:false,checked:false,note:'AI category finalist representative.'},
    {id:'g11',first:'Dev',last:'Malhotra',email:'dev@payments.demo',company:'Payments Council',type:'Presenter',rsvp:'confirmed',table:'T03',seat:'4',vip:false,checked:false,note:'Category presenter.'},
    {id:'g12',first:'Leena',last:'Joseph',email:'leena@fintechforum.demo',company:'India FinTech Forum',type:'Presenter',rsvp:'confirmed',table:'T03',seat:'5',vip:false,checked:false,note:'Category presenter.'}
  ];

  var cuesDefault=[
    {id:'c1',time:'17:30',duration:30,title:'Check-in desks open',type:'guest',owner:'Registration · Foyer',note:'Open VIP and general lanes. Keep winner arrivals flagged.'},
    {id:'c2',time:'18:00',duration:45,title:'Guest arrival & networking',type:'guest',owner:'Hospitality · Grand Foyer',note:'Ambient screen loops award categories and sponsor branding.'},
    {id:'c3',time:'18:50',duration:10,title:'Five-minute seating call',type:'stage',owner:'Host + Floor Team',note:'House music down. Stage screen switches to holding slide.'},
    {id:'c4',time:'19:00',duration:5,title:'Opening film',type:'stage',owner:'AV · Main Ballroom',note:'Play opener, lights to 30%, host standby stage left.'},
    {id:'c5',time:'19:05',duration:10,title:'Welcome & opening remarks',type:'stage',owner:'Aarav Kapoor',note:'Host welcomes guests and explains award process.'},
    {id:'c6',time:'19:15',duration:28,title:'Awards block 1',type:'award',owner:'Stage Manager',note:'Startup, Digital Lending and Payments Innovation.'},
    {id:'c7',time:'19:43',duration:12,title:'Industry keynote',type:'stage',owner:'Guest Speaker',note:'Reset trophies during keynote.'},
    {id:'c8',time:'19:55',duration:18,title:'Awards block 2',type:'award',owner:'Stage Manager',note:'AI in Financial Services and special mentions.'},
    {id:'c9',time:'20:13',duration:55,title:'Dinner service & networking',type:'break',owner:'Hospitality',note:'Winner media interviews begin in media room.'},
    {id:'c10',time:'21:08',duration:12,title:'Leadership award',type:'award',owner:'Maya Shah',note:'FinTech Leader of the Year. Walk-on music ready.'},
    {id:'c11',time:'21:20',duration:10,title:'Closing remarks',type:'stage',owner:'Host',note:'Thank sponsors, jury and entrants. Direct guests to winner wall.'},
    {id:'c12',time:'21:30',duration:30,title:'Winner media & networking',type:'media',owner:'PR Team · Media Room',note:'Winner portraits, interviews and social clips.'}
  ];

  function presentationDefaults(){
    var w=winnerData(),presenters=['Aarav Kapoor','Maya Shah','Priya Nair','Dev Malhotra','Leena Joseph'];
    return w.map(function(x,i){return{id:x.id,category:x.name,winner:x.winner,award:x.award,locked:x.locked,verified:x.verified,hasWinner:x.hasWinner,presenter:presenters[i%presenters.length],intro:'Next, we recognize excellence in '+x.name+'.',readout:'And the '+x.award+' is… '+x.winner+'.',allowReveal:true}})
  }

  var state={
    event:{name:awardName+' · Gala Night',format:'in-person',venue:'The Grand Ballroom, Mumbai',date:'2027-06-15',doorsOpen:'18:00',showStart:'19:00',capacity:500,checkinOpen:'17:30',dressCode:'Business formal'},
    baseRoster:{total:430,confirmed:402,checked:54,seated:390},
    guests:guestsDefault,
    cues:cuesDefault,
    presentations:presentationDefaults(),
    showMode:'rehearsal',
    currentStage:{type:'welcome',kicker:'UP NEXT',title:'Welcome to the '+awardShort,subtitle:'Stage screen is in rehearsal mode',category:'',winner:'',award:'',reveal:false},
    currentAwardIndex:-1,
    checkinMode:false,
    followupPrepared:false,
    savedAt:null
  };
  var guestFilter='all',editingGuestId=null,editingCueId=null,editingPresentationId=null;

  function mergeState(saved){
    if(!saved)return;
    if(saved.event)Object.assign(state.event,saved.event);
    if(saved.baseRoster)Object.assign(state.baseRoster,saved.baseRoster);
    if(Array.isArray(saved.guests))state.guests=saved.guests;
    if(Array.isArray(saved.cues))state.cues=saved.cues;
    if(Array.isArray(saved.presentations))state.presentations=saved.presentations;
    if(saved.showMode)state.showMode=saved.showMode;
    if(saved.currentStage)state.currentStage=saved.currentStage;
    if(typeof saved.currentAwardIndex==='number')state.currentAwardIndex=saved.currentAwardIndex;
    if(typeof saved.checkinMode==='boolean')state.checkinMode=saved.checkinMode;
    if(typeof saved.followupPrepared==='boolean')state.followupPrepared=saved.followupPrepared;
    state.savedAt=saved.savedAt||null;
  }
  mergeState(safeJson(STORAGE));

  function save(say){state.savedAt=new Date().toISOString();try{localStorage.setItem(STORAGE,JSON.stringify(state));if(say!==false)toast('Ceremony plan saved')}catch(e){if(say!==false)toast('Could not save in this browser')}}
  function openLayer(id){var el=$('#'+id);if(el){el.classList.add('open');el.setAttribute('aria-hidden','false')}}
  function closeLayer(id){var el=$('#'+id);if(el){el.classList.remove('open');el.setAttribute('aria-hidden','true')}}
  function guestName(g){return (g.first+' '+g.last).trim()}
  function confirmedGuests(){return state.guests.filter(function(g){return g.rsvp==='confirmed'})}
  function checkedGuests(){return state.guests.filter(function(g){return g.rsvp==='confirmed'&&g.checked})}
  function totalConfirmed(){return state.baseRoster.confirmed+confirmedGuests().length}
  function totalChecked(){return state.baseRoster.checked+checkedGuests().length}
  function totalGuests(){return state.baseRoster.total+state.guests.length}
  function totalSeated(){return state.baseRoster.seated+state.guests.filter(function(g){return g.rsvp==='confirmed'&&g.table}).length}
  function stageReady(p){return !!(p.hasWinner&&p.locked&&p.verified&&p.presenter&&p.allowReveal)}
  function protectedPresentations(){return state.presentations.filter(function(p){return !stageReady(p)})}

  function syncWinnerData(silent){
    var fresh=winnerData(),map={};state.presentations.forEach(function(p){map[p.id]=p});
    state.presentations=fresh.map(function(w,i){
      var old=map[w.id]||{};
      return {id:w.id,category:w.name,winner:w.winner,award:w.award,locked:w.locked,verified:w.verified,hasWinner:w.hasWinner,presenter:old.presenter||['Aarav Kapoor','Maya Shah','Priya Nair','Dev Malhotra','Leena Joseph'][i%5],intro:old.intro||('Next, we recognize excellence in '+w.name+'.'),readout:old.readout&&old.winner===w.winner?old.readout:('And the '+w.award+' is… '+w.winner+'.'),allowReveal:old.allowReveal!==false};
    });
    save(false);renderAll();if(!silent)toast('Winner decisions synced from Page 12');
  }

  function updateEventFromInputs(){
    state.event.name=$('#eventName').value.trim()||awardName+' · Gala Night';state.event.format=$('#eventFormat').value;state.event.venue=$('#venue').value.trim();state.event.date=$('#eventDate').value;state.event.doorsOpen=$('#doorsOpen').value;state.event.showStart=$('#showStart').value;state.event.capacity=Math.max(1,Number($('#guestCapacity').value||500));state.event.checkinOpen=$('#checkinOpen').value;state.event.dressCode=$('#dressCode').value.trim();renderMetrics();renderReadiness();
  }
  function renderEventInputs(){
    $('#eventName').value=state.event.name;$('#eventFormat').value=state.event.format;$('#venue').value=state.event.venue;$('#eventDate').value=state.event.date;$('#doorsOpen').value=state.event.doorsOpen;$('#showStart').value=state.event.showStart;$('#guestCapacity').value=state.event.capacity;$('#checkinOpen').value=state.event.checkinOpen;$('#dressCode').value=state.event.dressCode;
  }

  function renderMetrics(){
    var confirmed=totalConfirmed(),checked=totalChecked(),ready=state.presentations.filter(stageReady).length,total=state.presentations.length,protectedCount=total-ready,read=readinessScore();
    $('#readinessScore').textContent=read+'%';$('#readinessLabel').textContent=read>=90?'Show-ready':read>=70?'Nearly ready':'Needs attention';$('#confirmedCount').textContent=confirmed;$('#capacityLabel').textContent=state.event.capacity;$('#checkedInCount').textContent=checked;$('#checkinRate').textContent=Math.round((checked/Math.max(1,confirmed))*100)+'% of confirmed';$('#stageReadyCount').textContent=ready+' / '+total;$('#protectedWinnerCount').textContent=protectedCount+' protected';
  }

  function readinessData(){
    var eventOk=!!(state.event.venue&&state.event.date&&state.event.showStart),rsvpRate=totalConfirmed()/Math.max(1,state.event.capacity),winnersReady=state.presentations.length&&state.presentations.every(stageReady),presentersReady=state.presentations.every(function(p){return !!p.presenter}),runReady=state.cues.length>=6,seatingReady=totalSeated()>=Math.min(totalConfirmed(),Math.floor(state.event.capacity*.8));
    return [
      {ok:eventOk,kind:eventOk?'good':'blocked',title:'Event essentials',detail:eventOk?'Venue, date and show time are set':'Complete venue, date and show time'},
      {ok:rsvpRate>=.7,kind:rsvpRate>=.7?'good':'pending',title:'Guest confirmation',detail:totalConfirmed()+' confirmed of '+state.event.capacity+' capacity'},
      {ok:presentersReady,kind:presentersReady?'good':'pending',title:'Presenters assigned',detail:presentersReady?'Every award has a presenter':'One or more award presenters are missing'},
      {ok:winnersReady,kind:winnersReady?'good':'blocked',title:'Winner reveal protection',detail:winnersReady?'All award reveals are locked and verified':protectedPresentations().length+' award'+(protectedPresentations().length===1?' is':'s are')+' protected'},
      {ok:runReady,kind:runReady?'good':'pending',title:'Run of show',detail:state.cues.length+' production cues configured'},
      {ok:seatingReady,kind:seatingReady?'good':'pending',title:'Seating plan',detail:totalSeated()+' confirmed guests have assigned seats'}
    ];
  }
  function readinessScore(){var d=readinessData(),weights=[18,12,18,25,15,12],score=0;d.forEach(function(x,i){if(x.ok)score+=weights[i]});return score}
  function renderReadiness(){
    var score=readinessScore(),data=readinessData();$('#sideReadiness').textContent=score+'%';$('#readinessBar').style.width=score+'%';$('#readinessChecks').innerHTML=data.map(function(x){return '<div class="ce-health-item '+(!x.ok?x.kind:'')+'"><span>'+(x.ok?'✓':x.kind==='blocked'?'!':'•')+'</span><p><b>'+escapeHtml(x.title)+'</b><small>'+escapeHtml(x.detail)+'</small></p></div>'}).join('');
    var protectedCount=protectedPresentations().length,pending=state.guests.filter(function(g){return g.rsvp==='pending'}).length,unseated=state.guests.filter(function(g){return g.rsvp==='confirmed'&&!g.table}).length;
    if(protectedCount){$('#insightTitle').textContent=protectedCount+' award reveal'+(protectedCount===1?' is':'s are')+' still protected';$('#insightBody').textContent='Lock and verify winner decisions before ceremony staff can reveal them. Other stage cues remain safe to rehearse.';$('#insightAction').textContent='Review protected awards'}else if(pending){$('#insightTitle').textContent=pending+' priority guest RSVP'+(pending===1?' needs':'s need')+' follow-up';$('#insightBody').textContent='Resolve priority pending RSVPs and finalize seats before guest communications are frozen.';$('#insightAction').textContent='Review guest list'}else if(unseated){$('#insightTitle').textContent='Finish seating '+unseated+' confirmed guest'+(unseated===1?'':'s');$('#insightBody').textContent='Auto-assign the remaining priority guests, then review VIP placement before printing the room plan.';$('#insightAction').textContent='Auto-assign seats'}else{$('#insightTitle').textContent='Ceremony is ready for final rehearsal';$('#insightBody').textContent='Run the award sequence once with the stage display before switching the show to Live.';$('#insightAction').textContent='Start rehearsal'}
  }

  function fullGuestCounts(){
    var samplePending=state.guests.filter(function(g){return g.rsvp==='pending'}).length,sampleVip=state.guests.filter(function(g){return g.vip}).length;
    $('#allGuestCount').textContent=totalGuests();$('#confirmedFilterCount').textContent=totalConfirmed();$('#pendingFilterCount').textContent=samplePending;$('#checkedFilterCount').textContent=totalChecked();$('#vipFilterCount').textContent=sampleVip;
  }
  function guestMatches(g){
    var q=$('#guestSearch').value.trim().toLowerCase(),matches=!q||[guestName(g),g.email,g.company,g.type].join(' ').toLowerCase().indexOf(q)>-1;if(!matches)return false;
    if(guestFilter==='confirmed')return g.rsvp==='confirmed';if(guestFilter==='pending')return g.rsvp==='pending';if(guestFilter==='checked')return !!g.checked;if(guestFilter==='vip')return !!g.vip;return true;
  }
  function guestTypeClass(g){var t=String(g.type||'').toLowerCase();return t==='vip'?'vip':t==='winner'?'winner':t==='judge'?'judge':t==='sponsor'?'sponsor':''}
  function renderGuests(){
    var rows=state.guests.filter(guestMatches),body=$('#guestTableBody');
    if(!rows.length){body.innerHTML='<tr><td colspan="6"><div class="ce-empty">No guests match this view.</div></td></tr>'}
    else body.innerHTML=rows.map(function(g){var initials=((g.first||'?').charAt(0)+(g.last||'').charAt(0)).toUpperCase();return '<tr><td><div class="ce-guest-name"><div class="ce-guest-avatar">'+escapeHtml(initials)+'</div><div><b>'+escapeHtml(guestName(g))+(g.vip?' · VIP':'')+'</b><small>'+escapeHtml(g.company)+' · '+escapeHtml(g.email)+'</small></div></div></td><td><span class="ce-type '+guestTypeClass(g)+'">'+escapeHtml(g.type)+'</span></td><td><span class="ce-rsvp '+g.rsvp+'">'+cap(g.rsvp)+'</span></td><td>'+(g.table?'<span class="ce-seat-pill">'+escapeHtml(g.table)+' · '+escapeHtml(g.seat||'—')+'</span>':'<span class="ce-seat-pill">Unassigned</span>')+'</td><td>'+(g.rsvp==='confirmed'?'<button class="ce-check-btn '+(g.checked?'checked':'')+'" data-checkin="'+g.id+'">'+(g.checked?'✓ Checked in':'Check in')+'</button>':'<span class="ce-rsvp '+g.rsvp+'">—</span>')+'</td><td><button class="ce-row-menu" data-edit-guest="'+g.id+'">•••</button></td></tr>'}).join('');
    $('#guestTableSummary').textContent='Showing '+rows.length+' priority records · totals include '+state.baseRoster.total+' imported attendees';fullGuestCounts();renderMetrics();renderSeating();renderCheckinList();
  }
  function findGuest(id){return state.guests.filter(function(g){return g.id===id})[0]}
  function openGuest(g){editingGuestId=g?g.id:null;$('#guestDrawerTitle').textContent=g?'Edit guest':'Add guest';$('#guestFirstName').value=g?g.first:'';$('#guestLastName').value=g?g.last:'';$('#guestEmail').value=g?g.email:'';$('#guestCompany').value=g?g.company:'';$('#guestType').value=g?g.type:'Guest';$('#guestRsvp').value=g?g.rsvp:'confirmed';$('#guestTable').value=g?g.table:'';$('#guestSeat').value=g?g.seat:'';$('#guestVip').checked=g?!!g.vip:false;$('#guestChecked').checked=g?!!g.checked:false;$('#guestNote').value=g?g.note:'';openLayer('guestDrawer')}
  function saveGuest(){
    var first=$('#guestFirstName').value.trim(),last=$('#guestLastName').value.trim(),email=$('#guestEmail').value.trim();if(!first||!email){toast('Add at least a first name and email');return}var g=editingGuestId?findGuest(editingGuestId):null;if(!g){g={id:uid('g')};state.guests.push(g)}Object.assign(g,{first:first,last:last,email:email,company:$('#guestCompany').value.trim(),type:$('#guestType').value,rsvp:$('#guestRsvp').value,table:$('#guestTable').value.trim().toUpperCase(),seat:$('#guestSeat').value.trim(),vip:$('#guestVip').checked,checked:$('#guestChecked').checked,note:$('#guestNote').value.trim()});if(g.rsvp!=='confirmed')g.checked=false;save(false);renderAll();closeLayer('guestDrawer');toast(editingGuestId?'Guest updated':'Guest added')
  }
  function toggleCheckin(id){var g=findGuest(id);if(!g||g.rsvp!=='confirmed')return;g.checked=!g.checked;save(false);renderGuests();renderReadiness();toast(g.checked?guestName(g)+' checked in':'Check-in undone')}
  function autoSeatGuests(){var confirmed=state.guests.filter(function(g){return g.rsvp==='confirmed'&&!g.table}),table=5,seat=1;confirmed.forEach(function(g){g.table='T'+String(table).padStart(2,'0');g.seat=String(seat);seat++;if(seat>8){seat=1;table++}});save(false);renderAll();toast(confirmed.length?confirmed.length+' guests auto-assigned':'All priority guests already have seats')}
  function renderSeating(){
    var sampleSeated=state.guests.filter(function(g){return g.rsvp==='confirmed'&&g.table}).length,seated=state.baseRoster.seated+sampleSeated,confirmed=totalConfirmed(),unseated=Math.max(0,confirmed-seated),tables={};state.guests.forEach(function(g){if(g.table){tables[g.table]=(tables[g.table]||0)+1}});var baseTables=48,totalTables=Math.max(baseTables,Object.keys(tables).length);$('#seatedCount').textContent=seated;$('#unseatedCount').textContent=unseated;$('#tableCount').textContent=totalTables;
    var display=['T01','T02','T03','T04','T05','T06','T07','T08'];$('#seatMap').innerHTML=display.map(function(t,i){var n=tables[t]||((i<4)?8:7);return '<div class="ce-seat-table '+(i<2?'vip':'')+'"><div><b>'+t+'</b><small>'+n+'/8</small></div></div>'}).join('');
  }
  function renderCheckinList(){var q=($('#checkinSearch')&&$('#checkinSearch').value||'').trim().toLowerCase(),list=state.guests.filter(function(g){return g.rsvp==='confirmed'&&(!q||[guestName(g),g.company,g.email].join(' ').toLowerCase().indexOf(q)>-1)});$('#checkinList').innerHTML=list.map(function(g){return '<div class="ce-checkin-item"><div><b>'+escapeHtml(guestName(g))+(g.vip?' · VIP':'')+'</b><small>'+escapeHtml(g.company)+' · '+(g.table?escapeHtml(g.table)+' seat '+escapeHtml(g.seat||'—'):'Seat not assigned')+'</small></div><button class="'+(g.checked?'checked':'')+'" data-modal-checkin="'+g.id+'">'+(g.checked?'✓ Arrived':'Check in')+'</button></div>'}).join('')||'<div class="ce-empty">No confirmed guest found.</div>';$('#modalCheckedCount').textContent=totalChecked();$('#modalExpectedCount').textContent=totalConfirmed()}

  function cueIcon(type){return type==='award'?'🏆':type==='guest'?'✓':type==='break'?'☕':type==='media'?'◉':'▶'}
  function renderCues(){
    $('#runOfShowList').innerHTML=state.cues.map(function(c,i){return '<div class="ce-cue"><div class="ce-cue-time">'+escapeHtml(c.time)+'<small>'+c.duration+' min</small></div><div class="ce-cue-icon '+escapeHtml(c.type)+'">'+cueIcon(c.type)+'</div><div class="ce-cue-info"><b>'+escapeHtml(c.title)+'</b><small>'+escapeHtml(c.owner)+(c.note?' · '+escapeHtml(c.note):'')+'</small></div><div class="ce-cue-actions"><button data-move-cue="up" data-cue-id="'+c.id+'" '+(i===0?'disabled':'')+'>↑</button><button data-move-cue="down" data-cue-id="'+c.id+'" '+(i===state.cues.length-1?'disabled':'')+'>↓</button><button class="edit" data-edit-cue="'+c.id+'">Edit</button></div></div>'}).join('');
  }
  function findCue(id){return state.cues.filter(function(c){return c.id===id})[0]}
  function openCue(c){editingCueId=c?c.id:null;$('#cueDrawerTitle').textContent=c?'Edit cue':'Add cue';$('#cueTime').value=c?c.time:'19:00';$('#cueDuration').value=c?c.duration:10;$('#cueTitle').value=c?c.title:'';$('#cueType').value=c?c.type:'stage';$('#cueOwner').value=c?c.owner:'';$('#cueNote').value=c?c.note:'';$('#deleteCue').style.visibility=c?'visible':'hidden';openLayer('cueDrawer')}
  function saveCue(){var title=$('#cueTitle').value.trim();if(!title){toast('Add a cue title');return}var c=editingCueId?findCue(editingCueId):null;if(!c){c={id:uid('c')};state.cues.push(c)}Object.assign(c,{time:$('#cueTime').value||'19:00',duration:Math.max(1,Number($('#cueDuration').value||10)),title:title,type:$('#cueType').value,owner:$('#cueOwner').value.trim(),note:$('#cueNote').value.trim()});state.cues.sort(function(a,b){return a.time.localeCompare(b.time)});save(false);renderAll();closeLayer('cueDrawer');toast('Run-of-show cue saved')}
  function deleteCue(){if(!editingCueId)return;state.cues=state.cues.filter(function(c){return c.id!==editingCueId});save(false);renderAll();closeLayer('cueDrawer');toast('Cue removed')}
  function moveCue(id,dir){var i=state.cues.findIndex(function(c){return c.id===id});if(i<0)return;var j=dir==='up'?i-1:i+1;if(j<0||j>=state.cues.length)return;var x=state.cues[i];state.cues[i]=state.cues[j];state.cues[j]=x;save(false);renderCues()}

  function findPresentation(id){return state.presentations.filter(function(p){return p.id===id})[0]}
  function renderPresentations(){
    $('#awardPresentationList').innerHTML=state.presentations.map(function(p,i){var ready=stageReady(p),status=ready?'Stage-ready':!p.hasWinner?'Winner missing':(!p.locked||!p.verified)?'Protected':'Needs presenter',statusClass=ready?'ready':(!p.hasWinner||!p.locked||!p.verified)?'blocked':'needs';var live=state.currentStage&&state.currentStage.type==='award'&&state.currentStage.category===p.category,revealed=live&&state.currentStage.reveal;return '<div class="ce-award-row"><div class="ce-award-order">'+(i+1)+'</div><div class="ce-award-name"><b>'+escapeHtml(p.category)+'</b><small>Recipient source: Winners</small><div class="ce-winner-line '+(ready?'':'protected')+'"><em>'+(ready?escapeHtml(p.award)+' · '+escapeHtml(p.winner):'🔒 '+escapeHtml(p.winner))+'</em></div></div><div class="ce-presenter"><b>'+escapeHtml(p.presenter||'Unassigned')+'</b><small>Presenter</small></div><div><span class="ce-stage-status '+statusClass+'">'+escapeHtml(status)+'</span></div><div class="ce-award-controls"><button data-config-presentation="'+p.id+'">Edit</button><button data-cue-award="'+p.id+'">Cue</button><button class="'+(revealed?'danger-action':'primary-action')+'" data-reveal-award="'+p.id+'" '+(!ready?'disabled':'')+'>'+(revealed?'Hide':'Reveal')+'</button></div></div>'}).join('');
  }
  function presenterOptions(selected){var names=['Aarav Kapoor','Maya Shah','Priya Nair','Dev Malhotra','Leena Joseph','Vikram Iyer'];state.guests.filter(function(g){return ['Presenter','Judge','Sponsor','Winner'].indexOf(g.type)>-1}).forEach(function(g){var n=guestName(g);if(names.indexOf(n)<0)names.push(n)});return names.map(function(n){return '<option '+(n===selected?'selected':'')+'>'+escapeHtml(n)+'</option>'}).join('')}
  function openPresentation(p){editingPresentationId=p.id;$('#presenterCategory').textContent=p.category;$('#presenterSelect').innerHTML=presenterOptions(p.presenter);$('#stageIntro').value=p.intro;$('#winnerReadout').value=p.readout;$('#allowReveal').checked=p.allowReveal;var ready=stageReady(p),reasons=[];if(!p.hasWinner)reasons.push('winner not selected');if(!p.locked)reasons.push('winner decision not locked');if(!p.verified)reasons.push('recipient verification incomplete');if(!p.presenter)reasons.push('presenter missing');$('#winnerLockSummary').className='ce-winner-lock '+(ready?'ready':'blocked');$('#winnerLockSummary').innerHTML='<b>'+(ready?'✓ Stage-ready winner':'🔒 Protected winner')+'</b>'+(ready?escapeHtml(p.award+' · '+p.winner)+' can be sent to the stage screen.':'Reveal is blocked because '+escapeHtml(reasons.join(', '))+'.');openLayer('presenterDrawer')}
  function savePresentation(){var p=findPresentation(editingPresentationId);if(!p)return;p.presenter=$('#presenterSelect').value;p.intro=$('#stageIntro').value.trim();p.readout=$('#winnerReadout').value.trim();p.allowReveal=$('#allowReveal').checked;save(false);renderAll();closeLayer('presenterDrawer');toast('Presentation cue saved')}
  function autoAssignPresenters(){var names=['Aarav Kapoor','Maya Shah','Priya Nair','Dev Malhotra','Leena Joseph'];state.presentations.forEach(function(p,i){if(!p.presenter)p.presenter=names[i%names.length]});save(false);renderAll();toast('Presenters balanced across the award sequence')}

  function setStage(obj){state.currentStage=Object.assign({type:'general',kicker:'UP NEXT',title:'',subtitle:'',category:'',winner:'',award:'',reveal:false},obj||{});save(false);renderStage();}
  function cueAward(id){var p=findPresentation(id);if(!p)return;state.currentAwardIndex=state.presentations.findIndex(function(x){return x.id===id});setStage({type:'award',kicker:'AWARD CATEGORY',title:p.category,subtitle:p.intro||('Presenting '+p.category),category:p.category,winner:p.winner,award:p.award,reveal:false,presentationId:p.id});toast(p.category+' sent to stage queue')}
  function revealAward(id){var p=findPresentation(id);if(!p)return;if(!stageReady(p)){toast('This winner is protected. Lock and verify it first.');return}var isCurrent=state.currentStage&&state.currentStage.type==='award'&&state.currentStage.presentationId===p.id;if(!isCurrent){cueAward(id)}var now=state.currentStage&&state.currentStage.presentationId===p.id&&state.currentStage.reveal;setStage({type:'award',kicker:now?'AWARD CATEGORY':p.award.toUpperCase(),title:now?p.category:p.winner,subtitle:now?(p.intro||'Winner reveal hidden'):(p.category+' · '+p.presenter),category:p.category,winner:p.winner,award:p.award,reveal:!now,presentationId:p.id});toast(now?'Winner hidden from stage':'Winner reveal sent to stage')}
  function renderStage(){
    var s=state.currentStage||{};$('#miniKicker').textContent=s.kicker||'UP NEXT';$('#miniTitle').textContent=s.title||'Ceremony stage';$('#miniSubtitle').textContent=s.subtitle||'Ready';$('#eventModeBadge').textContent=cap(state.showMode);$('#eventModeBadge').classList.toggle('live',state.showMode==='live');$('#liveDot').textContent=state.showMode==='live'?'LIVE':'REHEARSAL';$('#liveDot').classList.toggle('live',state.showMode==='live');$$('#showModeControl [data-mode]').forEach(function(b){b.classList.toggle('active',b.dataset.mode===state.showMode)});renderPresentations();
  }
  function nextAward(step){if(!state.presentations.length)return;var i=state.currentAwardIndex;if(i<0)i=step>0?-1:0;i=(i+step+state.presentations.length)%state.presentations.length;state.currentAwardIndex=i;cueAward(state.presentations[i].id)}
  function rehearseAll(){state.showMode='rehearsal';state.currentAwardIndex=0;var p=state.presentations[0];setStage({type:'award',kicker:'REHEARSAL · AWARD CATEGORY',title:p.category,subtitle:p.intro,category:p.category,winner:p.winner,award:p.award,reveal:false,presentationId:p.id});toast('Award rehearsal started with '+p.category)}
  function changeMode(mode){if(mode==='live'&&state.showMode!=='live'){$('#liveConfirmCheck').checked=false;$('#confirmGoLive').disabled=true;$('#liveConfirmText').textContent=protectedPresentations().length?protectedPresentations().length+' protected award reveal'+(protectedPresentations().length===1?' will':'s will')+' remain hidden. Other stage cues can go live safely.':'All award reveals are stage-ready. Live cues will become visible on the stage display.';openLayer('liveConfirmModal');return}state.showMode=mode;if(mode==='rehearsal'&&state.currentStage)state.currentStage.subtitle=(state.currentStage.subtitle||'')+' · Rehearsal';save(false);renderAll();toast('Stage switched to '+cap(mode))}

  function renderAll(){renderEventInputs();renderMetrics();renderGuests();renderCues();renderPresentations();renderReadiness();renderStage();}

  function exportGuests(){var rows=[['Name','Email','Company','Type','RSVP','VIP','Table','Seat','Checked in','Note']];state.guests.forEach(function(g){rows.push([guestName(g),g.email,g.company,g.type,g.rsvp,g.vip?'Yes':'No',g.table,g.seat,g.checked?'Yes':'No',g.note])});var csv=rows.map(function(row){return row.map(function(v){return '"'+String(v||'').replace(/"/g,'""')+'"'}).join(',')}).join('\n');download('etb2b_awards-ceremony-guests.csv',csv,'text/csv');toast('Priority guest CSV exported')}
  function parseCsvLine(line){var out=[],cur='',q=false;for(var i=0;i<line.length;i++){var ch=line[i];if(ch==='"'){if(q&&line[i+1]==='"'){cur+='"';i++}else q=!q}else if(ch===','&&!q){out.push(cur);cur=''}else cur+=ch}out.push(cur);return out}
  function importCsv(file){if(!file)return;var reader=new FileReader();reader.onload=function(){try{var lines=String(reader.result||'').split(/\r?\n/).filter(Boolean);if(lines.length<2){toast('CSV has no guest rows');return}var headers=parseCsvLine(lines[0]).map(function(h){return h.trim().toLowerCase()});var added=0;lines.slice(1).forEach(function(line){var vals=parseCsvLine(line),obj={};headers.forEach(function(h,i){obj[h]=vals[i]||''});var full=(obj.name||'').trim().split(/\s+/),first=obj.first_name||obj.first||full.shift()||'',last=obj.last_name||obj.last||full.join(' ');if(!first||!obj.email)return;state.guests.push({id:uid('g'),first:first,last:last,email:obj.email,company:obj.company||'',type:obj.type||'Guest',rsvp:(obj.rsvp||'pending').toLowerCase(),table:(obj.table||'').toUpperCase(),seat:obj.seat||'',vip:/yes|true|1|vip/i.test(obj.vip||''),checked:false,note:obj.note||''});added++});save(false);renderAll();toast(added+' guest'+(added===1?'':'s')+' imported')}catch(e){toast('Could not read that CSV')}};reader.readAsText(file)}
  function printRunSheet(){window.print()}
  function prepareFollowup(){state.followupPrepared=true;save(false);toast('Post-event thank-you and winner follow-up drafts prepared')}
  function insightAction(){var protectedCount=protectedPresentations().length,pending=state.guests.filter(function(g){return g.rsvp==='pending'}).length,unseated=state.guests.filter(function(g){return g.rsvp==='confirmed'&&!g.table}).length;if(protectedCount){$('#presentationCard').scrollIntoView({behavior:'smooth',block:'start'});toast('Review red Protected statuses before reveal')}else if(pending){guestFilter='pending';$$('#guestFilters button').forEach(function(b){b.classList.toggle('active',b.dataset.guestFilter==='pending')});renderGuests();$('#guestCard').scrollIntoView({behavior:'smooth',block:'start'})}else if(unseated)autoSeatGuests();else rehearseAll()}

  $('#sideAwardName').textContent=awardName;$('#crumbAwardName').textContent=awardName;renderAll();
  ['eventName','eventFormat','venue','eventDate','doorsOpen','showStart','guestCapacity','checkinOpen','dressCode'].forEach(function(id){var el=$('#'+id);el.addEventListener(el.tagName==='SELECT'?'change':'input',updateEventFromInputs)});
  $('#saveCeremony').addEventListener('click',function(){updateEventFromInputs();save(true)});$('#syncWinners').addEventListener('click',function(){syncWinnerData(false)});$('#openStagePreview').addEventListener('click',function(){window.open('ceremony-stage.html','_blank')});$('#openStageWindow').addEventListener('click',function(){window.open('ceremony-stage.html','_blank')});$('#insightAction').addEventListener('click',insightAction);
  $('#guestSearch').addEventListener('input',renderGuests);$$('#guestFilters [data-guest-filter]').forEach(function(b){b.addEventListener('click',function(){guestFilter=this.dataset.guestFilter;$$('#guestFilters [data-guest-filter]').forEach(function(x){x.classList.toggle('active',x===b)});renderGuests()})});$('#toggleCheckinMode').addEventListener('click',function(){state.checkinMode=!state.checkinMode;this.classList.toggle('active',state.checkinMode);this.textContent=state.checkinMode?'✓ Check-in mode ON':'✓ Check-in mode';if(state.checkinMode)openLayer('checkinModal');save(false)});$('#addGuest').addEventListener('click',function(){openGuest(null)});$('#saveGuest').addEventListener('click',saveGuest);$('#autoSeat').addEventListener('click',autoSeatGuests);$('#editSeating').addEventListener('click',autoSeatGuests);$('#exportGuests').addEventListener('click',exportGuests);$('#importGuests').addEventListener('click',function(){$('#guestCsvFile').click()});$('#guestCsvFile').addEventListener('change',function(){importCsv(this.files[0]);this.value=''});$('#openCheckin').addEventListener('click',function(){renderCheckinList();openLayer('checkinModal')});$('#checkinSearch').addEventListener('input',renderCheckinList);
  $('#addCue').addEventListener('click',function(){openCue(null)});$('#saveCue').addEventListener('click',saveCue);$('#deleteCue').addEventListener('click',deleteCue);$('#assignPresenters').addEventListener('click',autoAssignPresenters);$('#rehearseAll').addEventListener('click',rehearseAll);$('#savePresentation').addEventListener('click',savePresentation);$('#previousCue').addEventListener('click',function(){nextAward(-1)});$('#nextCue').addEventListener('click',function(){nextAward(1)});$$('#showModeControl [data-mode]').forEach(function(b){b.addEventListener('click',function(){changeMode(this.dataset.mode)})});$('#liveConfirmCheck').addEventListener('change',function(){$('#confirmGoLive').disabled=!this.checked});$('#confirmGoLive').addEventListener('click',function(){state.showMode='live';save(false);renderAll();closeLayer('liveConfirmModal');toast('Stage screen is LIVE')});$('#printRunSheet').addEventListener('click',printRunSheet);$('#prepareFollowup').addEventListener('click',prepareFollowup);
  $('#openCopilot').addEventListener('click',function(){$('#copilotPanel').classList.add('open')});$('#closeCopilot').addEventListener('click',function(){$('#copilotPanel').classList.remove('open')});$$('.ce-copilot-prompts [data-prompt]').forEach(function(b){b.addEventListener('click',function(){var protectedCount=protectedPresentations().length,pending=state.guests.filter(function(g){return g.rsvp==='pending'}).length,totalMinutes=state.cues.reduce(function(a,c){return a+Number(c.duration||0)},0),answers={blockers:protectedCount?protectedCount+' award reveal'+(protectedCount===1?' is':'s are')+' protected because the winner is missing, unlocked, unverified or the reveal permission is off. The stage system will keep those names hidden even in Live mode.':'No winner reveal blockers are detected. Do one full rehearsal and confirm the AV display before going Live.',guests:pending+' priority guest RSVP'+(pending===1?' is':'s are')+' still pending in this working list. Focus first on winners, presenters, sponsors and VIPs because they affect seating and stage movement.',stage:state.presentations.filter(stageReady).length+' of '+state.presentations.length+' award categories are stage-ready. '+(protectedCount?'Keep protected categories on generic category slides until Page 12 is finalized.':'Every winner reveal currently passes the safety checks.'),timing:'The current run of show contains '+state.cues.length+' cues and about '+totalMinutes+' planned minutes. Awards blocks and speaker transitions are the best places to add a two-minute production buffer.'};$('#copilotAnswer').textContent=answers[this.dataset.prompt]||'Ceremony data looks healthy.'})});
  document.addEventListener('click',function(e){var close=e.target.closest('[data-close]');if(close){closeLayer(close.dataset.close);return}var editGuest=e.target.closest('[data-edit-guest]');if(editGuest){openGuest(findGuest(editGuest.dataset.editGuest));return}var check=e.target.closest('[data-checkin]');if(check){toggleCheckin(check.dataset.checkin);return}var modalCheck=e.target.closest('[data-modal-checkin]');if(modalCheck){toggleCheckin(modalCheck.dataset.modalCheckin);return}var editCue=e.target.closest('[data-edit-cue]');if(editCue){openCue(findCue(editCue.dataset.editCue));return}var move=e.target.closest('[data-move-cue]');if(move){moveCue(move.dataset.cueId,move.dataset.moveCue);return}var conf=e.target.closest('[data-config-presentation]');if(conf){openPresentation(findPresentation(conf.dataset.configPresentation));return}var cue=e.target.closest('[data-cue-award]');if(cue){cueAward(cue.dataset.cueAward);return}var reveal=e.target.closest('[data-reveal-award]');if(reveal){revealAward(reveal.dataset.revealAward);return}});
})();
