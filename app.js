// BEGIN INPUT OPTIONS BUNDLE
// Source: stations.js
// 수도권 역 선택용 로컬 목록. 실시간 운행 여부와 별개이며 직접 입력도 가능하다.
const LINES = {
'1호선':'연천 전곡 청산 소요산 동두천 보산 동두천중앙 지행 덕정 덕계 양주 녹양 가능 의정부 회룡 망월사 도봉산 도봉 방학 창동 녹천 월계 광운대 석계 신이문 외대앞 회기 청량리 제기동 신설동 동묘앞 동대문 종로5가 종로3가 종각 시청 서울 남영 용산 노량진 대방 신길 영등포 신도림 구로 구일 개봉 오류동 온수 역곡 소사 부천 중동 송내 부개 부평 백운 동암 간석 주안 도화 제물포 도원 동인천 인천 가산디지털단지 독산 금천구청 광명 석수 관악 안양 명학 금정 군포 당정 의왕 성균관대 화서 수원 세류 병점 서동탄 세마 오산대 오산 진위 송탄 서정리 평택지제 평택 성환 직산 두정 천안 봉명 쌍용 아산 탕정 배방 온양온천 신창',
'2호선':'시청 을지로입구 을지로3가 을지로4가 동대문역사문화공원 신당 상왕십리 왕십리 한양대 뚝섬 성수 건대입구 구의 강변 잠실나루 잠실 잠실새내 종합운동장 삼성 선릉 역삼 강남 교대 서초 방배 사당 낙성대 서울대입구 봉천 신림 신대방 구로디지털단지 대림 신도림 문래 영등포구청 당산 합정 홍대입구 신촌 이대 아현 충정로 용답 신답 용두 신설동 도림천 양천구청 신정네거리 까치산',
'3호선':'대화 주엽 정발산 마두 백석 대곡 화정 원당 원흥 삼송 지축 구파발 연신내 불광 녹번 홍제 무악재 독립문 경복궁 안국 종로3가 을지로3가 충무로 동대입구 약수 금호 옥수 압구정 신사 잠원 고속터미널 교대 남부터미널 양재 매봉 도곡 대치 학여울 대청 일원 수서 가락시장 경찰병원 오금',
'4호선':'진접 오남 별내별가람 북한산 상계 노원 창동 쌍문 수유 미아 미아사거리 길음 성신여대입구 한성대입구 혜화 동대문 동대문역사문화공원 충무로 명동 회현 서울 숙대입구 삼각지 신용산 이촌 동작 총신대입구 사당 남태령 선바위 경마공원 대공원 과천 정부과천청사 인덕원 평촌 범계 금정 산본 수리산 대야미 반월 상록수 한대앞 중앙 고잔 초지 안산 신길온천 정왕 오이도',
'5호선':'방화 개화산 김포공항 송정 마곡 발산 우장산 화곡 까치산 신정 목동 오목교 양평 영등포구청 영등포시장 신길 여의도 여의나루 마포 공덕 애오개 충정로 서대문 광화문 종로3가 을지로4가 동대문역사문화공원 청구 신금호 행당 왕십리 마장 답십리 장한평 군자 아차산 광나루 천호 강동 길동 굽은다리 명일 고덕 상일동 강일 미사 하남풍산 하남시청 하남검단산 둔촌동 올림픽공원 방이 오금 개롱 거여 마천',
'6호선':'응암 역촌 불광 독바위 연신내 구산 새절 증산 디지털미디어시티 월드컵경기장 마포구청 망원 합정 상수 광흥창 대흥 공덕 효창공원앞 삼각지 녹사평 이태원 한강진 버티고개 약수 청구 신당 동묘앞 창신 보문 안암 고려대 월곡 상월곡 돌곶이 석계 태릉입구 화랑대 봉화산 신내',
'7호선':'장암 도봉산 수락산 마들 노원 중계 하계 공릉 태릉입구 먹골 중화 상봉 면목 사가정 용마산 중곡 군자 어린이대공원 건대입구 자양 청담 강남구청 학동 논현 반포 고속터미널 내방 이수 남성 숭실대입구 상도 장승배기 신대방삼거리 보라매 신풍 대림 남구로 가산디지털단지 철산 광명사거리 천왕 온수 까치울 부천종합운동장 춘의 신중동 부천시청 상동 삼산체육관 굴포천 부평구청 산곡 석남',
'8호선':'별내 다산 동구릉 구리 장자호수공원 암사역사공원 암사 천호 강동구청 몽촌토성 잠실 석촌 송파 가락시장 문정 장지 복정 남위례 산성 남한산성입구 단대오거리 신흥 수진 모란',
'9호선':'개화 김포공항 공항시장 신방화 마곡나루 양천향교 가양 증미 등촌 염창 신목동 선유도 당산 국회의사당 여의도 샛강 노량진 노들 흑석 동작 구반포 신반포 고속터미널 사평 신논현 언주 선정릉 삼성중앙 봉은사 종합운동장 삼전 석촌고분 석촌 송파나루 한성백제 올림픽공원 둔촌오륜 중앙보훈병원',
'경의중앙선':'문산 파주 월롱 금촌 금릉 운정 야당 탄현 일산 풍산 백마 곡산 대곡 능곡 행신 강매 한국항공대 수색 디지털미디어시티 가좌 신촌 서울 홍대입구 서강대 공덕 효창공원앞 용산 이촌 서빙고 한남 옥수 응봉 왕십리 청량리 회기 중랑 상봉 망우 양원 구리 도농 양정 덕소 도심 팔당 운길산 양수 신원 국수 아신 오빈 양평 원덕 용문 지평',
'공항철도':'서울 공덕 홍대입구 디지털미디어시티 마곡나루 김포공항 계양 검암 청라국제도시 영종 운서 공항화물청사 인천공항1터미널 인천공항2터미널',
'경춘선':'청량리 회기 중랑 상봉 망우 신내 갈매 별내 퇴계원 사릉 금곡 평내호평 천마산 마석 대성리 청평 상천 가평 굴봉산 백양리 강촌 김유정 남춘천 춘천 광운대',
'수인분당선':'청량리 왕십리 서울숲 압구정로데오 강남구청 선정릉 선릉 한티 도곡 구룡 개포동 대모산입구 수서 복정 가천대 태평 모란 야탑 이매 서현 수내 정자 미금 오리 죽전 보정 구성 신갈 기흥 상갈 청명 영통 망포 매탄권선 수원시청 매교 수원 고색 오목천 어천 야목 사리 한대앞 중앙 고잔 초지 안산 신길온천 정왕 오이도 달월 월곶 소래포구 인천논현 호구포 남동인더스파크 원인재 연수 송도 인하대 숭의 신포 인천',
'신분당선':'신사 논현 신논현 강남 양재 양재시민의숲 청계산입구 판교 정자 미금 동천 수지구청 성복 상현 광교중앙 광교',
'우이신설선':'북한산우이 솔밭공원 419민주묘지 가오리 화계 삼양 삼양사거리 솔샘 북한산보국문 정릉 성신여대입구 보문 신설동',
'신림선':'샛강 대방 서울지방병무청 보라매 보라매공원 보라매병원 당곡 신림 서원 서울대벤처타운 관악산',
'GTX-A':'운정중앙 킨텍스 대곡 연신내 서울 수서 성남 구성 동탄',
'경강선':'판교 성남 이매 삼동 경기광주 초월 곤지암 신둔도예촌 이천 부발 세종대왕릉 여주',
'서해선':'일산 풍산 백마 곡산 대곡 능곡 김포공항 원종 부천종합운동장 소사 소새울 시흥대야 신천 신현 시흥시청 시흥능곡 달미 선부 초지 시우 원시',
'김포골드라인':'양촌 구래 마산 장기 운양 걸포북변 사우 풍무 고촌 김포공항',
'인천1호선':'검단호수공원 신검단중앙 아라 계양 귤현 박촌 임학 계산 경인교대입구 작전 갈산 부평구청 부평시장 부평 동수 부평삼거리 간석오거리 인천시청 예술회관 인천터미널 문학경기장 선학 신연수 원인재 동춘 동막 캠퍼스타운 테크노파크 지식정보단지 인천대입구 센트럴파크 국제업무지구 송도달빛축제공원',
'인천2호선':'검단오류 왕길 검단사거리 마전 완정 독정 검암 검바위 아시아드경기장 서구청 가정 가정중앙시장 석남 서부여성회관 인천가좌 가재울 주안국가산단 주안 시민공원 석바위시장 인천시청 석천사거리 모래내시장 만수 남동구청 인천대공원 운연',
'의정부경전철':'발곡 회룡 범골 경전철의정부 의정부시청 흥선 의정부중앙 동오 새말 경기도청북부청사 효자 곤제 어룡 송산 탑석',
'용인에버라인':'기흥 강남대 지석 어정 동백 초당 삼가 시청용인대 명지대 김량장 용인중앙시장 고진 보평 둔전 전대에버랜드'
};
for (const line of Object.keys(LINES)) LINES[line] = [...new Set(LINES[line].split(' '))];
// 역명 변경의 구·신 명칭은 인식 시 동일 역으로 취급한다.
const ALIASES = {'서울역':'서울','뚝섬유원지':'자양','당고개':'북한산','화전':'한국항공대','4.19민주묘지':'419민주묘지'};
function normalizeStation(value) { const v=String(value||'').trim(); return ALIASES[v] || (v.endsWith('역') ? v.slice(0,-1) : v); }
function stationLines(value) { const name=normalizeStation(value); return Object.keys(LINES).filter(line=>LINES[line].includes(name)); }

const LINE_COLORS = {'1호선':'#0052a4','2호선':'#00a84d','3호선':'#ef7c1c','4호선':'#00a5de','5호선':'#996cac','6호선':'#cd7c2f','7호선':'#747f00','8호선':'#e6186c','9호선':'#bdb092','경의중앙선':'#77c4a3','공항철도':'#0090d2','경춘선':'#0c8e72','수인분당선':'#f5a200','신분당선':'#d4003b','우이신설선':'#b7c452','신림선':'#6789ca','GTX-A':'#9a6292','경강선':'#003da5','서해선':'#8fc31f','김포골드라인':'#a17800','인천1호선':'#7ca8d5','인천2호선':'#ed8b00','의정부경전철':'#f6a600','용인에버라인':'#6fb245'};

// Source: input-helpers.js
const digits = {'영':0,'공':0,'일':1,'이':2,'삼':3,'사':4,'오':5,'육':6,'칠':7,'팔':8,'구':9,'한':1,'하나':1,'두':2,'둘':2,'세':3,'셋':3,'네':4,'넷':4,'다섯':5,'여섯':6,'일곱':7,'여덟':8,'아홉':9,'열':10,'스무':20,'스물':20};
function numberKo(s) {
 s=String(s).replace(/\s/g,''); if (/^\d+$/.test(s)) return Number(s);
 if (digits[s]!==undefined) return digits[s];
 if(s.includes('십')) {const [a,b]=s.split('십');return (a?digits[a]:1)*10+(b?digits[b]:0);}
 for(const [word,n] of [['스물',20],['스무',20],['서른',30],['마흔',40],['쉰',50],['열',10]]) if(s.startsWith(word))return n+(digits[s.slice(word.length)]||0);
 return NaN;
}
const numeric='[0-9영공일이삼사오육칠팔구십한두세네열스물스무서른마흔쉰다섯여섯일곱여덟아홉]+';
function parseSpeech(text, today, field='') {
 const result={}; let t=text.replace(/\s+/g,' ').trim();
 for(const [oldName,newName] of Object.entries(ALIASES))t=t.replaceAll(oldName,newName);
 const offset=t.includes('모레')?2:t.includes('내일')?1:t.includes('오늘')?0:null;
 if(offset!==null){const d=new Date(today+'T00:00:00+09:00');d.setUTCDate(d.getUTCDate()+offset);result.date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);}
 const explicit=t.match(/(\d{4})[년-]\s*(\d{1,2})[월-]\s*(\d{1,2})/);
 if(explicit)result.date=`${explicit[1]}-${explicit[2].padStart(2,'0')}-${explicit[3].padStart(2,'0')}`;
 const time=t.match(new RegExp(`(?:오전|오후|아침|저녁|밤|낮)?\\s*(${numeric})\\s*시(?:\\s*(${numeric})\\s*분|\\s*(반))?`));
 if(time){let h=numberKo(time[1]);const m=time[3]?30:time[2]?numberKo(time[2]):0;
  if(/오후|저녁|밤|낮/.test(t)&&h<12)h+=12;if(/오전|아침/.test(t)&&h===12)h=0;
  if(h<24&&m<60&&(h>12||/오전|오후|아침|저녁|밤|낮/.test(t)))result.time=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
 }
 for(const [key,words] of [['prep','준비'],['walk','걷기|도보|걸어서|걷는 시간'],['ride','이동|지하철|타는 시간']]){
  const match=t.match(new RegExp(`(?:${words})(?:는|은|시간|가|에|\\s)*(${numeric})\\s*분`));
  if(match){const n=numberKo(match[1]);if(n>=0&&n<=240)result[key]=n;}
 }
 const names=[...new Set(Object.values(LINES).flat())].sort((a,b)=>b.length-a.length);
 const found=[];
 for(const name of names){let pos=t.indexOf(name);while(pos>=0){if(!found.some(x=>pos>=x.pos&&pos<x.pos+x.name.length))found.push({name,pos});pos=t.indexOf(name,pos+name.length);}}
 found.sort((a,b)=>a.pos-b.pos);
 for(const item of found){const tail=t.slice(item.pos+item.name.length); if(/^역?\s*(에서|출발)/.test(tail))result.from=item.name;else if(/^역?\s*(까지|으로|로|도착)/.test(tail))result.to=item.name;}
 if(!result.to&&found.length===1&&!result.from)result.to=found[0].name;
 if(!result.from&&found.length>=2){result.from=found[0].name;result.to=found.at(-1).name;}
 const lineMatches=[...t.matchAll(/(\d+)\s*호선/g)].map(m=>({line:m[1]+'호선',pos:m.index}));
 for(const key of ['from','to'])if(result[key]){const pos=t.indexOf(result[key]);const line=lineMatches.filter(m=>m.pos<pos).at(-1)?.line;if(line&&LINES[line]?.includes(result[key]))result[key+'Line']=line;}
 if(field==='station')return {value:found[0]?.name||normalizeStation(t.replace(/.*호선\s*/,'')),line:lineMatches[0]?.line||''};
 if(field==='number'){const match=t.match(new RegExp(`(${numeric})\\s*(분)?`));return {value:match?numberKo(match[1]):NaN};}
 return result;
}

// Source: input-options.js
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
function syncInputOptions(){syncers.forEach(fn=>fn());updateLineTheme();}
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
function mountInputOptions(){
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
// END INPUT OPTIONS BUNDLE
import { addMinutes, calculatePlan, formatDate, formatStamp, formatTime, nextRoutineDate, toICS } from './core.js';

const $ = (selector) => document.querySelector(selector);
const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
const KST_WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
function kstDayIndex(date) {
  const day = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', weekday: 'short' }).format(date);
  return KST_WEEKDAY_INDEX[day];
}
const STORAGE_KEY = 'arrival-coach-v1';
const defaults = { from: '', prep: 20, walk: 8, ride: 35 };
let state = readState();
let activeGoal = state.goal || null;
let planCache = null;
let lastStage = null;
let reminderGate = new Map();
let geolocationWatch = null;
let speech = null;
let recorder = null;
let mediaStream = null;
let voiceRequest = null;
let voiceRun = 0;
let voiceDraft = null;
let voiceTarget = 'goal';
let geoConfirmedThisSession = false;

function readState() {
  try { return { defaults: { ...defaults }, routines: [], goal: null, recent: null, home: null, homeEnabled: false, notifications: false, sound: false, ...(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')) }; }
  catch { return { defaults: { ...defaults }, routines: [], goal: null, recent: null, home: null, homeEnabled: false, notifications: false, sound: false }; }
}
function persist() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, goal: activeGoal })); } catch { toast('기기 저장 공간에 기록하지 못했어. 브라우저 저장 설정을 확인해 줘.'); } }
function escapeHTML(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function toast(message) { const node = $('#toast'); node.textContent = message; node.hidden = false; clearTimeout(toast.timer); toast.timer = setTimeout(() => node.hidden = true, 3600); }
function announce(node, message) { node.textContent = message; node.hidden = false; }
function setInputValues(value = {}) {
  $('#fromStation').dataset.line = value.fromLine || '';
  $('#toStation').dataset.line = value.toLine || '';
  $('#fromStation').value = value.from ?? $('#defaultFrom').value ?? '';
  $('#toStation').value = value.to ?? '';
  $('#targetDate').value = value.date ?? formatDate(new Date());
  $('#targetTime').value = value.time ?? formatTime(addMinutes(new Date(), 60));
  $('#prepMinutes').value = value.prep ?? $('#defaultPrep').value ?? 20;
  $('#walkMinutes').value = value.walk ?? 8;
  $('#rideMinutes').value = value.ride ?? 35;
  syncInputOptions();
}
function readGoalForm() {
  return { fromLine: $('#fromStation').dataset.line || '', toLine: $('#toStation').dataset.line || '', from: $('#fromStation').value.trim(), to: $('#toStation').value.trim(), date: $('#targetDate').value, time: $('#targetTime').value,
    prep: Number($('#prepMinutes').value), walk: Number($('#walkMinutes').value), ride: Number($('#rideMinutes').value) };
}
function validGoal(goal) {
  return Boolean(goal.to && goal.date && goal.time && [goal.prep, goal.walk, goal.ride].every(n => Number.isFinite(n) && n >= 0 && n <= 240) && goal.ride >= 1);
}
function calculate() {
  const goal = readGoalForm();
  if (!validGoal(goal)) { toast('도착역, 날짜, 시간과 예상 분을 확인해 줘.'); return null; }
  const result = calculatePlan({ ...goal, now: new Date() });
  if (!result.valid) { toast(result.reason); return null; }
  state.defaults = { from: goal.from, fromLine: goal.fromLine || '', prep: goal.prep, walk: goal.walk, ride: goal.ride };
  state.recent = { ...goal };
  persist();
  renderPlan(goal, result, Boolean(activeGoal));
  return { goal, result };
}
function renderPlan(goal, plan, active) {
  planCache = { goal, plan, active };
  lastStage = plan.stage;
  document.body.dataset.goalActive = active ? 'true' : 'false';
  $('#coachHeading').textContent = active ? plan.title : '도착까지 이렇게 준비해';
  $('#stopGoal').hidden = !active;
  $('#coachActions').hidden = !active;
  const arrivalLabel = active && plan.stage !== 'ready' && plan.stage !== 'preparing' ? '예상 최종 도착' : '지금부터 준비하면 도착';
  const stageLabel = active ? `<p class="coach-message">${escapeHTML(plan.action)}</p>` : `<p class="coach-message">${escapeHTML(plan.title)}</p>`;
  $('#coachContent').innerHTML = `
    <div class="time-summary">
      <div class="time-chip"><span>준비 시작</span><strong>${formatTime(plan.prepare)}</strong></div>
      <div class="time-chip"><span>늦어도 출발</span><strong>${formatTime(plan.leave)}</strong></div>
      <div class="time-chip"><span>${arrivalLabel}</span><strong>${formatTime(plan.target)}</strong></div>
      <div class="time-chip"><span>도착 목표</span><strong>${formatStamp(plan.target).slice(5)}</strong></div>
    </div>
    ${stageLabel}
    <p class="coach-sub">${escapeHTML(goal.from || '출발역 미입력')} → ${escapeHTML(goal.to)} · 준비 ${goal.prep}분 · 걷기 ${goal.walk}분 · 이동 예상 ${goal.ride}분</p>
    <p class="countdown" id="countdown">${countdownText(plan)}</p>`;
  $('#coachCard').dataset.stage = plan.stage;
}
function countdownText(plan) {
  if (plan.stage === 'arrived') return `목표 시각 ${formatTime(plan.target)} · 실제 도착 여부를 확인해 줘.`;
  const diff = Math.max(0, plan.target - new Date());
  const minutes = Math.floor(diff / 60000), seconds = Math.floor(diff / 1000) % 60;
  return `도착 목표까지 ${minutes}분 ${String(seconds).padStart(2, '0')}초 · 시간은 예상치야.`;
}
function startGoal() {
  const computed = calculate();
  if (!computed) return;
  if (activeGoal && !window.confirm('진행 중인 목표를 새 목표로 바꿀까?')) return;
  activeGoal = { ...computed.goal, startedAt: Date.now(), active: true };
  persist();
  const result = calculatePlan({ ...activeGoal, now: new Date() });
  renderPlan(activeGoal, result, true);
  if (['preparing', 'walking', 'riding'].includes(result.stage)) notifyStage(result.stage, result);
  startHomeWatchIfAllowed();
  $('#coachCard').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  $('#coachHeading').focus?.({ preventScroll: true });
  toast('안내를 시작했어. 이 페이지가 열려 있는 동안 시각을 확인할게.');
}
function stopGoal(arrived = false) {
  if (!activeGoal) return;
  if (arrived) activeGoal = null;
  else activeGoal = null;
  state.homeEnabled = false;
  document.body.dataset.goalActive = 'false';
  $('#homeEnabled').checked = false;
  stopHomeWatch();
  persist();
  if (arrived) toast('도착 완료를 기록했어. 수고했어!');
  else toast('안내를 멈췄어. 저장된 반복 일정은 그대로야.');
  lastStage = null;
  const computed = calculate();
  if (!computed) {
    $('#coachHeading').textContent = arrived ? '도착 완료!' : '안내를 멈췄어';
    $('#coachContent').innerHTML = '<div class="empty-coach"><div class="coach-symbol" aria-hidden="true">✓</div><p>저장된 일정과 설정은 유지했어.</p></div>';
    $('#coachActions').hidden = true;
    $('#stopGoal').hidden = true;
  }
}
function updateClock() {
  const now = new Date();
  $('#liveClock').textContent = formatTime(now);
  const [year, month, day] = formatDate(now).split('-').map(Number);
  $('#liveDate').textContent = `${year}년 ${month}월 ${day}일 · ${DAY_NAMES[kstDayIndex(now)]}요일`;
  if (!activeGoal) return;
  const plan = calculatePlan({ ...activeGoal, now });
  if (!plan.valid) return;
  if (plan.stage !== lastStage) {
    renderPlan(activeGoal, plan, true);
    if (['preparing', 'walking', 'riding', 'arrived'].includes(plan.stage)) notifyStage(plan.stage, plan);
  } else {
    const countdown = $('#countdown');
    if (countdown) countdown.textContent = countdownText(plan);
    // The top-level countdown changes each second; don't rebuild the card or move focus.
  }
  checkHomeNudge(plan, now);
}
function notifyStage(stage, plan) {
  const messages = { preparing: ['준비 시작할 시간이야', `${activeGoal.to}까지 갈 준비를 시작해.`], walking: ['출발 시각이야', '입력한 예상 시각이야. 집을 나섰는지 확인해 줘.'], riding: ['지하철 이동 예상 구간이야', '실제 열차 위치나 이동 경로는 확인할 수 없어.'], arrived: ['도착 목표 시각', '실제 도착 여부를 확인해 줘.'] };
  const [title, body] = messages[stage] || [];
  if (!title) return;
  const now = Date.now(), key = stage;
  if (now - (reminderGate.get(key) || 0) < 5 * 60_000) return;
  reminderGate.set(key, now);
  if (state.notifications && 'Notification' in window && Notification.permission === 'granted') {
    try { new Notification(title, { body, tag: `arrival-${stage}` }); } catch { /* page-only reminder remains available */ }
  }
  if (state.sound) playTone();
  toast(`${title} · ${body}`);
}
function playTone() {
  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator(), gain = context.createGain();
    oscillator.connect(gain); gain.connect(context.destination); oscillator.frequency.value = 680;
    gain.gain.value = .07; oscillator.start(); oscillator.stop(context.currentTime + .16);
    oscillator.onended = () => context.close();
  } catch { /* sound is optional and browser-controlled */ }
}

function dayLabel(days) { return [...days].sort((a, b) => (a || 7) - (b || 7)).map(d => `${DAY_NAMES[d]}요일`).join(' · '); }
function renderRoutines() {
  const list = $('#routineList');
  if (!state.routines.length) { list.innerHTML = '<p class="muted empty-list">아직 저장된 일정이 없어.</p>'; return; }
  list.innerHTML = state.routines.map(item => {
    const next = nextRoutineDate(item);
    return `<article class="routine-item" data-id="${escapeHTML(item.id)}">
      <div class="routine-top"><strong class="routine-title">${escapeHTML(item.name)}</strong><span class="routine-time">${escapeHTML(item.time)}</span></div>
      <p class="routine-meta">${escapeHTML(item.from || '출발역 미입력')} → ${escapeHTML(item.to)} · ${escapeHTML(dayLabel(item.days))}</p>
      <div class="routine-actions"><button class="button button-primary" data-action="start" type="button">오늘 한 번 시작</button><button class="button button-outline" data-action="edit" type="button">편집</button><button class="button button-outline" data-action="ics" type="button">캘린더 알람</button><button class="button button-outline" data-action="delete" type="button">삭제</button></div>
      <div class="next-date">다음 일정 · ${next ? `${formatDate(next).slice(5).replace('-', '/') }(${DAY_NAMES[kstDayIndex(next)]})` : '계산할 수 없음'}</div>
    </article>`;
  }).join('');
}
function resetRoutineForm() {
  $('#routineForm').reset(); $('#routineId').value = ''; $('#routinePrep').value = state.defaults.prep; $('#routineWalk').value = state.defaults.walk; $('#routineRide').value = state.defaults.ride;
}
function openRoutine(item = null) {
  resetRoutineForm();
  if (item) {
    $('#routineId').value = item.id; $('#routineName').value = item.name; $('#routineTime').value = item.time;
    $('#routineFrom').value = item.from || ''; $('#routineTo').value = item.to || '';
    $('#routinePrep').value = item.prep; $('#routineWalk').value = item.walk; $('#routineRide').value = item.ride;
    document.querySelectorAll('.weekday-list input').forEach(input => input.checked = item.days.includes(Number(input.value)));
  }
  $('#routineFrom').dataset.line = item?.fromLine || '';
  $('#routineTo').dataset.line = item?.toLine || '';
  syncInputOptions();
  $('#routineForm').hidden = false; $('#routineName').focus();
}
function submitRoutine(event) {
  event.preventDefault();
  const days = [...document.querySelectorAll('.weekday-list input:checked')].map(input => Number(input.value));
  if (!days.length) { toast('반복할 요일을 하나 이상 골라 줘.'); return; }
  const id = $('#routineId').value || crypto.randomUUID();
  const routine = { id, fromLine: $('#routineFrom').dataset.line || '', toLine: $('#routineTo').dataset.line || '', name: $('#routineName').value.trim(), days, time: $('#routineTime').value, from: $('#routineFrom').value.trim(), to: $('#routineTo').value.trim(), prep: Number($('#routinePrep').value), walk: Number($('#routineWalk').value), ride: Number($('#routineRide').value) };
  if (!routine.name || !routine.to || !routine.time) { toast('이름, 도착역, 도착 시각을 채워 줘.'); return; }
  if (state.routines.some(item => item.id !== id && item.time === routine.time && item.days.some(day => days.includes(day))) && !window.confirm('같은 요일과 시각에 일정이 있어. 그래도 저장할까?')) return;
  const index = state.routines.findIndex(item => item.id === id);
  if (index >= 0) state.routines[index] = routine; else state.routines.push(routine);
  state.defaults = { from: routine.from, fromLine: routine.fromLine || '', prep: routine.prep, walk: routine.walk, ride: routine.ride };
  persist(); renderRoutines(); $('#routineForm').hidden = true; toast('일정을 저장했어.');
}
function startRoutine(item) {
  const next = nextRoutineDate(item);
  if (!next) { toast('다음 일정을 계산할 수 없어. 반복 요일과 시각을 확인해 줘.'); return; }
  if (activeGoal && !window.confirm('진행 중인 목표를 이 일정으로 바꿀까?')) return;
  setInputValues({ ...item, date: formatDate(next) });
  activeGoal = { ...readGoalForm(), startedAt: Date.now(), active: true };
  state.defaults = { from: activeGoal.from, fromLine: activeGoal.fromLine || '', prep: activeGoal.prep, walk: activeGoal.walk, ride: activeGoal.ride };
  state.recent = { ...activeGoal };
  persist();
  const routinePlan = calculatePlan({ ...activeGoal, now: new Date() });
  renderPlan(activeGoal, routinePlan, true);
  if (['preparing', 'walking', 'riding'].includes(routinePlan.stage)) notifyStage(routinePlan.stage, routinePlan);
  startHomeWatchIfAllowed();
  $('#coachCard').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  toast(`${item.name} 일정으로 안내를 시작했어.`);
}
function exportICS(item) {
  const weekly = window.confirm('확인을 누르면 매주 반복, 취소를 누르면 이번 일정만 내보내.');
  try {
    const result = toICS(item, { repeat: weekly });
    const blob = new Blob([result.content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = `arrival-${item.id}.ics`; link.click(); URL.revokeObjectURL(url);
    const note = result.pastForFirst ? `반복 알람 2개를 유지했어. 첫 일정에서는 ${result.pastForFirst}개 알람 시각이 지나 있어 울리지 않을 수 있어.` : result.omitted ? `이번 일정만 내보냈어. 이미 지난 알람 ${result.omitted}개는 제외했어.` : '준비·출발 알람이 포함된 캘린더 파일을 만들었어.';
    announce($('#calendarNotice'), note);
  } catch (error) { toast(error.message); }
}

async function checkAIStatus() {
  try {
    const response = await fetch('/api/ai/status', { cache: 'no-store' });
    const data = await response.json();
    $('#aiStatus').textContent = data.configured ? `OpenAI 서버 키 설정됨 · 연결 확인 전 (${data.intentModel})` : 'AI 미연결 · 서버 키 미설정';
    $('.status-dot').classList.remove('ok');
    return data;
  } catch {
    $('#aiStatus').textContent = '서버 상태 확인 불가'; return { configured: false };
  }
}
async function openVoice(target = 'goal') {
  voiceTarget = typeof target === 'string' ? target : 'goal';
  voiceDraft = null; $('#transcript').value = ''; $('#voiceDialog').showModal();
  $('#voiceDialogStatus').textContent = '마이크를 쓰려면 아래 말하기 시작 버튼을 눌러. 직접 입력도 가능해.';
}
function applySpokenText() {
  const text = $('#transcript').value.trim();
  const parsed = parseSpeech(text, formatDate(new Date()));
  const target = voiceTarget === 'routine' ? {from:'routineFrom',to:'routineTo',time:'routineTime',prep:'routinePrep',walk:'routineWalk',ride:'routineRide'} : {from:'fromStation',to:'toStation',date:'targetDate',time:'targetTime',prep:'prepMinutes',walk:'walkMinutes',ride:'rideMinutes'};
  const applied=[];
  for(const [key,id] of Object.entries(target)) if(parsed[key]!=null){
    $('#'+id).value=parsed[key];
    if(key==='from'||key==='to')$('#'+id).dataset.line=parsed[key+'Line']||'';
    applied.push(key);
  }
  if(voiceTarget==='routine'){
    const days = ['일','월','화','수','목','금','토'];
    const weekdays = text.includes('평일')?[1,2,3,4,5]:text.includes('주말')?[0,6]:text.includes('매일')?[0,1,2,3,4,5,6]:days.map((day,i)=>text.includes(day+'요일')?i:null).filter(i=>i!==null);
    if(weekdays.length){document.querySelectorAll('.weekday-list input').forEach(el=>el.checked=weekdays.includes(Number(el.value)));applied.push('days');}
    const name=['출근','퇴근','등교','수업','약속','운동','병원','귀가'].find(n=>text.includes(n));
    if(name){$('#routineName').value=name;applied.push('name');}
  }
  syncInputOptions();
  $('#voiceDialogStatus').textContent=applied.length ? `말한 내용으로 ${applied.length}개 항목을 자동으로 채웠어. 선택 메뉴에서 확인·수정하고 시작해 줘.${/시/.test(text)&&!parsed.time?' 시각은 오전·오후를 붙여 다시 알려 줘.':''}` : '값을 확정하지 못했어. 역 이름, 오전·오후와 시각, 준비·도보·이동 분을 붙여 말해 줘.';
  return applied.length>0;
}
function cleanupVoice() {
  voiceRun++;
  clearTimeout(recorderTimer); recorderTimer = null;
  if (voiceRequest) voiceRequest.abort(); voiceRequest = null;
  try { speech?.stop(); } catch { /* already stopped */ }
  speech = null;
  if (recorder && recorder.state !== 'inactive') { try { recorder.stop(); } catch { /* already stopped */ } }
  recorder = null;
  mediaStream?.getTracks().forEach(track => track.stop()); mediaStream = null;
  $('#speechStop').hidden = true;
}
function startSpeech() {
  cleanupVoice();
  const run = voiceRun;
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (Recognition) {
    try {
      speech = new Recognition(); speech.lang = 'ko-KR'; speech.interimResults = false; speech.maxAlternatives = 1;
      speech.onresult = event => { if (run === voiceRun) { $('#transcript').value = event.results[0][0].transcript; applySpokenText(); } };
      speech.onerror = event => { if (run === voiceRun) $('#voiceDialogStatus').textContent = event.error === 'not-allowed' ? '마이크 권한이 거절됐어. 아래에 직접 입력해 줘.' : '음성을 인식하지 못했어. 다시 말하거나 직접 입력해 줘.'; };
      speech.onend = () => { if (run === voiceRun) speech = null; };
      speech.start(); $('#voiceDialogStatus').textContent = '듣고 있어… 마이크 사용은 이 버튼을 눌러 시작했어.'; return;
    } catch { speech = null; }
  }
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    $('#voiceDialogStatus').textContent = '이 브라우저는 음성 입력을 지원하지 않아. 아래 입력란에 직접 적어 줘.'; $('#transcript').focus(); return;
  }
  recordForTranscription(run);
}
async function recordForTranscription(run) {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (run !== voiceRun || !$('#voiceDialog').open) { mediaStream.getTracks().forEach(track => track.stop()); return; }
    const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find(type => MediaRecorder.isTypeSupported(type)) || '';
    recorder = new MediaRecorder(mediaStream, mimeType ? { mimeType } : undefined);
    const chunks = [];
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
    recorder.onstop = async () => {
      mediaStream?.getTracks().forEach(track => track.stop()); mediaStream = null; $('#speechStop').hidden = true;
      const blob = new Blob(chunks, { type: recorder?.mimeType || mimeType || 'audio/webm' });
      if (blob.size > 4 * 1024 * 1024) { $('#voiceDialogStatus').textContent = '음성이 4MB를 넘었어. 짧게 다시 녹음해 줘.'; return; }
      if (run !== voiceRun || !blob.size) return;
      $('#voiceDialogStatus').textContent = '음성을 서버로 보내 전사 중이야. 음성은 저장하지 않아.';
      voiceRequest = new AbortController();
      try {
        const formData = new FormData(); formData.append('file', blob, `voice.${blob.type.includes('mp4') ? 'mp4' : 'webm'}`);
        const response = await fetch('/api/transcribe', { method: 'POST', body: formData, signal: voiceRequest.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || '전사 요청을 완료하지 못했어.');
        if (run === voiceRun) { $('#transcript').value = data.transcript; applySpokenText(); }
      } catch (error) { if (error.name !== 'AbortError' && run === voiceRun) $('#voiceDialogStatus').textContent = error.message || '전사에 실패했어. 직접 입력해 줘.'; }
    };
    recorder.start(); $('#speechStop').hidden = false; $('#voiceDialogStatus').textContent = '최대 15초 녹음 중이야. 멈추면 서버 전사를 요청해.';
    recorderTimer = setTimeout(() => { if (recorder?.state === 'recording') recorder.stop(); }, 15_000);
  } catch {
    mediaStream?.getTracks().forEach(track => track.stop()); mediaStream = null;
    $('#voiceDialogStatus').textContent = '마이크 권한이 없거나 사용할 수 없어. 아래에 직접 입력해 줘.';
  }
}
let recorderTimer = null;
function mergeIntent(intent, previous) {
  const result = { ...(previous || {}), ...(intent || {}) };
  for (const key of ['from', 'to', 'date', 'time', 'prep', 'walk', 'ride']) if (intent?.[key] == null) result[key] = previous?.[key] ?? null;
  return result;
}
async function parseVoice() {
  if (applySpokenText()) return;
  const transcript = $('#transcript').value.trim();
  if (!transcript) { $('#voiceDialogStatus').textContent = '말한 내용을 적어 줘.'; $('#transcript').focus(); return; }
  if (transcript.length > 2000) { $('#voiceDialogStatus').textContent = '문장은 2,000자 이내로 입력해 줘.'; return; }
  cleanupVoice(); const run = voiceRun;
  voiceRequest = new AbortController();
  $('#voiceDialogStatus').textContent = '서버의 AI 일정 확인을 기다리는 중이야. 키가 없으면 연결되지 않아.';
  try {
    const current = readGoalForm();
    const previous = voiceDraft || {};
    const response = await fetch('/api/intent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: voiceRequest.signal,
      body: JSON.stringify({ transcript, context: { today: formatDate(new Date()), defaults: { ...state.defaults, from: state.defaults.from || $('#defaultFrom').value }, previous } }) });
    const data = await response.json();
    if (run !== voiceRun) return;
    if (!response.ok) throw new Error(data.error || 'AI 연결을 완료하지 못했어. 직접 입력으로 목표를 계속 만들 수 있어.');
    const intent = mergeIntent(data.intent, previous);
    intent.from = intent.from || state.defaults.from || $('#defaultFrom').value || current.from || null;
    intent.prep = intent.prep ?? state.defaults.prep;
    intent.walk = intent.walk ?? state.defaults.walk;
    intent.ride = intent.ride ?? state.defaults.ride;
    voiceDraft = intent;
    const missing = [['from','출발역'], ['to','도착역'], ['date','도착 날짜'], ['time','도착 시각']].find(([key]) => !intent[key]);
    if (missing) {
      $('#voiceDialogStatus').textContent = data.intent.clarification || `${missing[1]}을 짧게 알려 줘. 앞서 말한 값은 유지할게.`;
      $('#transcript').value = ''; $('#transcript').placeholder = `${missing[1]}을 입력해 주세요`; $('#transcript').focus(); return;
    }
    const time = /^\d{2}:\d{2}$/.test(intent.time) ? intent.time : null;
    const date = /^\d{4}-\d{2}-\d{2}$/.test(intent.date) ? intent.date : null;
    const completed = { from: intent.from || '', to: intent.to, date, time, prep: intent.prep, walk: intent.walk, ride: intent.ride };
    if (!validGoal(completed) || !calculatePlan({ ...completed, now: new Date() }).valid) throw new Error('역·날짜·시간을 확인해 줘. 입력칸에서 수정할 수 있어.');
    const approved = window.confirm(`이 일정으로 안내를 시작할까?\n\n${completed.from || '출발역 미입력'} → ${completed.to}\n${completed.date} ${completed.time}\n준비 ${completed.prep}분 · 도보 ${completed.walk}분 · 이동 예상 ${completed.ride}분\n\n노선과 시간표는 연결되지 않았어. AI가 정리한 역과 시각을 확인해 줘.`);
    $('#voiceDialog').close(); cleanupVoice(); setInputValues(completed);
    if (!approved) {
      $('#voiceStatus').textContent = 'AI가 정리한 값을 양식에 채웠어. 확인하고 직접 시작해 줘.';
      $('#goalCard').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      $('#toStation').focus();
      return;
    }
    $('#voiceStatus').textContent = 'AI 결과를 확인했어. 입력칸에서 수정할 수 있어.';
    startGoal();
  } catch (error) {
    if (error.name === 'AbortError' || run !== voiceRun) return;
    $('#voiceDialogStatus').textContent = `${error.message} 음성 문장은 저장하지 않았어. 직접 입력하거나 목표 양식을 사용해 줘.`;
    $('#transcript').focus();
  }
}

let arrivalData = null;
function renderArrivals() {
  if (!arrivalData) return;
  const container = $('#arrivalResults'); container.replaceChildren();
  const now = Date.now() / 1000;
  const lineNames = {1001:'1호선',1002:'2호선',1003:'3호선',1004:'4호선',1005:'5호선',1006:'6호선',1007:'7호선',1008:'8호선',1009:'9호선',1061:'경의중앙선',1063:'경의중앙선',1065:'공항철도',1067:'경춘선',1075:'수인분당선',1077:'신분당선',1092:'우이신설선',1032:'GTX-A'};
  for (const train of arrivalData.trains) {
    const selectedLine = $('#arrivalStation').dataset.line;
    if(selectedLine && lineNames[train.line] !== selectedLine) continue;
    const card = document.createElement('section'); card.className = 'realtime-line';
    const title = document.createElement('strong');
    title.textContent = `${lineNames[train.line] || train.line} · ${train.direction} · ${train.destination}`;
    const text = document.createElement('p');
    const age = train.receivedEpoch ? now - train.receivedEpoch : null;
    const remaining = train.arrivalEpoch ? Math.ceil(train.arrivalEpoch - now) : null;
    const fresh = age !== null && age >= -60 && age <= 180;
    const countdown = fresh && remaining > 0 ? `${Math.floor(remaining / 60)}분 ${remaining % 60}초 후 · ` : '';
    text.textContent = `${countdown}${train.message || train.detail || '도착예정시간 미제공'}${fresh ? '' : ' · 생성시각 확인 필요 / 오래된 정보'}`;
    const time = document.createElement('small'); time.textContent = `정보 생성: ${train.receivedAt || '미제공'}`;
    card.append(title, text, time); container.append(card);
  }
}
async function lookupArrivals(event) {
  event.preventDefault();
  const station = $('#arrivalStation').value.trim(); if (!station) return;
  const button = $('#arrivalSearch'); button.disabled = true;
  arrivalData = null; $('#arrivalResults').replaceChildren();
  $('#arrivalNotice').textContent = `${station}역 도착정보 조회 중…`;
  try {
    const response = await fetch(`/api/realtime/arrivals?station=${encodeURIComponent(station)}`, {cache:'no-store'});
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '조회에 실패했어.');
    arrivalData = data; renderArrivals();
    $('#arrivalNotice').textContent = data.trains.length
      ? `${data.station} · 조회 ${data.fetchedAt}${data.cached ? ' · 60초 캐시' : ''} · 남은 시간은 정보 생성 시각 기준으로 보정돼.`
      : `${data.station}역의 도착정보가 없어. 정확한 역 이름·운행 시간·제공 지역을 확인해 줘.`;
  } catch (error) { $('#arrivalNotice').textContent = error.message; }
  finally { button.disabled = false; }
}

async function loadTimetableStatus() {
  const badge = $('#timetableStatus');
  try {
    const response = await fetch('/api/realtime/status', { cache: 'no-store' });
    const data = await response.json();
    badge.textContent = data.configured ? '서울 실시간 API 설정됨' : 'API 키 미설정';
    badge.className = 'status-pill ' + (data.configured ? 'status-on' : 'status-off');
    $('#timetableMessage').textContent = data.configured
      ? `자동 ${data.refreshMinutes}분 갱신 · 최대 ${data.requestsPerRefresh}회 요청 · 60초 캐시`
      : 'PyCharm 실행 설정에서 SEOUL_REALTIME_API_KEY를 설정하면 실시간 위치를 조회해.';
    $('#timetableUpdated').textContent = data.configured ? '조회 대기' : '연결 대기';
    return Boolean(data.configured);
  } catch {
    badge.textContent = '상태 확인 실패';
    $('#timetableMessage').textContent = '서울 실시간 API 설정을 확인하지 못했어.';
    return false;
  }
}
async function loadScheduleApiStatus() {
  const note = $('#timetableApiStatus');
  try {
    const response = await fetch('/api/timetable/status', { cache: 'no-store' });
    const data = await response.json();
    note.textContent = data.message || '시간표 API 미연결. 예상 이동시간을 사용합니다.';
  } catch {
    note.textContent = '시간표 API 상태 확인에 실패했어. 예상 이동시간을 사용 중이야.';
  }
}
async function refreshTimetable() {
  const button = $('#refreshTimetable'); button.disabled = true;
  $('#timetableMessage').textContent = '서울 지하철 위치를 조회하고 있어.';
  try {
    const response = await fetch('/api/realtime/positions', { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '서울 API 요청에 실패했어.');
    const container = $('#realtimeLines'); container.replaceChildren();
    let total = 0; let failed = 0;
    for (const item of data.lines || []) {
      const section = document.createElement('section'); section.className = 'realtime-line';
      const title = document.createElement('strong'); title.textContent = item.line; section.append(title);
      if (item.error) { failed++; const note = document.createElement('p'); note.textContent = item.error; section.append(note); }
      else if (!item.trains?.length) { const note = document.createElement('p'); note.textContent = '현재 응답된 열차 정보 없음'; section.append(note); }
      else {
        total += item.trains.length; const list = document.createElement('ul');
        for (const train of item.trains) {
          const li = document.createElement('li');
          const status = ({ '0':'진입','1':'도착','2':'출발','3':'전역 출발' })[train.status] || '운행';
          li.textContent = `${train.station || '위치 정보 없음'} · ${status} · 행선 ${train.destination || '정보 없음'}${train.express ? ' · 급행/특급' : ''}`; list.append(li);
        }
        section.append(list);
      }
      container.append(section);
    }
    $('#timetableUpdated').textContent = `조회 ${data.updatedAt || ''}${data.cached ? ' · 캐시' : ''}`;
    $('#timetableMessage').textContent = `${total}대 열차 위치 수신${failed ? ` · ${failed}개 노선 응답 확인 필요` : ''}. 위치정보는 경로·도착시간 계산과 별개야.`;
  } catch (error) { $('#timetableMessage').textContent = `${error.message} API 키와 이용 승인을 확인해 줘.`; }
  finally { button.disabled = false; }
}

function saveDefaultSettings() {
  state.defaults = { ...state.defaults, from: $('#defaultFrom').value.trim(), fromLine: $('#defaultFrom').dataset.line || '', prep: Number($('#defaultPrep').value) || 0 };
  persist();
}
function stopHomeWatch() {
  if (geolocationWatch != null && navigator.geolocation) navigator.geolocation.clearWatch(geolocationWatch);
  geolocationWatch = null;
}
function setHomeMessage(message) { $('#homeHelp').textContent = message; }
function saveCurrentHome() {
  if (!navigator.geolocation) { setHomeMessage('이 브라우저는 위치 기능을 지원하지 않아.'); return; }
  setHomeMessage('현재 위치를 확인하고 있어. 브라우저 권한 창에서 허용해 줘.');
  navigator.geolocation.getCurrentPosition(position => {
    geoConfirmedThisSession = true;
    state.home = { lat: position.coords.latitude, lon: position.coords.longitude, savedAt: Date.now() };
    state.homeEnabled = false; $('#homeEnabled').checked = false; persist();
    setHomeMessage('집 위치를 이 기기에 저장했어. 출발 재촉은 목표 안내 중 켤 수 있어.');
  }, () => setHomeMessage('위치를 저장하지 못했어. 권한을 확인하거나 직접 목표 안내를 이용해 줘.'), { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
}
async function permissionGranted() {
  try { if (!navigator.permissions?.query) return false; return (await navigator.permissions.query({ name: 'geolocation' })).state === 'granted'; }
  catch { return false; }
}
async function startHomeWatchIfAllowed() {
  if (!state.homeEnabled || !state.home || !activeGoal || geolocationWatch != null) return;
  if (!navigator.geolocation) { setHomeMessage('이 브라우저는 위치 기능을 지원하지 않아. 저장된 선택은 보존했지만 추적은 시작하지 않았어.'); return; }
  if (!(await permissionGranted()) && !geoConfirmedThisSession) { setHomeMessage('저장된 선택은 유지했어. 기존 위치 권한이 확인되지 않아 추적을 재개하지 않았어. 현재 위치 저장 버튼을 눌러 직접 권한을 확인해 줘.'); return; }
  geolocationWatch = navigator.geolocation.watchPosition(position => {
    const distance = metersBetween(state.home.lat, state.home.lon, position.coords.latitude, position.coords.longitude);
    if (distance <= 160 && activeGoal) checkHomeNudge(calculatePlan({ ...activeGoal, now: new Date() }), new Date(), true);
  }, () => setHomeMessage('위치 확인이 멈췄어. 브라우저 권한을 확인하고 다시 켜 줘.'), { enableHighAccuracy: true, maximumAge: 20000, timeout: 15000 });
  setHomeMessage('목표 안내 중 이 페이지에서만 집 주변 여부를 확인해. 페이지를 닫으면 중단돼.');
}
function metersBetween(aLat, aLon, bLat, bLon) {
  const rad = n => n * Math.PI / 180, dLat = rad(bLat - aLat), dLon = rad(bLon - aLon);
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}
function checkHomeNudge(plan, now, atHome = false) {
  if (!atHome || !activeGoal || !state.homeEnabled || !plan) return;
  const minute = Math.floor(now.getTime() / 60000);
  const stage = plan.stage === 'ready' ? 'none' : plan.stage;
  if (stage === 'none') return;
  const key = `home-${stage}`;
  if (minute - (reminderGate.get(key) || -100) < 5) return;
  reminderGate.set(key, minute);
  const text = stage === 'preparing' ? '집에 있어. 이제 준비를 시작하자.' : '집에 있어. 늦어도 출발 시각이야. 나가자.';
  toast(text);
  if (state.notifications && 'Notification' in window && Notification.permission === 'granted') new Notification('집에서 나갈 준비', { body: text, tag: key });
}
async function setNotifications(enabled) {
  if (!enabled) { state.notifications = false; persist(); return; }
  if (!('Notification' in window)) { $('#notificationsEnabled').checked = false; toast('이 브라우저는 알림을 지원하지 않아.'); return; }
  const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
  state.notifications = permission === 'granted'; $('#notificationsEnabled').checked = state.notifications; persist();
  $('#notificationHelp').textContent = state.notifications ? '준비·출발 시각을 알림으로 알려줄게. 페이지가 열려 있어야 해.' : '알림 권한이 허용되지 않았어. 페이지 안의 안내는 계속 보여.';
}

function swapStations(fromId,toId){
 const from=document.getElementById(fromId),to=document.getElementById(toId);
 const fromValue=from.value, toValue=to.value, fromLine=from.dataset.line||'',toLine=to.dataset.line||'';
 from.value=toValue;to.value=fromValue;
 from.dataset.line=toLine;to.dataset.line=fromLine;
 // Clear the visible line before restoring so transfer stations keep the swapped line.
 document.getElementById(fromId+'Line').value='';document.getElementById(toId+'Line').value='';
 syncInputOptions();
 if(fromId==='fromStation'){
  planCache=null;
  if(!activeGoal){$('#coachHeading').textContent='경로가 바뀌었어요';$('#coachContent').innerHTML='<p>시간 계산을 누르면 바뀐 경로로 다시 계산해요.</p>';}
 }
 toast('출발역과 도착역을 바꿨어. 확인 후 계산 또는 저장해 줘.');
}
function bindEvents() {
  $('#swapStations').addEventListener('click',()=>swapStations('fromStation','toStation'));
  $('#swapRoutineStations').addEventListener('click',()=>swapStations('routineFrom','routineTo'));
  $('#goalForm').addEventListener('submit', event => { event.preventDefault(); calculate(); });
  $('#startGoal').addEventListener('click', startGoal);
  $('#stopGoal').addEventListener('click', () => stopGoal(false));
  $('#markArrived').addEventListener('click', () => stopGoal(true));
  $('#editGoal').addEventListener('click', () => { $('#goalCard').scrollIntoView({ behavior: 'smooth', block: 'start' }); $('#toStation').focus(); });
  $('#newRoutine').addEventListener('click', () => openRoutine());
  $('#cancelRoutine').addEventListener('click', () => { $('#routineForm').hidden = true; });
  $('#routineForm').addEventListener('submit', submitRoutine);
  $('#routineList').addEventListener('click', event => {
    const button = event.target.closest('[data-action]'); if (!button) return;
    const article = button.closest('[data-id]'), item = state.routines.find(routine => routine.id === article?.dataset.id); if (!item) return;
    if (button.dataset.action === 'start') startRoutine(item);
    if (button.dataset.action === 'edit') openRoutine(item);
    if (button.dataset.action === 'ics') exportICS(item);
    if (button.dataset.action === 'delete' && window.confirm(`${item.name} 일정을 지울까?`)) { state.routines = state.routines.filter(routine => routine.id !== item.id); persist(); renderRoutines(); }
  });
  $('#voiceStart').addEventListener('click', () => openVoice('goal'));
  $('#routineVoice').addEventListener('click', () => openVoice('routine'));
  $('#speechButton').addEventListener('click', startSpeech);
  $('#speechStop').addEventListener('click', () => { clearTimeout(recorderTimer); if (recorder?.state === 'recording') recorder.stop(); });
  $('#parseTranscript').addEventListener('click', parseVoice);
  $('#cancelVoice').addEventListener('click', () => { cleanupVoice(); $('#voiceDialog').close(); });
  $('#voiceDialog').addEventListener('cancel', cleanupVoice);
  $('#voiceDialog').addEventListener('close', cleanupVoice);
  $('#arrivalForm').addEventListener('submit', lookupArrivals);
  $('#refreshTimetable').addEventListener('click', refreshTimetable);
  $('#defaultPrep').addEventListener('change', saveDefaultSettings);
  $('#defaultFrom').addEventListener('change', saveDefaultSettings);
  $('#notificationsEnabled').addEventListener('change', event => setNotifications(event.target.checked));
  $('#soundEnabled').addEventListener('change', event => { state.sound = event.target.checked; persist(); if (state.sound) playTone(); });
  $('#saveHome').addEventListener('click', saveCurrentHome);
  $('#homeEnabled').addEventListener('change', async event => {
    if (!event.target.checked) { state.homeEnabled = false; stopHomeWatch(); persist(); setHomeMessage('집 위치 재촉을 껐어.'); return; }
    if (!state.home) { event.target.checked = false; setHomeMessage('먼저 현재 위치 저장을 눌러 집 위치를 등록해 줘.'); return; }
    if (!activeGoal) { event.target.checked = false; toast('먼저 목표 안내를 시작해 줘.'); return; }
    state.homeEnabled = true; persist(); await startHomeWatchIfAllowed();
  });
  $('#clearLocal').addEventListener('click', () => {
    if (!window.confirm('저장된 기본값, 반복 일정, 목표와 집 위치를 이 기기에서 모두 지울까?')) return;
    stopHomeWatch(); cleanupVoice(); localStorage.removeItem(STORAGE_KEY); state = readState(); activeGoal = null; renderRoutines(); setInputValues(); $('#coachHeading').textContent = '목표 시간을 계산해볼까?'; $('#coachContent').innerHTML = '<div class="empty-coach"><div class="coach-symbol" aria-hidden="true">◷</div><p>목표를 입력하면 준비 시작 시각과 늦어도 출발할 시각을 보여줄게.</p></div>'; $('#coachActions').hidden = true; $('#stopGoal').hidden = true; $('#homeEnabled').checked = false; $('#defaultFrom').value = ''; $('#defaultPrep').value = 20; syncInputOptions(); toast('이 기기의 저장 내용을 지웠어.');
  });
}

function init() {
  $('#defaultFrom').value = state.defaults.from || '';
  $('#defaultFrom').dataset.line = state.defaults.fromLine || '';
  $('#defaultPrep').value = state.defaults.prep ?? 20;
  $('#notificationsEnabled').checked = Boolean(state.notifications && 'Notification' in window && Notification.permission === 'granted');
  $('#soundEnabled').checked = Boolean(state.sound);
  $('#homeEnabled').checked = Boolean(state.homeEnabled);
  setInputValues(activeGoal || { from: state.defaults.from, fromLine: state.defaults.fromLine || '', prep: state.defaults.prep, walk: state.defaults.walk, ride: state.defaults.ride });
  renderRoutines(); bindEvents(); updateClock(); setInterval(updateClock, 1000);
  $('#arrivalStation').value = state.defaults.from || '';
  mountInputOptions();
  syncInputOptions();
  setInterval(renderArrivals, 1000);
  checkAIStatus();
  loadScheduleApiStatus();
  loadTimetableStatus().then(configured => {
    if (!configured) return;
    refreshTimetable();
    setInterval(() => { if (document.visibilityState === 'visible') refreshTimetable(); }, 30 * 60_000);
  });
  if (activeGoal) {
    const plan = calculatePlan({ ...activeGoal, now: new Date() });
    renderPlan(activeGoal, plan, true);
    permissionGranted().then(granted => {
      if (granted && state.homeEnabled && state.home) { $('#homeEnabled').checked = true; startHomeWatchIfAllowed(); }
      else if (state.homeEnabled) setHomeMessage('저장된 선택은 유지했어. 기존 위치 권한이 확인되지 않아 추적을 재개하지 않았어. 위치 저장 버튼을 눌러 직접 권한을 확인해 줘.');
    });
  } else if (state.homeEnabled) {
    setHomeMessage('저장된 선택은 유지했어. 출발 재촉은 활성 목표가 있고 위치 권한이 허용될 때만 시작돼.');
  }
  if (state.recent && !activeGoal) setInputValues(state.recent);
  if (state.home) $('#homeHelp').textContent = '집 위치가 이 기기에 저장돼 있어. 출발 재촉은 목표 진행 중에만 작동해.';
}

window.addEventListener('pagehide', () => { stopHomeWatch(); cleanupVoice(); });
init();
