
import { db, firestoreApi } from './firebase-init.js';

const { doc, getDoc, setDoc, onSnapshot } = firestoreApi;
const inventoryRef = doc(db, 'inventarios', 'principal');

let applyingRemoteData = false;
let creatingInitialDocument = false;
let saveQueue = Promise.resolve();

async function initializeInventory() {
    try {
        const current = await getDoc(inventoryRef);

        if (!current.exists()) {
            creatingInitialDocument = true;

            const emptyData = window.__getDefaultInventoryData();

            await setDoc(inventoryRef, emptyData);
            creatingInitialDocument = false;
        }

        onSnapshot(
            inventoryRef,
            (snapshot) => {
                if (!snapshot.exists()) return;

                applyingRemoteData = true;

                try {
                    window.__replaceInventoryData(snapshot.data());
                } finally {
                    applyingRemoteData = false;
                }
            },
            (error) => {
                console.error('Error de sincronización Firestore:', error);
                alert(
                    'No se pudo sincronizar el inventario con Firebase. ' +
                    'Revisa la consola del navegador.'
                );
            }
        );
    } catch (error) {
        creatingInitialDocument = false;
        console.error('Error inicializando inventario:', error);
        alert(
            'No se pudo inicializar el inventario en Firestore. ' +
            'No cargues datos reales hasta resolver el error.'
        );
    }
}

window.addEventListener('movill:inventory-changed', (event) => {
    if (applyingRemoteData || creatingInitialDocument) return;

    const data = event.detail;

    saveQueue = saveQueue
        .then(() => setDoc(inventoryRef, data))
        .catch((error) => {
            console.error('Error guardando en Firestore:', error);
            alert(
                'El cambio no se pudo guardar en la nube. ' +
                'Revisa la conexión y los permisos de Firestore.'
            );
        });
});

initializeInventory();
