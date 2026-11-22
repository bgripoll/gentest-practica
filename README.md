# GenTest Practica · v1.9 Centro de control

Actualización modular desde v1.8. Conserva el registro obligatorio, usuarios, bancos, pruebas, modo alumno y repasos.

## Instalación
1. Ejecuta `actualizacion_supabase_dashboard_v7.sql` en Supabase SQL Editor. No borra registros.
2. Sube el contenido del ZIP a la raíz del repositorio GitHub Pages, conservando `js/` y `css/`.
3. Recarga la web con `?v=19`.

## Panel de administración
- Gestiones: solicitudes pendientes, alumnos autorizados sin bancos, bancos sin publicar. Los contadores abren secciones reales.
- Actividad últimos siete días: alumnos con respuestas, tests finalizados, respuestas y respuestas en repaso.
- Alertas históricas: temas con menor porcentaje de acierto (mínimo 10 respuestas) y preguntas con más errores (mínimo 5 respuestas). Al pulsar se abre el informe del banco.
- Los indicadores académicos excluyen usuarios administradores. Las pruebas de laboratorio no se guardan.
- Si falta la migración, los contadores de gestión funcionan y se muestra un aviso en lugar de inventar estadísticas.
