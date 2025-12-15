// quiz.js
// Logique de la page de quiz : QCM + saisie du code

document.addEventListener("DOMContentLoaded", () => {
  const products = (window.PLU_DATA && window.PLU_DATA.products) || [];

  const quizConfigForm = document.getElementById("quizConfigForm");
  const questionCountInput = document.getElementById("questionCount");
  const quizDurationInput = document.getElementById("quizDuration");
  const quizModeSelect = document.getElementById("quizMode");

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

  const typingContainer = document.getElementById("typingContainer");
  const typingInput = document.getElementById("typingInput");

  const resultsQuestionsCount = document.getElementById(
    "resultsQuestionsCount"
  );
  const resultsCorrectCount = document.getElementById("resultsCorrectCount");
  const resultsErrorsCount = document.getElementById("resultsErrorsCount");
  const resultsSuccessRate = document.getElementById("resultsSuccessRate");
  const mistakesList = document.getElementById("mistakesList");
  const restartQuizBtn = document.getElementById("restartQuizBtn");

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
  let currentMode = "mcq";
  let currentQuestion = null;
  let questionLocked = false;

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

  // Renvoie jusqu'à `maxCount` produits différents du produit donné,
  // en priorisant ceux de la même catégorie.
  function getWrongProductsFor(product, maxCount) {
    const sameCategory = shuffleArray(
      products.filter(
        (p) => p.code !== product.code && p.category === product.category
      )
    );

    let wrong = sameCategory.slice(0, maxCount);

    if (wrong.length < maxCount) {
      const remaining = maxCount - wrong.length;
      const alreadyIds = new Set([product.code, ...wrong.map((p) => p.code)]);
      const others = shuffleArray(
        products.filter((p) => !alreadyIds.has(p.code))
      );
      wrong = wrong.concat(others.slice(0, remaining));
    }

    return wrong;
  }

  // --------- Génération des questions ----------
  // QCM : 2 types (nom -> code, code -> nom)
  function generateMcqQuestionFromProduct(product) {
    const type = Math.random() < 0.5 ? "NAME_TO_CODE" : "CODE_TO_NAME";

    const wrongProducts = getWrongProductsFor(product, 3);
    const optionProducts = shuffleArray([product, ...wrongProducts]);

    if (type === "NAME_TO_CODE") {
      const options = optionProducts.map((p) => ({
        label: String(p.code),
        product: p,
      }));

      return {
        mode: "mcq",
        type,
        product,
        questionText: `Quel est le code PLU pour : « ${product.name} » ?`,
        correctAnswer: String(product.code),
        options,
      };
    } else {
      const options = optionProducts.map((p) => ({
        label: p.name,
        product: p,
      }));

      return {
        mode: "mcq",
        type,
        product,
        questionText: `Quel produit correspond au code PLU : ${product.code} ?`,
        correctAnswer: product.name,
        options,
      };
    }
  }

  // Saisie : image -> code
  function generateTypingQuestionFromProduct(product) {
    return {
      mode: "typing",
      type: "IMAGE_TO_CODE",
      product,
      questionText: `Quel est le code PLU pour ce produit ?`,
      correctAnswer: String(product.code),
      options: [],
    };
  }

  // Ici on garantit qu'un produit ne sera utilisé qu'une seule fois par session
  function generateQuestions(count, mode) {
    if (!products.length) return [];

    const maxQuestions = products.length;
    const finalCount = Math.min(count, maxQuestions);

    const shuffledProducts = shuffleArray(products).slice(0, finalCount);

    return shuffledProducts.map((product) => {
      if (mode === "typing") {
        return generateTypingQuestionFromProduct(product);
      }
      return generateMcqQuestionFromProduct(product);
    });
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
    currentQuestion = question;

    if (!question) {
      endQuiz("questions");
      return;
    }

    currentQuestionIndexEl.textContent = currentQuestionIndex + 1;
    totalQuestionsEl.textContent = questions.length;

    questionTextEl.textContent = question.questionText;
    answersContainer.innerHTML = "";

    // Réinitialise affichage
    answersContainer.style.display = "none";
    typingContainer.hidden = true;

    // Image de la question
    if (question.product && question.product.image && questionImageEl) {
      // En QCM : on affiche l'image seulement pour NAME_TO_CODE
      if (question.mode === "mcq" && question.type === "CODE_TO_NAME") {
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

    if (question.mode === "typing") {
      // Mode saisie de code
      typingContainer.hidden = false;
      typingInput.value = "";
      typingInput.classList.remove(
        "typing-input-correct",
        "typing-input-wrong"
      );
      typingInput.focus();
    } else {
      // Mode QCM
      answersContainer.style.display = "grid";
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
  }

  // --------- Gestion des réponses QCM ----------
  function handleMcqAnswer(button, question) {
    if (questionLocked) return;
    questionLocked = true;

    const selectedValue = button.dataset.value;
    const isCorrect = selectedValue === question.correctAnswer;

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

    registerAnswer(question, selectedValue, isCorrect);
  }

  // --------- Gestion des réponses saisie de code ----------
  function handleTypingAnswer() {
    if (questionLocked) return;
    if (!currentQuestion || currentQuestion.mode !== "typing") return;

    const rawValue = typingInput.value.trim();
    if (!rawValue) return; // on ne valide pas si l'utilisateur n'a rien tapé

    questionLocked = true;

    const isCorrect = rawValue === currentQuestion.correctAnswer;

    typingInput.classList.remove("typing-input-correct", "typing-input-wrong");
    typingInput.classList.add(
      isCorrect ? "typing-input-correct" : "typing-input-wrong"
    );

    registerAnswer(currentQuestion, rawValue, isCorrect);
  }

  // --------- Enregistrement commun des réponses ----------
  function registerAnswer(question, userValue, isCorrect) {
    stats.totalAsked += 1;
    if (isCorrect) {
      stats.correct += 1;
    } else {
      stats.errors += 1;
    }

    stats.answersLog.push({
      questionText: question.questionText,
      correctAnswer: question.correctAnswer,
      userAnswer: userValue || "(vide)",
      isCorrect,
    });

    setTimeout(() => {
      if (currentMode === "typing") {
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
    currentQuestion = null;
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
    resultsPanel.hidden = true;

    displayQuestion();
    startTimer(totalSeconds);

    window.scrollTo({ top: quizPanel.offsetTop - 20, behavior: "smooth" });
  });

  restartQuizBtn.addEventListener("click", () => {
    stopTimer();
    resetQuizState();

    quizPanel.hidden = true;
    resultsPanel.hidden = true;

    window.scrollTo({
      top: quizConfigForm.offsetTop - 20,
      behavior: "smooth",
    });
  });

  // Validation au clavier pour le mode "saisie du code"
  typingInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleTypingAnswer();
    }
  });
});
