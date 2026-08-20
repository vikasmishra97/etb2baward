
document.addEventListener('click',e=>{const b=e.target.closest('[data-toast]');if(!b)return;const t=document.getElementById('toast');t.textContent=b.dataset.toast||'Saved';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)});
