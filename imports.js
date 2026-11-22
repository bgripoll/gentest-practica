'use strict';
async function importQuestions(){
 if(profile.role!=='admin')throw Error('Solo el administrador puede importar.');
 const f=$('file').files[0],bankId=$('importBank').value;
 if(!f||!bankId)throw Error('Selecciona banco y Excel.');
 if(typeof XLSX==='undefined')throw Error('No se ha cargado el lector de Excel.');
 const wb=XLSX.read(await f.arrayBuffer(),{type:'array'});
 const rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:''});
 const normalize=t=>String(t||'').normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('es');
 const existingKeys=new Set();let from=0;
 while(true){const page=requireOk(await ensureDb().from('questions').select('question').eq('bank_id',bankId).range(from,from+999));page.forEach(q=>existingKeys.add(normalize(q.question)));if(page.length<1000)break;from+=1000}
 const seen=new Set(),out=[];let invalid=0,duplicate=0;
 for(const r of rows){
  const question=safe(field(r,'question')),opts=['a','b','c','d'].map(x=>safe(field(r,x))),idx=correctIndex(field(r,'correct'),opts);
  if(!question||opts.some(x=>!x)||idx<0){invalid++;continue}
  const key=normalize(question);if(existingKeys.has(key)||seen.has(key)){duplicate++;continue}seen.add(key);
  out.push({bank_id:bankId,topic:safe(field(r,'topic'))||'Sin tema',question,option_a:opts[0],option_b:opts[1],option_c:opts[2],option_d:opts[3],correct_answer:'ABCD'[idx],explanation:safe(field(r,'explanation'))||null});
 }
 if(!out.length)throw Error(`No hay preguntas nuevas válidas. Duplicadas: ${duplicate}; inválidas: ${invalid}.`);
 if(!confirm(`Banco: ${allBanks.find(x=>x.id===bankId)?.name}\nFilas leídas: ${rows.length}\nNuevas: ${out.length}\nDuplicadas omitidas: ${duplicate}\nInválidas omitidas: ${invalid}\n\n¿Importar las nuevas preguntas?`))return;
 const topics=[...new Set(out.map(x=>x.topic))];
 requireOk(await ensureDb().from('bank_topics').upsert(topics.map(name=>({bank_id:bankId,name})),{onConflict:'bank_id,name',ignoreDuplicates:true}));
 const existing=requireOk(await ensureDb().from('bank_topics').select('id,name').eq('bank_id',bankId));const ids=new Map(existing.map(x=>[x.name,x.id]));
 const batch=requireOk(await ensureDb().from('import_batches').insert({bank_id:bankId,filename:f.name,imported_by:user.id,imported_count:0}).select('id').single());
 let count=0;for(let i=0;i<out.length;i+=100){const chunk=out.slice(i,i+100).map(x=>({...x,topic_id:ids.get(x.topic),import_batch_id:batch.id}));requireOk(await ensureDb().from('questions').insert(chunk));count+=chunk.length}
 requireOk(await ensureDb().from('import_batches').update({imported_count:count}).eq('id',batch.id));
 $('file').value='';await loadBank();await loadAdmin();message(`Importadas ${count}. Duplicadas omitidas: ${duplicate}. Inválidas: ${invalid}.`);
}
async function launchPreview(selectId,countId){const id=$(selectId).value;if(!id)throw Error('Crea un banco primero.');const pool=bank.filter(x=>x.bank_id===id);if(!pool.length)throw Error('Este banco no tiene preguntas.');const n=countId?Number($(countId).value):10;items=pool.sort(()=>Math.random()-.5).slice(0,n);preview=true;session={id:null,correct:0,total:items.length};pos=0;show('quiz');renderQuestion()}
