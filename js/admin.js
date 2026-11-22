'use strict';
async function loadAdmin(){
 allBanks=requireOk(await ensureDb().from('banks').select('*').order('name'));
 adminUsers=requireOk(await ensureDb().from('profiles').select('id,email,role,approved,created_at,first_name,last_name,dni,birth_date,phone').order('created_at',{ascending:false}));
 const access=requireOk(await ensureDb().from('user_bank_access').select('user_id,bank_id'));
 const stats=requireOk(await db.rpc('admin_user_stats'));
 const statsMap=new Map(stats.map(x=>[x.user_id,x]));
 $('summaryContent').textContent=`Usuarios: ${adminUsers.length} · Pendientes: ${adminUsers.filter(x=>!x.approved).length} · Bancos: ${allBanks.length} · Respuestas: ${stats.reduce((n,x)=>n+Number(x.answers),0)}`;
 for(const id of ['importBank','labBank']){const sel=$(id);sel.replaceChildren();allBanks.forEach(b=>{const opt=new Option(b.name+(b.published?' · publicado':' · borrador'),b.id);sel.add(opt)})}
 const ubox=$('userList');ubox.replaceChildren();
 let lastLogins=new Map();
 try { const loginRows=requireOk(await ensureDb().rpc('admin_user_last_signins'));lastLogins=new Map((loginRows||[]).map(r=>[r.user_id,r.last_sign_in_at])); }
 catch(e){console.warn('No se pudo consultar el último inicio de sesión. Ejecuta el SQL v5.',e);}
 const sorted=[...adminUsers].sort((a,b)=>{
  const na=[a.first_name,a.last_name].filter(Boolean).join(' ').trim()||a.email||'';
  const nb=[b.first_name,b.last_name].filter(Boolean).join(' ').trim()||b.email||'';
  return na.localeCompare(nb,'es',{sensitivity:'base'});
 });
 const heading=adminEl('div',undefined,'student-list-head');heading.append(adminEl('span','Alumno'),adminEl('span','Correo de registro'),adminEl('span','Último acceso'),adminEl('span','Estado'));ubox.append(heading);
 for(const u of sorted){
  const row=adminEl('button',undefined,'student-list-row');row.type='button';
  const full=[u.first_name,u.last_name].filter(Boolean).join(' ').trim()||'Sin nombre (editar ficha)';
  const name=adminEl('span',full,'student-list-name');
  const mail=adminEl('span',u.email||'Sin correo','student-list-email');
  const signIn=lastLogins.get(u.id);
  const when=adminEl('span',signIn?new Date(signIn).toLocaleString('es-ES',{dateStyle:'short',timeStyle:'short'}):'Sin registro','student-list-date');
  const status=adminEl('span',u.approved?'Activo':'Pendiente / bloqueado','student-list-status');
  row.append(name,mail,when,status);
  row.onclick=()=>openUserDetail(u);
  ubox.append(row);
 }
 const bdiv=$('bankList');bdiv.replaceChildren();for(const b of allBanks){const wrap=document.createElement('div');wrap.className='usercard';const title=document.createElement('strong');title.textContent=b.name;wrap.append(title);const meta=document.createElement('p');meta.className='mini muted';meta.textContent=b.description||'Sin descripción';wrap.append(meta);const actions=document.createElement('div');actions.className='actions';const pub=document.createElement('button');pub.className=b.published?'danger':'secondary';pub.textContent=b.published?'Despublicar':'Publicar';pub.onclick=()=>action(async()=>{requireOk(await ensureDb().from('banks').update({published:!b.published}).eq('id',b.id));await loadAdmin()});actions.append(pub);const edit=document.createElement('button');edit.className='secondary';edit.textContent='Renombrar';edit.onclick=()=>action(async()=>{const name=prompt('Nuevo nombre del banco',b.name);if(!name||name.trim()===b.name)return;requireOk(await ensureDb().from('banks').update({name:name.trim()}).eq('id',b.id));await loadAdmin()});actions.append(edit);const topics=document.createElement('button');topics.className='secondary';topics.textContent='Ver temas';topics.onclick=()=>action(async()=>{const t=requireOk(await ensureDb().from('bank_topics').select('name').eq('bank_id',b.id).order('position'));const q=requireOk(await ensureDb().from('questions').select('id,topic,active').eq('bank_id',b.id));alert((t.length?t.map(x=>x.name+' ('+q.filter(y=>y.topic===x.name&&y.active).length+')').join('\n'):'No hay temas')+'\nTotal: '+q.length+' preguntas')});actions.append(topics);const report=document.createElement('button');report.className='secondary';report.textContent='Estadísticas del banco';report.onclick=()=>action(()=>openBankReport(b.id,null,b.name));actions.append(report);wrap.append(actions);bdiv.append(wrap)}
}
function adminTab(id){document.querySelectorAll('.admin-tab').forEach(x=>x.classList.toggle('hidden',x.id!=='tab-'+id));document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x.dataset.tab===id))}

// Administración v4: ficha editable y estadísticas agregadas seguras (RPC).
function adminEl(tag, text, cls){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el}
function adminField(form,label,value,type='text'){
 const wrap=adminEl('div');const lab=adminEl('label',label);const input=document.createElement('input');input.type=type;input.value=value||'';wrap.append(lab,input);form.append(wrap);return input;
}
let selectedAdminUser=null;
function showUserList(){
 selectedAdminUser=null;
 $('adminDetail').classList.add('hidden');
 $('adminReport').classList.add('hidden');
 $('userListView').classList.remove('hidden');
 $('userDetailView').classList.add('hidden');
}
function openUserDetail(u){
 selectedAdminUser=u.id;
 $('userListView').classList.add('hidden');
 $('userDetailView').classList.remove('hidden');
 $('adminReport').classList.add('hidden');
 const pane=$('adminDetail');pane.replaceChildren();pane.classList.remove('hidden');
 const heading=adminEl('div',undefined,'detail-heading');
 const back=adminEl('button','← Volver al listado de alumnos','secondary');back.type='button';back.onclick=showUserList;
 heading.append(back,adminEl('h2',[u.first_name,u.last_name].filter(Boolean).join(' ')||u.email||'Alumno'));
 pane.append(heading);
 const nav=adminEl('div',undefined,'detail-tabs');pane.append(nav);
 const sections={datos:adminEl('div',undefined,'detail-section'),permisos:adminEl('div',undefined,'detail-section hidden'),estadisticas:adminEl('div',undefined,'detail-section hidden')};
 function chooseTab(tab){for(const [id,el] of Object.entries(sections))el.classList.toggle('hidden',id!==tab);nav.querySelectorAll('button').forEach(btn=>btn.classList.toggle('active',btn.dataset.section===tab));}
 for(const [id,label] of [['datos','Datos personales'],['permisos','Bancos autorizados'],['estadisticas','Estadísticas']]){
  const btn=adminEl('button',label,'secondary');btn.type='button';btn.dataset.section=id;btn.onclick=()=>chooseTab(id);nav.append(btn);
 }
 Object.values(sections).forEach(el=>pane.append(el));
 const form=document.createElement('form');form.className='admin-profile-grid';
 const first=adminField(form,'Nombre',u.first_name),last=adminField(form,'Apellidos',u.last_name),dni=adminField(form,'DNI/NIE',u.dni),birth=adminField(form,'Fecha de nacimiento',u.birth_date,'date'),phone=adminField(form,'Teléfono',u.phone,'tel');
 const email=adminField(form,'Correo electrónico (cuenta de acceso)',u.email,'email');email.readOnly=true;
 const save=adminEl('button','Guardar datos');save.type='submit';form.append(save);
 form.onsubmit=e=>{e.preventDefault();action(async()=>{
  requireOk(await ensureDb().from('profiles').update({first_name:first.value.trim()||null,last_name:last.value.trim()||null,dni:dni.value.trim().toUpperCase()||null,birth_date:birth.value||null,phone:phone.value.trim()||null}).eq('id',u.id));
  await loadAdmin();const updated=adminUsers.find(x=>x.id===u.id);if(updated)openUserDetail(updated);
  message('Ficha guardada correctamente.');
 })};sections.datos.append(form,adminEl('p','El correo de acceso se modifica mediante Supabase Auth, no desde esta ficha.','note'));
 const state=adminEl('div',undefined,'user-access-state');
 state.append(adminEl('p',u.approved?'Cuenta autorizada':'Cuenta pendiente o bloqueada'));
 const toggle=adminEl('button',u.approved?'Bloquear usuario':'Autorizar usuario',u.approved?'danger':'secondary');toggle.disabled=u.id===user.id;
 toggle.onclick=()=>action(async()=>{requireOk(await ensureDb().from('profiles').update({approved:!u.approved}).eq('id',u.id));await loadAdmin();openUserDetail(adminUsers.find(x=>x.id===u.id));});state.append(toggle);sections.permisos.append(state);
 const perms=adminEl('div');sections.permisos.append(perms);
 action(async()=>{
  const access=requireOk(await ensureDb().from('user_bank_access').select('bank_id').eq('user_id',u.id));
  perms.replaceChildren();
  if(!allBanks.length)perms.append(adminEl('p','Todavía no hay bancos de preguntas.','muted'));
  for(const b of allBanks){const lab=adminEl('label',undefined,'user-permission-row');const cb=document.createElement('input');cb.type='checkbox';cb.checked=access.some(a=>a.bank_id===b.id);cb.disabled=u.id===user.id||u.role==='admin';cb.onchange=()=>action(async()=>{
   if(cb.checked)requireOk(await ensureDb().from('user_bank_access').insert({user_id:u.id,bank_id:b.id}));
   else requireOk(await ensureDb().from('user_bank_access').delete().eq('user_id',u.id).eq('bank_id',b.id));
   message('Permisos actualizados.');
  });lab.append(cb,adminEl('span',b.name));perms.append(lab);}
 });
 const statTitle=adminEl('p','Selecciona un banco para consultar los resultados individuales.','muted');sections.estadisticas.append(statTitle);
 const sel=document.createElement('select');for(const b of allBanks)sel.add(new Option(b.name,b.id));sections.estadisticas.append(sel);
 const button=adminEl('button','Ver estadísticas del banco','secondary');button.disabled=!allBanks.length;button.onclick=()=>action(()=>openBankReport(sel.value,u.id,sel.selectedOptions[0]?.textContent||''));sections.estadisticas.append(button);
 chooseTab('datos');window.scrollTo({top:0,behavior:'instant'});
}
async function openBankReport(bankId,userId,title){
 const data=requireOk(await ensureDb().rpc('admin_bank_report',{p_bank_id:bankId,p_user_id:userId}));
 const pane=$('adminReport');pane.replaceChildren();pane.classList.remove('hidden');
 const row=adminEl('div',undefined,'row');row.append(adminEl('h2','Estadísticas · '+title));const close=adminEl('button','Cerrar informe','secondary');close.onclick=()=>pane.classList.add('hidden');row.append(close);pane.append(row);
 const totals=adminEl('div',undefined,'admin-metrics');
 for(const [label,val] of [['Preguntas del banco',data.total_questions],['Respuestas realizadas',data.attempts],['Correctas',data.correct],['Erróneas',data.wrong],['Repasos',data.reviews],['Alumnos participantes',data.students],['Sesiones finalizadas',data.sessions]]){
  const cell=adminEl('div',undefined,'stat');cell.append(adminEl('strong',String(val||0)),adminEl('span',label));totals.append(cell);
 }pane.append(totals);
 pane.append(adminEl('h3','Resultados por tema'));
 const topics=document.createElement('table');topics.className='report-table';topics.innerHTML='<thead><tr><th>Tema</th><th>Respuestas</th><th>Correctas</th><th>Erróneas</th><th>Repasos</th><th>Preguntas distintas</th><th>% acierto</th></tr></thead>';
 const body=document.createElement('tbody');for(const t of data.topics||[]){const tr=document.createElement('tr');for(const v of [t.topic,t.attempts,t.correct,t.wrong,t.reviews,t.distinct_questions,t.attempts?Math.round(t.correct*100/t.attempts)+'%':'—'])tr.append(adminEl('td',String(v??'')));body.append(tr)}topics.append(body);const scroll=adminEl('div',undefined,'report-scroll');scroll.append(topics);pane.append(scroll);
 pane.append(adminEl('h3','Preguntas más falladas'));
 if(!(data.hardest||[]).length)pane.append(adminEl('p','Todavía no hay respuestas incorrectas registradas.','muted'));
 for(const q of data.hardest||[]){const item=adminEl('div',undefined,'usercard');item.append(adminEl('strong',q.topic+' · '+q.wrong+' fallos de '+q.attempts+' respuestas'),adminEl('p',q.question,'mini'));pane.append(item)}
 pane.scrollIntoView({behavior:'smooth',block:'start'});
}
