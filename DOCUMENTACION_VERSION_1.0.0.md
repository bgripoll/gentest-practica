# Ficha técnica y funcional — GenTest Practica 1.0.0

**Corte documental:** 22/11/2026. **Origen del código:** entrega modular denominada v1.9. **Versión oficial de referencia:** 1.0.0.  
**Repositorio previsto:** https://github.com/bgripoll/gentest-practica  
**Web prevista:** https://bgripoll.github.io/gentest-practica/  
**Base de datos:** Supabase (PostgreSQL y Supabase Auth).  
**Alcance de la comprobación:** inventario elaborado mediante inspección del código local de la entrega v1.9; no constituye certificación de pruebas de extremo a extremo en producción.

## 1. Finalidad y roles
Aplicación web para preparar exámenes tipo test. Roles **administrador** y **estudiante**. El administrador gestiona accesos, bancos y seguimiento; el estudiante practica y consulta su evolución. Los resultados no constituyen exámenes oficiales supervisados.

## 2. Registro, autenticación y autorización
- Alta con nombre, apellidos, DNI/NIE, fecha de nacimiento, teléfono, correo, contraseña y confirmación.
- Comprobación de obligatoriedad y patrón formal DNI/NIE en interfaz; **no consta verificación matemática de la letra de control**.
- Supabase Auth gestiona credenciales y sesiones. Se requiere aprobación del administrador y permisos por banco para el uso normal.
- El correo aparece como no editable desde la ficha administrativa. La modificación de contraseña no forma parte de esa ficha.
- Los datos personales exigen tratamiento conforme a normativa de protección de datos; el inventario no acredita cumplimiento jurídico integral.

## 3. Funciones de administración
- **Centro de control:** solicitudes pendientes, estudiantes sin banco, bancos no publicados; actividad de últimos 7 días (estudiantes activos, test completados, respuestas y repasos); temas con menor acierto y preguntas con más errores.
- Umbrales de alertas: temas con **al menos 10 respuestas** y preguntas con **al menos 5**. Estadísticas académicas excluyen perfiles administradores.
- **Usuarios:** listado ordenado, email, fecha de último inicio de sesión (no equivale a última actividad); ficha con datos, bancos autorizados y estadísticas; aprobación/bloqueo y edición de campos permitidos.
- **Bancos:** creación, publicación, permisos, informes e importación desde hojas de cálculo. La importación no deduplica automáticamente.
- **Pruebas:** laboratorio con test de 5, 10 o 20 preguntas sin registro estadístico.
- **Acceder como alumno:** permite revisar interfaz de estudiante y regresar a administración; el modo de demostración no persiste resultados.

## 4. Funciones de estudiante
- Selección de bancos y temas autorizados; práctica tipo test con cuatro alternativas y explicación cuando existe.
- Sesiones, respuestas y estadísticas de progreso; apartados de repaso, errores pendientes y estadísticas.
- Repaso espaciado según la lógica de progreso implantada: error reinicia racha de aciertos consecutivos; tras aciertos sucesivos se programan intervalos de 3 días, 15 días y 1 mes, respectivamente.
- Visualización de aciertos, errores, historial y evolución, sujeta a la disponibilidad de datos registrados.

## 5. Arquitectura y componentes
- Sitio estático con `index.html`, `css/styles.css` y JavaScript clásico modularizado en `js/` (no utiliza empaquetador ni framework).
- Orden de scripts: `core.js`, `data.js`, `student-ui.js`, `statistics.js`, `admin-users-legacy.js`, `practice.js`, `admin.js`, `imports.js`, `events.js`, `bootstrap.js`.
- Dependencias cargadas desde CDN: Supabase JS v2 y SheetJS XLSX 0.18.5.
- Hosting previsto: GitHub Pages. Persistencia: Supabase.
- El cliente contiene identificador público de proyecto y clave publicable de Supabase; la protección de datos depende de las políticas de acceso en el servidor, no del secreto de esa clave.

## 6. Modelo de datos (visión general)
- `profiles`: cuenta, rol, autorización y datos personales.
- `banks`, `bank_topics`, `user_bank_access`: organización y permisos.
- `questions`: banco, tema, enunciado, cuatro opciones, respuesta correcta y explicación.
- `test_sessions`, `answers`: sesiones y respuestas.
- `question_progress`: seguimiento de errores y repaso espaciado.
- Funciones administrativas: `admin_user_stats`, `admin_bank_report`, `admin_user_last_signins`, `admin_dashboard_overview`, entre otras de soporte.
- RLS y comprobaciones de administrador en funciones de servidor forman parte de la arquitectura prevista; su auditoría completa queda pendiente.

## 7. Evolución de SQL
Migraciones históricas de base de datos identificadas hasta **v7**, independientes del SemVer de la aplicación. La v7 incorpora `admin_dashboard_overview`. La v6 incorpora persistencia de datos personales de registro; la v5, último inicio de sesión; la v4, campos de perfil e informes; la v3, progreso de repaso. Las migraciones anteriores constituyen la base inicial y los bancos. **No se necesita SQL nuevo para declarar 1.0.0**. El paquete incluye una copia de la última migración por trazabilidad, no como instrucción para ejecutarla de nuevo.

## 8. Seguridad, limitaciones y comprobaciones pendientes
- No se ha realizado en esta entrega una auditoría independiente de seguridad, privacidad ni accesibilidad.
- No se ha verificado desde este entorno el despliegue público ni el estado de las migraciones ejecutadas en Supabase.
- El último acceso administrativo refleja `last_sign_in_at`, no un seguimiento de actividad continua.
- La carga de Excel requiere revisión humana y no evita duplicados automáticamente.
- La disponibilidad del centro de control académico depende de la función SQL v7 y de los permisos correctos.
- Antes de declarar una versión «estable» se recomienda prueba real de registro, autorización, asignación de banco, práctica, repaso, estadísticas y acceso administrador/alumno.

## 9. Convenciones a partir de esta línea base
- Número canónico en `VERSION`, con formato `MAJOR.MINOR.PATCH`.
- Actualizar `CHANGELOG.md` en cada entrega, con cambios y fecha.
- En correcciones compatibles incrementar PATCH; en funcionalidades compatibles incrementar MINOR; en incompatibilidades incrementar MAJOR.
- Mantener migraciones SQL versionadas **independientemente** y explicar su orden de aplicación.
- No reutilizar un número para entregas distintas. Registrar las pruebas realizadas y los asuntos pendientes.
