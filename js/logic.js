/* Logika murni (tanpa DOM) agar bisa diuji di Node.js. */
(function (root) {
  'use strict';
  const RANK = { high: 0, medium: 1, low: 2 };
  const pad = n => String(n).padStart(2, '0');

  // Kunci tanggal LOKAL "YYYY-MM-DD" (bukan toISOString yang memakai UTC).
  function dateKey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  // Parse lokal: new Date('2026-10-19') akan dibaca UTC, jadi dihindari.
  function parseKey(k) { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); }

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  function validateTitle(raw) {
    const v = String(raw == null ? '' : raw).trim();
    if (!v) return { ok: false, error: 'Judul tugas tidak boleh kosong.' };
    if (v.length > 80) return { ok: false, error: 'Judul maksimal 80 karakter.' };
    return { ok: true, value: v };
  }

  function calcProgress(tasks) {
    const total = tasks.length;
    const done = tasks.filter(t => t.done).length;
    return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
  }

  function isOverdue(task, now) {
    return !task.done && !!task.deadline && task.deadline < dateKey(now);
  }

  function toggleTask(task, now) {
    const done = !task.done;
    return Object.assign({}, task, { done, completedOn: done ? dateKey(now) : null });
  }

  function sortTasks(tasks) {
    return tasks.slice().sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (RANK[a.priority] !== RANK[b.priority]) return RANK[a.priority] - RANK[b.priority];
      if (a.deadline && b.deadline) return a.deadline < b.deadline ? -1 : a.deadline > b.deadline ? 1 : 0;
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return 0;
    });
  }

  function filterTasks(tasks, filter, now) {
    if (filter === 'active') return tasks.filter(t => !t.done);
    if (filter === 'done') return tasks.filter(t => t.done);
    if (filter === 'overdue') return tasks.filter(t => isOverdue(t, now));
    return tasks.slice();
  }

  // Senin–Minggu untuk minggu yang memuat tanggal ref.
  function weekDays(ref) {
    const y = ref.getFullYear(), m = ref.getMonth(), d = ref.getDate() - ((ref.getDay() + 6) % 7);
    return Array.from({ length: 7 }, (_, i) => dateKey(new Date(y, m, d + i)));
  }

  function weeklyCounts(tasks, ref) {
    const days = weekDays(ref);
    return { days, counts: days.map(k => tasks.filter(t => t.done && t.completedOn === k).length) };
  }

  // Sel kalender; null = sel kosong sebelum tanggal 1. Minggu dimulai Senin.
  function buildMonth(year, month, tasks) {
    const offset = (new Date(year, month, 1).getDay() + 6) % 7;
    const total = new Date(year, month + 1, 0).getDate();
    const cells = Array(offset).fill(null);
    for (let day = 1; day <= total; day++) {
      const key = year + '-' + pad(month + 1) + '-' + pad(day);
      const onDay = tasks.filter(t => t.deadline === key);
      cells.push({ day, key, count: onDay.length, pending: onDay.filter(t => !t.done).length });
    }
    return cells;
  }

  function greeting(hour) {
    if (hour < 11) return 'Selamat pagi';
    if (hour < 15) return 'Selamat siang';
    if (hour < 18) return 'Selamat sore';
    return 'Selamat malam';
  }

  const api = { dateKey, parseKey, uid, validateTitle, calcProgress, isOverdue, toggleTask,
                sortTasks, filterTasks, weekDays, weeklyCounts, buildMonth, greeting };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.UTask = Object.assign(root.UTask || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
