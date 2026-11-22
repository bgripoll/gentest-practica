'use strict';
function ensureDb(){if(!db){if(!window.supabase?.createClient)throw Error('No se ha cargado la biblioteca de Supabase. Comprueba la conexión y recarga la página.');const projectUrl=String(SUPABASE_PROJECT_URL).trim();
if(!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(projectUrl))throw Error('Configuración incorrecta de Supabase URL: '+projectUrl);
try { db=window.supabase.createClient(projectUrl,KEY); }
catch(e) { throw Error('No se pudo iniciar Supabase ('+projectUrl+'): '+e.message); }}return db}
async function init(){if(!window.supabase){message('No se ha podido cargar Supabase. Comprueba tu conexión a internet.',true);return}ensureDb();const params=new URLSearchParams(location.search);if(params.get('type')==='recovery'||location.hash.includes('type=recovery')){setTimeout(async()=>{const password=prompt('Introduce tu nueva contraseña (mínimo 6 caracteres):');if(password&&password.length>=6){await action(async()=>{requireOk(await ensureDb().auth.updateUser({password}));message('Contraseña actualizada.');await refresh()})}},700)}await action(refresh)}init();
