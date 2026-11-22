# Historial de cambios — GenTest Practica

## [1.1.0] — 2026-11-22
- Gestión de preguntas por banco: búsqueda, paginación, edición, activación/desactivación.
- Gestión básica de temas: alta, renombrado y eliminación solo de temas vacíos.
- Exportación de banco a Excel.
- Detección de duplicados por enunciado normalizado durante la importación Excel, tanto en archivo como en banco.
- Eliminación segura de bancos vacíos.
- Sin migraciones SQL nuevas. Conserva historial de respuestas al desactivar preguntas.
- Limitación deliberada: no se permite renombrar un tema con preguntas desde esta interfaz sin una operación transaccional; no se borran preguntas con historial.
- Pruebas: comprobación sintáctica local; pendiente validación con Supabase real.

# Historial de cambios — GenTest Practica

Se adopta [SemVer](https://semver.org/lang/es/) desde la versión **1.0.0**.

## [1.0.0] — 2026-11-22

**Primera versión base oficial.** Consolidación documental y renumeración de la entrega previamente identificada como **v1.9**. No se incorporan nuevas funcionalidades ni cambios de esquema respecto a dicha entrega.

### Funcionalidades incluidas en la línea base
- Registro con datos personales obligatorios y acceso sujeto a aprobación administrativa.
- Panel administrativo: centro de control, usuarios, bancos de preguntas y laboratorio de pruebas.
- Acceso del administrador a la interfaz de alumno y retorno al panel, con modo demostración sin registrar respuestas.
- Fichas de alumnos, permisos por banco y estadísticas administrativas.
- Importación de preguntas desde Excel y bancos/temas.
- Práctica de test, repaso espaciado, errores pendientes, historial y estadísticas del estudiante.
- Centro de control con tareas pendientes, actividad de siete días y alertas académicas.

### Historial anterior (nombres de entrega, no SemVer)
- **v1.9:** centro de control administrativo y alertas académicas (SQL histórico v7).
- **v1.8:** registro con datos personales obligatorios (SQL histórico v6).
- **v1.7:** eliminación de «Vista alumno» redundante y acceso como alumno en demostración.
- **v1.6:** navegación de regreso desde alumno a administrador (SQL histórico sin cambios).
- **v1.5:** listado y ficha de usuarios, fecha de último inicio de sesión (SQL histórico v5).
- **v1.4:** ampliación de perfiles y estadísticas administrativas (SQL histórico v4).
- **v1.3 y anteriores:** estabilización de autenticación, bancos, práctica y repasos; SQL inicial y ampliaciones históricas.

> Las denominaciones anteriores documentan la secuencia de entregas, no una serie SemVer retroactiva. La numeración SQL v1–v7 es independiente de la versión de la aplicación.

## Política para próximas entregas
- **1.0.1**: arreglo compatible sin función nueva.
- **1.1.0**: función nueva compatible con la versión actual.
- **2.0.0**: cambio incompatible.

Cada entrega deberá registrar fecha, cambios, archivos afectados, migraciones SQL requeridas, compatibilidad y pruebas realizadas. No se declarará una prueba en producción como realizada si no se ha ejecutado.
