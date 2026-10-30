// 本地数据层：IndexedDB。所有数据仅存本机，不上云。
// 存储：plants（植物档案）、waterings（浇水记录）、checkins（打卡/成长）、settings（设置/缓存）

const DB_NAME = 'plantcare';
const DB_VERSION = 1;

let _db = null;

export function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('plants')) {
        db.createObjectStore('plants', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('waterings')) {
        const s = db.createObjectStore('waterings', { keyPath: 'id' });
        s.createIndex('plantId', 'plantId', { unique: false });
      }
      if (!db.objectStoreNames.contains('checkins')) {
        const s = db.createObjectStore('checkins', { keyPath: 'id' });
        s.createIndex('plantId', 'plantId', { unique: false });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };
    req.onsuccess = () => { _db = req.result; resolve(_db); };
    req.onerror = () => reject(req.error);
  });
}

function tx(store, mode = 'readonly') {
  return openDB().then((db) => db.transaction(store, mode).objectStore(store));
}

function reqToPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getAll(store) {
  return tx(store).then((s) => reqToPromise(s.getAll()));
}

function get(store, id) {
  return tx(store).then((s) => reqToPromise(s.get(id)));
}

function put(store, value) {
  return tx(store, 'readwrite').then((s) => reqToPromise(s.put(value))).then(() => value);
}

function del(store, id) {
  return tx(store, 'readwrite').then((s) => reqToPromise(s.delete(id)));
}

// ---------- 植物 ----------
export const plants = {
  all: () => getAll('plants'),
  get: (id) => get('plants', id),
  add: (p) => {
    p.id = p.id || ('p_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7));
    p.createdAt = p.createdAt || new Date().toISOString();
    return put('plants', p);
  },
  update: (p) => put('plants', p),
  remove: (id) =>
    openDB().then(async (db) => {
      const t = db.transaction(['plants', 'waterings', 'checkins'], 'readwrite');
      t.objectStore('plants').delete(id);
      // 删除关联记录
      const wi = t.objectStore('waterings').index('plantId');
      const ci = t.objectStore('checkins').index('plantId');
      await new Promise((res) => { const r = wi.openCursor(IDBKeyRange.only(id)); r.onsuccess = (e) => { const c = e.target.result; if (c) { c.delete(); c.continue(); } else res(); }; });
      await new Promise((res) => { const r = ci.openCursor(IDBKeyRange.only(id)); r.onsuccess = (e) => { const c = e.target.result; if (c) { c.delete(); c.continue(); } else res(); }; });
      return true;
    }),
};

// ---------- 浇水记录 ----------
export const waterings = {
  all: () => getAll('waterings'),
  byPlant: (plantId) =>
    tx('waterings').then((s) => reqToPromise(s.index('plantId').getAll(IDBKeyRange.only(plantId)))),
  add: (w) => {
    w.id = w.id || ('w_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7));
    return put('waterings', w);
  },
  remove: (id) => del('waterings', id),
};

// ---------- 打卡 / 成长记录 ----------
export const checkins = {
  all: () => getAll('checkins'),
  byPlant: (plantId) =>
    tx('checkins').then((s) => reqToPromise(s.index('plantId').getAll(IDBKeyRange.only(plantId)))),
  add: (c) => {
    c.id = c.id || ('c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7));
    c.date = c.date || new Date().toISOString();
    return put('checkins', c);
  },
  remove: (id) => del('checkins', id),
};

// ---------- 设置 ----------
export const settings = {
  get: async (key) => { const r = await get('settings', key); return r ? r.value : null; },
  set: (key, value) => put('settings', { key, value }),
};
