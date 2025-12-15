// script.js
// Logique de la page d'accueil : recherche + liste des produits

document.addEventListener("DOMContentLoaded", () => {
  const products = (window.PLU_DATA && window.PLU_DATA.products) || [];

  const searchInput = document.getElementById("searchInput");
  const productGrid = document.getElementById("productGrid");
  const productCountLabel = document.getElementById("productCountLabel");
  const toggleListButton = document.getElementById("toggleListButton");
  const noResultsMessage = document.getElementById("noResultsMessage");
  const scrollTopBtn = document.getElementById("scrollTopBtn");

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

  function renderProducts(list) {
    productGrid.innerHTML = "";

    if (!list.length) {
      noResultsMessage.hidden = false;
    } else {
      noResultsMessage.hidden = true;
      list.forEach((p) => {
        const card = createProductCard(p);
        productGrid.appendChild(card);
      });
    }

    updateProductCount(list.length);
  }

  function normalize(str) {
    return str.toString().trim().toLowerCase();
  }

  function filterProducts() {
    const query = normalize(searchInput.value);

    if (!query) {
      renderProducts(products);
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

    renderProducts(filtered);
  }

  // Recherche en temps réel
  if (searchInput) {
    searchInput.addEventListener("input", filterProducts);
  }

  // Bouton afficher / masquer
  if (toggleListButton) {
    toggleListButton.addEventListener("click", () => {
      listVisible = !listVisible;

      if (listVisible) {
        productGrid.style.display = "grid";
        // Ré-affiche éventuellement le message "aucun résultat"
        if (!productGrid.children.length) {
          noResultsMessage.hidden = false;
        }
        toggleListButton.textContent = "Masquer la liste";
      } else {
        productGrid.style.display = "none";
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

  // Premier rendu
  renderProducts(products);
});
