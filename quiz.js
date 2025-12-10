// quiz.js - Logique pour la page quiz (quiz.html)

const NBRE_QUESTIONS_TOTAL = 10; 
const TEMPS_LIMITE_PAR_QUESTION = 15; // 15 secondes par question

let questionsPosees = 0;
let score = 0;
let questionActuelle = null;
let timer; 
let tempsRestant; 

// --- Fonctions utilitaires ---

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- Fonctions Chrono ---

function demarrerChrono() {
    tempsRestant = TEMPS_LIMITE_PAR_QUESTION;
    const chronoAffichage = document.getElementById('chrono-affichage');
    chronoAffichage.textContent = `Temps : ${tempsRestant}s`;

    clearInterval(timer); 

    timer = setInterval(() => {
        tempsRestant--;
        chronoAffichage.textContent = `Temps : ${tempsRestant}s`;

        if (tempsRestant <= 5) {
            chronoAffichage.style.color = '#f44336'; 
        } else {
            chronoAffichage.style.color = '#005A9C';
        }

        if (tempsRestant <= 0) {
            clearInterval(timer);
            reponseAutomatique('Temps écoulé !'); 
        }
    }, 1000); 
}

function arreterChrono() {
    clearInterval(timer);
}

// --- Logique du Quiz (QCM) ---

function genererQuestion() {
    const produitCorrect = PLU_DATA[Math.floor(Math.random() * PLU_DATA.length)];
    
    let choixFaux = [];
    const produitsRestants = PLU_DATA.filter(p => p.code !== produitCorrect.code);
    
    shuffleArray(produitsRestants);
    choixFaux = produitsRestants.slice(0, 3);
    
    const tousLesChoix = [produitCorrect, ...choixFaux];
    shuffleArray(tousLesChoix);
    
    const typeQuestion = Math.random() < 0.5 ? 'code' : 'nom'; 

    return {
        produit: produitCorrect,
        choix: tousLesChoix,
        type: typeQuestion
    };
}

function afficherQuestion(question) {
    const quizArea = document.getElementById('quiz-area');
    quizArea.innerHTML = '';
    document.getElementById('bouton-suivant').style.display = 'none';
    
    let enonceHTML = '';
    let reponseCible = '';
    
    // MODIFICATION ICI : Suppression des **
    if (question.type === 'code') {
        enonceHTML = `
            <h2>Quel est le code PLU pour : ${question.produit.nom.toUpperCase()} ?</h2>
            <img src="assets/${question.produit.image}" alt="${question.produit.nom}">
        `;
        reponseCible = question.produit.code;
        
    } else {
        enonceHTML = `
            <h2>Quel produit correspond au code PLU : ${question.produit.code} ?</h2>
            <img src="assets/${question.produit.image}" alt="${question.produit.nom}" style="opacity: 0.1;">
            <p style="font-style: italic; font-size: 0.9em;">(L'image sera révélée après la réponse)</p>
        `;
        reponseCible = question.produit.nom;
    }

    const choixHTML = question.choix.map(choix => {
        let valeurAffichee = question.type === 'code' ? choix.code : choix.nom;
        let valeurReponse = question.type === 'code' ? choix.code : choix.nom;

        return `<button onclick="verifierReponse(this, '${valeurReponse}', '${reponseCible}')">${valeurAffichee}</button>`;
    }).join('');

    quizArea.innerHTML = `
        <div class="question-card">
            ${enonceHTML}
            <div class="choix">
                ${choixHTML}
            </div>
        </div>
    `;
    
    demarrerChrono(); 
}

function reponseAutomatique(message) {
    const boutons = document.querySelectorAll('.choix button');
    boutons.forEach(btn => btn.disabled = true);
    
    const reponseCorrecte = questionActuelle.type === 'code' ? questionActuelle.produit.code : questionActuelle.produit.nom;

    boutons.forEach(btn => {
        if (String(btn.textContent).trim().toLowerCase() === String(reponseCorrecte).trim().toLowerCase()) {
             btn.classList.add('reponse-correcte');
        }
    });

    const quizArea = document.getElementById('quiz-area');
    quizArea.querySelector('img').src = `assets/${questionActuelle.produit.image}`;
    quizArea.querySelector('img').alt = questionActuelle.produit.nom;
    quizArea.querySelector('img').style.opacity = '1';

    document.getElementById('chrono-affichage').textContent = message;

    afficherBoutonSuivant();
}


function verifierReponse(boutonClique, reponseUtilisateur, reponseCorrecte) {
    arreterChrono(); 
    
    const boutons = document.querySelectorAll('.choix button');
    boutons.forEach(btn => btn.disabled = true);
    
    const quizArea = document.getElementById('quiz-area');
    
    if (String(reponseUtilisateur).trim().toLowerCase() === String(reponseCorrecte).trim().toLowerCase()) {
        score++;
        boutonClique.classList.add('reponse-correcte');
    } else {
        boutonClique.classList.add('reponse-incorrecte');
        
        boutons.forEach(btn => {
            if (String(btn.textContent).trim().toLowerCase() === String(reponseCorrecte).trim().toLowerCase()) {
                 btn.classList.add('reponse-correcte');
            }
        });
    }

    quizArea.querySelector('img').src = `assets/${questionActuelle.produit.image}`;
    quizArea.querySelector('img').alt = questionActuelle.produit.nom;
    quizArea.querySelector('img').style.opacity = '1';

    document.getElementById('score').textContent = `Score : ${score} / ${questionsPosees + 1}`;
    
    afficherBoutonSuivant();
}


function afficherBoutonSuivant() {
    if (questionsPosees < NBRE_QUESTIONS_TOTAL) {
        document.getElementById('bouton-suivant').style.display = 'block';
    } else {
        document.getElementById('bouton-suivant').style.display = 'none';
        // MODIFICATION ICI : Suppression des ** dans le message de fin
        document.getElementById('message-fin').innerHTML = `
            <div class="resultats">
                <h2>FIN DU QUIZ !</h2>
                <p>Votre score final est de : ${score} / ${NBRE_QUESTIONS_TOTAL}</p>
                <p style="margin-top: 15px;"><button onclick="reinitialiserQuiz()" class="bouton-quiz">Recommencer le Quiz</button></p>
            </div>
        `;
        document.getElementById('message-fin').style.display = 'block';
    }
}


function chargerNouvelleQuestion() {
    document.getElementById('chrono-affichage').style.color = '#005A9C'; 
    
    if (questionsPosees < NBRE_QUESTIONS_TOTAL) {
        questionsPosees++;
        questionActuelle = genererQuestion();
        afficherQuestion(questionActuelle);
    }
}

function reinitialiserQuiz() {
    arreterChrono();
    questionsPosees = 0;
    score = 0;
    document.getElementById('score').textContent = `Score : 0 / 0`;
    document.getElementById('message-fin').style.display = 'none';
    chargerNouvelleQuestion();
}

document.addEventListener('DOMContentLoaded', function() {
    if (typeof PLU_DATA !== 'undefined' && PLU_DATA.length > 4) {
        chargerNouvelleQuestion();
    } else {
        document.getElementById('quiz-area').innerHTML = '<p style="color: red;">Erreur : La base de données PLU_DATA est manquante ou insuffisante. Vérifiez le fichier data.js.</p>';
        if (document.getElementById('chrono-affichage')) {
            document.getElementById('chrono-affichage').style.display = 'none';
        }
    }
});
