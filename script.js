// script.js

// Les données PLU_DATA sont chargées depuis data.js

// --- FONCTION POUR CONSTRUIRE LES CARTES ---
function construireCartes(data) {
    const container = document.getElementById('cartes-container');
    container.innerHTML = ''; // Nettoyer le conteneur existant
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: red; font-weight: bold;">Erreur : La base de données PLU_DATA est vide ou non chargée.</p>';
        return;
    }

    data.forEach(item => {
        const carteHTML = `
            <div class="carte-plu" data-plu="${item.code}" data-nom="${item.nom.toUpperCase()}">
                <div class="plu-code">${item.code}</div>
                <div class="plu-image">
                    <img src="assets/${item.image}" alt="${item.nom}">
                </div>
                <div class="plu-nom">${item.nom}</div>
            </div>
        `;
        container.innerHTML += carteHTML;
    });
}

// --- FONCTION DE FILTRAGE (RECHERCHE pour les Cartes) ---
function filtrerCartes() {
    var input, filter, cartes, i, nomCarte, codeCarte;
    input = document.getElementById("recherche");
    filter = input.value.toUpperCase();
    
    cartes = document.getElementById("cartes-container").getElementsByClassName('carte-plu');
    
    const listeContainer = document.getElementById('cartes-container');
    const bouton = document.getElementById('masquer-bouton');
    const estMasquee = listeContainer.style.display === 'none';


    for (i = 0; i < cartes.length; i++) {
        nomCarte = cartes[i].getAttribute('data-nom');
        codeCarte = cartes[i].getAttribute('data-plu');
        
        // Si le filtre est actif (il y a du texte dans la barre de recherche)
        if (filter.length > 0) {
            // Affiche la carte UNIQUEMENT si elle correspond au filtre
            if (nomCarte.indexOf(filter) > -1 || codeCarte.indexOf(filter) > -1) {
                cartes[i].style.display = "";
            } else {
                cartes[i].style.display = "none";
            }
            
            // Si le container était masqué, on l'affiche lors d'une recherche active
            if (listeContainer.style.display === 'none') {
                listeContainer.style.display = 'grid';
            }
            
        } 
        // Si la recherche est vide
        else {
             // Si la liste est masquée par le bouton, on garde les cartes masquées
            if (estMasquee) {
                 cartes[i].style.display = "none";
            }
            // Si la liste est affichée (état par défaut), on affiche toutes les cartes
            else {
                 cartes[i].style.display = "";
            }
        }
    }
    
    // S'assurer que le texte du bouton est correct après une recherche vide
    if (filter.length === 0) {
        bouton.textContent = estMasquee ? 'Afficher la liste' : 'Masquer la liste';
    }
}

// --- FONCTION DE MASQUAGE/AFFICHAGE DE LA LISTE ---
function toggleListe() {
    const listeContainer = document.getElementById('cartes-container');
    const bouton = document.getElementById('masquer-bouton');
    const rechercheInput = document.getElementById("recherche");
    
    if (listeContainer.style.display === 'none') {
        // AFFICHAGE :
        listeContainer.style.display = 'grid'; 
        bouton.textContent = 'Masquer la liste';
        
        // Si le champ de recherche n'est pas vide, on réapplique le filtre
        if (rechercheInput.value.length > 0) {
            filtrerCartes();
        } else {
             // Si la recherche est vide, on s'assure que toutes les cartes sont visibles
             const cartes = listeContainer.getElementsByClassName('carte-plu');
             Array.from(cartes).forEach(carte => carte.style.display = "");
        }
        
    } else {
        // MASQUAGE :
        listeContainer.style.display = 'none';
        bouton.textContent = 'Afficher la liste';
    }
}

// Lancement au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    if (typeof PLU_DATA !== 'undefined' && document.getElementById('cartes-container')) {
        construireCartes(PLU_DATA);
        document.getElementById("recherche").value = "";
    }
});


// --- LOGIQUE DU BOUTON RETOUR EN HAUT (Scroll-to-top) ---

// Quand l'utilisateur fait défiler la page, on vérifie la position
window.onscroll = function() {
    scrollFunction();
};

function scrollFunction() {
    const btn = document.getElementById("scrollToTopBtn");
    // Afficher le bouton si la position verticale est supérieure à 500 pixels (après le header)
    if (document.body.scrollTop > 500 || document.documentElement.scrollTop > 500) {
        btn.style.display = "block";
    } else {
        btn.style.display = "none";
    }
}

// Quand l'utilisateur clique sur le bouton, faire remonter la page en douceur
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}
