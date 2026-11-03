import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const stationsCode=await readFile(new URL('../stations.js',import.meta.url),'utf8');
const stationsURL='data:text/javascript;base64,'+Buffer.from(stationsCode).toString('base64');
const code=(await readFile(new URL('../input-helpers.js',import.meta.url),'utf8')).replace("'./stations.js'",JSON.stringify(stationsURL));
const {parseSpeech,numberKo}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const {LINES,stationLines,normalizeStation}=await import(stationsURL);
test('line catalog distinguishes transfer stations and normalizes aliases',()=>{
 assert(stationLines('신촌역').includes('2호선'));assert(stationLines('신촌').includes('경의중앙선'));
 assert.equal(normalizeStation('뚝섬유원지'),'자양');assert(LINES['7호선'].includes('자양'));
 assert.equal(Object.keys(LINES).length,24);
});
test('spoken trip fills named fields and preserves line context',()=>{
 const p=parseSpeech('2호선 신촌에서 2호선 이대까지 내일 오전 아홉 시 반 준비는 이십 분 도보 팔 분 이동 삼십오 분','2026-10-29');
 assert.deepEqual(p,{date:'2026-10-30',time:'09:30',prep:20,walk:8,ride:35,from:'신촌',to:'이대',fromLine:'2호선',toLine:'2호선'});
});
test('ambiguous hour and absent values are not invented',()=>{
 assert.equal(parseSpeech('이대까지 9시','2026-10-29').time,undefined);
 assert.equal(parseSpeech('오후 열두 시','2026-10-29').time,'12:00');
 assert.equal(parseSpeech('오전 열두 시','2026-10-29').time,'00:00');
 assert.equal(parseSpeech('준비 이십오 분','2026-10-29').prep,25);
 assert.equal(parseSpeech('모레','2026-12-31').date,'2027-01-02');
 assert(Number.isNaN(numberKo('모름')));
});
test('individual station and numeric speech are available without AI',()=>{
 assert.equal(parseSpeech('신촌역','2026-10-29','station').value,'신촌');
 assert.equal(parseSpeech('삼십오 분','2026-10-29','number').value,35);
});
