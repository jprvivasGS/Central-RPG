// Armazenamento local (localStorage) com CRUD, duplicar, exportar e importar.
// Coleções: characters, campaigns, entities (npc/enemy/map/puzzle). Mais um "kv" para ferramentas.
const P = 'mesa-central:v1:';
export const COLS = ['characters', 'campaigns', 'entities'];
const mem = {};

const load = (k, def) => {
  try { const raw = localStorage.getItem(P + k); if (raw != null) return JSON.parse(raw); } catch (e) { /* ignora */ }
  return mem[k] ?? def;
};
const persist = (k, v) => {
  mem[k] = v;
  try { localStorage.setItem(P + k, JSON.stringify(v)); return true; }
  catch (e) { window.dispatchEvent(new CustomEvent('storage-error')); return false; }
};

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const clone = (o) => JSON.parse(JSON.stringify(o));

export const list = (col, pred) => load(col, []).filter(pred || (() => true)).sort((a, b) => b.updatedAt - a.updatedAt);
export const get = (col, id) => load(col, []).find((x) => x.id === id) || null;

export function save(col, item) {
  const all = load(col, []);
  const now = Date.now();
  if (!item.id) { item.id = uid(); item.createdAt = now; }
  item.updatedAt = now;
  const i = all.findIndex((x) => x.id === item.id);
  if (i >= 0) all[i] = item; else all.push(item);
  persist(col, all);
  return item;
}

export function remove(col, id) {
  persist(col, load(col, []).filter((x) => x.id !== id));
  if (col === 'campaigns') persist('entities', load('entities', []).filter((e) => e.campaignId !== id));
}

export function duplicate(col, id) {
  const src = get(col, id);
  if (!src) return null;
  const c = clone(src);
  delete c.id;
  c.name = (c.name || 'Sem nome') + ' (cópia)';
  if (c.data && 'nome' in c.data) c.data.nome = c.name;
  return save(col, c);
}

export const getKV = (k, def) => (load('kv', {})[k] ?? def);
export function setKV(k, v) { const kv = load('kv', {}); kv[k] = v; persist('kv', kv); }

export function exportData(only) {
  const collections = {};
  for (const c of COLS) collections[c] = only?.[c] ? load(c, []).filter((x) => only[c].includes(x.id)) : load(c, []);
  return { app: 'mesa-central', version: 1, exportedAt: new Date().toISOString(), collections, kv: only ? {} : load('kv', {}) };
}

export function importData(obj) {
  if (!obj || obj.app !== 'mesa-central' || !obj.collections) throw new Error('Arquivo não é um backup da Mesa Central.');
  const stats = { added: 0, updated: 0, skipped: 0 };
  for (const c of COLS) {
    const all = load(c, []);
    for (const it of obj.collections[c] || []) {
      const i = all.findIndex((x) => x.id === it.id);
      if (i < 0) { all.push(it); stats.added++; }
      else if ((it.updatedAt || 0) > (all[i].updatedAt || 0)) { all[i] = it; stats.updated++; }
      else stats.skipped++;
    }
    persist(c, all);
  }
  if (obj.kv) persist('kv', { ...load('kv', {}), ...obj.kv });
  return stats;
}

export function usageBytes() {
  let n = 0;
  try { for (const k of Object.keys(localStorage)) if (k.startsWith(P)) n += (localStorage.getItem(k) || '').length * 2; } catch (e) { /* ignora */ }
  return n;
}

export function wipe() {
  for (const c of [...COLS, 'kv']) persist(c, c === 'kv' ? {} : []);
}
