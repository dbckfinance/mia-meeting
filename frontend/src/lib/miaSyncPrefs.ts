/**
 * Persistent Reikn sync preferences (Tauri store + localStorage fallback).
 */

const STORE_FILE = 'mia-sync.json';
const AUTO_SYNC_KEY = 'auto_sync_reikn';
const CLOUD_IDS_KEY = 'cloud_meeting_ids';
const LS_AUTO = 'mia-meeting-auto-sync';
const LS_IDS = 'mia-meeting-cloud-ids';

async function withStore<T>(fn: (store: {
  get: <V>(key: string) => Promise<V | undefined>;
  set: (key: string, value: unknown) => Promise<void>;
  save: () => Promise<void>;
}) => Promise<T>): Promise<T | null> {
  try {
    const { load } = await import('@tauri-apps/plugin-store');
    const store = await load(STORE_FILE, { defaults: {}, autoSave: true });
    return await fn(store);
  } catch {
    return null;
  }
}

/** Default ON — user stays local only by turning this off. */
export async function getAutoSyncEnabled(): Promise<boolean> {
  const fromStore = await withStore(async (store) => {
    const value = await store.get<boolean>(AUTO_SYNC_KEY);
    return value;
  });
  if (typeof fromStore === 'boolean') return fromStore;
  try {
    const raw = localStorage.getItem(LS_AUTO);
    if (raw === '0') return false;
    if (raw === '1') return true;
  } catch {
    /* ignore */
  }
  return true;
}

export async function setAutoSyncEnabled(enabled: boolean): Promise<void> {
  await withStore(async (store) => {
    await store.set(AUTO_SYNC_KEY, enabled);
    await store.save();
  });
  try {
    localStorage.setItem(LS_AUTO, enabled ? '1' : '0');
  } catch {
    /* ignore */
  }
}

async function loadCloudIds(): Promise<Record<string, string>> {
  const fromStore = await withStore(async (store) => {
    return (await store.get<Record<string, string>>(CLOUD_IDS_KEY)) || {};
  });
  if (fromStore && Object.keys(fromStore).length) return fromStore;
  try {
    const raw = localStorage.getItem(LS_IDS);
    if (raw) return JSON.parse(raw) as Record<string, string>;
  } catch {
    /* ignore */
  }
  return fromStore || {};
}

async function persistCloudIds(ids: Record<string, string>): Promise<void> {
  await withStore(async (store) => {
    await store.set(CLOUD_IDS_KEY, ids);
    await store.save();
  });
  try {
    localStorage.setItem(LS_IDS, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

export async function getCloudMeetingId(localMeetingId: string): Promise<string | null> {
  if (!localMeetingId) return null;
  const ids = await loadCloudIds();
  return ids[localMeetingId] || null;
}

export async function setCloudMeetingId(localMeetingId: string, cloudId: string): Promise<void> {
  if (!localMeetingId || !cloudId) return;
  const ids = await loadCloudIds();
  ids[localMeetingId] = cloudId;
  await persistCloudIds(ids);
}
