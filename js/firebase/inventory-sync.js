import { db, firestoreApi } from './firebase-init.js';
const { collection, doc, onSnapshot, setDoc, addDoc, deleteDoc } = firestoreApi;
let unsubscribe = null;
let loaded = false;
let canEdit = false;
let confirmedRobots = new Map();
let saveQueue = Promise.resolve();
const bridge = () => window.__movillInventoryBridge;
const today = () => new Date().toISOString().slice(0,10);

function startRobotFeed() {
  if (unsubscribe) return;
  loaded = false;
  const grid = document.getElementById('robotsGrid');
  if (grid) grid.innerHTML = '<div class="col-span-full text-center py-12 text-sm text-gray-400">Cargando inventario desde Firestore…</div>';
  unsubscribe = onSnapshot(collection(db, 'robots'), snap => {
    const rows = snap.docs.map(d => ({ ...d.data(), id: d.id }));
    confirmedRobots = new Map(rows.map(r => [String(r.id), JSON.stringify(r)]));
    bridge()?.setRobots(rows);
    loaded = true;
  }, err => {
    console.error('Firestore robots:', err);
    if (grid) grid.innerHTML = '<div class="col-span-full text-center py-12 text-sm text-rose-400">No se pudo cargar el inventario desde Firestore. Revisa permisos de la colección robots.</div>';
    alert('Error cargando robots desde Firestore: ' + (err.code || err.message));
  });
}
window.addEventListener('movill:authenticated', e => {
  const role = String(e.detail?.profile?.rol || e.detail?.profile?.Rol || '').toLowerCase();
  canEdit = role === 'admin' || role === 'editor';
  startRobotFeed();
});
window.addEventListener('movill:unauthenticated', () => {
  if (unsubscribe) unsubscribe();
  unsubscribe = null; loaded = false; canEdit = false; confirmedRobots.clear();
  bridge()?.setRobots([]);
});


// Las acciones de trazabilidad, garantías y demos del HTML original también
// pueden modificar timeline/reviews de un cobot y llamar saveData(). Persistimos
// esos cambios puntuales en el documento del robot correspondiente.
window.addEventListener('movill:inventory-changed', event => {
  if (!loaded || !canEdit) return;
  const robots = Array.isArray(event.detail?.robots) ? event.detail.robots : [];
  const current = new Map(robots.map(r => [String(r.id), r]));
  const writes = [];
  for (const [id, robot] of current) {
    const serialized = JSON.stringify(robot);
    if (confirmedRobots.get(id) !== serialized) {
      const payload = { ...robot }; delete payload.id;
      writes.push(setDoc(doc(db, 'robots', id), payload, { merge: true }));
    }
  }
  for (const id of confirmedRobots.keys()) {
    if (!current.has(id)) writes.push(deleteDoc(doc(db, 'robots', id)));
  }
  if (!writes.length) return;
  saveQueue = saveQueue.then(() => Promise.all(writes)).catch(err => {
    console.error('No se pudo guardar la actualización del robot:', err);
    alert('No se pudo guardar la actualización del cobot en Firestore: ' + (err.code || err.message));
  });
});

// Reemplaza únicamente las operaciones de guardar/eliminar; el modal, checklist,
// selectores, render, QR, fotos y trazabilidad siguen siendo los del HTML original.
window.saveRobot = async function(e) {
  e.preventDefault();
  if (!loaded) return alert('Espera a que termine de cargar el inventario desde Firestore.');
  if (!canEdit) return alert('Tu usuario tiene permisos de solo lectura.');
  const d = bridge()?.getData();
  const id = document.getElementById('robotId').value.trim();
  const model = document.getElementById('robotModel').value.trim();
  const sn = document.getElementById('robotSn').value.trim();
  const seriesCode = document.getElementById('robotSeriesCode').value;
  const status = document.getElementById('robotStatus').value;
  const mfgDate = document.getElementById('robotMfgDate').value;
  const arrivalDate = document.getElementById('robotArrivalDate').value;
  const invoice = document.getElementById('robotInvoice').value.trim();
  const location = document.getElementById('robotLocation').value.trim();
  const notes = document.getElementById('robotNotes').value.trim();
  const checklist = bridge().checklist();
  if (!model || !sn || !location) return alert('Completa modelo, número de serie y ubicación.');
  const existing = id ? d.robots.find(r => r.id === id) : null;
  const photos = [...(existing?.photos || []), ...(await bridge().processFiles(document.getElementById('robotPhotoFiles')))];
  const timeline = [...(existing?.timeline || [])];
  if (!existing) timeline.push({ date: arrivalDate || today(), text: `Ingreso de equipo a inventario en ${location}`, author: 'Sistema' });
  else if ((existing.location || '') !== location) timeline.push({ date: today(), text: `Movimiento de ubicación a: ${location}`, author: 'Sistema' });
  const payload = { model, sn, seriesCode, status, mfgDate, arrivalDate, invoice, location, testChecklist: checklist, photos, notes, reviews: existing?.reviews || [], timeline };
  try {
    if (id) await setDoc(doc(db, 'robots', id), payload, { merge: true });
    else await addDoc(collection(db, 'robots'), payload);
    bridge().closeRobotModal();
  } catch (err) {
    console.error('Guardado robot:', err);
    alert('No se pudo guardar el robot en Firestore: ' + (err.code || err.message));
  }
};
window.deleteRobot = async function(id) {
  if (!loaded) return alert('Espera a que termine de cargar el inventario.');
  if (!canEdit) return alert('Tu usuario tiene permisos de solo lectura.');
  if (!confirm('¿Eliminar elemento?')) return;
  try { await deleteDoc(doc(db, 'robots', id)); }
  catch (err) { alert('No se pudo eliminar el cobot: ' + (err.code || err.message)); }
};
