// Minimal offline prototype with localStorage streaks
const $ = (sel)=>document.querySelector(sel);
const welcome = $("#welcome");
const subject = $("#subject");
const quiz = $("#quiz");
const summary = $("#summary");
const qText = $("#qText");
const optionsBox = $("#options");
const nextBtn = $("#nextBtn");
const streakEl = $("#streak");
const pointsEl = $("#points");
const againBtn = $("#againBtn");
const shareBtn = $("#shareBtn");

const streakKey = "learnloop_streak";
const pointsKey = "learnloop_points";

let state = { subject:null, i:0, correct:0, bank:[] };

const BANK = {
  math: [
    {q: "What is 5 + 7?", a: "12", choices:["10","11","12","13"]},
    {q: "If x=3, what is 2x + 4?", a: "10", choices:["8","9","10","12"]},
    {q: "What is the next prime after 7?", a: "11", choices:["9","10","11","12"]},
  ],
  coding: [
    {q: "In HTML, which tag makes the largest heading?", a:"<h1>", choices:["<h6>","<p>","<h1>","<title>"]},
    {q: "In JS, which symbol creates an array?", a:"[]", choices:["{}","()","[]","<>"]},
    {q: "Git command to upload local commits?", a:"git push", choices:["git init","git commit","git push","git add ."]},
  ],
  english: [
    {q: "Choose the correct sentence.", a:"She has been studying.", choices:["She have been studying.","She has been studying.","She has be studying.","She has studying."]},
    {q: "Synonym of 'rapid' is…", a:"fast", choices:["slow","late","fast","short"]},
    {q: "Past tense of 'go' is…", a:"went", choices:["goed","goes","gone","went"]},
  ]
};

function getStreak(){ return parseInt(localStorage.getItem(streakKey)||"0",10); }
function setStreak(v){ localStorage.setItem(streakKey, String(v)); streakEl.textContent = "🔥 Streak: " + v; }
function getPoints(){ return parseInt(localStorage.getItem(pointsKey)||"0",10); }
function setPoints(v){ localStorage.setItem(pointsKey, String(v)); pointsEl.textContent = "⭐ Points: " + v; }

function shuffle(arr){ return arr.map(v=>[Math.random(),v]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]); }

function show(el){ [welcome,subject,quiz,summary].forEach(e=>e.classList.add("hidden")); el.classList.remove("hidden"); }

function start(){
  setStreak(getStreak()); setPoints(getPoints());
  show(subject);
}

function chooseSubject(sub){
  state.subject = sub;
  state.bank = shuffle(BANK[sub].slice());
  state.i = 0; state.correct = 0;
  showQuestion();
  show(quiz);
}

function showQuestion(){
  const item = state.bank[state.i];
  qText.textContent = item.q;
  optionsBox.innerHTML = "";
  shuffle(item.choices.slice()).forEach(choice=>{
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = choice;
    btn.onclick = ()=>pick(choice, item.a, btn);
    optionsBox.appendChild(btn);
  });
  nextBtn.classList.add("hidden");
}

function pick(choice, answer, btn){
  const buttons = [...document.querySelectorAll(".option")];
  buttons.forEach(b => b.disabled = true);
  if(choice === answer){
    btn.classList.add("correct");
    state.correct++;
    setPoints(getPoints()+10);
  } else {
    btn.classList.add("wrong");
    // highlight correct
    buttons.find(b=>b.textContent===answer)?.classList.add("correct");
  }
  nextBtn.classList.remove("hidden");
}

function next(){
  state.i++;
  if(state.i < state.bank.length){
    showQuestion();
  } else {
    // finish
    const total = state.bank.length;
    const pct = Math.round((state.correct/total)*100);
    if(pct >= 67){ setStreak(getStreak()+1); } else { setStreak(0); }
    const msg = `You scored ${state.correct}/${total} (${pct}%). ` +
      (pct>=67 ? "Great! Your daily streak increased. 🔥" : "Keep practicing to build your streak.");
    document.getElementById("summaryText").textContent = msg;
    show(summary);
  }
}

function copyShare(){
  const text = `I just practiced with LearnLoop — AI micro-learning. #SDG4 #1MillionDevs4Africa`;
  navigator.clipboard.writeText(text).then(()=>{
    shareBtn.textContent = "Copied!";
    setTimeout(()=>shareBtn.textContent="Copy share text",1200);
  });
}

// wire UI
document.getElementById("startBtn").onclick = start;
document.querySelectorAll(".chip").forEach(el=> el.onclick = ()=>chooseSubject(el.dataset.subject));
nextBtn.onclick = next;
againBtn.onclick = ()=>{ show(subject); };
shareBtn.onclick = copyShare;

// Initialize
show(welcome);
