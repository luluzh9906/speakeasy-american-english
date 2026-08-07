const DATA = {
  daily: { scene: '咖啡店点单', title: '来一杯你喜欢的咖啡', phrase: 'Could I get a latte, please?', meaning: '我想要一杯拿铁，谢谢。', hint: '用 Could I get… 礼貌而自然地点单。' },
  scenes: [
    { id:'coffee', icon:'☕', name:'咖啡店点单', level:'入门 · 5 分钟', phrase:'Could I get a latte, please?', meaning:'我想要一杯拿铁，谢谢。' },
    { id:'intro', icon:'👋', name:'认识新朋友', level:'入门 · 6 分钟', phrase:'What do you do for fun?', meaning:'你平时喜欢做什么？' },
    { id:'travel', icon:'✈️', name:'机场与旅行', level:'初级 · 7 分钟', phrase:'Where is the boarding gate?', meaning:'登机口在哪里？' },
    { id:'work', icon:'💬', name:'工作日沟通', level:'初级 · 8 分钟', phrase:'Could you walk me through it?', meaning:'你能带我过一遍吗？' }
  ]
};
const storageKey = 'speakeasy-progress-v1';
let state = loadState();
let current = DATA.daily;
let recognition;

function loadState() { try { return JSON.parse(localStorage.getItem(storageKey)) || { completed:[], phrases:[], lastDay:null, streak:0 }; } catch { return { completed:[], phrases:[], lastDay:null, streak:0 }; } }
function saveState() { localStorage.setItem(storageKey, JSON.stringify(state)); renderProgress(); renderHome(); }
function localDay() { return new Date().toLocaleDateString('en-CA'); }
function showToast(message) { const t=document.querySelector('#toast'); t.textContent=message; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2500); }
function speak(text) { if (!('speechSynthesis' in window)) return showToast('此浏览器暂不支持朗读功能'); speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text); u.lang='en-US'; u.rate=.85; speechSynthesis.speak(u); }
function renderHome() {
  document.querySelector('#streak-count').textContent=state.streak;
  document.querySelector('#daily-summary').textContent=`学会在${DATA.daily.scene}自然地表达。`;
  document.querySelector('#scene-preview').innerHTML=DATA.scenes.slice(0,4).map(s=>`<button class="scene-tile" type="button" data-scene="${s.id}"><span class="scene-icon">${s.icon}</span><strong>${s.name}</strong><span>${s.level}</span></button>`).join('');
  document.querySelector('#expression-card').innerHTML=`<p class="english">${DATA.daily.phrase}</p><p class="meaning">${DATA.daily.meaning}</p><p class="example">“Could I get an iced latte?”</p>`;
}
function renderScenes() { document.querySelector('#scene-list').innerHTML=DATA.scenes.map(s=>`<button type="button" class="scene-row" data-scene="${s.id}"><span class="scene-icon">${s.icon}</span><span><strong>${s.name}</strong><p>${s.level}</p></span><span>→</span></button>`).join(''); }
function showView(name) { document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${name}`)); document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.nav===name)); const titles={home:'开始说美语',scenes:'练习情境',progress:'学习记录'}; document.querySelector('#page-title').textContent=titles[name]||'开口练习'; if(name==='progress') renderProgress(); window.scrollTo({top:0,behavior:'smooth'}); }
function beginPractice(scene) { current=scene; showView('practice'); renderPractice(); }
function renderPractice(result='') { document.querySelector('#practice-content').innerHTML=`<article class="practice-card"><p class="practice-step">TODAY · 01 / 01</p><h2>${current.scene || current.name}</h2><p class="instruction">先听一遍，然后按住麦克风跟读。说错也没关系，重点是把声音发出来。</p><div class="target-phrase"><strong>${current.phrase}</strong><span>${current.meaning}</span></div><div class="practice-actions"><button type="button" class="outline-button" data-action="speak-current">🔊 听发音</button><button type="button" class="record-button" data-action="record">🎙️ 跟读</button></div>${result ? `<p class="recognition-result"><strong>你说：</strong>${result}</p>`:''}<div class="practice-actions"><button type="button" class="primary-button" data-action="complete">完成这次练习 →</button></div></article>`; }
function completePractice() { const day=localDay(); if(!state.completed.some(x=>x.day===day && x.phrase===current.phrase)) { const yesterday=new Date(Date.now()-86400000).toLocaleDateString('en-CA'); state.streak=state.lastDay===day?state.streak:(state.lastDay===yesterday?state.streak+1:1); state.lastDay=day; state.completed.unshift({ day, scene:current.scene||current.name, phrase:current.phrase }); if(!state.phrases.includes(current.phrase)) state.phrases.push(current.phrase); saveState(); } document.querySelector('#practice-content').innerHTML=`<article class="practice-card completion"><div class="big-mark">✓</div><p class="practice-step">NICE WORK</p><h2>你完成了今天的练习！</h2><p class="instruction">连续 ${state.streak} 天开口。明天再来，让表达变成习惯。</p><button class="primary-button" type="button" data-nav="home">回到首页</button></article>`; }
function renderProgress() { document.querySelector('#stat-practices').textContent=state.completed.length; document.querySelector('#stat-minutes').textContent=state.completed.length*5; document.querySelector('#stat-phrases').textContent=state.phrases.length; document.querySelector('#history-list').innerHTML=state.completed.length?state.completed.slice(0,8).map(x=>`<article class="history-item"><p>${x.scene}</p><span>${x.day}<br>${x.phrase}</span></article>`).join(''):'<div class="empty">还没有记录。完成第一次跟读，成长就从这里开始。</div>'; }
function startRecognition(button) { const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR) return showToast('语音识别暂不受此浏览器支持，可先使用听发音练习。'); if(recognition) recognition.stop(); recognition=new SR(); recognition.lang='en-US'; recognition.interimResults=false; recognition.maxAlternatives=1; button.classList.add('listening'); button.textContent='● 正在听…'; recognition.onresult=e=>{ button.classList.remove('listening'); renderPractice(e.results[0][0].transcript); }; recognition.onerror=()=>{ button.classList.remove('listening'); button.textContent='🎙️ 再试一次'; showToast('没有听清，再试一次吧。'); }; recognition.onend=()=>{ button.classList.remove('listening'); if(button.textContent.includes('正在')) button.textContent='🎙️ 跟读'; }; recognition.start(); }
document.addEventListener('click',e=>{ const nav=e.target.closest('[data-nav]'); if(nav) return showView(nav.dataset.nav); const scene=e.target.closest('[data-scene]'); if(scene) return beginPractice(DATA.scenes.find(s=>s.id===scene.dataset.scene)); const action=e.target.closest('[data-action]')?.dataset.action; if(!action) return; if(action==='start-daily') beginPractice(DATA.daily); if(action==='speak-expression') speak(DATA.daily.phrase); if(action==='speak-current') speak(current.phrase); if(action==='record') startRecognition(e.target.closest('button')); if(action==='complete') completePractice(); if(action==='reset-progress') { if(confirm('确定清除这台设备上的学习记录吗？')) { state={completed:[],phrases:[],lastDay:null,streak:0}; saveState(); showToast('学习记录已重置'); } } });
document.querySelector('#today-label').textContent=new Intl.DateTimeFormat('en-US',{weekday:'long',month:'short',day:'numeric'}).format(new Date()).toUpperCase();
renderHome(); renderScenes(); renderProgress();
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
