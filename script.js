// script.js
// Logique de la page d'accueil : recherche + liste des produits par catégorie

document.addEventListener("DOMContentLoaded", () => {
  const products = (window.PLU_DATA && window.PLU_DATA.products) || [];

  const searchInput = document.getElementById("searchInput");
  const productCountLabel = document.getElementById("productCountLabel");
  const toggleListButton = document.getElementById("toggleListButton");
  const noResultsMessage = document.getElementById("noResultsMessage");
  const scrollTopBtn = document.getElementById("scrollTopBtn");

  const productListsWrapper = document.getElementById("productListsWrapper");
  const gridFruits = document.getElementById("gridFruits");
  const gridBoulangerie = document.getElementById("gridBoulangerie");

  let listVisible = true;

  function updateProductCount(count) {
    const plural = count > 1 ? "s" : "";
    productCountLabel.textContent = `${count} produit${plural}`;
  }

  function createProductCard(product) {
    const card = document.createElement("article");
    card.className = "product-card";

    const imgWrapper = document.createElement("div");
    imgWrapper.className = "product-image-wrapper";

    const img = document.createElement("img");
    img.className = "product-image";
    img.src = product.image;
    img.alt = product.name || "Produit";
    img.loading = "lazy";

    img.onerror = () => {
      imgWrapper.classList.add("product-image-fallback-bg");
      img.classList.add("product-image-fallback");
      img.removeAttribute("src");
      img.alt = "";
    };

    imgWrapper.appendChild(img);

    const info = document.createElement("div");
    info.className = "product-info";

    const code = document.createElement("div");
    code.className = "product-code";
    code.textContent = `Code PLU : ${product.code}`;

    const name = document.createElement("div");
    name.className = "product-name";
    name.textContent = product.nom || product.name;

    info.appendChild(code);
    info.appendChild(name);

    card.appendChild(imgWrapper);
    card.appendChild(info);

    return card;
  }

  function renderCategory(gridElement, list) {
    gridElement.innerHTML = "";
    list.forEach((p) => {
      const card = createProductCard(p);
      gridElement.appendChild(card);
    });
  }

  function renderProductsByCategory(list) {
    // Séparation par catégorie
    const fruits = list.filter((p) => p.category === "fruits_legumes");
    const boulangerie = list.filter((p) => p.category === "boulangerie");

    renderCategory(gridFruits, fruits);
    renderCategory(gridBoulangerie, boulangerie);

    const total = list.length;
    updateProductCount(total);

    // Message "aucun résultat"
    if (total === 0) {
      noResultsMessage.hidden = false;
    } else {
      noResultsMessage.hidden = true;
    }
  }

  function normalize(str) {
    return str.toString().trim().toLowerCase();
  }

  function filterProducts() {
    const query = normalize(searchInput.value);

    if (!query) {
      renderProductsByCategory(products);
      return;
    }

    const filtered = products.filter((p) => {
      const code = normalize(p.code);
      const name = normalize(p.name || "");
      const nom = normalize(p.nom || "");
      return (
        code.includes(query) ||
        name.includes(query) ||
        nom.includes(query)
      );
    });

    renderProductsByCategory(filtered);
  }

  // Recherche live
  if (searchInput) {
    searchInput.addEventListener("input", filterProducts);
  }

  // Afficher / masquer toute la liste (les deux catégories)
  if (toggleListButton) {
    toggleListButton.addEventListener("click", () => {
      listVisible = !listVisible;

      if (listVisible) {
        productListsWrapper.style.display = "block";
        // Si aucun produit n'est affiché, on montre le message
        if (
          !gridFruits.children.length &&
          !gridBoulangerie.children.length
        ) {
          noResultsMessage.hidden = false;
        }
        toggleListButton.textContent = "Masquer la liste";
      } else {
        productListsWrapper.style.display = "none";
        noResultsMessage.hidden = true;
        toggleListButton.textContent = "Afficher la liste";
      }
    });
  }

  // Bouton retour en haut
  if (scrollTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        scrollTopBtn.classList.add("visible");
      } else {
        scrollTopBtn.classList.remove("visible");
      }
    });

    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Premier rendu : tous les produits, triés par catégorie
  renderProductsByCategory(products);
});
