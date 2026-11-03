import { LINES, LINE_COLORS, stationLines, normalizeStation } from './stations.js';
import { parseSpeech } from './input-helpers.js';
let recognition=null;
const stationIds=['fromStation','toStation','routineFrom','routineTo','defaultFrom','arrivalStation'];
const syncers=[];
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function option(value,label=value){const o=document.createElement('option');o.value=value;o.textContent=label;return o;}
function changed(input,value){input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));syncInputOptions();}
function mic(input,kind,notice){
 const b=document.createElement('button');b.type='button';b.className='field-voice button button-light';b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M6 11v1a6 6 0 0 0 12 0v-1M12 18v3M9 21h6"/></svg>';b.setAttribute('aria-label',`${input.labels?.[0]?.textContent.split('◉')[0]?.trim()||input.id} 말로 입력`);
 b.onclick=()=>{
  const R=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!R){notice.textContent='이 브라우저에서는 상단 말해서 시작의 녹음 전사를 사용하거나 선택 메뉴로 골라 줘.';return;}
  try{recognition?.abort();recognition=new R();recognition.lang='ko-KR';notice.textContent='듣고 있어…';
   recognition.onresult=e=>{const text=e.results[0][0].transcript;const p=parseSpeech(text,today(),kind);
    let value=kind==='station'||kind==='number'?p.value:kind==='date'?p.date:kind==='time'?p.time:text;
    if(value==null||Number.isNaN(value)||kind==='number'&&(value<Number(input.min)||value>Number(input.max))){notice.textContent='인식한 값이 모호해. 오전·오후, 분 단위 등을 붙여 다시 말하거나 선택해 줘.';return;}
    if(kind==='station')input.dataset.line=p.line||'';changed(input,String(value));notice.textContent=`“${text}” → ${value} 입력됨. 확인하고 수정할 수 있어.`;
   };recognition.onerror=()=>notice.textContent='마이크 권한이나 음성 인식을 확인해 줘. 선택 메뉴도 사용할 수 있어.';recognition.start();
  }catch{notice.textContent='다시 말하기를 눌러 줘.';}
 };return b;
}
export function syncInputOptions(){syncers.forEach(fn=>fn());updateLineTheme();}
function updateLineTheme(){
 const lineFor=id=>document.getElementById(id)?.dataset.line||'';
 const from=lineFor('fromStation'), to=lineFor('toStation');
 const selected=from||to||lineFor('arrivalStation');
 const accent=LINE_COLORS[selected]||'#242424';
 document.documentElement.style.setProperty('--accent',accent);
 document.documentElement.style.setProperty('--accent-ink',accent);
 const label=document.getElementById('lineThemeLabel');
 if(label)label.textContent=from&&to?`${from} → ${to}`:selected||'호선을 선택하세요';
 document.querySelector('meta[name="theme-color"]')?.setAttribute('content',accent);
 for(const id of stationIds){const input=document.getElementById(id);if(input)input.nextElementSibling?.style.setProperty('--station-color',LINE_COLORS[lineFor(id)]||'#d5d5d5');}
}
export function mountInputOptions(){
 for(const input of document.querySelectorAll('input:not([type=checkbox]):not([type=hidden])')){
  const isStation=stationIds.includes(input.id),kind=isStation?'station':input.type==='number'?'number':input.type==='date'?'date':input.type==='time'?'time':'text';
  const group=document.createElement('span');group.className='input-options';input.after(group);
  const notice=document.createElement('small');notice.className='input-option-note';notice.setAttribute('role','status');
  // The existing input remains the canonical value for calculation, saving and voice.
  if(isStation){
   const line=document.createElement('select');line.id=input.id+'Line';line.setAttribute('aria-label','호선 선택');line.append(option('','호선 선택'),...Object.keys(LINES).map(n=>option(n)));
   const station=document.createElement('select');station.setAttribute('aria-label','역 선택');station.required=input.required;input.required=false;
   const fill=()=>{station.replaceChildren(option('','역 선택'),...(LINES[line.value]||[...new Set(Object.values(LINES).flat())]).map(n=>option(n)));};
   line.onchange=()=>{fill();changed(input,'');};station.onchange=()=>changed(input,station.value);
   group.append(line,station);input.hidden=true;
   const direct=document.createElement('button');direct.type='button';direct.textContent='직접 입력';direct.className='field-direct';direct.onclick=()=>{input.hidden=!input.hidden;if(!input.hidden)input.focus();};group.append(direct);
   syncers.push(()=>{const value=normalizeStation(input.value);const lines=stationLines(value);const stored=input.dataset.line||'';
    if(stored&&lines.includes(stored))line.value=stored;
    if(!line.value||value&&!LINES[line.value]?.includes(value))line.value=lines.includes(stored)?stored:lines.length===1?lines[0]:'';
    fill();if(value&&!Array.from(station.options).some(o=>o.value===value))station.append(option(value,`${value} (직접 입력)`));station.value=value;
    input.dataset.line=line.value;
   });line.addEventListener('change',()=>{input.dataset.line=line.value;});
  }else if(kind==='number'){
   const select=document.createElement('select');select.setAttribute('aria-label',`${input.getAttribute('aria-label')||input.id} 분 선택`);
   for(let n=Number(input.min||0);n<=Number(input.max||240);n++)select.append(option(String(n),`${n}분`));
   select.onchange=()=>changed(input,select.value);group.append(select);input.hidden=true;syncers.push(()=>select.value=input.value);
  }else if(kind==='time'){
   const hours=document.createElement('select'),minutes=document.createElement('select');hours.setAttribute('aria-label','시 선택');minutes.setAttribute('aria-label','분 선택');
   for(let n=0;n<24;n++)hours.append(option(String(n).padStart(2,'0'),`${n<12?'오전':'오후'} ${n%12||12}시`));
   for(let n=0;n<60;n++)minutes.append(option(String(n).padStart(2,'0'),`${n}분`));
   hours.onchange=minutes.onchange=()=>changed(input,`${hours.value}:${minutes.value}`);group.append(hours,minutes);input.hidden=true;
   syncers.push(()=>{if(!input.value)input.value='09:00';const [h,m]=input.value.split(':');hours.value=h;minutes.value=m;});
  }else if(kind==='date'){
   for(const [label,offset] of [['오늘',0],['내일',1],['모레',2]]){const b=document.createElement('button');b.type='button';b.textContent=label;b.className='field-direct';b.onclick=()=>changed(input,parseSpeech(label,today()).date);group.append(b);}
  }else if(input.id==='routineName'){
   const select=document.createElement('select');select.setAttribute('aria-label','일정 이름 빠른 선택');select.append(option('','이름 선택'),...['출근','퇴근','등교','수업','약속','운동','병원','귀가'].map(n=>option(n)));select.onchange=()=>{if(select.value)changed(input,select.value);};group.append(select);
  }
  group.append(mic(input,kind,notice),notice);
  input.addEventListener('input',syncInputOptions);input.addEventListener('change',syncInputOptions);
 }
 syncInputOptions();
}
