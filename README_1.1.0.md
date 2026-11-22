# Instalación de GenTest Practica 1.1.0

1. Haz copia del repositorio y de la base de datos Supabase antes de actualizar.
2. Sustituye el contenido publicado en GitHub Pages por los archivos de esta carpeta, conservando la configuración de Supabase existente en `js/core.js`.
3. No es necesaria una migración SQL nueva si ya está instalado el esquema de la versión 1.0.0.
4. Comprueba con un usuario administrador la creación de bancos, importación con duplicados, edición, activación, exportación y despublicación.
5. Comprueba con un usuario alumno que solo accede a bancos autorizados y preguntas activas.

**Importante:** no se ha probado esta entrega contra tu proyecto Supabase real. La detección de duplicados usa el enunciado normalizado, no una comparación semántica de preguntas. Las operaciones de importación siguen siendo por lotes; si falla una inserción parcial, consulta `import_batches` y las preguntas antes de reintentar.
