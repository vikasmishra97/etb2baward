(function () {
  const portals = [
    ['retail','Retail.com'],['auto','Auto'],['healthworld','Healthworld.com'],['telecom','Telecom.com'],['energyworld','Energyworld.com'],['cio','CIO.com'],
    ['realty','Realty.com'],['brandequity','BRAND EQUITY.com','brand'],['cfo','CFO.com'],['ciso','CISO.in'],['bfsi','BFSI'],['government','Government'],
    ['hospitality','HOSPITALITY WORLD'],['hrworld','HRWorld'],['legalworld','LegalWorld.com'],['travelworld','TravelWorld.com'],['masterclass','Masterclass'],['infra','Infra.com'],
    ['economic-times','THE ECONOMIC TIMES'],['cio-sea','CIO SOUTHEAST ASIA'],['hrworld-sea','HRWorld SOUTHEAST ASIA'],['hrworld-emea','HRWorld EMEA'],['education','Education.com'],['times-learn','TIMES LEARN','plain'],
    ['energyworld-mea','Energyworld MEA'],['manufacturing','Manufacturing'],['toi','TOI','plain'],['pharma','Pharma.com'],['grow-fast','Grow Fast','modern'],
    ['enterprise-ai','EnterpriseAI.com'],['supply-chain','SupplyChain.in'],['crypto','CryptoWorld.com'],['chemicals','Chemicals.in'],['sustainability','Sustainability.com']
  ];

  const grid = document.getElementById('portalGrid');

  portals.forEach(function (portal) {
    const id = portal[0];
    const name = portal[1];
    const accent = portal[2] || '';
    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'portal-card';
    button.dataset.accent = accent;
    button.setAttribute('aria-label', 'Open ' + name + ' portal');
    button.innerHTML = '<span class="mini-et">ET</span>' +
      '<span class="portal-name"><span class="portal-wordmark">' + name + '</span>' +
      '<small>From The Economic Times</small></span>';

    button.addEventListener('click', function () {
      // No portal or user details are stored. Every portal opens the same home dashboard.
      window.location.href = 'index.html';
    });

    grid.appendChild(button);
  });
})();
