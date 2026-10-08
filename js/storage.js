// Persistent app data: one versioned JSON document in localStorage.
//
// {
//   version: 1,
//   activeProfileId: string | null,
//   profiles: [{
//     id, name, avatar, mode: 'kids' | 'adult', layoutId, createdAt, updatedAt,
//     settings: { sound: boolean, theme: 'auto' | 'light' | 'dark' },
//     medals: { [medalId]: ISO date earned },
//     progress: { [layoutId]: object }   // one course progress per layout (see course.js)
//   }]
// }
//
// The key is namespaced because on GitHub Pages every repo of a user shares one origin.
// To change the shape: bump SCHEMA_VERSION and add MIGRATIONS[oldVersion].

import { getLayout, defaultLayoutId } from './layouts/index.js';

export const STORAGE_KEY = 'mecanografia';
export const SCHEMA_VERSION = 2;

// MIGRATIONS[n] turns a version-n document into a version-(n + 1) one.
const MIGRATIONS = {
  // v2: per-profile settings (sound, theme) and medals.
  1: (document) => ({
    ...document,
    version: 2,
    profiles: (document.profiles ?? []).map((profile) => ({ ...profile, settings: defaultSettings(), medals: {} })),
  }),
};

const MODES = ['kids', 'adult'];
const THEMES = ['auto', 'light', 'dark'];

export function defaultSettings() {
  return { sound: false, theme: 'auto' };
}
const NAME_MAX_LENGTH = 30;
const BACKUP_APP = 'mecanografia';
const BACKUP_TYPE = 'backup';

export class BackupError extends Error {
  /** @param {'not-json' | 'not-backup' | 'newer-version'} reason */
  constructor(reason) {
    super(`Invalid backup: ${reason}`);
    this.reason = reason;
  }
}

export function emptyData() {
  return { version: SCHEMA_VERSION, activeProfileId: null, profiles: [] };
}

/**
 * @param backend  object with getItem/setItem (localStorage), or null to keep data in memory
 */
export function createStore(backend = browserStorage()) {
  let canSave = true;
  let data = load();

  function load() {
    const raw = safely(() => backend?.getItem(STORAGE_KEY)) ?? null;
    if (raw === null) return emptyData();
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      safely(() => backend.setItem(`${STORAGE_KEY}.corrupt`, raw));
      console.error('Datos guardados dañados: se apartaron en', `${STORAGE_KEY}.corrupt`);
      return emptyData();
    }
    if (parsed?.version > SCHEMA_VERSION) {
      // Written by a newer version of the app: use it read-only rather than destroy it.
      canSave = false;
      return normalize({ ...parsed, version: SCHEMA_VERSION });
    }
    return normalize(upgrade(parsed));
  }

  function save() {
    if (!canSave || !backend) return;
    safely(() => backend.setItem(STORAGE_KEY, JSON.stringify(data)));
  }

  return {
    get persistent() {
      return Boolean(backend);
    },
    get canSave() {
      return canSave;
    },
    /** A copy of the current data. */
    read() {
      return structuredClone(data);
    },
    /** Applies a change to a copy of the data, normalizes it and saves it. */
    write(mutate) {
      const next = structuredClone(data);
      mutate(next);
      data = normalize(next);
      save();
      return structuredClone(data);
    },
    /** Replaces everything (used when importing a backup). */
    replaceAll(newData) {
      data = normalize(upgrade(structuredClone(newData)));
      save();
    },
  };
}

export function serializeBackup(data, exportedAt = new Date()) {
  return JSON.stringify(
    { app: BACKUP_APP, type: BACKUP_TYPE, exportedAt: exportedAt.toISOString(), data },
    null,
    2,
  );
}

/** Parses a backup file's text into app data (upgraded and normalized). Throws BackupError. */
export function parseBackup(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new BackupError('not-json');
  }
  if (parsed?.app !== BACKUP_APP || parsed.type !== BACKUP_TYPE || typeof parsed.data !== 'object') {
    throw new BackupError('not-backup');
  }
  if (parsed.data?.version > SCHEMA_VERSION) throw new BackupError('newer-version');
  return normalize(upgrade(parsed.data));
}

function upgrade(document) {
  let current = document && typeof document === 'object' ? document : emptyData();
  let version = Number.isInteger(current.version) ? current.version : SCHEMA_VERSION;
  while (version < SCHEMA_VERSION) {
    current = MIGRATIONS[version](current);
    version += 1;
  }
  return current;
}

// Makes any (possibly hand-edited or imported) document safe to use.
function normalize(document) {
  const profiles = (Array.isArray(document.profiles) ? document.profiles : [])
    .map(normalizeProfile)
    .filter(Boolean);
  const activeExists = profiles.some((profile) => profile.id === document.activeProfileId);
  return {
    version: SCHEMA_VERSION,
    activeProfileId: activeExists ? document.activeProfileId : null,
    profiles,
  };
}

function normalizeProfile(profile) {
  if (!profile || typeof profile !== 'object') return null;
  const name = typeof profile.name === 'string' ? profile.name.trim().slice(0, NAME_MAX_LENGTH) : '';
  if (typeof profile.id !== 'string' || !profile.id || !name) return null;
  const progress = profile.progress && typeof profile.progress === 'object' ? profile.progress : {};
  return {
    id: profile.id,
    name,
    avatar: typeof profile.avatar === 'string' && profile.avatar ? profile.avatar : '🙂',
    mode: MODES.includes(profile.mode) ? profile.mode : 'adult',
    layoutId: getLayout(profile.layoutId) ? profile.layoutId : defaultLayoutId,
    createdAt: typeof profile.createdAt === 'string' ? profile.createdAt : new Date(0).toISOString(),
    updatedAt: typeof profile.updatedAt === 'string' ? profile.updatedAt : new Date(0).toISOString(),
    settings: normalizeSettings(profile.settings),
    medals: Object.fromEntries(
      Object.entries(isObject(profile.medals) ? profile.medals : {}).filter(([, date]) => typeof date === 'string'),
    ),
    progress,
  };
}

function normalizeSettings(settings) {
  const defaults = defaultSettings();
  if (!isObject(settings)) return defaults;
  return {
    sound: typeof settings.sound === 'boolean' ? settings.sound : defaults.sound,
    theme: THEMES.includes(settings.theme) ? settings.theme : defaults.theme,
  };
}

const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

function browserStorage() {
  try {
    const storage = globalThis.localStorage;
    const probe = `${STORAGE_KEY}.probe`;
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return storage;
  } catch {
    return null; // private mode, blocked site data, or not a browser
  }
}

function safely(action) {
  try {
    return action();
  } catch (error) {
    console.error('No se pudo acceder al almacenamiento local', error);
    return undefined;
  }
}
