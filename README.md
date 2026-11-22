# GenTest Practica — versión modular

Reorganización del `index.html` existente, sin cambios en las tablas ni en los datos de Supabase.

## Publicación

Sube **todo el contenido de esta carpeta** a la raíz del repositorio de GitHub Pages, conservando las carpetas `css/` y `js/`. No subas solamente `index.html`.

## Archivos

- `index.html`: estructura HTML y carga de scripts.
- `css/styles.css`: estilos.
- `js/core.js`: configuración, estado compartido y utilidades.
- `js/data.js`: sesión y consultas de datos.
- `js/student-ui.js`: selección de bancos y vista principal.
- `js/statistics.js`: estadísticas y pestañas del alumno.
- `js/admin-users-legacy.js`: función antigua de pendientes conservada por compatibilidad.
- `js/practice.js`: selección, respuestas, repasos y finalización de test.
- `js/admin.js`: panel de administración.
- `js/imports.js`: importación Excel y pruebas de administrador.
- `js/events.js`: controladores de botones y formularios.
- `js/bootstrap.js`: arranque de la aplicación.

## Nota técnica

Es una **primera separación conservadora** del JavaScript original en scripts clásicos ordenados para mantener las variables compartidas. No son todavía módulos ES con `import`/`export`. Se prioriza no cambiar el comportamiento existente; la migración a módulos ES puede realizarse después, con pruebas de integración.

## Pruebas de regresión recomendadas

Acceso, registro, aprobación de usuario, importación Excel, práctica por tema, repaso de errores, estadísticas, pruebas de administrador y cierre de sesión.

**No almacenes claves privadas de Supabase en este repositorio.** La clave publicable de cliente ya existente permanece en el navegador; la seguridad depende de las políticas RLS de Supabase.


## v1.4 Administración
Ejecutar primero actualizacion_supabase_admin_v4.sql. Luego publicar todos los archivos. El correo es de solo lectura: modificar auth.users requiere un flujo seguro de administración. Las estadísticas por banco se obtienen con RPC restringida a administradores.
