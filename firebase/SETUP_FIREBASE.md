# Crear el proyecto Firebase para Movill Inventario

Esta carpeta es una plantilla de integración; aún no está conectada a los botones
de la interfaz original.

## 1. Crear proyecto
1. Entra a https://console.firebase.google.com/
2. Selecciona **Crear un proyecto** y usa un nombre interno claro, por ejemplo
   `movill-inventario` (si está disponible).
3. Google Analytics es opcional para esta aplicación; puedes desactivarlo durante
   la configuración inicial.
4. En la vista general del proyecto, agrega una aplicación Web (`</>`).
5. Copia la configuración que muestra Firebase.

## 2. Activar servicios
1. **Authentication → Sign-in method**: habilita Email/Password.
2. **Firestore Database**: crea la base de datos en modo producción y elige la
   región más cercana que cumpla las políticas de tu empresa. La región no se
   puede cambiar fácilmente después.
3. **Storage**: crea el bucket si tu proyecto/plan lo permite.
4. No habilites acceso público y no publiques reglas abiertas.

## 3. Poner la configuración en el código
1. Copia `firebase/firebase-config.example.js` como `firebase/firebase-config.js`.
2. Reemplaza los valores de ejemplo por los valores reales de la aplicación web.
3. No subas contraseñas, service-account keys ni claves privadas al navegador.
   La configuración web identifica la aplicación; las reglas son la barrera real.

## 4. Publicar reglas
Revisa `firestore.rules` y `storage.rules` con el equipo antes de publicar.
Las reglas de este paquete son una base restrictiva para roles `admin`, `editor`
y `viewer`. No publiques las reglas hasta crear el primer usuario administrador:
1. Authentication → agrega el usuario inicial por correo/contraseña.
2. Copia su UID.
3. Firestore → crea `usuarios/{UID}` con estos campos:
   - `nombre`: nombre visible (string)
   - `correo`: correo del usuario (string)
   - `rol`: `admin` (string)
   El ID del documento debe ser exactamente el UID de Authentication.
4. Publica las reglas.

## 5. Pruebas locales
Los módulos ES se deben servir desde un servidor HTTP/HTTPS; no abras el HTML
como `file://`. Para una siguiente etapa podemos usar Firebase Hosting. Mientras
no exista `firebase/firebase-config.js`, la app original sigue funcionando con
`localStorage` y los datos de prueba.

## 6. Importante sobre la app actual
No reemplaces aún el `app.js` ni retires `localStorage`. La integración debe
migrar módulo por módulo y probarse antes de convertir Firestore en la fuente
principal. La interfaz actual usa funciones globales desde `onclick`, así que la
integración debe exponer cuidadosamente las funciones necesarias al `window` o
migrar esos eventos de manera controlada.

## Etapa 3: probar inicio de sesión
Esta versión agrega la pantalla de acceso. Copia el archivo `firebase/firebase-config.js`
que ya configuraste desde tu carpeta anterior. En Firestore debe existir `users/{UID}`
con `email` (string), `displayName` (string), `role` (string: `admin`, `editor` o `viewer`)
y `active` (boolean: `true`). El usuario autenticado solo pasa a la aplicación si el perfil
existe y está activo.

**Alcance:** los datos de inventario todavía se guardan en `localStorage`. No uses esta
etapa como versión multiusuario de producción; la sincronización de colecciones y las
restricciones de edición por rol son el siguiente paso.
