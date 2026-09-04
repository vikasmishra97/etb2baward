(function(){
  const USER_KEY='etb2b_auth_user',PORTAL_KEY='etb2b_selected_portal';
  let user=null;try{user=JSON.parse(localStorage.getItem(USER_KEY)||'null')}catch(e){}
  if(!user?.email){location.replace('login.html');return;}
  const portals=[
    ['retail','Retail.com'],['auto','Auto'],['healthworld','Healthworld.com'],['telecom','Telecom.com'],['energyworld','Energyworld.com'],['cio','CIO.com'],
    ['realty','Realty.com'],['brandequity','BRAND EQUITY.com','brand'],['cfo','CFO.com'],['ciso','CISO.in'],['bfsi','BFSI'],['government','Government'],
    ['hospitality','HOSPITALITY WORLD'],['hrworld','HRWorld'],['legalworld','LegalWorld.com'],['travelworld','TravelWorld.com'],['masterclass','Masterclass'],['infra','Infra.com'],
    ['economic-times','THE ECONOMIC TIMES'],['cio-sea','CIO SOUTHEAST ASIA'],['hrworld-sea','HRWorld SOUTHEAST ASIA'],['hrworld-emea','HRWorld EMEA'],['education','Education.com'],['times-learn','TIMES LEARN','plain'],
    ['energyworld-mea','Energyworld MEA'],['manufacturing','Manufacturing'],['toi','TOI','plain'],['pharma','Pharma.com'],['grow-fast','Grow Fast','modern'],
    ['enterprise-ai','EnterpriseAI.com'],['supply-chain','SupplyChain.in'],['crypto','CryptoWorld.com'],['chemicals','Chemicals.in'],['sustainability','Sustainability.com']
  ];
  function initials(name,email){const n=(name||email||'U').trim().split(/\s+/).filter(Boolean);return (n.length>1?n[0][0]+n[n.length-1][0]:n[0].slice(0,2)).toUpperCase()}
  const userEl=document.getElementById('portalUser');
  userEl.innerHTML=`${user.picture?`<img src="${user.picture}" alt="">`:`<span class="portal-avatar">${initials(user.name,user.email)}</span>`}<span><b>${user.name||user.email}</b><small>${user.email}</small></span>`;
  const grid=document.getElementById('portalGrid');
  portals.forEach(([id,name,accent])=>{
    const b=document.createElement('button');b.type='button';b.className='portal-card';b.dataset.accent=accent||'';
    b.innerHTML=`<span class="mini-et">ET</span><span class="portal-name"><span class="portal-wordmark">${name}</span><small>From The Economic Times</small></span>`;
    b.addEventListener('click',()=>{
      localStorage.setItem(PORTAL_KEY,JSON.stringify({id,name,selectedAt:new Date().toISOString()}));
      location.href='index.html';
    });
    grid.appendChild(b);
  });
})();
