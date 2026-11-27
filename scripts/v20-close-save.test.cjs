'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '../source/moyun.single.html'), 'utf8');
const start = source.indexOf('    function handleBeforeUnloadSave() {');
const end = source.indexOf('\n    onUnmounted(() => {', start);
assert.ok(start >= 0 && end > start, 'close handler exists');

function run(options = {}) {
  const calls = [];
  const context = {
    summaryBackfillJob: null, storageLoadFailed: false,
    isGenerating: { value: !!options.generating },
    requestedLibraryWrite: options.requested ?? 4,
    completedLibraryWrite: options.completed ?? 4,
    _lastKnownLibraryRevision: 9, LIBRARY_REVISION_DB_KEY: 'library_v6_revision', CONNECTION_CREDENTIALS_DB_KEY:'credentials', connectionCredentials:{value:{}},
    stopSummaryBackfill: () => calls.push('stop-summary'),
    captureInterruptedDraftFromStream: () => calls.push('capture-draft'),
    syncBookData: () => calls.push('sync'),
    buildLibrarySnapshot: () => { calls.push('build'); calls.push('sync'); return { books: [] }; },
    saveEmergencyBackup: () => calls.push('emergency'),
    DB: { saveLibrary: (...args) => { calls.push(['saveLibrary', ...args]); return Promise.resolve('indexeddb'); } },
    console: { error: (...args) => calls.push(['error', ...args]) }
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end) + '\nhandleBeforeUnloadSave();', context);
  return { calls, context };
}

test('已保存且无生成草稿时关闭不再同步或序列化整库', () => {
  const { calls } = run();
  assert.deepEqual(calls, []);
});

test('有未保存修改时仍写应急备份并推进版本号', () => {
  const { calls, context } = run({ requested: 5, completed: 4 });
  assert.deepEqual(calls.filter(call => typeof call === 'string'), ['build', 'sync', 'emergency']);
  const save=calls.find(Array.isArray);
  assert.equal(save[0],'saveLibrary');assert.equal(save[1].revision,10);assert.equal(save[2],10);assert.equal(save[3],'credentials');
  assert.equal(context._lastKnownLibraryRevision, 10);
});

test('关闭时仍生成中会先抢救草稿再触发应急保存', () => {
  const { calls } = run({ generating: true });
  assert.ok(calls.indexOf('capture-draft') < calls.indexOf('sync'));
  assert.ok(calls.includes('emergency'));
});

test('同步关页兜底包含早期章节编辑草稿及最后三章', () => {
  const saved = new Map();
  const context = { emergencyBackupSequence: 0, localStorage: { setItem:(key,value)=>saved.set(key,value) },
    getEmergencyBackupStorageKey:()=> 'existing-emergency-key', console };
  vm.createContext(context);
  const from = source.indexOf('    function saveEmergencyBackup(');
  const to = source.indexOf('    function clearEmergencyBackup(', from);
  vm.runInContext(source.slice(from,to), context);
  context.saveEmergencyBackup({currentBookId:'book',books:[{id:'book'}],chapters:Array.from({length:6},(_,i)=>({id:'c'+i,content:'正文'+i,...(i===0?{isEditing:true,tempTitle:'改后标题',tempContent:'刚输入的草稿'}:{})}))});
  const backup = JSON.parse(saved.get('existing-emergency-key'));
  assert.deepEqual(backup.chapters.map(ch=>ch.id), ['c0','c3','c4','c5']);
  assert.equal(backup.chapters[0].tempContent, '刚输入的草稿');
  assert.equal(backup.chapters[0].tempTitle, '改后标题');
  assert.equal(backup.chapters[0].storageIndex, 0);
});
