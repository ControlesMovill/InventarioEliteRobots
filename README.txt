MOVILL INVENTARIO — LOGIN INTEGRADO AL HTML ORIGINAL

Esta versión integra la pantalla de inicio de sesión directamente en el HTML original de 150 KB, conservando sus módulos y funciones.

CONFIGURACIÓN:
1. Copia firebase/firebase-config.example.js como firebase/firebase-config.js.
2. Pega los valores de configuración web de tu proyecto Firebase en firebase-config.js. Debe exportar: export const firebaseConfig = {...};
3. En Firebase Authentication, habilita Email/Password y crea el usuario.
4. En Firestore, crea usuarios/{UID de Authentication} con campos nombre, correo y rol. El rol debe ser admin, editor o viewer.
5. Sirve esta carpeta por HTTP/HTTPS (por ejemplo, Firebase Hosting o servidor local). No abras index.html con file://.

IMPORTANTE: Esta entrega integra el LOGIN y valida el perfil de usuario en Firestore. Los datos del inventario aún se guardan en localStorage; no hay sincronización multiusuario de inventario todavía. No publiques reglas de Firestore sin revisar las reglas actuales de tu proyecto.
