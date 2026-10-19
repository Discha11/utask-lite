const assert = require('assert');
const L = require('../js/logic.js');
let pass = 0, fail = 0;
function t(name, fn) {
  try { fn(); pass++; console.log('  ok    ' + name); }
  catch (e) { fail++; console.log('  GAGAL ' + name + '\n        ' + e.message); }
}
const T = o => Object.assign({ id: 'x', title: 't', priority: 'medium', deadline: '', done: false, completedOn: null }, o);
const NOW = new Date(2026, 9, 19, 10, 0); // Senin, 19 Okt 2026 (waktu lokal)
const ids = a => a.map(x => x.id);

console.log('calcProgress');
t('tanpa tugas = 0% (bukan NaN)', () => assert.deepStrictEqual(L.calcProgress([]), { total: 0, done: 0, percent: 0 }));
t('3 dari 4 = 75%', () => assert.strictEqual(L.calcProgress([T({done:true}),T({done:true}),T({done:true}),T()]).percent, 75));
t('1 dari 3 dibulatkan 33%', () => assert.strictEqual(L.calcProgress([T({done:true}),T(),T()]).percent, 33));

console.log('dateKey / parseKey');
t('dateKey memakai tanggal lokal', () => assert.strictEqual(L.dateKey(new Date(2026, 0, 1, 0, 30)), '2026-01-01'));
t('parseKey round-trip', () => assert.strictEqual(L.dateKey(L.parseKey('2026-12-31')), '2026-12-31'));

console.log('isOverdue');
t('lewat tenggat & belum selesai', () => assert.ok(L.isOverdue(T({deadline:'2026-10-18'}), NOW)));
t('tenggat hari ini belum terlambat', () => assert.ok(!L.isOverdue(T({deadline:'2026-10-19'}), NOW)));
t('sudah selesai tidak terlambat', () => assert.ok(!L.isOverdue(T({deadline:'2026-10-01', done:true}), NOW)));
t('tanpa tenggat tidak terlambat', () => assert.ok(!L.isOverdue(T(), NOW)));

console.log('toggleTask');
t('menandai selesai mengisi completedOn', () => { const r = L.toggleTask(T(), NOW); assert.ok(r.done); assert.strictEqual(r.completedOn, '2026-10-19'); });
t('membatalkan selesai mengosongkan completedOn', () => { const r = L.toggleTask(T({done:true, completedOn:'2026-10-19'}), NOW); assert.ok(!r.done); assert.strictEqual(r.completedOn, null); });
t('tidak mengubah objek asli', () => { const o = T(); L.toggleTask(o, NOW); assert.strictEqual(o.done, false); });

console.log('sortTasks');
t('aktif sebelum selesai', () => assert.deepStrictEqual(ids(L.sortTasks([T({id:'a',done:true}),T({id:'b'})])), ['b','a']));
t('prioritas tinggi lebih dulu', () => assert.deepStrictEqual(ids(L.sortTasks([T({id:'l',priority:'low'}),T({id:'h',priority:'high'})])), ['h','l']));
t('tenggat awal dulu, tanpa tenggat terakhir', () => assert.deepStrictEqual(
  ids(L.sortTasks([T({id:'n'}),T({id:'b',deadline:'2026-11-01'}),T({id:'a',deadline:'2026-10-20'})])), ['a','b','n']));

console.log('filterTasks');
const set = [T({id:'1'}), T({id:'2',done:true}), T({id:'3',deadline:'2026-10-01'})];
t('active', () => assert.strictEqual(L.filterTasks(set,'active',NOW).length, 2));
t('done', () => assert.strictEqual(L.filterTasks(set,'done',NOW).length, 1));
t('overdue', () => assert.deepStrictEqual(ids(L.filterTasks(set,'overdue',NOW)), ['3']));
t('all', () => assert.strictEqual(L.filterTasks(set,'all',NOW).length, 3));

console.log('weekDays / weeklyCounts');
t('minggu dimulai Senin', () => { const d = L.weekDays(NOW); assert.strictEqual(d[0], '2026-10-19'); assert.strictEqual(d[6], '2026-10-25'); });
t('hari Minggu masuk minggu yang sama', () => assert.strictEqual(L.weekDays(new Date(2026, 9, 25))[0], '2026-10-19'));
t('pergantian bulan (29 Okt -> 1 Nov)', () => { const d = L.weekDays(new Date(2026, 9, 29)); assert.strictEqual(d[0], '2026-10-26'); assert.strictEqual(d[6], '2026-11-01'); });
t('menghitung selesai per hari', () => {
  const r = L.weeklyCounts([T({done:true,completedOn:'2026-10-19'}),T({done:true,completedOn:'2026-10-19'}),
    T({done:true,completedOn:'2026-10-21'}),T({done:true,completedOn:'2026-09-01'})], NOW);
  assert.deepStrictEqual(r.counts, [2,0,1,0,0,0,0]);
});

console.log('buildMonth');
t('Okt 2026 mulai Kamis -> 3 sel kosong, 31 hari', () => { const c = L.buildMonth(2026, 9, []); assert.strictEqual(c.filter(x => x === null).length, 3); assert.strictEqual(c.filter(Boolean).length, 31); });
t('Feb 2028 (kabisat) 29 hari', () => assert.strictEqual(L.buildMonth(2028, 1, []).filter(Boolean).length, 29));
t('menandai tenggat dan jumlah pending', () => {
  const c = L.buildMonth(2026, 9, [T({deadline:'2026-10-19'}), T({deadline:'2026-10-19', done:true})]).filter(Boolean)[18];
  assert.strictEqual(c.key, '2026-10-19'); assert.strictEqual(c.count, 2); assert.strictEqual(c.pending, 1);
});

console.log('validateTitle / greeting');
t('judul kosong ditolak', () => assert.ok(!L.validateTitle('   ').ok));
t('judul > 80 ditolak', () => assert.ok(!L.validateTitle('a'.repeat(81)).ok));
t('judul dipangkas spasi', () => assert.strictEqual(L.validateTitle('  Belajar  ').value, 'Belajar'));
t('sapaan sesuai jam', () => assert.deepStrictEqual([5,12,16,20].map(L.greeting), ['Selamat pagi','Selamat siang','Selamat sore','Selamat malam']));

console.log('\n' + (fail ? fail + ' gagal, ' : 'Semua ') + pass + ' kasus uji lulus.');
process.exit(fail ? 1 : 0);
