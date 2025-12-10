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
        product, // pour l'image
      };
    } else {
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
        product, // pour l'image
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
      timerDisplay.textContent = formatTime(timerSecondsRemaini
