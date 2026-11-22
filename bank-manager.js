 'use strict';
let managedBankId=null, managedPage=0, managedFilter='';
function bmEl(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e}
function bmButton(label,fn,cls='secondary'){const b=bmEl('button',label,cls);b.type='button';b.onclick=()=>action(fn);return b}
async function bankQuestions(id,columns='*'){
 const result=[];let from=0;
 while(true){const rows=requireOk(await ensureDb().from('questions').select(columns).eq('bank_id',id).order('created_at',{ascending:true}).range(from,from+999));result.push(...rows);if(rows.length<1000)break;from+=1000}
 return result;
}
async function openBankManager(id){managedBankId=id;managedPage=0;managedFilter='';await renderBankManager()}
async function renderBankManager(){
 const id=managedBankId,bankInfo=allBanks.find(x=>x.id===id);if(!bankInfo)return;
 const panel=$('bankManager');panel.classList.remove('hidden');panel.replaceChildren();
 const header=bmEl('div',undefined,'row');header.append(bmEl('h3','Gestionar: '+bankInfo.name),bmButton('Cerrar',async()=>{panel.classList.add('hidden');managedBankId=null}));panel.append(header);
 const topics=requireOk(await ensureDb().from('bank_topics').select('id,name,position').eq('bank_id',id).order('position'));
 const questions=await bankQuestions(id,'id,topic,topic_id,question,option_a,option_b,option_c,option_d,correct_answer,explanation,active,created_at');
 const active=questions.filter(q=>q.active).length;panel.append(bmEl('p',`${questions.length} preguntas · ${active} activas · ${questions.length-active} inactivas · ${topics.length} temas`,'note'));
 const topicTitle=bmEl('h4','Temas');panel.append(topicTitle);
 const topicLine=bmEl('div',undefined,'actions');const addTopic=bmEl('input');addTopic.placeholder='Nombre del nuevo tema';addTopic.setAttribute('aria-label','Nuevo tema');topicLine.append(addTopic,bmButton('Añadir tema',async()=>{const name=addTopic.value.trim();if(!name)throw Error('Introduce un nombre.');requireOk(await ensureDb().from('bank_topics').insert({bank_id:id,name}));await renderBankManager()}));panel.append(topicLine);
 const topicList=bmEl('div',undefined,'bank-topic-list');
 for(const t of topics){const row=bmEl('div',undefined,'bank-topic-row');const n=questions.filter(q=>q.topic_id===t.id||q.topic===t.name).length;row.append(bmEl('span',`${t.name} · ${n} preguntas`));row.append(bmButton('Renombrar',async()=>{
  const name=prompt('Nuevo nombre del tema',t.name)?.trim();if(!name||name===t.name)return;
  if(questions.some(q=>q.topic===t.name)){throw Error('Este tema contiene preguntas. Para preservar su coherencia e historial, el cambio de nombre requiere una migración transaccional; no se ha realizado ningún cambio.');}
  requireOk(await ensureDb().from('bank_topics').update({name}).eq('id',t.id));await renderBankManager();
 }));row.append(bmButton('Eliminar vacío',async()=>{if(n)throw Error('No se puede eliminar un tema con preguntas.');if(!confirm(`¿Eliminar el tema ${t.name}?`))return;requireOk(await ensureDb().from('bank_topics').delete().eq('id',t.id));await renderBankManager()},'danger'));topicList.append(row)}panel.append(topicList);
 panel.append(bmEl('h4','Preguntas'));
 const filters=bmEl('div',undefined,'actions');const search=bmEl('input');search.placeholder='Buscar por enunciado';search.value=managedFilter;search.setAttribute('aria-label','Buscar preguntas');const searchBtn=bmButton('Buscar',async()=>{managedFilter=search.value.trim();managedPage=0;await renderBankManager()});search.onkeydown=e=>{if(e.key==='Enter')searchBtn.click()};filters.append(search,searchBtn,bmButton('Limpiar',async()=>{managedFilter='';managedPage=0;await renderBankManager()}));panel.append(filters);
 const matching=questions.filter(q=>!managedFilter||q.question.toLocaleLowerCase('es').includes(managedFilter.toLocaleLowerCase('es')));
 const pageSize=20,totalPages=Math.max(1,Math.ceil(matching.length/pageSize));managedPage=Math.min(managedPage,totalPages-1);
 const list=bmEl('div',undefined,'bank-question-list');for(const q of matching.slice(managedPage*pageSize,(managedPage+1)*pageSize)){
  const row=bmEl('div',undefined,'bank-question-row');row.append(bmEl('p',`${q.active?'● Activa':'○ Inactiva'} · ${q.topic} · ${q.question}`));
  const actions=bmEl('div',undefined,'actions');actions.append(bmButton('Editar',()=>editBankQuestion(q,topics)),bmButton(q.active?'Desactivar':'Activar',async()=>{requireOk(await ensureDb().from('questions').update({active:!q.active}).eq('id',q.id));await loadBank();await renderBankManager()},q.active?'danger':'secondary'));row.append(actions);list.append(row)
 }panel.append(list);if(!matching.length)panel.append(bmEl('p','No hay preguntas con ese filtro.','note'));
 const nav=bmEl('div',undefined,'actions');nav.append(bmButton('Anterior',async()=>{managedPage=Math.max(0,managedPage-1);await renderBankManager()}),bmEl('span',`Página ${managedPage+1} de ${totalPages}`),bmButton('Siguiente',async()=>{managedPage=Math.min(totalPages-1,managedPage+1);await renderBankManager()}));panel.append(nav);
 panel.scrollIntoView({block:'start',behavior:'smooth'});
}
async function editBankQuestion(q,topics){
 const panel=$('bankManager');let form=$('bankQuestionEditor');if(form)form.remove();form=bmEl('form',undefined,'bank-question-editor');form.id='bankQuestionEditor';form.append(bmEl('h4','Editar pregunta'));
 const controls={};function field(key,label,large=false){const wrap=bmEl('div');wrap.append(bmEl('label',label));const input=document.createElement(large?'textarea':'input');input.value=q[key]||'';input.required=key!=='explanation';wrap.append(input);form.append(wrap);controls[key]=input}
 field('question','Enunciado',true);for(const letter of 'abcd')field('option_'+letter,'Opción '+letter.toUpperCase(),true);
 const topicWrap=bmEl('div');topicWrap.append(bmEl('label','Tema'));const topic=document.createElement('select');for(const t of topics)topic.add(new Option(t.name,t.id));topic.value=q.topic_id||topics.find(t=>t.name===q.topic)?.id||'';topicWrap.append(topic);form.append(topicWrap);
 const correctWrap=bmEl('div');correctWrap.append(bmEl('label','Respuesta correcta'));const correct=document.createElement('select');for(const l of 'ABCD')correct.add(new Option(l,l));correct.value=q.correct_answer;correctWrap.append(correct);form.append(correctWrap);field('explanation','Explicación',true);
 const actions=bmEl('div',undefined,'actions');const save=bmEl('button','Guardar cambios');save.type='submit';actions.append(save,bmButton('Cancelar',async()=>form.remove()));form.append(actions);
 form.onsubmit=e=>{e.preventDefault();action(async()=>{const chosen=topics.find(t=>t.id===topic.value);if(!chosen)throw Error('Selecciona un tema.');const values={topic:chosen.name,topic_id:chosen.id,correct_answer:correct.value};for(const [k,v] of Object.entries(controls))values[k]=v.value.trim()||(k==='explanation'?null:'');if(!values.question||'abcd'.split('').some(l=>!values['option_'+l]))throw Error('Completa el enunciado y las cuatro opciones.');requireOk(await ensureDb().from('questions').update(values).eq('id',q.id));await loadBank();await renderBankManager();message('Pregunta actualizada.')})};panel.prepend(form);form.scrollIntoView({behavior:'smooth',block:'start'});
}
async function exportBankExcel(id){if(typeof XLSX==='undefined')throw Error('No se ha cargado el lector de Excel.');const b=allBanks.find(x=>x.id===id);const rows=await bankQuestions(id,'id,topic,question,option_a,option_b,option_c,option_d,correct_answer,explanation,active');const sheet=XLSX.utils.json_to_sheet(rows.map(q=>({ID:q.id,Tema:q.topic,Pregunta:q.question,A:q.option_a,B:q.option_b,C:q.option_c,D:q.option_d,Correcta:q.correct_answer,Explicación:q.explanation||'',Activa:q.active?'Sí':'No'})));const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,sheet,'Preguntas');XLSX.writeFile(wb,`GenTest_${(b?.name||'Banco').replace(/[^a-z0-9áéíóúñ_-]/gi,'_').slice(0,45)}.xlsx`)}
async function deleteEmptyBank(id){const b=allBanks.find(x=>x.id===id);const rows=requireOk(await ensureDb().from('questions').select('id').eq('bank_id',id).limit(1));if(rows.length)throw Error('El banco contiene preguntas. Para proteger el historial no se permite eliminarlo. Puedes despublicarlo.');if(!confirm(`¿Eliminar definitivamente el banco vacío «${b?.name}»?`))return;requireOk(await ensureDb().from('banks').delete().eq('id',id));if(managedBankId===id){managedBankId=null;$('bankManager').classList.add('hidden')}await loadAdmin();message('Banco vacío eliminado.')}
