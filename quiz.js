// quiz.js
// Logique de la page de quiz : QCM + saisie du code

document.addEventListener("DOMContentLoaded", () => {
  const products = (window.PLU_DATA && window.PLU_DATA.products) || [];

  // --- Éléments DOM ---

  const quizConfigForm = document.getElementById("quizConfigForm");
  const questionCountInput = document.getElementById("questionCount");
  const quizDurationInput = document.getElementById("quizDuration");
  const quizModeSelect = document.getElementById("quizMode");

  const quizPanel = document.getElementById("quizPanel");
  const resultsPanel = document.getElementById("resultsPanel");

  const timerDisplay = document.getElementById("timerDisplay");
  const currentQuestionIndexEl = document.getElementById("currentQuestionIndex");
  const totalQuestionsEl = document.getElementById("totalQuestions");

  const questionTextEl = document.getElementById("questionText");
  const answersContainer = document.getElementById("answersContainer");
  const questionImageEl = document.getElementById("questionImage");

  const typingContainer = document.getElementById("typingContainer");
  const typingInput = document.getElementById("typingInput");

  const resultsQuestionsCount = document.getElementById("resultsQuestionsCount");
  const resultsCorrectCount = document.getElementById("resultsCorrectCount");
  const resultsErrorsCount = document.getElementById("resultsErrorsCount");
  const resultsSuccessRate = document.getElementById("resultsSuccessRate");
  const mistakesList = document.getElementById("mistakesList");
  const restartQuizBtn = document.getElementById("restartQuizBtn");

  // --- État du quiz ---
  let questions = [];
  let currentQuestionIndex = 0;
  let currentQuestion = null;
  let timerSecondsRemaining = 0;
  let timerIntervalId = null;
  let questionLocked = false;
  let currentMode = "mcq"; // "mcq" ou "typing"

  let stats = {
    totalAsked: 0,
    correct: 0,
    errors: 0,
    answersLog: []
  };

  // --- Utilitaires ---

  function shuffleArray(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function setModeLayout(mode) {
    if (!typingContainer || !answersContainer) return;

    if (mode === "typing") {
      typingContainer.style.display = "block";
      answersContainer.style.display = "none";
    } else {
      typingContainer.style.display = "none";
      answersContainer.style.display = "grid";
    }
  }

  // Propositions : même catégorie si possible
  function getWrongProductsFor(product, maxCount) {
    const sameCategory = shuffleArray(
      products.filter(
        (p) => p.code !== product.code && p.category === product.category
      )
    );

    let wrong = sameCategory.slice(0, maxCount);

    if (wrong.length < maxCount) {
      const remaining = maxCount - wrong.length;
      const usedCodes = new Set([product.code, ...wrong.map((p) => p.code)]);
      const others = shuffleArray(products.filter((p) => !usedCodes.has(p.code)));
      wrong = wrong.concat(others.slice(0, remaining));
    }

    return wrong;
  }

  // --- Génération des questions ---

  function generateMcqQuestionFromProduct(product) {
    const type = Math.random() < 0.5 ? "NAME_TO_CODE" : "CODE_TO_NAME";

    const wrongProducts = getWrongProductsFor(product, 3);
    const optionProducts = shuffleArray([product, ...wrongProducts]);

    if (type === "NAME_TO_CODE") {
      const options = optionProducts.map((p) => ({
        label: String(p.code),
        product: p
      }));

      return {
        mode: "mcq",
        type,
        product,
        questionText: `Quel est le code PLU pour : « ${product.name} » ?`,
        correctAnswer: String(product.code),
        options
      };
    }

    // CODE_TO_NAME
    const options = optionProducts.map((p) => ({
      label: p.name,
      product: p
    }));

    return {
      mode: "mcq",
      type,
      product,
      questionText: `Quel produit correspond au code PLU : ${product.code} ?`,
      correctAnswer: product.name,
      options
    };
  }

  function generateTypingQuestionFromProduct(product) {
    return {
      mode: "typing",
      type: "IMAGE_TO_CODE",
      product,
      questionText: `Quel est le code PLU pour : « ${product.name} » ?`,
      correctAnswer: String(product.code),
      options: []
    };
  }

  // Pas de répétitions de produits dans une session
  function generateQuestions(count, mode) {
    if (!products.length) return [];

    const maxQuestions = products.length;
    const finalCount = Math.min(count, maxQuestions);

    const shuffledProducts = shuffleArray(products).slice(0, finalCount);

    return shuffledProducts.map((product) =>
      mode === "typing"
        ? generateTypingQuestionFromProduct(product)
        : generateMcqQuestionFromProduct(product)
    );
  }

  // --- Timer ---

  function startTimer(totalSeconds) {
    timerSecondsRemaining = totalSeconds;
    timerDisplay.textContent = formatTime(timerSecondsRemaining);

    timerIntervalId = setInterval(() => {
      timerSecondsRemaining -= 1;
      timerDisplay.textContent = formatTime(timerSecondsRemaining);

      if (timerSecondsRemaining <= 0) {
        clearInterval(timerIntervalId);
        timerIntervalId = null;
        endQuiz("time");
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerIntervalId !== null) {
      clearInterval(timerIntervalId);
      timerIntervalId = null;
    }
  }

  // --- Affichage d'une question ---

  function displayQuestion() {
    const question = questions[currentQuestionIndex];
    currentQuestion = question;

    if (!question) {
      endQuiz("questions");
      return;
    }

    currentQuestionIndexEl.textContent = currentQuestionIndex + 1;
    totalQuestionsEl.textContent = questions.length;
    questionTextEl.textContent = question.questionText;

    // Reset conteneurs
    answersContainer.innerHTML = "";
    setModeLayout(question.mode);

    // Gestion de l'image
    if (question.product && question.product.image && questionImageEl) {
      if (question.mode === "mcq" && question.type === "CODE_TO_NAME") {
        // En QCM "code → produit", pas d'image sinon c'est la réponse
        questionImageEl.style.display = "none";
      } else {
        questionImageEl.src = question.product.image;
        questionImageEl.alt = question.product.name || "Produit du quiz";
        questionImageEl.style.display = "block";
        questionImageEl.onerror = () => {
          questionImageEl.style.display = "none";
        };
      }
    } else if (questionImageEl) {
      questionImageEl.style.display = "none";
    }

    // Mode saisie du code
    if (question.mode === "typing") {
      typingInput.value = "";
      typingInput.classList.remove("typing-input-correct", "typing-input-wrong");
      typingInput.focus();
      return;
    }

    // Mode QCM
    question.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn answer-btn";
      btn.dataset.value = opt.label;

      if (question.type === "CODE_TO_NAME" && opt.product && opt.product.image) {
        const imgWrapper = document.createElement("div");
        imgWrapper.className = "answer-image-wrapper";

        const img = document.createElement("img");
        img.className = "answer-image";
        img.src = opt.product.image;
        img.alt = opt.product.name || "Produit";
        img.loading = "lazy";

        imgWrapper.appendChild(img);

        const labelSpan = document.createElement("span");
        labelSpan.className = "answer-label";
        labelSpan.textContent = opt.label;

        btn.appendChild(imgWrapper);
        btn.appendChild(labelSpan);
      } else {
        btn.textContent = opt.label;
      }

      btn.addEventListener("click", () => handleMcqAnswer(btn, question));
      answersContainer.appendChild(btn);
    });
  }

  // --- Réponse QCM ---

  function handleMcqAnswer(button, question) {
    if (questionLocked) return;
    questionLocked = true;

    const selectedValue = button.dataset.value;
    const isCorrect = selectedValue === question.correctAnswer;

    const buttons = answersContainer.querySelectorAll(".answer-btn");
    buttons.forEach((btn) => {
      const value = btn.dataset.value;
      if (value === question.correctAnswer) {
        btn.classList.add("answer-correct");
      } else if (value === selectedValue) {
        btn.classList.add("answer-selected");
        if (!isCorrect) btn.classList.add("answer-wrong");
      }
      btn.disabled = true;
    });

    registerAnswer(question, selectedValue, isCorrect);
  }

  // --- Réponse saisie de code ---

  function handleTypingAnswer() {
    if (questionLocked) return;
    if (!currentQuestion || currentQuestion.mode !== "typing") return;

    const rawValue = typingInput.value.trim();
    if (!rawValue) return;

    questionLocked = true;

    const isCorrect = rawValue === currentQuestion.correctAnswer;

    typingInput.classList.remove("typing-input-correct", "typing-input-wrong");
    typingInput.classList.add(
      isCorrect ? "typing-input-correct" : "typing-input-wrong"
    );

    registerAnswer(currentQuestion, rawValue, isCorrect);
  }

  // --- Enregistrement de la réponse (commun) ---

  function registerAnswer(question, userValue, isCorrect) {
    stats.totalAsked += 1;
    if (isCorrect) stats.correct += 1;
    else stats.errors += 1;

    stats.answersLog.push({
      questionText: question.questionText,
      correctAnswer: question.correctAnswer,
      userAnswer: userValue || "(vide)",
      isCorrect
    });

    setTimeout(() => {
      if (question.mode === "typing") {
        typingInput.classList.remove(
          "typing-input-correct",
          "typing-input-wrong"
        );
      }

      currentQuestionIndex += 1;
      questionLocked = false;

      if (currentQuestionIndex >= questions.length) {
        endQuiz("questions");
      } else {
        displayQuestion();
      }
    }, 600);
  }

  // --- Fin du quiz ---

  function endQuiz() {
    stopTimer();
    quizPanel.hidden = true;
    resultsPanel.hidden = false;

    const total = stats.totalAsked || 0;
    const correct = stats.correct || 0;
    const errors = stats.errors || 0;
    const successRate = total > 0 ? Math.round((correct / total) * 100) : 0;

    resultsQuestionsCount.textContent = total;
    resultsCorrectCount.textContent = correct;
    resultsErrorsCount.textContent = errors;
    resultsSuccessRate.textContent = successRate;

    mistakesList.innerHTML = "";

    const mistakes = stats.answersLog.filter((a) => !a.isCorrect);

    if (!mistakes.length) {
      const p = document.createElement("p");
      p.textContent = "Bravo ! Aucune erreur sur cette session 🎉";
      mistakesList.appendChild(p);
      return;
    }

    mistakes.forEach((m, index) => {
      const card = document.createElement("article");
      card.className = "mistake-card";

      const title = document.createElement("h4");
      title.textContent = `Erreur ${index + 1}`;

      const q = document.createElement("p");
      q.innerHTML = `<strong>Question :</strong> ${m.questionText}`;

      const yourAnswer = document.createElement("p");
      yourAnswer.innerHTML = `<strong>Ta réponse :</strong> ${m.userAnswer}`;

      const correctAnswer = document.createElement("p");
      correctAnswer.innerHTML = `<strong>Bonne réponse :</strong> ${m.correctAnswer}`;

      card.appendChild(title);
      card.appendChild(q);
      card.appendChild(yourAnswer);
      card.appendChild(correctAnswer);

      mistakesList.appendChild(card);
    });
  }

  function resetQuizState() {
    questions = [];
    currentQuestionIndex = 0;
    currentQuestion = null;
    timerSecondsRemaining = 0;
    timerDisplay.textContent = "00:00";
    questionLocked = false;
    stats = {
      totalAsked: 0,
      correct: 0,
      errors: 0,
      answersLog: []
    };
  }

  // --- Écouteurs ---

  quizConfigForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!products.length) {
      alert(
        "Aucun produit défini dans data.js. Ajoute des produits pour pouvoir lancer un quiz."
      );
      return;
    }

    let questionCount = parseInt(questionCountInput.value, 10);
    const durationMinutes = parseInt(quizDurationInput.value, 10);
    const mode = quizModeSelect.value === "typing" ? "typing" : "mcq";
    currentMode = mode;

    if (!Number.isFinite(questionCount) || questionCount <= 0) {
      alert("Merci de saisir un nombre de questions valide.");
      return;
    }

    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      alert("Merci de saisir une durée de session valide (en minutes).");
      return;
    }

    const maxQuestions = products.length;
    if (questionCount > maxQuestions) {
      alert(
        `Il y a ${maxQuestions} produits différents. Le nombre de questions est limité à ${maxQuestions} pour éviter les répétitions.`
      );
      questionCount = maxQuestions;
      questionCountInput.value = String(maxQuestions);
    }

    resetQuizState();

    const totalSeconds = durationMinutes * 60;
    questions = generateQuestions(questionCount, mode);

    quizPanel.hidden = false;
    resultsPanel.hidden = false; // on l'affiche mais on le laisse visuellement vide
    resultsPanel.hidden = true;  // pour être sûr qu'il est masqué

    setModeLayout(mode);
    displayQuestion();
    startTimer(totalSeconds);

    window.scrollTo({ top: quizPanel.offsetTop - 20, behavior: "smooth" });
  });

  restartQuizBtn.addEventListener("click", () => {
    stopTimer();
    resetQuizState();

    quizPanel.hidden = true;
    resultsPanel.hidden = true;

    // On remet juste l'affichage en fonction du type choisi,
    // pour la configuration suivante
    const mode = quizModeSelect.value === "typing" ? "typing" : "mcq";
    currentMode = mode;
    setModeLayout(mode);

    window.scrollTo({ top: quizConfigForm.offsetTop - 20, behavior: "smooth" });
  });

  // Validation clavier pour le mode "saisie du code"
  typingInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleTypingAnswer();
    }
  });

  // --- Initialisation : adapter l’affichage au type sélectionné par défaut ---
  currentMode = quizModeSelect.value === "typing" ? "typing" : "mcq";
  setModeLayout(currentMode);
});
