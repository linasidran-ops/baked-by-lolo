// قاعدة بيانات وهمية في الذاكرة تحاكي claude.use('db') و claude.use('user') للاختبار
(() => {
  const store = {}, subs = [];
  const P = new URLSearchParams(location.search);
  const ROLE = P.get('role') || 'customer';            // customer | owner
  const UID = ROLE === 'owner' ? 'u_owner' : (P.get('uid') || 'u_cust1');
  const clone = o => JSON.parse(JSON.stringify(o));
  const snapDoc = (path) => ({ id: path.split('/').pop(), exists: path in store, data: () => store[path] ? clone(store[path]) : undefined, metadata: { fromCache: false, hasPendingWrites: false } });
  const inColl = (c, p) => p.startsWith(c + '/') && p.split('/').length === c.split('/').length + 1;
  const snapColl = (c) => { const docs = Object.keys(store).filter(p => inColl(c, p)).sort().map(snapDoc); return { docs, size: docs.length, empty: !docs.length, docChanges: () => [], metadata: { fromCache: false } }; };
  const notify = () => subs.forEach(s => setTimeout(() => s.kind === 'doc' ? s.next(snapDoc(s.path)) : s.next(snapColl(s.path)), 0));
  const merge = (a, b) => { for (const k in b) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
  const doc = (path) => ({ id: path.split('/').pop(), path,
    get: async () => snapDoc(path),
    set: async (d) => { store[path] = clone(d); notify(); },
    update: async (d) => { if (!(path in store)) throw { code: 'invalid_argument' }; merge(store[path], clone(d)); notify(); },
    delete: async () => { delete store[path]; notify(); },
    onSnapshot: (next) => { subs.push({ kind: 'doc', path, next }); setTimeout(() => next(snapDoc(path)), 0); return () => {}; },
    collection: (c) => coll(path + '/' + c) });
  const coll = (path) => ({ path, doc: (id) => doc(path + '/' + (id || Math.random().toString(36).slice(2))),
    get: async () => snapColl(path),
    onSnapshot: (next) => { subs.push({ kind: 'coll', path, next }); setTimeout(() => next(snapColl(path)), 0); return () => {}; },
    where() { return this; }, orderBy() { return this; }, limit() { return this; } });
  const db = { doc, collection: coll };
  const user = { id: async () => UID, canEdit: async () => ROLE === 'owner', isOwner: async () => ROLE === 'owner', profiles: async (ids) => Object.fromEntries(ids.map(i => [i, { name: i === 'u_cust1' ? 'زبونة تجريبية' : '' }])) };
  window.__store = store;
  window.__seed = (obj) => { Object.assign(store, clone(obj)); notify(); };
  window.claude = { use: async (n) => n === 'db' ? db : n === 'user' ? user : null };
})();
