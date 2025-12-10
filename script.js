// --- VARIABLES GLOBALES DE CONTRÔLE ---
const TEST_DURATION_SECONDS = 90; // Durée de 1 minute 30 secondes
let timeLeft = TEST_DURATION_SECONDS;
let timerInterval;
let startTime; 

// --- REFERENCES DOM (Assurez-vous que les IDs correspondent à votre HTML) ---
const timerDisplay = document.getElementById('timerDisplay');
const startButton = document.getElementById('startButton');
const testQuestionsDiv = document.getElementById('test-questions');
const submitButton = document.getElementById('submitButton');
const resultsArea = document.getElementById('results-area');
// Sélectionne tous les champs de saisie de codes PLU dans la zone de questions
const questionInputs = document.querySelectorAll('#test-questions input[type="text"]'); 

// -------------------------------------------------------------------
// 1. DÉMARRAGE DU TEST (DÉCOMPTE DE 3s)
// -------------------------------------------------------------------
function startTest() {
    // Initialisation de l'état
    startButton.disabled = true;
    startButton.textContent = 'En cours...';
    resultsArea.style.display = 'none';
    testQuestionsDiv.style.display = 'block'; 
    submitButton.style.display = 'none';
    
    // Réinitialisation des champs pour un nouveau test et désactivation pendant le décompte
    questionInputs.forEach(input => {
        input.value = '';
        input.disabled = true;
    });

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
            startTime = Date.now(); // Enregistre le moment du départ
            startTimer(); // Lance le chronomètre
        }
    }, 1000);
}

// -------------------------------------------------------------------
// 2. LOGIQUE DU CHRONOMÈTRE
// -------------------------------------------------------------------
function startTimer() {
    timerDisplay.style.color = 'black';
    
    timerInterval = setInterval(() => {
        timeLeft--;
        
        // Formatage en M:SS
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (timeLeft <= 10) {
            timerDisplay.style.color = 'red'; // Alerte visuelle
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            finishTest(); // Le temps est écoulé
        }
    }, 1000);
}

// -------------------------------------------------------------------
// 3. FIN DU TEST 
// -------------------------------------------------------------------
function finishTest() {
    clearInterval(timerInterval);

    // Calcul du temps réel utilisé
    const endTime = Date.now();
    const totalTimeSeconds = Math.round((endTime - startTime) / 1000);
    const usedMinutes = Math.floor(totalTimeSeconds / 60);
    const usedSeconds = totalTimeSeconds % 60;
    
    document.getElementById('timeUsed').textContent = 
        `${usedMinutes}m ${usedSeconds < 10 ? '0' : ''}${usedSeconds}s`;

    // Désactivation et masquage des questions
    questionInputs.forEach(input => input.disabled = true);
    submitButton.style.display = 'none';
    // Le testQuestionsDiv est masqué pour laisser place aux résultats
    testQuestionsDiv.style.display = 'none'; 
    
    calculateResults(); // Passe au calcul
    
    // Réinitialisation de l'état pour le prochain test
    timeLeft = TEST_DURATION_SECONDS;
    startButton.disabled = false;
    startButton.textContent = 'Recommencer';
    startButton.style.display = 'block';
    timerDisplay.textContent = '1:30';
    timerDisplay.style.color = 'black';
}

// -------------------------------------------------------------------
// 4. CALCUL ET AFFICHAGE DES RÉSULTATS
// -------------------------------------------------------------------
function calculateResults() {
    let correctCount = 0;
    const totalQuestions = questionInputs.length;
    const detailsList = document.getElementById('detailsList');
    detailsList.innerHTML = ''; 

    questionInputs.forEach(input => {
        const li = document.createElement('li');
        // Récupère la bonne réponse depuis l'attribut data-correct-answer (Voir HTML)
        const correctAnswer = input.getAttribute('data-correct-answer');
        // Récupère la réponse de l'utilisateur
        const userAnswer = input.value.trim();
        
        // La comparaison est stricte (les codes doivent être exacts)
        const isCorrect = (userAnswer === correctAnswer);
        
        // Récupère le texte de la question pour l'affichage détaillé
        const questionLabel = input.previousElementSibling;
        const questionText = questionLabel ? questionLabel.textContent : `Question ${input.id}`;
        
        li.classList.add(isCorrect ? 'correct' : 'incorrect');

        li.innerHTML = `
            ${isCorrect ? '✅' : '❌'} ${questionText} : 
            <br>Votre saisie : <strong>${userAnswer || '*(Non répondu)*'}</strong> 
            ${isCorrect ? '' : ` (Réponse attendue : <strong>${correctAnswer}</strong>)`}
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
    
    // Affiche la zone de résultats
    resultsArea.style.display = 'block';
}
