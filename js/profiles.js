// Profile operations on top of the store: list, create, edit, delete, active profile and
// per-layout progress.

import { createStore, defaultSettings } from './storage.js';
import { getLayout } from './layouts/index.js';
import { HAND_SKINS, HAND_PLACEMENTS } from './hand-skins.js';

export const AVATARS = ['🦊', '🐼', '🐸', '🦁', '🐙', '🦄', '🐢', '🐧', '🐱', '🐶', '🦉', '🐝', '🚀', '⚽', '🎸', '🌵'];
export const MODES = ['kids', 'adult'];
export const THEMES = ['auto', 'light', 'dark'];
const NAME_MAX_LENGTH = 30;

export class ProfileError extends Error {
  /** @param {'name-empty' | 'name-taken' | 'invalid' | 'not-found'} reason */
  constructor(reason) {
    super(`Profile error: ${reason}`);
    this.reason = reason;
  }
}

export function createProfileService(store, { now = () => new Date(), newId = randomId } = {}) {
  const listeners = new Set();

  const notify = () => listeners.forEach((listener) => listener());
  const find = (data, id) => data.profiles.find((profile) => profile.id === id);

  function validate(data, fields, ownId = null) {
    const name = String(fields.name ?? '').trim().slice(0, NAME_MAX_LENGTH);
    if (!name) throw new ProfileError('name-empty');
    const taken = data.profiles.some(
      (profile) => profile.id !== ownId && profile.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
    );
    if (taken) throw new ProfileError('name-taken');
    if (!MODES.includes(fields.mode) || !getLayout(fields.layoutId) || !fields.avatar) {
      throw new ProfileError('invalid');
    }
    return { name, avatar: fields.avatar, mode: fields.mode, layoutId: fields.layoutId };
  }

  function change(mutate) {
    let result;
    store.write((data) => {
      result = mutate(data);
    });
    notify();
    return result;
  }

  return {
    list: () => store.read().profiles,
    get: (id) => find(store.read(), id) ?? null,
    active() {
      const data = store.read();
      return find(data, data.activeProfileId) ?? null;
    },

    /** Creates a profile and makes it the active one. */
    create(fields) {
      return change((data) => {
        const timestamp = now().toISOString();
        const profile = {
          id: newId(),
          ...validate(data, fields),
          createdAt: timestamp,
          updatedAt: timestamp,
          settings: defaultSettings(),
          medals: {},
          progress: {},
        };
        data.profiles.push(profile);
        data.activeProfileId = profile.id;
        return structuredClone(profile);
      });
    },

    update(id, changes) {
      return change((data) => {
        const profile = find(data, id);
        if (!profile) throw new ProfileError('not-found');
        Object.assign(profile, validate(data, { ...profile, ...changes }, id), {
          updatedAt: now().toISOString(),
        });
        return structuredClone(profile);
      });
    },

    remove(id) {
      change((data) => {
        data.profiles = data.profiles.filter((profile) => profile.id !== id);
        if (data.activeProfileId === id) data.activeProfileId = null;
      });
    },

    setActive(id) {
      change((data) => {
        data.activeProfileId = id && find(data, id) ? id : null;
      });
    },

    /** settings: partial { sound, voice, theme, hands, handsPlacement }. */
    updateSettings(id, settings) {
      const valid =
        (settings.sound === undefined || typeof settings.sound === 'boolean') &&
        (settings.voice === undefined || typeof settings.voice === 'boolean') &&
        (settings.theme === undefined || THEMES.includes(settings.theme)) &&
        (settings.hands === undefined || HAND_SKINS.some(({ id: skinId }) => skinId === settings.hands)) &&
        (settings.handsPlacement === undefined || HAND_PLACEMENTS.includes(settings.handsPlacement));
      if (!valid) throw new ProfileError('invalid');
      return change((data) => {
        const profile = find(data, id);
        if (!profile) throw new ProfileError('not-found');
        profile.settings = { ...profile.settings, ...settings };
        return structuredClone(profile.settings);
      });
    },

    /** Records medals as earned on `date`; medals already earned keep their first date. */
    awardMedals(id, medalIds, date) {
      change((data) => {
        const profile = find(data, id);
        if (!profile) throw new ProfileError('not-found');
        for (const medalId of medalIds) profile.medals[medalId] ??= date;
      });
    },

    progressFor(id, layoutId) {
      return this.get(id)?.progress[layoutId] ?? {};
    },

    saveProgress(id, layoutId, progress) {
      change((data) => {
        const profile = find(data, id);
        if (!profile) throw new ProfileError('not-found');
        profile.progress[layoutId] = progress;
      });
    },

    /** Replaces all profiles with the data from a backup (already parsed and validated). */
    replaceAll(data) {
      store.replaceAll(data);
      notify();
    },

    exportData: () => store.read(),
    get persistent() {
      return store.persistent;
    },
    get canSave() {
      return store.canSave;
    },

    onChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

function randomId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

// App-wide instance backed by localStorage.
export const profiles = createProfileService(createStore());
