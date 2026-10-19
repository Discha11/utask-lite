(function () {
  'use strict';
  const U = window.UTask;
  const $ = id => document.getElementById(id);
  const now = new Date();
  const state = {
    tasks: U.Storage.load('tasks', []),
    filter: 'all',
    editingId: null,
    calYear: now.getFullYear(),
    calMonth: now.getMonth()
  };
  if (!Array.isArray(state.tasks)) state.tasks = [];

  const PRIO = { high: 'Tinggi', medium: 'Sedang', low: 'Rendah' };
  const DAY_LABEL = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;   // textContent: aman dari injeksi HTML
    return e;
  }
  const save = () => U.Storage.save('tasks', state.tasks);
  const fmtDate = k => U.parseKey(k).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

  /* ---------- Tema ---------- */
  function applyTheme(t) { document.documentElement.dataset.theme = t; }
  const preferred = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(U.Storage.load('theme', preferred));
  $('themeBtn').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    U.Storage.save('theme', next);
  });

  /* ---------- Render ---------- */
  function renderTop() {
    const d = new Date();
    const p = U.calcProgress(state.tasks);
    const late = state.tasks.filter(t => U.isOverdue(t, d)).length;
    const pending = p.total - p.done;
    $('greetSmall').textContent = U.greeting(d.getHours()) + ' · ' +
      d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
    $('greetInfo').textContent = pending === 0 ? 'Tidak ada tugas yang menunggu.' : 'Ada ' + pending + ' tugas yang belum selesai.';
    $('statTotal').textContent = p.total;
    $('statDone').textContent = p.done;
    $('statLate').textContent = late;
    $('ringText').textContent = p.percent + '%';
    $('ringFg').style.strokeDashoffset = String(251.33 * (1 - p.percent / 100));
    $('ringInfo').textContent = p.total === 0 ? 'Belum ada tugas.' : p.done + ' dari ' + p.total + ' tugas selesai.';
  }

  function renderChart() {
    const { days, counts } = U.weeklyCounts(state.tasks, new Date());
    $('weekTotal').textContent = counts.reduce((a, b) => a + b, 0);
    const W = 320, H = 130, padX = 16, top = 14, base = 100;
    const max = Math.max(1, ...counts);
    const pts = counts.map((c, i) => [padX + i * ((W - 2 * padX) / 6), base - (c / max) * (base - top)]);
    const line = pts.map(p => p.join(',')).join(' ');
    const area = padX + ',' + base + ' ' + line + ' ' + pts[6][0] + ',' + base;
    const today = U.dateKey(new Date());
    let svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="chart" role="img" aria-label="Grafik tugas selesai per hari">' +
      '<polygon points="' + area + '" class="c-area"/><polyline points="' + line + '" class="c-line"/>';
    pts.forEach((p, i) => {
      svg += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (days[i] === today ? 5 : 3) + '" class="c-dot"/>';
      if (counts[i] > 0) svg += '<text x="' + p[0] + '" y="' + (p[1] - 8) + '" text-anchor="middle" class="c-val">' + counts[i] + '</text>';
      svg += '<text x="' + p[0] + '" y="122" text-anchor="middle" class="c-lbl' + (days[i] === today ? ' now' : '') + '">' + DAY_LABEL[i] + '</text>';
    });
    $('chart').innerHTML = svg + '</svg>';   // hanya angka & label tetap, bukan input pengguna
  }

  function renderList() {
    const d = new Date();
    const list = $('list');
    list.textContent = '';
    const items = U.sortTasks(U.filterTasks(state.tasks, state.filter, d));
    if (items.length === 0) {
      list.appendChild(el('li', 'empty', state.tasks.length === 0
        ? 'Belum ada tugas. Isi judul di atas lalu simpan.' : 'Tidak ada tugas pada filter ini.'));
      return;
    }
    items.forEach(t => {
      const li = el('li', 'item' + (t.done ? ' done' : '') + (U.isOverdue(t, d) ? ' late' : ''));
      const cb = el('input'); cb.type = 'checkbox'; cb.checked = t.done;
      cb.setAttribute('aria-label', 'Selesaikan ' + t.title);
      cb.addEventListener('change', () => replace(U.toggleTask(t, new Date())));
      const body = el('div', 'body');
      body.appendChild(el('span', 'ttl', t.title));
      const meta = el('span', 'meta');
      meta.appendChild(el('span', 'tag p-' + t.priority, PRIO[t.priority]));
      if (t.deadline) meta.appendChild(el('span', 'due', (U.isOverdue(t, d) ? 'Terlambat · ' : 'Tenggat ') + fmtDate(t.deadline)));
      body.appendChild(meta);
      const edit = el('button', 'icon', '✎'); edit.type = 'button'; edit.setAttribute('aria-label', 'Ubah ' + t.title);
      edit.addEventListener('click', () => startEdit(t));
      const del = el('button', 'icon', '✕'); del.type = 'button'; del.setAttribute('aria-label', 'Hapus ' + t.title);
      del.addEventListener('click', () => remove(t.id));
      li.append(cb, body, edit, del);
      list.appendChild(li);
    });
  }

  function renderCalendar() {
    $('calTitle').textContent = new Date(state.calYear, state.calMonth, 1)
      .toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    const cal = $('cal');
    cal.textContent = '';
    DAY_LABEL.forEach(l => cal.appendChild(el('span', 'dow', l)));
    const today = U.dateKey(new Date());
    U.buildMonth(state.calYear, state.calMonth, state.tasks).forEach(c => {
      if (!c) { cal.appendChild(el('span')); return; }
      const b = el('button', 'day' + (c.key === today ? ' today' : '') + (c.count ? ' has' : '') + (c.pending ? ' pend' : ''), String(c.day));
      b.type = 'button';
      b.title = c.count ? c.count + ' tugas bertenggat' : '';
      b.addEventListener('click', () => { $('deadline').value = c.key; $('title').focus(); });
      cal.appendChild(b);
    });
  }

  function render() { renderTop(); renderChart(); renderList(); renderCalendar(); }

  /* ---------- Aksi ---------- */
  function replace(task) {
    state.tasks = state.tasks.map(t => t.id === task.id ? task : t);
    save(); render();
  }
  function remove(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    if (state.editingId === id) resetForm();
    save(); render();   // render ulang seluruh tampilan, termasuk grafik & kalender
  }
  function startEdit(t) {
    state.editingId = t.id;
    $('title').value = t.title; $('priority').value = t.priority; $('deadline').value = t.deadline || '';
    $('formTitle').textContent = 'Ubah tugas'; $('submitBtn').textContent = 'Simpan perubahan';
    $('cancelBtn').hidden = false; $('title').focus();
  }
  function resetForm() {
    state.editingId = null; $('taskForm').reset(); $('formError').textContent = '';
    $('formTitle').textContent = 'Tambah tugas'; $('submitBtn').textContent = 'Simpan tugas';
    $('cancelBtn').hidden = true;
  }

  $('taskForm').addEventListener('submit', e => {
    e.preventDefault();
    const v = U.validateTitle($('title').value);
    if (!v.ok) { $('formError').textContent = v.error; $('title').focus(); return; }
    const data = { title: v.value, priority: $('priority').value, deadline: $('deadline').value };
    if (state.editingId) {
      const old = state.tasks.find(t => t.id === state.editingId);
      state.tasks = state.tasks.map(t => t.id === old.id ? Object.assign({}, old, data) : t);
    } else {
      state.tasks.push(Object.assign({ id: U.uid(), done: false, completedOn: null }, data));
    }
    resetForm(); save(); render();
  });
  $('cancelBtn').addEventListener('click', resetForm);

  $('filters').addEventListener('click', e => {
    const f = e.target.dataset && e.target.dataset.f;
    if (!f) return;
    state.filter = f;
    document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.f === f));
    renderList();
  });

  function shiftMonth(n) {
    const d = new Date(state.calYear, state.calMonth + n, 1);
    state.calYear = d.getFullYear(); state.calMonth = d.getMonth();
    renderCalendar();
  }
  $('prevM').addEventListener('click', () => shiftMonth(-1));
  $('nextM').addEventListener('click', () => shiftMonth(1));

  render();
})();
