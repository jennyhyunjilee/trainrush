import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePlan, formatDate, nextRoutineDate, parseLocal, toICS } from '../core.js';
const kstDate = (date, time) => parseLocal(date, time);

test('local date parsing rejects impossible dates and accepts local wall time', () => {
  assert.equal(parseLocal('2026-02-30', '09:00'), null);
  assert.equal(parseLocal('2026-10-28', '24:00'), null);
  const result = parseLocal('2026-10-28', '09:30');
  assert.equal(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(result), '09:30');
});

test('goal calculator exposes prep, leave, walking, riding, arrival and estimate labels', () => {
  const target = kstDate('2026-10-28', '17:00');
  const goal = { date: '2026-10-28', time: '17:00', prep: 20, walk: 8, ride: 35 };
  const at = (mins) => new Date(target.getTime() + mins * 60000);
  const ready = calculatePlan({ ...goal, now: at(-90) });
  assert.equal(ready.stage, 'ready');
  assert.equal(ready.prepare.getHours(), 15);
  assert.equal(ready.prepare.getMinutes(), 57);
  assert.equal(ready.leave.getHours(), 16);
  assert.equal(ready.leave.getMinutes(), 17);
  assert.match(ready.title, /여유/);
  assert.equal(calculatePlan({ ...goal, now: at(-50) }).stage, 'preparing');
  assert.equal(calculatePlan({ ...goal, now: at(-40) }).stage, 'walking');
  assert.equal(calculatePlan({ ...goal, now: at(-5) }).stage, 'riding');
  assert.equal(calculatePlan({ ...goal, now: at(0) }).stage, 'arrived');
  assert.equal(ready.estimatesOnly, true);
});

test('next weekly routine date uses local weekday and skips a passed time', () => {
  const routine = { days: [3], time: '09:00' };
  const todayBefore = kstDate('2026-10-28', '08:30');
  assert.equal(formatDate(nextRoutineDate(routine, todayBefore)), '2026-10-28');
  const todayAfter = kstDate('2026-10-28', '09:01');
  assert.equal(formatDate(nextRoutineDate(routine, todayAfter)), '2026-11-04');
});

test('weekly ICS retains both alarms and marks first already-passed alarm', () => {
  const target = kstDate('2026-10-28', '18:00');
  const now = kstDate('2026-10-28', '17:30');
  const routine = { id: 'mock', name: '평일 등교', days: [1,2,3,4,5], time: '18:00',
    from: '신촌', to: '이대', prep: 60, walk: 0, ride: 20 };
  const result = toICS(routine, { repeat: true, now });
  assert.equal(result.alarmCount, 2);
  assert.equal(result.pastForFirst, 1);
  assert.match(result.content, /TZID=Asia\/Seoul/);
  assert.match(result.content, /RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR/);
  assert.equal((result.content.match(/BEGIN:VALARM/g) || []).length, 2);
  assert.match(result.content, /TRIGGER;RELATED=START:-PT80M/);
  assert.match(result.content, /TRIGGER;RELATED=START:-PT20M/);
  assert.match(result.content, /\r\n/);
  const physical = result.content.split('\r\n');
  for (const line of physical) assert.ok(new TextEncoder().encode(line).length <= 75);
});

test('single ICS export omits repeat rule and handles unicode safely', () => {
  const result = toICS({ id: 'mock2', name: '정말 긴 한국어 일정 이름 테스트', days: [3], time: '10:00',
    from: '신촌', to: '이대', prep: 20, walk: 8, ride: 35 }, { repeat: false, now: kstDate('2026-10-28', '08:00') });
  assert.equal(result.pastForFirst, 0);
  assert.doesNotMatch(result.content, /RRULE:/);
  assert.match(result.content, /BEGIN:VTIMEZONE/);
  assert.match(result.content, /SUMMARY:정말 긴 한국어 일정 이름 테스트/);
});

test('single ICS export omits only alarms whose trigger has already passed', () => {
  const result = toICS({ id: 'mock3', name: '당일', days: [3], time: '10:00',
    from: '신촌', to: '이대', prep: 60, walk: 0, ride: 20 },
  { repeat: false, now: kstDate('2026-10-28', '09:30') });
  assert.equal(result.omitted, 1);
  assert.equal(result.alarmCount, 1);
  assert.equal((result.content.match(/BEGIN:VALARM/g) || []).length, 1);
  assert.doesNotMatch(result.content, /TRIGGER;RELATED=START:-PT80M/);
  assert.match(result.content, /TRIGGER;RELATED=START:-PT20M/);
});
