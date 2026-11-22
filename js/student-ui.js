'use strict';
const progressMap=()=>new Map(progress.map(x=>[x.question_id,x]));
function fillSelect(id,options){const el=$(id),old=el.value;el.replaceChildren();for(const o of options)el.add(new Option(o.label,o.value));if(options.some(x=>x.value===old))el.value=old}
function selectedBank(id){return bank.filter(q=>q.bank_id===$(id).value)}
function topicOptions(id,all=false){const qs=selectedBank(id),ts=[...new Set(qs.map(q=>q.topic))].sort((a,b)=>a.localeCompare(b,'es',{numeric:true}));return [...(all?[{label:'Todos los temas',value:'*'}]:[]),...ts.map(t=>({label:t+' ('+qs.filter(q=>q.topic===t).length+')',value:t}))]}
function updateTopicPickers(){fillSelect('practiceTopic',topicOptions('practiceBank'));fillSelect('errorsTopic',topicOptions('errorsBank',true));$('topicPicker').classList.toggle('hidden',$('scope').value==='all')}
function renderHome(){const correct=history.filter(h=>h.questions&&h.selected_answer===h.questions.correct_answer).length;$('nAnswers').textContent=history.length;$('nAccuracy').textContent=history.length?Math.round(100*correct/history.length)+'%':'—';$('nQuestions').textContent=bank.length;
 const opts=studentBanks.map(x=>({label:x.name,value:x.id}));for(const id of ['practiceBank','reviewBank','errorsBank'])fillSelect(id,opts);updateTopicPickers();const now=Date.now(),due=progress.filter(x=>x.correct_streak>0&&x.next_review_at&&new Date(x.next_review_at).getTime()<=now).length,errors=progress.filter(x=>x.pending_error).length;
 $('reviewInfo').textContent=`${due} preguntas programadas disponibles hoy. Las nuevas preguntas se practican desde la pestaña Practicar.`;$('errorsInfo').textContent=`${errors} preguntas con errores pendientes de corregir.`;renderStats()}
