# GenTest Practica — versión 1.0.0 (línea base)

**Fecha de referencia:** 22 de noviembre de 2026.  
**Estado:** versión base documental para iniciar SemVer; se corresponde funcionalmente con la entrega denominada anteriormente «v1.9».  
**Importante:** esta renumeración **no introduce nuevas funciones ni cambia la base de datos**. La publicación en GitHub Pages debe realizarse manualmente.

## Archivos de referencia
- `CHANGELOG.md`: historial a partir de la versión base y reglas de clasificación.
- `DOCUMENTACION_VERSION_1.0.0.md`: inventario funcional, arquitectura, despliegue, base de datos y limitaciones.
- `VERSION`: número canónico de la aplicación.
- `actualizacion_supabase_dashboard_v7.sql`: copia de la última migración histórica. **No volver a ejecutarla por el simple cambio de número de versión**.

## Instalación
Si ya está instalada la antigua v1.9, basta publicar el código de esta entrega para unificar las etiquetas de versión. No se requiere migración SQL adicional. Se mantienen las rutas `js/` y `css/`. Para refrescar la caché puede abrirse la URL con `?v=1.0.0`.

## Política de versiones
A partir de ahora se usa `MAJOR.MINOR.PATCH`:
- `PATCH`: corrección compatible o cambio de presentación sin nueva función.
- `MINOR`: nueva funcionalidad compatible.
- `MAJOR`: cambio incompatible que requiera adaptación de usuarios, API o datos.

Cada nueva entrega debe actualizar `VERSION`, `CHANGELOG.md`, la documentación afectada y los parámetros de caché. Las migraciones SQL llevan una numeración independiente.
