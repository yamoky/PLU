// script.js - Code pour la page d'accueil (index.html) UNIQUEMENT

document.addEventListener('DOMContentLoaded', () => {
    // 1. On lance la génération de la liste au chargement de la page
    genererCartes();
    
    // 2. Gestion du bouton "Retour en haut"
    window.onscroll = function() { scrollFunction() };
});

// --- Fonction pour créer les cartes HTML à partir de data.js ---
function genererCartes() {
    const container = document.getElementById('cartes-container');
    
    // Sécurité : si on n'est pas sur la page index (pas de container), on arrête.
    if (!container) return; 

    // Sécurité : si data.js n'est pas chargé
    if (typeof PLU_DATA === 'undefined') {
        container.innerHTML = "<p style='color:red; text-align:center;'>Erreur : Le fichier data.js n'est pas chargé ou est vide.</p>";
        console.error("PLU_DATA est introuvable.");
        return;
    }

    container.innerHTML = ''; // On vide le conteneur avant de le remplir

    // Boucle sur chaque produit pour créer sa carte
    PLU_DATA.forEach(item => {
        const carte = document.createElement('div');
        carte.className = 'carte-plu';
        
        // On ajoute des attributs cachés pour faciliter la recherche (nom et code)
        carte.setAttribute('data-nom', item.nom.toLowerCase());
        carte.setAttribute('data-code', item.code);

        // On construit le HTML de la carte
        carte.innerHTML = `
            <div class="plu-image">
                <img src="assets/${item.image}" alt="${item.nom}" loading="lazy" onerror="this.src='https://via.placeholder.com/200?text=No+Image'">
            </div>
            <div class="plu-nom">${item.nom}</div>
            <div class="plu-code">${item.code}</div>
        `;
        
        container.appendChild(carte);
    });
}

// --- Fonction de Recherche (Appelée par l'input "onkeyup") ---
function filtrerCartes() {
    const input = document.getElementById('recherche');
    if (!input) return;

    const filter = input.value.toLowerCase();
    const cartes = document.getElementsByClassName('carte-plu');

    for (let i = 0; i < cartes.length; i++) {
        const nom = cartes[i].getAttribute('data-nom');
        const code = cartes[i].getAttribute('data-code');

        // Si le nom OU le code contient le texte recherché
        if (nom.includes(filter) || code.includes(filter)) {
            cartes[i].style.display = ""; // Afficher
        } else {
            cartes[i].style.display = "none"; // Masquer
        }
    }
}

// --- Fonction Masquer/Afficher la liste ---
function toggleListe() {
    const container = document.getElementById('cartes-container');
    const bouton = document.getElementById('masquer-bouton');
    const barreRecherche = document.getElementById('recherche');

    if (!container) return;

    // Si le conteneur est caché ou n'a pas de display défini (vide)
    const styleDisplay = window.getComputedStyle(container).display;

    if (styleDisplay === 'none') {
        // AFFICHER
        container.style.display = 'grid'; 
        if(barreRecherche) barreRecherche.style.display = 'block';
        if(bouton) {
            bouton.textContent = 'Masquer la liste';
            bouton.style.backgroundColor = '#ddd'; // Gris
        }
    } else {
        // MASQUER
        container.style.display = 'none';
        if(barreRecherche) barreRecherche.style.display = 'none';
        if(bouton) {
            bouton.textContent = 'Afficher la liste';
            bouton.style.backgroundColor = '#90ee90'; // Vert clair
        }
    }
}

// --- Fonction Scroll to Top (Optionnel) ---
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
