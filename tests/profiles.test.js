import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../js/storage.js';
import { createProfileService, AVATARS, ProfileError } from '../js/profiles.js';

function service() {
  let counter = 0;
  return createProfileService(createStore(null), {
    now: () => new Date('2026-10-08T12:00:00Z'),
    newId: () => `id${++counter}`,
  });
}

const input = { name: 'Sofi', avatar: AVATARS[0], mode: 'kids', layoutId: 'es-latam' };

test('creates a profile with empty progress and makes it active', () => {
  const profiles = service();
  const created = profiles.create(input);
  assert.equal(created.id, 'id1');
  assert.equal(created.createdAt, '2026-10-08T12:00:00.000Z');
  assert.deepEqual(created.progress, {});
  assert.equal(profiles.active().id, 'id1');
  assert.equal(profiles.list().length, 1);
});

test('trims the name and rejects empty or duplicate names', () => {
  const profiles = service();
  assert.equal(profiles.create({ ...input, name: '  Sofi  ' }).name, 'Sofi');
  assert.throws(() => profiles.create({ ...input, name: '   ' }), (e) => e instanceof ProfileError && e.reason === 'name-empty');
  assert.throws(() => profiles.create({ ...input, name: 'sofi' }), (e) => e.reason === 'name-taken');
});

test('rejects unknown modes and layouts', () => {
  const profiles = service();
  assert.throws(() => profiles.create({ ...input, mode: 'robot' }), (e) => e.reason === 'invalid');
  assert.throws(() => profiles.create({ ...input, layoutId: 'klingon' }), (e) => e.reason === 'invalid');
});

test('updates a profile, keeping its progress', () => {
  const profiles = service();
  const { id } = profiles.create(input);
  profiles.saveProgress(id, 'es-latam', { lessons: 3 });
  const updated = profiles.update(id, { name: 'Sofía', layoutId: 'en-us', mode: 'adult' });
  assert.equal(updated.name, 'Sofía');
  assert.equal(updated.layoutId, 'en-us');
  assert.deepEqual(updated.progress['es-latam'], { lessons: 3 });
  // Renaming to its own name (other case) is not a duplicate.
  assert.equal(profiles.update(id, { name: 'SOFÍA' }).name, 'SOFÍA');
});

test('progress is kept separately for each layout', () => {
  const profiles = service();
  const { id } = profiles.create(input);
  profiles.saveProgress(id, 'es-latam', { done: ['01'] });
  profiles.saveProgress(id, 'en-us', { done: [] });
  assert.deepEqual(profiles.progressFor(id, 'es-latam'), { done: ['01'] });
  assert.deepEqual(profiles.progressFor(id, 'en-us'), { done: [] });
});

test('deleting the active profile clears the active one', () => {
  const profiles = service();
  const first = profiles.create(input);
  const second = profiles.create({ ...input, name: 'Papá', mode: 'adult' });
  assert.equal(profiles.active().id, second.id);
  profiles.remove(second.id);
  assert.equal(profiles.active(), null);
  profiles.setActive(first.id);
  assert.equal(profiles.active().id, first.id);
});

test('notifies listeners on every change', () => {
  const profiles = service();
  let calls = 0;
  profiles.onChange(() => calls++);
  const { id } = profiles.create(input);
  profiles.update(id, { name: 'Sofía' });
  profiles.setActive(null);
  profiles.remove(id);
  assert.equal(calls, 4);
});

test('new profiles start with sound off, automatic theme and no medals', () => {
  const created = service().create(input);
  assert.deepEqual(created.settings, { sound: false, voice: true, theme: 'auto', hands: 'tone-3', handsPlacement: 'below' });
  assert.deepEqual(created.medals, {});
});

test('settings and medals are updated without touching the rest', () => {
  const profiles = service();
  const { id } = profiles.create(input);
  profiles.updateSettings(id, { sound: true });
  profiles.updateSettings(id, { theme: 'dark' });
  profiles.updateSettings(id, { voice: false });
  assert.deepEqual(profiles.get(id).settings, { sound: true, voice: false, theme: 'dark', hands: 'tone-3', handsPlacement: 'below' });
  profiles.awardMedals(id, ['first-lesson'], 'T1');
  profiles.awardMedals(id, ['first-lesson', 'five-lessons'], 'T2'); // already earned keeps its date
  assert.deepEqual(profiles.get(id).medals, { 'first-lesson': 'T1', 'five-lessons': 'T2' });
  assert.throws(() => profiles.updateSettings(id, { theme: 'neon' }), (e) => e.reason === 'invalid');
  assert.throws(() => profiles.updateSettings(id, { voice: 'yes' }), (e) => e.reason === 'invalid');
  assert.throws(() => profiles.updateSettings(id, { hands: 'dragon' }), (e) => e.reason === 'invalid');
  assert.throws(() => profiles.updateSettings(id, { handsPlacement: 'left' }), (e) => e.reason === 'invalid');
  profiles.updateSettings(id, { hands: 'robot', handsPlacement: 'over' });
  assert.equal(profiles.get(id).settings.hands, 'robot');
  assert.equal(profiles.get(id).settings.handsPlacement, 'over');
});
