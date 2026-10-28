# Esquema propuesto de Firestore — Movill Inventario

## Principios
- El `id` de un documento será el identificador estable usado por la aplicación.
- El número de serie normalizado (`snNormalized`) será único por robot; la unicidad se debe validar con transacción/ID determinista en el código, no solo con reglas.
- Fechas de negocio pueden conservar `YYYY-MM-DD`; los campos técnicos de auditoría usan `createdAt` / `updatedAt` como `serverTimestamp()`.
- Los archivos se almacenan en Firebase Storage. Firestore guarda metadatos y rutas, no cadenas base64.
- No guardar secretos ni claves de administración en el frontend.
- La interfaz actual incluye Proyectos/Tareas además de inventario, por eso también se incluyen esas colecciones.

## Colecciones y campos sugeridos

### `robots/{robotId}`
`sn`, `snNormalized`, `model`, `seriesCode`, `status`, `invoice`, `location`,
`mfgDate`, `arrivalDate`, `testChecklist[]`, `notes`, `reviews[]`, `createdAt`,
`updatedAt`, `createdBy`, `updatedBy`, `deletedAt` (baja lógica opcional).

`photos[]` se reemplazará por referencias de archivos como:
`[{name, storagePath, contentType, size, uploadedAt, uploadedBy}]`.

### `demos/{demoId}`
`robotId`, `robotSn`, `item`, `company`, `dateOut`, `dateReturn`, `status`,
`engineer`, `notes`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`,
`closedAt`, `closedBy`. Las devoluciones deben actualizar el préstamo y el robot
de forma atómica y agregar un movimiento.

### `warranties/{warrantyId}`
`caseNumber`, `robotId`, `robotSn`, `reporter`, `status`, `date`, `priority`,
`reason`, `notes`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`.
Archivos en Storage; no base64 en el documento.

### `movements/{movementId}` (historial)
`robotId`, `robotSn`, `type`, `fromLocation`, `toLocation`, `fromStatus`,
`toStatus`, `relatedCollection`, `relatedId`, `note`, `actorUid`, `actorName`,
`createdAt`. Solo crear; no editar ni borrar desde la aplicación.

### `auditLogs/{logId}`
`entityType`, `entityId`, `action`, `changedFields`, `actorUid`, `actorName`,
`createdAt`. Solo crear; lectura limitada a administradores.

### `projects/{projectId}`
`name`, `logo`, `desc`, `assignees[]`, `createdAt`, `updatedAt`.

### `folders/{folderId}`
`projectId`, `name`, `location`, `collapsed`, `createdAt`, `updatedAt`.

### `tasks/{taskId}`
`folderId`, `title`, `status`, `color`, `assignees[]`, `robotIds[]`, `desc`,
`attachments[]`, `comments[]`, `createdAt`, `updatedAt`.

### Catálogos
- `engineers/{engineerId}`: `name`, `active`, `createdAt`, `updatedAt`.
- `series/{seriesId}`: `code`, `name`, `desc`.
- `statuses/{statusId}`: `name`, `color`, `scope`.
- `demoStatuses/{statusId}`: `name`, `active`.
- `warrantyStatuses/{statusId}`: `name`, `active`.

### `usuarios/{uid}`
`nombre`, `correo`, `rol` (`admin`, `editor`, `viewer`). El ID del documento debe ser exactamente el UID del usuario en Firebase Authentication. El usuario no puede asignarse su propio rol.
Crear el primer documento de administrador manualmente en Firebase Console después de crear el usuario en Authentication.

## Reglas de relación e integridad que se implementarán en el servicio
1. No permitir dos robots con el mismo S/N normalizado.
2. Una devolución debe cerrar el préstamo, actualizar ubicación/estado del robot y
   registrar el movimiento dentro de una transacción.
3. Una garantía debe referenciar un robot existente; cambios de estado registran
   movimiento/auditoría.
4. Los borrados de robots y operaciones históricas deben ser bajas lógicas o
   acciones administrativas explícitas, no borrado silencioso.
5. No guardar imágenes/documentos como Data URL/base64 en Firestore.
