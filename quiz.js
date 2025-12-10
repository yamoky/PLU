// quiz.js
// Logique de la page de quiz

document.addEventListener("DOMContentLoaded", () => {
  const products = (window.PLU_DATA && window.PLU_DATA.products) || [];

  const quizConfigForm = document.getElementById("quizConfigForm");
  const questionCountInput = document.getElementById("questionCount");
  const quizDurationInput = document.getElementById("quizDuration");

  const quizPanel = document.getElementById("quizPanel");
  const resultsPanel = document.getElementById("resultsPanel");

  const timerDisplay = document.getElementById("timerDisplay");
  const currentQuestionIndexEl = document.getElementById(
    "currentQuestionIndex"
  );
  const totalQuestionsEl = document.getElementById("totalQuestions");

  const questionTextEl = document.getElementById("questionText");
  const answersContainer = document.getElementById("answersContainer");
  const questionImageEl = document.getElementById("questionImage");

  const resultsQuestionsCount = document.getElementById(
    "resultsQuestionsCount"
  );
  const resultsCorrectCount = document.getElementById("resultsCorrectCount");
  const resultsErrorsCount = document.getElementById("resultsErrorsCount");
  const resultsSuccessRate = document.getElementById("resultsSuccessRate");
  const mistakesList = document.getElementById("mistakesList");
  const restartQuizBtn = document.getElementById("restartQuizBtn");

  // État du quiz
  let questions = [];
  let currentQuestionIndex = 0;
  let timerSecondsRemaining = 0;
  let timerIntervalId = null;
  let stats = {
    totalAsked: 0,
    correct: 0,
    errors: 0,
    answersLog: [],
  };

  // --------- Utilitaires ----------
  function shuffleArray(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  }

  // --------- Génération des questions ----------
  function generateQuestionFromProduct(product) {
    // type 0 => "Quel est le code de Banane ?"
    // type 1 => "Quel produit correspond au code 1 ?"
    const type = Math.random() < 0.5 ? 0 : 1;

    if (type === 0) {
      // Code pour un produit donné
      const correctAnswer = String(product.code);
      const wrongProducts = shuffleArray(
        products.filter((p) => p.code !== product.code)
      ).slice(0, 3);
      const options = shuffleArray([
        correctAnswer,
        ...wrongProducts.map((p) => String(p.code)),
      ]);

      return {
        type: "NAME_TO_CODE",
        questionText: `Quel est le code PLU pour : « ${product.name} » ?`,
        correctAnswer,
        options,
        product, // on garde le produit pour l'image
      };
    } else {
      // Produit pour un code donné
      const correctAnswer = product.name;
      const wrongProducts = shuffleArray(
        products.filter((p) => p.code !== product.code)
      ).slice(0, 3);
      const options = shuffleArray([
        correctAnswer,
        ...wrongProducts.map((p) => p.name),
      ]);

      return {
        type: "CODE_TO_NAME",
        questionText: `Quel produit correspond au code PLU : ${product.code} ?`,
        correctAnswer,
        options,
        product, // on garde le produit pour l'image
      };
    }
  }

  function generateQuestions(count) {
    const availableCount = Math.min(count, products.length * 2);
    const selectedQuestions = [];

    for (let i = 0; i < availableCount; i++) {
      const randomProduct =
        products[Math.floor(Math.random() * products.length)];
      selectedQuestions.push(generateQuestionFromProduct(randomProduct));
    }

    return selectedQuestions;
  }

  // --------- Timer ----------
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

  // --------- Affichage d'une question ----------
  function displayQuestion() {
    const question = questions[currentQuestionIndex];
    if (!question) {
      endQuiz("questions");
      return;
    }

    currentQuestionIndexEl.textContent = currentQuestionIndex + 1;
    totalQuestionsEl.textContent = questions.length;

    questionTextEl.textContent = question.questionText;
    answersContainer.innerHTML = "";

    // Gestion de l'image du produit
    if (question.product && question.product.image && questionImageEl) {
      questionImageEl.src = question.product.image;
      questionImageEl.alt = question.product.name || "Produit du quiz";
      questionImageEl.style.visibility = "visible";

      // fallback si l'image ne charge pas
      questionImageEl.onerror = () => {
        questionImageEl.style.visibility = "hidden";
      };
    } else if (questionImageEl) {
      questionImageEl.style.visibility = "hidden";
    }

    question.options.forEach((option) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn answer-btn";
      btn.textContent = option;
      btn.dataset.value = option;
      btn.addEventListener("click", () => handleAnswer(btn, question));
      answersContainer.appendChild(btn);
    });
  }

  // --------- Gestion de la réponse ----------
  let questionLocked = false;

  function handleAnswer(button, question) {
    if (questionLocked) return;
    questionLocked = true;

    const selectedValue = button.dataset.value;
    const isCorrect = selectedValue === question.correctAnswer;

    // Style visuel
    const answerButtons = answersContainer.querySelectorAll(".answer-btn");
    answerButtons.forEach((btn) => {
      const value = btn.dataset.value;
      if (value === question.correctAnswer) {
        btn.classList.add("answer-correct");
      } else if (value === selectedValue) {
        btn.classList.add("answer-selected");
        if (!isCorrect) {
          btn.classList.add("answer-wrong");
        }
      }
      btn.disabled = true;
    });

    // Mise à jour des stats
    stats.totalAsked += 1;
    if (isCorrect) {
      stats.correct += 1;
    } else {
      stats.errors += 1;
    }

    stats.answersLog.push({
      questionText: question.questionText,
      correctAnswer: question.correctAnswer,
      userAnswer: selectedValue,
      isCorrect,
    });

    // Passage à la question suivante après un petit délai
    setTimeout(() => {
      currentQuestionIndex += 1;
      questionLocked = false;

      if (currentQuestionIndex >= questions.length) {
        endQuiz("questions");
      } else {
        displayQuestion();
      }
    }, 600);
  }

  // --------- Fin du quiz + résultats ----------
  function endQuiz(reason) {
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

    mistakes.forEach((mistake, index) => {
      const card = document.createElement("article");
      card.className = "mistake-card";

      const title = document.createElement("h4");
      title.textContent = `Erreur ${index + 1}`;

      const q = document.createElement("p");
      q.innerHTML = `<strong>Question :</strong> ${mistake.questionText}`;

      const yourAnswer = document.createElement("p");
      yourAnswer.innerHTML = `<strong>Ta réponse :</strong> ${mistake.userAnswer}`;

      const correctAnswer = document.createElement("p");
      correctAnswer.innerHTML = `<strong>Bonne réponse :</strong> ${mistake.correctAnswer}`;

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
    stats = {
      totalAsked: 0,
      correct: 0,
      errors: 0,
      answersLog: [],
    };
    questionLocked = false;
    timerSecondsRemaining = 0;
    timerDisplay.textContent = "00:00";
  }

  // --------- Écouteurs ----------
  quizConfigForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!products.length) {
      alert(
        "Aucun produit défini dans data.js. Ajoute des produits pour pouvoir lancer un quiz."
      );
      return;
    }

    const questionCount = parseInt(questionCountInput.value, 10);
    const durationMinutes = parseInt(quizDurationInput.value, 10);

    if (!Number.isFinite(questionCount) || questionCount <= 0) {
      alert("Merci de saisir un nombre de questions valide.");
      return;
    }

    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      alert("Merci de saisir une durée de session valide (en minutes).");
      return;
    }

    resetQuizState();

    const totalSeconds = durationMinutes * 60;
    questions = generateQuestions(questionCount);

    quizPanel.hidden = false;
    resultsPanel.hidden = false; // on l'affiche mais il est vide tant qu'on a pas terminé
    resultsPanel.hidden = true; // donc on le re-cache ici

    displayQuestion();
    startTimer(totalSeconds);

    window.scrollTo({ top: quizPanel.offsetTop - 20, behavior: "smooth" });
  });

  restartQuizBtn.addEventListener("click", () => {
    stopTimer();
    resetQuizState();

    quizPanel.hidden = true;
    resultsPanel.hidden = true;

    // Scroll vers la config pour relancer
    window.scrollTo({
      top: quizConfigForm.offsetTop - 20,
      behavior: "smooth",
    });
  });
});
