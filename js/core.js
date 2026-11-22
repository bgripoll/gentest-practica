'use strict';
const SUPABASE_PROJECT_URL='https://iklafanogguxcchqkuyw.supabase.co';const KEY='sb_publishable_8KlKEeNUCXStcFlL4Ei6-A_j7glL1eh';
const $=id=>document.getElementById(id);const sections=['auth','register','pending','home','quiz','results','admin'];let db,user,profile,bank=[],history=[],progress=[],studentBanks=[],sessionsHistory=[],session=null,items=[],pos=0,answered=false,busy=false,allBanks=[],adminUsers=[],preview=false,currentMode='practice';
const show=id=>{sections.forEach(x=>$(x).classList.toggle('hidden',x!==id));window.scrollTo({top:0,behavior:'instant'})};
const message=(txt,error=false)=>{const el=$('message');el.textContent=txt;el.className='msg'+(error?' error':'');el.classList.toggle('hidden',!txt)};
const safe=val=>String(val??'').trim();const norm=val=>safe(val).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const headers={question:['pregunta','enunciado','texto pregunta','question'],a:['a','respuesta a','opcion a','alternativa a','respuesta1','opcion1'],b:['b','respuesta b','opcion b','alternativa b','respuesta2','opcion2'],c:['c','respuesta c','opcion c','alternativa c','respuesta3','opcion3'],d:['d','respuesta d','opcion d','alternativa d','respuesta4','opcion4'],correct:['correcta','respuesta correcta','opcion correcta','solucion','correct','respuesta valida'],topic:['tema','tematica','categoria','bloque','topic'],explanation:['explicacion','justificacion','fundamento','comentario','observaciones']};
function field(r,type){const kv=Object.entries(r);const keys=headers[type].map(norm);const match=kv.find(([k])=>keys.includes(norm(k)));return match?match[1]:''}
function correctIndex(v,opts){const s=safe(v),n=norm(s);if(['a','b','c','d'].includes(n))return 'abcd'.indexOf(n);if(['1','2','3','4'].includes(n))return Number(n)-1;return opts.findIndex(o=>norm(o)===n&&n)}
async function action(fn){if(busy)return;busy=true;message('');try{ensureDb();await fn()}catch(e){message(e.message||String(e),true);console.error(e)}finally{busy=false}}
function requireOk({data,error}){if(error)throw error;return data}
