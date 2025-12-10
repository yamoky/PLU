// script.js
// Logique de la page d'accueil : recherche + affichage des produits

document.addEventListener("DOMContentLoaded", () => {
  const products = (window.PLU_DATA && window.PLU_DATA.products) || [];

  const searchInput = document.getElementById("searchInput");
  const productsGrid = document.getElementById("productsGrid");
  const resultsCount = document.getElementById("resultsCount");
  const toggleListBtn = document.getElementById("toggleListBtn");
  const noResultsMessage = document.getElementById("noResultsMessage");
  const scrollTopBtn = document.getElementById("scrollTopBtn");

  let isListVisible = true;
  let currentList = products.slice();

  // ---------- Rendu des cartes produits ----------
  function renderProducts(list) {
    productsGrid.innerHTML = "";

    if (!list.length) {
      noResultsMessage.hidden = false;
      resultsCount.textContent = "0 produit";
      return;
    }

    noResultsMessage.hidden = true;

    list.forEach((product) => {
      const card = document.createElement("article");
      card.className = "product-card";

      const imgWrapper = document.createElement("div");
      imgWrapper.className = "product-image-wrapper";

      const img = document.createElement("img");
      img.className = "product-image";
      img.src = product.image || "";
      img.alt = product.name || "Produit PLU";
      img.loading = "lazy";

      img.onerror = () => {
        img.classList.add("product-image-fallback");
        imgWrapper.classList.add("product-image-fallback-bg");
      };

      imgWrapper.appendChild(img);

      const info = document.createElement("div");
      info.className = "product-info";

      const codeEl = document.createElement("p");
      codeEl.className = "product-code";
      codeEl.textContent = `Code PLU : ${product.code}`;

      const nameEl = document.createElement("p");
      nameEl.className = "product-name";
      nameEl.textContent = product.name;

      info.appendChild(codeEl);
      info.appendChild(nameEl);

      card.appendChild(imgWrapper);
      card.appendChild(info);

      productsGrid.appendChild(card);
    });

    const count = list.length;
    resultsCount.textContent = `${count} produit${count > 1 ? "s" : ""}`;
  }

  // ---------- Recherche ----------
  function filterProducts(query) {
    const trimmed = query.trim().toLowerCase();

    if (!trimmed) {
      currentList = products.slice();
      renderProducts(currentList);
      return;
    }

    currentList = products.filter((p) => {
      const code = String(p.code || "").toLowerCase();
      const name = String(p.name || "").toLowerCase();
      return code.includes(trimmed) || name.includes(trimmed);
    });

    renderProducts(currentList);
  }

  // ---------- Toggle affichage de la liste ----------
  function toggleListVisibility() {
    isListVisible = !isListVisible;
    productsGrid.style.display = isListVisible ? "grid" : "none";
    noResultsMessage.style.display = isListVisible ? "" : "none";
    toggleListBtn.textContent = isListVisible
      ? "Masquer la liste"
      : "Afficher la liste";
  }

  // ---------- Gestion du scroll-top ----------
  function updateScrollButton() {
    if (window.scrollY > 200) {
      scrollTopBtn.classList.add("visible");
    } else {
      scrollTopBtn.classList.remove("visible");
    }
  }

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ---------- Écouteurs ----------
  searchInput.addEventListener("input", (e) => {
    if (!isListVisible) {
      toggleListVisibility();
    }
    filterProducts(e.target.value);
  });

  toggleListBtn.addEventListener("click", () => {
    toggleListVisibility();
  });

  window.addEventListener("scroll", updateScrollButton);
  scrollTopBtn.addEventListener("click", scrollToTop);

  // ---------- Initialisation ----------
  renderProducts(products);
  updateScrollButton();
});
