// =================================================================================
// LOGIQUE EXISTANTE (FILTRAGE DE LA LISTE PLU)
// =================================================================================

const searchInput = document.getElementById('plu-search');
const pluList = document.getElementById('plu-list');

if (searchInput && pluList) {
    searchInput.addEventListener('keyup', function() {
        const searchText = searchInput.value.toLowerCase();
        const items = pluList.getElementsByTagName('li');
        
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const text = item.textContent || item.innerText;
            
            if (text.toLowerCase().indexOf(searchText) > -1) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        }
    });
}


// =================================================================================
// NOUVELLE LOGIQUE (TEST CHRONOMÉTRÉ)
// =================================================================================

// --- VARIABLES GLOBALES DE CONTRÔLE ---
const TEST_DURATION_SECONDS = 90; // 1 minute et 30 secondes
let timeLeft = TEST_DURATION_SECONDS;
let timerInterval;
let startTime; 

// --- REFERENCES DOM NOUVELLES ET EXISTANTES ---
const timerDisplay = document.getElementById('timerDisplay');
const startButton = document.getElementById('startButton');
const testQuestionsDiv = document.getElementById('test-questions');
const submitButton = document.getElementById('submitButton');
const resultsArea = document.getElementById('results-area');
const retryButton = document.getElementById('retryButton');
const consultationModeDiv = document.getElementById('consultation-mode'); 

const questionInputs = document.querySelectorAll('#test-questions input[type="text"]'); 


// -------------------------------------------------------------------
// 1. DÉMARRAGE DU TEST (Décompte de 3s)
// -------------------------------------------------------------------
function startTest() {
    // 1. Masquer le mode consultation/recherche
    if (consultationModeDiv) {
        consultationModeDiv.style.display = 'none';
    }

    // 2. Préparation de l'interface du test
    startButton.disabled = true;
    resultsArea.style.display = 'none';
    testQuestionsDiv.style.display = 'block'; 
    submitButton.style.display = 'none';
    if (retryButton) retryButton.style.display = 'none';
    
    timerDisplay.classList.remove('timer-alert');
    timerDisplay.classList.add('timer-ready');
    
    // 3. Initialisation des questions
    questionInputs.forEach(input => {
        input.value = ''; 
        input.disabled = true; 
    });

    // 4. Logique du Décompte (3, 2, 1...)
    let countdown = 3;
    timerDisplay.textContent = `Départ dans ${countdown}...`;

    const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            timerDisplay.textContent = `Départ dans ${countdown}...`;
        } else {
            clearInterval(countdownInterval);
            timerDisplay.textContent = '1:30';
            startButton.style.display = 'none';
            submitButton.style.display = 'block';
            questionInputs.forEach(input => input.disabled = false); // Active les inputs
            startTime = Date.now(); 
            startTimer(); 
        }
    }, 1000);
}

// -------------------------------------------------------------------
// 2. LOGIQUE DU CHRONOMÈTRE (1m30s)
// -------------------------------------------------------------------
function startTimer() {
    timerDisplay.classList.remove('timer-ready');
    timeLeft = TEST_DURATION_SECONDS; 
    
    timerInterval = setInterval(() => {
        timeLeft--;
        
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (timeLeft <= 10) {
            timerDisplay.classList.add('timer-alert'); 
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            finishTest(); 
        }
    }, 1000);
}

// -------------------------------------------------------------------
// 3. FIN DU TEST 
// -------------------------------------------------------------------
function finishTest() {
    clearInterval(timerInterval);

    // Calcul du temps réel utilisé
    const timeElapsed = (TEST_DURATION_SECONDS - timeLeft);
    const usedMinutes = Math.floor(timeElapsed / 60);
    const usedSeconds = timeElapsed % 60;
    
    document.getElementById('timeUsed').textContent = 
        `${usedMinutes}m ${usedSeconds < 10 ? '0' : ''}${usedSeconds}s`;

    // Masquage du test
    questionInputs.forEach(input => input.disabled = true);
    submitButton.style.display = 'none';
    testQuestionsDiv.style.display = 'none';
    
    calculateResults(); 
    
    // Affichage du bouton "Réessayer"
    if (retryButton) retryButton.style.display = 'block';
    
    // Rétablit le startButton pour être prêt à relancer
    startButton.disabled = false;
    startButton.textContent = 'Recommencer'; 
}

// -------------------------------------------------------------------
// 4. CALCUL ET AFFICHAGE DES RÉSULTATS (Modifiée pour nettoyer les ** dans le texte de la question)
// -------------------------------------------------------------------
function calculateResults() {
    let correctCount = 0;
    const totalQuestions = questionInputs.length;
    const detailsList = document.getElementById('detailsList');
    detailsList.innerHTML = ''; 

    questionInputs.forEach(input => {
        const li = document.createElement('li');
        const correctAnswer = input.getAttribute('data-correct-answer');
        const userAnswer = input.value.trim();
        
        const isCorrect = (userAnswer === correctAnswer);
        
        const questionLabel = input.previousElementSibling;
        let questionText = questionLabel ? questionLabel.textContent : `Question ${input.id}`;
        
        // --- NOUVEAU : Enlever toutes les doubles astérisques du texte de la question ---
        // Ceci cible les cas où le texte de la question contient " Quel produit correspond au code PLU : **2** ?"
        questionText = questionText.replace(/\*\*/g, ''); 
        
        li.classList.add(isCorrect ? 'correct' : 'incorrect');

        li.innerHTML = `
            ${isCorrect ? '✅' : '❌'} 
            <span class="question-text">${questionText}</span> : 
            <br>Votre saisie : <strong>${userAnswer || '*(Non répondu)*'}</strong> 
            ${isCorrect ? '' : ` (Attendu : <strong class="expected-answer">${correctAnswer}</strong>)`}
        `;

        if (isCorrect) {
            correctCount++;
        }
        
        detailsList.appendChild(li);
    });

    // Mise à jour du score général
    const percentage = (correctCount / totalQuestions) * 100;
    
    document.getElementById('scoreBrut').textContent = `${correctCount}/${totalQuestions}`;
    document.getElementById('successPercentage').textContent = `${percentage.toFixed(0)}%`;
    
    resultsArea.style.display = 'block';
}

// -------------------------------------------------------------------
// 5. FONCTIONS GLOBALES (Gardées pour compatibilité avec l'HTML)
// -------------------------------------------------------------------
// NOTE: L'ancienne fonction checkPlu n'est plus nécessaire car finishTest fait la vérification.
// Si vous aviez d'autres fonctions globales, assurez-vous de les insérer ici.
// Par exemple: 
// function otherExistingFunction() { ... }

