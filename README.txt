MOVILL INVENTARIO - INTERFAZ ORIGINAL + FIREBASE

Esta versión conserva el index.html completo de la interfaz original (formularios, modelos, estatus, checklist, evidencias, trazabilidad, tarjetas, filtros y modales).

Firebase: la colección robots es la fuente de verdad para el inventario de cobots. La lectura inicia después de validar el usuario. Alta, edición y eliminación escriben directamente en robots.

No se modifica ni elimina ningún documento existente en Firestore. No se crea inventarios/principal.

IMPORTANTE: publica en Firebase Console las reglas de firebase/firestore.rules. Sirve el proyecto desde GitHub Pages/Firebase Hosting/servidor web, no con file://. Conserva firebase/firebase-config.js.

Nota: las secciones de proyectos/tareas/demos/garantías mantienen su interfaz original, pero esta integración de sincronización directa corresponde a la colección robots.
