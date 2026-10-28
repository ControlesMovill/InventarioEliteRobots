import { auth, db, authApi, firestoreApi } from './firebase-init.js';

const { onAuthStateChanged, signInWithEmailAndPassword, signOut } = authApi;
const { doc, getDoc } = firestoreApi;

const gate = document.getElementById('authGate');
const form = document.getElementById('loginForm');
const emailInput = document.getElementById('loginEmail');
const passwordInput = document.getElementById('loginPassword');
const loginButton = document.getElementById('loginButton');
const message = document.getElementById('authMessage');
const logoutButton = document.getElementById('logoutButton');
const emailBadge = document.getElementById('authUserEmail');
const roleBadge = document.getElementById('authUserRole');

function showMessage(text) {
  message.textContent = text;
  message.classList.remove('hidden');
}
function clearMessage() {
  message.textContent = '';
  message.classList.add('hidden');
}
function showGate() {
  gate.classList.remove('hidden');
  logoutButton.classList.add('hidden');
}
function showApp(user, profile) {
  gate.classList.add('hidden');
  logoutButton.classList.remove('hidden');
  emailBadge.textContent = profile.nombre || user.email || 'Usuario';
  roleBadge.textContent = `Rol: ${profile.rol}`;
  document.body.dataset.userRole = profile.rol;
  document.body.dataset.userUid = user.uid;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearMessage();
  loginButton.disabled = true;
  loginButton.textContent = 'Verificando acceso…';
  try {
    await signInWithEmailAndPassword(auth, emailInput.value.trim(), passwordInput.value);
    // onAuthStateChanged valida el perfil y muestra la aplicación.
  } catch (error) {
    const messages = {
      'auth/invalid-credential': 'Correo o contraseña incorrectos.',
      'auth/invalid-email': 'El formato del correo no es válido.',
      'auth/too-many-requests': 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
      'auth/network-request-failed': 'No se pudo conectar. Revisa tu conexión a internet.'
    };
    showMessage(messages[error.code] || `No se pudo iniciar sesión (${error.code || 'error'}).`);
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = 'Iniciar sesión';
  }
});

logoutButton.addEventListener('click', async () => {
  logoutButton.disabled = true;
  try {
    await signOut(auth);
  } catch (error) {
    showMessage('No se pudo cerrar la sesión. Inténtalo de nuevo.');
  } finally {
    logoutButton.disabled = false;
  }
});

onAuthStateChanged(auth, async (user) => {
  clearMessage();
  if (!user) {
    showGate();
    return;
  }
  gate.classList.remove('hidden');
  loginButton.disabled = true;
  loginButton.textContent = 'Validando permisos…';
  try {
    const profileRef = doc(db, 'usuarios', user.uid);
    const profileSnapshot = await getDoc(profileRef);
    if (!profileSnapshot.exists()) {
      await signOut(auth);
      showGate();
      showMessage('Tu cuenta inició sesión, pero no tiene perfil en Firestore. Crea el documento usuarios/' + user.uid + ' con los campos nombre, correo y rol.');
      return;
    }
    const profile = profileSnapshot.data();
    if (!['admin', 'editor', 'viewer'].includes(profile.rol)) {
      await signOut(auth);
      showGate();
      showMessage('Tu perfil tiene un rol no válido. En el campo rol utiliza admin, editor o viewer.');
      return;
    }
    showApp(user, profile);
  } catch (error) {
    await signOut(auth).catch(() => {});
    showGate();
    showMessage('No se pudieron validar tus permisos en Firestore. Verifica que exista usuarios/' + user.uid + ' y que las reglas permitan leer tu propio perfil. Detalle: ' + (error.code || error.message || 'error desconocido'));
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = 'Iniciar sesión';
  }
});
