const questions = [
  {
    id: 'satisfaction',
    type: 'radio',
    label: '全体的な満足度はいかがですか？',
    options: ['非常に満足', '満足', '普通', '不満', '非常に不満'],
  },
  {
    id: 'features',
    type: 'checkbox',
    label: 'よく使う機能を選んでください（複数選択可）',
    options: ['検索', 'お気に入り', '通知', 'レポート', 'チャット', 'ダッシュボード'],
  },
  {
    id: 'rating',
    type: 'stars',
    label: 'デザインの使いやすさを評価してください',
    max: 5,
  },
  {
    id: 'recommend',
    type: 'scale',
    label: '友人や同僚にこのサービスを勧めますか？',
    min: 0,
    max: 10,
    labelMin: '勧めない',
    labelMax: '強く勧める',
  },
  {
    id: 'frequency',
    type: 'radio',
    label: 'どのくらいの頻度でご利用されていますか？',
    options: ['毎日', '週3〜4回', '週1〜2回', '月に数回', 'ほぼ使わない'],
  },
  {
    id: 'feedback',
    type: 'textarea',
    label: 'ご意見・ご要望があればお聞かせください',
    placeholder: '自由にご記入ください（任意）',
  },
];

const answers = {};
let current = 0;

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  el.classList.add('active');
  // force reflow for animation replay
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = '';
}

function updateProgress(step) {
  const pct = (step / (questions.length + 1)) * 100;
  document.getElementById('progressBar').style.width = pct + '%';
}

function startSurvey() {
  current = 0;
  updateProgress(0);
  showScreen('screen-questions');
  renderQuestion();
}

function renderQuestion() {
  const q = questions[current];
  const total = questions.length;

  document.getElementById('questionCounter').textContent = `${current + 1} / ${total}`;
  document.getElementById('btnBack').classList.toggle('hidden', current === 0);
  document.getElementById('btnNext').textContent = current === total - 1 ? '送信 ✓' : '次へ →';

  const wrap = document.getElementById('questionWrap');
  wrap.innerHTML = '';

  const label = document.createElement('div');
  label.className = 'question-label';
  label.textContent = q.label;
  wrap.appendChild(label);

  const saved = answers[q.id];

  if (q.type === 'radio') {
    const opts = document.createElement('div');
    opts.className = 'options';
    q.options.forEach(opt => {
      const item = document.createElement('label');
      item.className = 'option-item' + (saved === opt ? ' selected' : '');
      item.innerHTML = `<input type="radio" name="${q.id}" value="${opt}"${saved === opt ? ' checked' : ''} /><span class="option-dot"></span><span>${opt}</span>`;
      item.querySelector('input').addEventListener('change', () => {
        opts.querySelectorAll('.option-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        answers[q.id] = opt;
      });
      opts.appendChild(item);
    });
    wrap.appendChild(opts);

  } else if (q.type === 'checkbox') {
    const checked = saved || [];
    const opts = document.createElement('div');
    opts.className = 'options';
    q.options.forEach(opt => {
      const item = document.createElement('label');
      item.className = 'option-item' + (checked.includes(opt) ? ' selected' : '');
      item.innerHTML = `<input type="checkbox" name="${q.id}" value="${opt}"${checked.includes(opt) ? ' checked' : ''} /><span class="option-check"></span><span>${opt}</span>`;
      // labelのclickだと入力要素の合成clickと合わせて2回発火し、選択が打ち消されるためchangeを使う
      item.querySelector('input').addEventListener('change', e => {
        item.classList.toggle('selected', e.target.checked);
        const cur = answers[q.id] || [];
        if (e.target.checked) {
          answers[q.id] = [...cur, opt];
        } else {
          answers[q.id] = cur.filter(v => v !== opt);
        }
      });
      opts.appendChild(item);
    });
    wrap.appendChild(opts);

  } else if (q.type === 'stars') {
    const group = document.createElement('div');
    group.className = 'star-group';
    let hovered = saved || 0;
    const stars = [];
    for (let i = 1; i <= q.max; i++) {
      const s = document.createElement('span');
      s.className = 'star' + (i <= hovered ? ' active' : '');
      s.textContent = '★';
      s.dataset.val = i;
      s.addEventListener('mouseenter', () => {
        stars.forEach((st, idx) => st.classList.toggle('active', idx < i));
      });
      s.addEventListener('mouseleave', () => {
        stars.forEach((st, idx) => st.classList.toggle('active', idx < (answers[q.id] || 0)));
      });
      s.addEventListener('click', () => {
        answers[q.id] = i;
        stars.forEach((st, idx) => st.classList.toggle('active', idx < i));
      });
      stars.push(s);
      group.appendChild(s);
    }
    wrap.appendChild(group);

  } else if (q.type === 'scale') {
    const group = document.createElement('div');
    group.className = 'scale-group';
    const btns = [];
    for (let i = q.min; i <= q.max; i++) {
      const b = document.createElement('button');
      b.className = 'scale-btn' + (saved === i ? ' active' : '');
      b.textContent = i;
      b.addEventListener('click', () => {
        btns.forEach(btn => btn.classList.remove('active'));
        b.classList.add('active');
        answers[q.id] = i;
      });
      btns.push(b);
      group.appendChild(b);
    }
    const lbl = document.createElement('div');
    lbl.className = 'scale-labels';
    lbl.innerHTML = `<span>${q.labelMin}</span><span>${q.labelMax}</span>`;
    wrap.appendChild(group);
    wrap.appendChild(lbl);

  } else if (q.type === 'textarea') {
    const ta = document.createElement('textarea');
    ta.className = 'text-input';
    ta.placeholder = q.placeholder || '';
    ta.value = saved || '';
    ta.addEventListener('input', () => { answers[q.id] = ta.value; });
    wrap.appendChild(ta);
  }

  updateProgress(current + 1);
}

function nextQuestion() {
  current++;
  if (current >= questions.length) {
    showResult();
  } else {
    renderQuestion();
  }
}

function prevQuestion() {
  if (current > 0) {
    current--;
    renderQuestion();
  }
}

function showResult() {
  updateProgress(questions.length + 1);
  showScreen('screen-result');

  const summary = document.getElementById('resultSummary');
  summary.innerHTML = '';
  questions.forEach(q => {
    const val = answers[q.id];
    if (!val && val !== 0) return;
    const item = document.createElement('div');
    item.className = 'result-item';
    const display = Array.isArray(val) ? val.join('、') : (q.type === 'stars' ? '★'.repeat(val) : String(val));
    item.innerHTML = `<div class="q">${q.label}</div><div class="a">${display || '（未回答）'}</div>`;
    summary.appendChild(item);
  });
}

function restartSurvey() {
  Object.keys(answers).forEach(k => delete answers[k]);
  updateProgress(0);
  showScreen('screen-welcome');
}
