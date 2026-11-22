# GenTest Practica modular v1.7

- Elimina la pestaña redundante «Vista alumno» de administración.
- Renombra «Ir a practicar» como «Acceder como alumno».
- El administrador puede regresar con «Volver a administración» sin cerrar sesión.
- **Modo demostración del administrador:** los test iniciados desde «Acceder como alumno» no escriben sesiones ni respuestas en Supabase, y no alteran las estadísticas.
- «Pruebas» conserva el laboratorio independiente.
- No requiere cambios SQL. Subir todos los archivos y carpetas conservando sus rutas.

Pruebas recomendadas: iniciar sesión como administrador, acceder como alumno, completar un test, regresar al panel, ejecutar laboratorio y comprobar que las estadísticas no varían. Probar después el flujo normal con una cuenta de estudiante.
