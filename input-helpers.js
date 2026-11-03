import { LINES, ALIASES, normalizeStation } from './stations.js';
const digits = {'영':0,'공':0,'일':1,'이':2,'삼':3,'사':4,'오':5,'육':6,'칠':7,'팔':8,'구':9,'한':1,'하나':1,'두':2,'둘':2,'세':3,'셋':3,'네':4,'넷':4,'다섯':5,'여섯':6,'일곱':7,'여덟':8,'아홉':9,'열':10,'스무':20,'스물':20};
export function numberKo(s) {
 s=String(s).replace(/\s/g,''); if (/^\d+$/.test(s)) return Number(s);
 if (digits[s]!==undefined) return digits[s];
 if(s.includes('십')) {const [a,b]=s.split('십');return (a?digits[a]:1)*10+(b?digits[b]:0);}
 for(const [word,n] of [['스물',20],['스무',20],['서른',30],['마흔',40],['쉰',50],['열',10]]) if(s.startsWith(word))return n+(digits[s.slice(word.length)]||0);
 return NaN;
}
const numeric='[0-9영공일이삼사오육칠팔구십한두세네열스물스무서른마흔쉰다섯여섯일곱여덟아홉]+';
export function parseSpeech(text, today, field='') {
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
