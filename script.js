// script.js - Logique pour la page d'accueil (index.html)

document.addEventListener('DOMContentLoaded', () => {
    genererCartes();
    
    // Gestion du bouton Scroll To Top
    window.onscroll = function() { scrollFunction() };
});

// 1. Générer les cartes depuis data.js
function genererCartes() {
    const container = document.getElementById('cartes-container');
    
    // Vérification de sécurité
    if (!container) return; 
    if (typeof PLU_DATA === 'undefined') {
        container.innerHTML = "<p>Erreur : Données PLU manquantes (data.js).</p>";
        return;
    }

    container.innerHTML = ''; // Nettoyer

    PLU_DATA.forEach(item => {
        const carte = document.createElement('div');
        carte.className = 'carte-plu';
        // On ajoute le nom en data-attribute pour faciliter la recherche
        carte.setAttribute('data-nom', item.nom.toLowerCase());
        carte.setAttribute('data-code', item.code);

        carte.innerHTML = `
            <div class="plu-image">
                <img src="assets/${item.image}" alt="${item.nom}" loading="lazy">
            </div>
            <div class="plu-nom">${item.nom}</div>
            <div class="plu-code">${item.code}</div>
        `;
        container.appendChild(carte);
    });
}

// 2. Filtrer les cartes (Barre de recherche)
function filtrerCartes() {
    const input = document.getElementById('recherche');
    const filter = input.value.toLowerCase();
    const cartes = document.getElementsByClassName('carte-plu');

    for (let i = 0; i < cartes.length; i++) {
        const nom = cartes[i].getAttribute('data-nom');
        const code = cartes[i].getAttribute('data-code');

        // Vérifie si la recherche correspond au NOM ou au CODE
        if (nom.includes(filter) || code.includes(filter)) {
            cartes[i].style.display = "";
        } else {
            cartes[i].style.display = "none";
        }
    }
}

// 3. Masquer / Afficher la liste
function toggleListe() {
    const container = document.getElementById('cartes-container');
    const bouton = document.getElementById('masquer-bouton');
    const barreRecherche = document.getElementById('recherche');

    if (container.style.display === 'none') {
        container.style.display = 'grid'; // Ou 'flex' selon votre CSS, ici grid est mieux
        barreRecherche.style.display = 'block';
        bouton.textContent = 'Masquer la liste';
        bouton.style.backgroundColor = '#ddd';
    } else {
        container.style.display = 'none';
        barreRecherche.style.display = 'none';
        bouton.textContent = 'Afficher la liste';
        bouton.style.backgroundColor = '#90ee90'; // Un vert clair pour inciter à afficher
    }
}

// 4. Bouton Retour en haut
function scrollFunction() {
    const btn = document.getElementById("scrollToTopBtn");
    if (btn) {
        if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
            btn.style.display = "block";
        } else {
            btn.style.display = "none";
        }
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
