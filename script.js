// script.js

// Les données PLU_DATA sont chargées depuis data.js

// --- FONCTION POUR CONSTRUIRE LES CARTES ---
function construireCartes(data) {
    const container = document.getElementById('cartes-container');
    container.innerHTML = ''; // Nettoyer le conteneur existant
    
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
    
    // Sélectionne toutes les cartes
    cartes = document.getElementById("cartes-container").getElementsByClassName('carte-plu');

    // Parcourt toutes les cartes
    for (i = 0; i < cartes.length; i++) {
        // Récupère les données stockées dans les attributs data-*
        nomCarte = cartes[i].getAttribute('data-nom');
        codeCarte = cartes[i].getAttribute('data-plu');
        
        // Affiche ou masque la carte si le filtre correspond au nom ou au code
        if (nomCarte.indexOf(filter) > -1 || codeCarte.indexOf(filter) > -1) {
            cartes[i].style.display = "";
        } else {
            cartes[i].style.display = "none";
        }       
    }
}

// Lancement au chargement de la page
window.onload = function() {
    // Vérifier si PLU_DATA est disponible et construire les cartes
    if (typeof PLU_DATA !== 'undefined' && document.getElementById('cartes-container')) {
        construireCartes(PLU_DATA);
    }
};

// --- Les fonctions de tri (sortTable) ne sont plus nécessaires pour la vue par cartes. ---
