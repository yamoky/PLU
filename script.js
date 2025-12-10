// script.js
// Gère affichage/masquage de la liste, recherche en temps réel.

(function(){
  // Récupère éléments
  const toggleBtn = document.getElementById('toggle-list');
  const productSection = document.getElementById('product-list-section');
  const searchWrap = document.getElementById('search-wrap');
  const searchInput = document.getElementById('search-input');
  const productListEl = document.getElementById('product-list');
  const noResults = document.getElementById('no-results');
  const searchCount = document.getElementById('search-count');

  // Data
  const products = (window.PLU_DATA && window.PLU_DATA.products) || [];

  // Render la liste complète
  function renderList(items){
    productListEl.innerHTML = '';
    if(!items.length){
      noResults.classList.remove('hidden');
      return;
    } else {
      noResults.classList.add('hidden');
    }

    const frag = document.createDocumentFragment();
    items.forEach(p => {
      const li = document.createElement('li');
      li.className = 'product-item';
      li.innerHTML = `
        <div class="code">${escapeHtml(p.code)}</div>
        <div class="name">${escapeHtml(p.name)}</div>
        <div class="meta">${escapeHtml(p.category || '')}</div>
      `;
      frag.appendChild(li);
    });
    productListEl.appendChild(frag);
  }

  // Escape minimal pour sécurité
  function escapeHtml(s= '') {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // Filtre par code ou nom (insensible à la casse)
  function filter(query){
    if(!query) return products.slice();
    const q = query.trim().toLowerCase();
    return products.filter(p => (p.code && p.code.toLowerCase().includes(q)) || (p.name && p.name.toLowerCase().includes(q)));
  }

  // Toggle affichage
  function toggleList(){
    const hidden = productSection.classList.toggle('hidden');
    const show = !hidden;
    productSection.setAttribute('aria-hidden', hidden ? 'true' : 'false');
    searchWrap.setAttribute('aria-hidden', hidden ? 'true' : 'false');
    toggleBtn.textContent = show ? 'Masquer la liste des produits' : 'Afficher la liste des produits';
    if(show){
      renderList(products);
      searchInput.focus();
      searchCount.textContent = `${products.length} produits`;
    } else {
      // clear search
      searchInput.value = '';
      searchCount.textContent = '';
    }
  }

  // Gestion recherche
  function onSearchInput(e){
    const q = e.target.value;
    const result = filter(q);
    renderList(result);
    searchCount.textContent = `${result.length} produit(s) trouvé(s)`;
  }

  // Initial
  toggleBtn.addEventListener('click', toggleList);
  searchInput.addEventListener('input', onSearchInput);
  // Pré-rendu caché (ne pas afficher la liste automatiquement)
  productSection.classList.add('hidden');
})();
