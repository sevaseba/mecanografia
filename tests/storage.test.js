import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  STORAGE_KEY,
  SCHEMA_VERSION,
  createStore,
  serializeBackup,
  parseBackup,
  BackupError,
} from '../js/storage.js';

function memoryBackend(initial = {}) {
  const items = new Map(Object.entries(initial));
  return {
    getItem: (key) => (items.has(key) ? items.get(key) : null),
    setItem: (key, value) => items.set(key, String(value)),
    removeItem: (key) => items.delete(key),
    items,
  };
}

const profile = (overrides = {}) => ({
  id: 'p1',
  name: 'Sofi',
  avatar: '🦊',
  mode: 'kids',
  layoutId: 'es-latam',
  createdAt: '2026-10-08T00:00:00.000Z',
  updatedAt: '2026-10-08T00:00:00.000Z',
  progress: {},
  ...overrides,
});

test('starts empty when nothing is stored', () => {
  const store = createStore(memoryBackend());
  assert.deepEqual(store.read(), { version: SCHEMA_VERSION, activeProfileId: null, profiles: [] });
});

test('writes and reads back a document under its key', () => {
  const backend = memoryBackend();
  const store = createStore(backend);
  store.write((data) => {
    data.profiles.push(profile());
    data.activeProfileId = 'p1';
  });
  const saved = JSON.parse(backend.items.get(STORAGE_KEY));
  assert.equal(saved.version, SCHEMA_VERSION);
  assert.equal(saved.profiles[0].name, 'Sofi');
  assert.equal(createStore(backend).read().activeProfileId, 'p1');
});

test('read returns a copy that cannot corrupt the store', () => {
  const store = createStore(memoryBackend());
  store.read().profiles.push(profile());
  assert.equal(store.read().profiles.length, 0);
});

test('normalizes invalid data: bad profiles dropped, defaults filled, dangling active id cleared', () => {
  const backend = memoryBackend({
    [STORAGE_KEY]: JSON.stringify({
      version: 1,
      activeProfileId: 'missing',
      profiles: [
        profile({ mode: 'robot', layoutId: 'klingon', progress: undefined }),
        { id: 'p2', name: '   ' },
        'nonsense',
      ],
    }),
  });
  const data = createStore(backend).read();
  assert.equal(data.profiles.length, 1);
  assert.equal(data.profiles[0].mode, 'adult');
  assert.equal(data.profiles[0].layoutId, 'es-latam');
  assert.deepEqual(data.profiles[0].progress, {});
  assert.equal(data.activeProfileId, null);
});

test('keeps progress of layouts it does not know (forward compatible)', () => {
  const backend = memoryBackend({
    [STORAGE_KEY]: JSON.stringify({
      version: 1,
      activeProfileId: 'p1',
      profiles: [profile({ progress: { 'es-latam': { a: 1 }, 'fr-fr': { b: 2 } } })],
    }),
  });
  assert.deepEqual(createStore(backend).read().profiles[0].progress, { 'es-latam': { a: 1 }, 'fr-fr': { b: 2 } });
});

test('corrupt JSON is set aside and the app starts empty', () => {
  const backend = memoryBackend({ [STORAGE_KEY]: '{not json' });
  const data = createStore(backend).read();
  assert.equal(data.profiles.length, 0);
  assert.equal(backend.items.get(`${STORAGE_KEY}.corrupt`), '{not json');
});

test('a document from a newer app version is not overwritten', () => {
  const newer = JSON.stringify({ version: SCHEMA_VERSION + 1, profiles: [] });
  const backend = memoryBackend({ [STORAGE_KEY]: newer });
  const store = createStore(backend);
  assert.equal(store.canSave, false);
  store.write((data) => data.profiles.push(profile()));
  assert.equal(backend.items.get(STORAGE_KEY), newer);
});

test('works in memory when localStorage is unavailable', () => {
  const store = createStore(null);
  assert.equal(store.persistent, false);
  store.write((data) => data.profiles.push(profile()));
  assert.equal(store.read().profiles.length, 1);
});

test('backup round trip', () => {
  const data = { version: SCHEMA_VERSION, activeProfileId: 'p1', profiles: [profile()] };
  const text = serializeBackup(data, new Date('2026-10-08T12:00:00Z'));
  const parsed = JSON.parse(text);
  assert.equal(parsed.app, 'mecanografia');
  assert.equal(parsed.type, 'backup');
  assert.equal(parsed.exportedAt, '2026-10-08T12:00:00.000Z');
  assert.deepEqual(parseBackup(text), data);
});

test('rejects files that are not backups, with a reason', () => {
  const reason = (text) => {
    try {
      parseBackup(text);
      return 'accepted';
    } catch (error) {
      assert.ok(error instanceof BackupError);
      return error.reason;
    }
  };
  assert.equal(reason('hola'), 'not-json');
  assert.equal(reason('{"foo": 1}'), 'not-backup');
  assert.equal(reason(JSON.stringify({ app: 'mecanografia', type: 'backup', data: { version: 99, profiles: [] } })), 'newer-version');
});
