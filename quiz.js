// quiz.js
// Gère le déroulement du quiz, le timer, l'affichage des résultats et des corrections.

(function(){
  const questionsPool = (window.PLU_DATA && window.PLU_DATA.questions) || [];
  const startBtn = document.getElementById('start-quiz');
  const numQuestionsSelect = document.getElementById('num-questions');
  const timeInput = document.getElementById('time-per-session');

  const quizArea = document.getElementById('quiz-area');
  const questionArea = document.getElementById('question-area');
  const timerEl = document.getElementById('timer-value');
  const nextBtn = document.getElementById('next-btn');

  const resultArea = document.getElementById('result-area');
  const resultSummary = document.getElementById('result-summary');
  const mistakesDiv = document.getElementById('mistakes');
  const restartBtn = document.getElementById('restart');

  let session = {
    questions: [],
    currentIndex: 0,
    answers: [], // {questionId, selectedIndex, correctIndex}
    totalTime: 90,
    remaining: 90,
    timerId: null,
    running: false,
  };

  // Utility: shuffle
  function shuffle(arr){
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]] = [a[j],a[i]];
    }
    return a;
  }

  // Format mm:ss
  function formatTime(sec){
    const m = Math.floor(sec/60).toString().padStart(2,'0');
    const s = (sec % 60).toString().padStart(2,'0');
    return `${m}:${s}`;
  }

  // Start session
  function startSession(){
    // reset
    const num = parseInt(numQuestionsSelect.value,10) || 10;
    const timeSec = Math.max(10, parseInt(timeInput.value,10) || 90);

    const poolShuffled = shuffle(questionsPool);
    session.questions = poolShuffled.slice(0, num);
    session.currentIndex = 0;
    session.answers = [];
    session.totalTime = timeSec;
    session.remaining = timeSec;
    session.running = true;

    // UI
    resultArea.classList.add('hidden');
    quizArea.classList.remove('hidden');
    quizArea.setAttribute('aria-hidden','false');
    renderQuestion();
    startTimer();
  }

  // Start timer (only once per session)
  function startTimer(){
    stopTimer();
    timerEl.textContent = formatTime(session.remaining);
    session.timerId = setInterval(() => {
      session.remaining -= 1;
      if(session.remaining < 0){
        stopTimer();
        endSession('time');
        return;
      }
      timerEl.textContent = formatTime(session.remaining);
    }, 1000);
  }

  function stopTimer(){
    if(session.timerId) clearInterval(session.timerId);
    session.timerId = null;
  }

  // Render current question
  function renderQuestion(){
    const qObj = session.questions[session.currentIndex];
    if(!qObj) {
      endSession('complete');
      return;
    }

    questionArea.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'question-card';

    const qTitle = document.createElement('div');
    qTitle.innerHTML = `<strong>Question ${session.currentIndex + 1}/${session.questions.length}</strong>`;
    const qText = document.createElement('p');
    qText.textContent = qObj.question;

    container.appendChild(qTitle);
    container.appendChild(qText);

    const choicesList = document.createElement('div');
    choicesList.className = 'choices';

    qObj.choices.forEach((c, i) => {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.style.display = 'block';
      btn.style.margin = '6px 0';
      btn.textContent = c;
      btn.addEventListener('click', () => onSelect(i));
      choicesList.appendChild(btn);
    });

    container.appendChild(choicesList);
    questionArea.appendChild(container);

    // Update next button label
    nextBtn.disabled = true;
    nextBtn.textContent = session.currentIndex < session.questions.length - 1 ? 'Passer (sans répondre)' : 'Terminer';
  }

  // When the user selects an answer
  function onSelect(choiceIndex){
    const q = session.questions[session.currentIndex];
    const record = {
      questionId: q.id,
      questionText: q.question,
      selectedIndex: choiceIndex,
      correctIndex: q.answerIndex,
      choices: q.choices,
      explanation: q.explanation || ''
    };

    // If already answered this question, replace (but we proceed to next)
    const existing = session.answers.find(a=>a.questionId===q.id);
    if(existing){
      Object.assign(existing, record);
    } else {
      session.answers.push(record);
    }

    // Move to next question automatically (do not reset the session.remaining timer)
    if(session.currentIndex < session.questions.length - 1){
      session.currentIndex++;
      renderQuestion();
    } else {
      // last question answered -> end
      endSession('complete');
    }
  }

  // Next button: skip current question (record as unanswered) or finish
  function onNext(){
    // record unanswered as null selected
    const q = session.questions[session.currentIndex];
    const exists = session.answers.find(a=>a.questionId===q.id);
    if(!exists){
      session.answers.push({
        questionId: q.id,
        questionText: q.question,
        selectedIndex: null,
        correctIndex: q.answerIndex,
        choices: q.choices,
        explanation: q.explanation || ''
      });
    }

    if(session.currentIndex < session.questions.length - 1){
      session.currentIndex++;
      renderQuestion();
    } else {
      endSession('complete');
    }
  }

  // End session: reason can be 'time' or 'complete'
  function endSession(reason){
    stopTimer();
    session.running = false;
    quizArea.classList.add('hidden');
    quizArea.setAttribute('aria-hidden','true');
    resultArea.classList.remove('hidden');
    resultArea.setAttribute('aria-hidden','false');

    // Ensure every question has an answer record
    session.questions.forEach(q=>{
      if(!session.answers.find(a=>a.questionId===q.id)){
        session.answers.push({
          questionId: q.id,
          questionText: q.question,
          selectedIndex: null,
          correctIndex: q.answerIndex,
          choices: q.choices,
          explanation: q.explanation || ''
        });
      }
    });

    // Compute score
    let correct = 0;
    const mistakes = [];
    session.answers.forEach(a=>{
      if(a.selectedIndex === a.correctIndex) correct++;
      else mistakes.push(a);
    });

    const total = session.questions.length;
    const percent = Math.round((correct/total)*100);

    resultSummary.innerHTML = `
      <p>Session terminée (${reason === 'time' ? 'Temps écoulé' : 'Questions terminées'}).</p>
      <p>Score : <strong>${correct}/${total}</strong> — <strong>${percent}%</strong></p>
      <p>Temps total alloué : ${formatTime(session.totalTime)} — Temps restant : ${formatTime(Math.max(0, session.remaining))}</p>
    `;

    // Corrections détaillées
    if(mistakes.length){
      mistakesDiv.innerHTML = '<h3>Corrections / Erreurs</h3>';
      const ul = document.createElement('ul');
      mistakes.forEach(m => {
        const li = document.createElement('li');
        const chosen = (m.selectedIndex === null) ? '<em>Pas de réponse</em>' : m.choices[m.selectedIndex];
        const correctAns = m.choices[m.correctIndex];
        li.innerHTML = `<strong>${escapeHtml(m.questionText)}</strong><br/>
                        Ta réponse : ${escapeHtml(chosen)}<br/>
                        Bonne réponse : ${escapeHtml(correctAns)}<br/>
                        ${m.explanation ? '<em>Explication :</em> ' + escapeHtml(m.explanation) : ''}`;
        ul.appendChild(li);
      });
      mistakesDiv.appendChild(ul);
    } else {
      mistakesDiv.innerHTML = `<div style="color:var(--success)"><strong>Bravo — toutes les réponses sont correctes !</strong></div>`;
    }
  }

  // small escape
  function escapeHtml(s='') {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // Restart
  function restart(){
    resultArea.classList.add('hidden');
    startSession();
  }

  // Event wiring
  startBtn.addEventListener('click', startSession);
  nextBtn.addEventListener('click', onNext);
  restartBtn.addEventListener('click', restart);

  // Prevent timer being re-set to 15s anywhere:
  // the code uses session.totalTime and session.remaining only and startTimer uses session.remaining
  // => aucun autre code ne modifie session.remaining sauf le setInterval et stopTimer.

})();
