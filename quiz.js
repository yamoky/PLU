// quiz.js

const NBRE_QUESTIONS_TOTAL = 10; // Définir le nombre de questions par session
let questionsPosees = 0;
let score = 0;
let questionActuelle = null;

// Fonction utilitaire pour mélanger un tableau
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Fonction pour générer une nouvelle question
function genererQuestion() {
    // 1. Choisir le produit correct aléatoirement
    const produitCorrect = PLU_DATA[Math.floor(Math.random() * PLU_DATA.length)];
    
    // 2. Choisir 3 produits incorrects (distracteurs)
    let choixFaux = [];
    const produitsRestants = PLU_DATA.filter(p => p.code !== produitCorrect.code);
    
    // Mélanger les produits restants et prendre les 3 premiers
    shuffleArray(produitsRestants);
    choixFaux = produitsRestants.slice(0, 3);
    
    // 3. Combiner et mélanger tous les choix
    const tousLesChoix = [produitCorrect, ...choixFaux];
    shuffleArray(tousLesChoix);
    
    // 4. Déterminer si on pose la question sur le code ou sur le nom (50/50)
    const typeQuestion = Math.random() < 0.5 ? 'code' : 'nom'; 

    return {
        produit: produitCorrect,
        choix: tousLesChoix,
        type: typeQuestion
    };
}

// Fonction pour afficher la question à l'écran
function afficherQuestion(question) {
    const quizArea = document.getElementById('quiz-area');
    quizArea.innerHTML = '';
    document.getElementById('bouton-suivant').style.display = 'none';
    
    let enonceHTML = '';
    let reponseCible = '';
    
    if (question.type === 'code') {
        // QUESTION: Quel est le code PLU pour ce produit ? (Afficher l'image)
        enonceHTML = `
            <h2>Quel est le code PLU pour : **${question.produit.nom.toUpperCase()}** ?</h2>
            <img src="assets/${question.produit.image}" alt="${question.produit.nom}">
        `;
        reponseCible = question.produit.code;
        
    } else {
        // QUESTION: Quel produit correspond à ce code PLU ? (Afficher le code)
        enonceHTML = `
            <h2>Quel produit correspond au code PLU : **${question.produit.code}** ?</h2>
            <img src="assets/${question.produit.image}" alt="${question.produit.nom}" style="opacity: 0.1;">
            <p style="font-style: italic; font-size: 0.9em;">(L'image sera révélée après la réponse)</p>
        `;
        reponseCible = question.produit.nom;
    }

    // Affichage des choix
    const choixHTML = question.choix.map(choix => {
        let valeurAffichee = question.type === 'code' ? choix.code : choix.nom;
        let valeurReponse = question.type === 'code' ? choix.code : choix.nom;

        return `<button onclick="verifierReponse(this, '${valeurReponse}', '${reponseCible}', '${question.produit.image}', '${question.produit.nom}')">${valeurAffichee}</button>`;
    }).join('');

    quizArea.innerHTML = `
        <div class="question-card">
            ${enonceHTML}
            <div class="choix">
                ${choixHTML}
            </div>
        </div>
    `;
}


// Fonction pour vérifier la réponse de l'utilisateur
function verifierReponse(boutonClique, reponseUtilisateur, reponseCorrecte, image, nomProduit) {
    
    // Désactiver tous les boutons après le clic
    const boutons = document.querySelectorAll('.choix button');
    boutons.forEach(btn => btn.disabled = true);
    
    const quizArea = document.getElementById('quiz-area');
    
    // 1. Vérification
    if (String(reponseUtilisateur).trim().toLowerCase() === String(reponseCorrecte).trim().toLowerCase()) {
        score++;
        boutonClique.classList.add('reponse-correcte');
        
        // Afficher l'image dans le cas 'code vers nom'
        if (questionActuelle.type === 'nom') {
            quizArea.querySelector('img').style.opacity = '1';
        }
        
    } else {
        boutonClique.classList.add('reponse-incorrecte');
        
        // Surligner la bonne réponse
        boutons.forEach(btn => {
            if (String(btn.textContent).trim().toLowerCase() === String(reponseCorrecte).trim().toLowerCase()) {
                 btn.classList.add('reponse-correcte');
            }
        });
        
        // Afficher l'image dans tous les cas
        quizArea.querySelector('img').src = `assets/${image}`;
        quizArea.querySelector('img').alt = nomProduit;
        quizArea.querySelector('img').style.opacity = '1';

    }

    // 2. Mettre à jour le score et passer à la suite
    document.getElementById('score').textContent = `Score : ${score} / ${questionsPosees + 1}`;
    
    if (questionsPosees < NBRE_QUESTIONS_TOTAL - 1) {
        document.getElementById('bouton-suivant').style.display = 'block';
    } else {
        // Fin du quiz
        document.getElementById('message-fin').innerHTML = `
            <div class="resultats">
                <h2>FIN DU QUIZ !</h2>
                <p>Votre score final est de : **${score} / ${NBRE_QUESTIONS_TOTAL}**</p>
                <p style="margin-top: 15px;"><button onclick="reinitialiserQuiz()" class="bouton-quiz">Recommencer le Quiz</button></p>
            </div>
        `;
        document.getElementById('message-fin').style.display = 'block';
    }
}

// Fonction de chargement de question
function chargerNouvelleQuestion() {
    if (questionsPosees < NBRE_QUESTIONS_TOTAL) {
        questionsPosees++;
        questionActuelle = genererQuestion();
        afficherQuestion(questionActuelle);
    }
}

// Fonction de réinitialisation
function reinitialiserQuiz() {
    questionsPosees = 0;
    score = 0;
    document.getElementById('score').textContent = `Score : 0 / 0`;
    document.getElementById('message-fin').style.display = 'none';
    chargerNouvelleQuestion();
}

// Lancer la première question au chargement de la page
window.onload = function() {
    // Vérifier que la liste PLU_DATA existe et n'est pas vide
    if (typeof PLU_DATA !== 'undefined' && PLU_DATA.length > 4) {
        chargerNouvelleQuestion();
    } else {
        document.getElementById('quiz-area').innerHTML = '<p style="color: red;">Erreur : La base de données PLU_DATA est manquante ou insuffisante. Vérifiez le fichier data.js.</p>';
    }
};
