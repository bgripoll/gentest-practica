'use strict';
async function loadAdmin(){
 allBanks=requireOk(await ensureDb().from('banks').select('*').order('name'));
 adminUsers=requireOk(await ensureDb().from('profiles').select('id,email,role,approved,created_at,first_name,last_name,dni,birth_date,phone').order('created_at',{ascending:false}));
 const access=requireOk(await ensureDb().from('user_bank_access').select('user_id,bank_id'));
 const stats=requireOk(await db.rpc('admin_user_stats'));
 const statsMap=new Map(stats.map(x=>[x.user_id,x]));
 $('summaryContent').textContent=`Usuarios: ${adminUsers.length} · Pendientes: ${adminUsers.filter(x=>!x.approved).length} · Bancos: ${allBanks.length} · Respuestas: ${stats.reduce((n,x)=>n+Number(x.answers),0)}`;
 for(const id of ['importBank','labBank','studentBank']){const sel=$(id);sel.replaceChildren();allBanks.forEach(b=>{const opt=new Option(b.name+(b.published?' · publicado':' · borrador'),b.id);sel.add(opt)})}
 const ubox=$('userList');ubox.replaceChildren();
 for(const u of adminUsers){const st=statsMap.get(u.id)||{sessions:0,answers:0,correct:0};const wrap=document.createElement('div');wrap.className='usercard';const h=document.createElement('strong');h.textContent=u.email||u.id;wrap.append(h);const info=document.createElement('p');info.className='mini muted';info.textContent=`${u.role} · ${u.approved?'Autorizado':'Pendiente/bloqueado'} · ${st.sessions} sesiones · ${st.answers} respuestas · ${Number(st.answers)?Math.round(100*Number(st.correct)/Number(st.answers))+'% aciertos':'Sin resultados'}`;wrap.append(info);
 const toggle=document.createElement('button');toggle.className=u.approved?'danger':'secondary';toggle.textContent=u.approved?'Bloquear':'Autorizar';toggle.disabled=u.id===user.id;toggle.onclick=()=>action(async()=>{requireOk(await ensureDb().from('profiles').update({approved:!u.approved}).eq('id',u.id));await loadAdmin()});wrap.append(toggle);
 const title=document.createElement('p');title.textContent='Bancos autorizados:';wrap.append(title);
 for(const b of allBanks){const lab=document.createElement('label');lab.className='mini banktag';const cb=document.createElement('input');cb.type='checkbox';cb.checked=access.some(a=>a.user_id===u.id&&a.bank_id===b.id);cb.disabled=u.id===user.id||u.role==='admin';cb.onchange=()=>action(async()=>{if(cb.checked)requireOk(await ensureDb().from('user_bank_access').insert({user_id:u.id,bank_id:b.id}));else requireOk(await ensureDb().from('user_bank_access').delete().eq('user_id',u.id).eq('bank_id',b.id));await loadAdmin()});lab.append(cb,document.createTextNode(b.name));wrap.append(lab)}const detail=document.createElement('button');detail.className='secondary';detail.textContent='Editar ficha y estadísticas';detail.onclick=()=>openUserDetail(u);wrap.append(detail);ubox.append(wrap)}
 const bdiv=$('bankList');bdiv.replaceChildren();for(const b of allBanks){const wrap=document.createElement('div');wrap.className='usercard';const title=document.createElement('strong');title.textContent=b.name;wrap.append(title);const meta=document.createElement('p');meta.className='mini muted';meta.textContent=b.description||'Sin descripción';wrap.append(meta);const actions=document.createElement('div');actions.className='actions';const pub=document.createElement('button');pub.className=b.published?'danger':'secondary';pub.textContent=b.published?'Despublicar':'Publicar';pub.onclick=()=>action(async()=>{requireOk(await ensureDb().from('banks').update({published:!b.published}).eq('id',b.id));await loadAdmin()});actions.append(pub);const edit=document.createElement('button');edit.className='secondary';edit.textContent='Renombrar';edit.onclick=()=>action(async()=>{const name=prompt('Nuevo nombre del banco',b.name);if(!name||name.trim()===b.name)return;requireOk(await ensureDb().from('banks').update({name:name.trim()}).eq('id',b.id));await loadAdmin()});actions.append(edit);const topics=document.createElement('button');topics.className='secondary';topics.textContent='Ver temas';topics.onclick=()=>action(async()=>{const t=requireOk(await ensureDb().from('bank_topics').select('name').eq('bank_id',b.id).order('position'));const q=requireOk(await ensureDb().from('questions').select('id,topic,active').eq('bank_id',b.id));alert((t.length?t.map(x=>x.name+' ('+q.filter(y=>y.topic===x.name&&y.active).length+')').join('\n'):'No hay temas')+'\nTotal: '+q.length+' preguntas')});actions.append(topics);const report=document.createElement('button');report.className='secondary';report.textContent='Estadísticas del banco';report.onclick=()=>action(()=>openBankReport(b.id,null,b.name));actions.append(report);wrap.append(actions);bdiv.append(wrap)}
}
function adminTab(id){document.querySelectorAll('.admin-tab').forEach(x=>x.classList.toggle('hidden',x.id!=='tab-'+id));document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x.dataset.tab===id))}

// Administración v4: ficha editable y estadísticas agregadas seguras (RPC).
function adminEl(tag, text, cls){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el}
function adminField(form,label,value,type='text'){
 const wrap=adminEl('div');const lab=adminEl('label',label);const input=document.createElement('input');input.type=type;input.value=value||'';wrap.append(lab,input);form.append(wrap);return input;
}
function openUserDetail(u){
 const pane=$('adminDetail');pane.replaceChildren();pane.classList.remove('hidden');
 const row=adminEl('div',undefined,'row');row.append(adminEl('h2','Ficha de usuario'));
 const close=adminEl('button','Cerrar','secondary');close.onclick=()=>pane.classList.add('hidden');row.append(close);pane.append(row);
 const form=document.createElement('form');form.className='admin-profile-grid';
 const first=adminField(form,'Nombre',u.first_name),last=adminField(form,'Apellidos',u.last_name),dni=adminField(form,'DNI/NIE',u.dni),birth=adminField(form,'Fecha de nacimiento',u.birth_date,'date'),phone=adminField(form,'Teléfono',u.phone,'tel');
 const email=adminField(form,'Correo electrónico (cuenta de acceso)',u.email,'email');email.readOnly=true;
 const info=adminEl('p','Para cambiar el correo de acceso es necesario un procedimiento seguro que actualice también Supabase Auth.','note');
 const save=adminEl('button','Guardar datos');save.type='submit';form.append(save);
 form.onsubmit=e=>{e.preventDefault();action(async()=>{
  requireOk(await ensureDb().from('profiles').update({first_name:first.value.trim()||null,last_name:last.value.trim()||null,dni:dni.value.trim().toUpperCase()||null,birth_date:birth.value||null,phone:phone.value.trim()||null}).eq('id',u.id));
  await loadAdmin();const updated=adminUsers.find(x=>x.id===u.id);if(updated)openUserDetail(updated);
  message('Ficha guardada correctamente.');
 })};pane.append(form,info);
 pane.append(adminEl('h3','Estadísticas individuales por banco'));
 const sel=document.createElement('select');for(const b of allBanks)sel.add(new Option(b.name,b.id));pane.append(sel);
 const button=adminEl('button','Consultar estadísticas','secondary');button.onclick=()=>action(()=>openBankReport(sel.value,u.id,sel.selectedOptions[0]?.textContent||''));pane.append(button);
 pane.scrollIntoView({behavior:'smooth',block:'start'});
}
async function openBankReport(bankId,userId,title){
 const data=requireOk(await ensureDb().rpc('admin_bank_report',{p_bank_id:bankId,p_user_id:userId}));
 const pane=$('adminReport');pane.replaceChildren();pane.classList.remove('hidden');
 const row=adminEl('div',undefined,'row');row.append(adminEl('h2','Estadísticas · '+title));const close=adminEl('button','Cerrar','secondary');close.onclick=()=>pane.classList.add('hidden');row.append(close);pane.append(row);
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
