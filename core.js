export const DAY = 86400000;
export const pad = (n) => String(n).padStart(2, '0');
const kstParts = (date) => Object.fromEntries(new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23', weekday: 'short',
}).formatToParts(date).map(part => [part.type, part.value]));

export function parseLocal(date, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const [y, m, d] = date.split('-').map(Number);
  const [h, min] = time.split(':').map(Number);
  const calendarCheck = new Date(Date.UTC(y, m - 1, d));
  if (calendarCheck.getUTCFullYear() !== y || calendarCheck.getUTCMonth() !== m - 1 || calendarCheck.getUTCDate() !== d || h > 23 || min > 59) return null;
  const value = new Date(Date.UTC(y, m - 1, d, h - 9, min, 0, 0));
  return value;
}

export function addMinutes(date, minutes) { return new Date(date.getTime() + minutes * 60000); }
export function formatTime(date) { const p = kstParts(date); return `${p.hour}:${p.minute}`; }
export function formatDate(date) { const p = kstParts(date); return `${p.year}-${p.month}-${p.day}`; }
export function formatStamp(date) { return `${formatDate(date)} ${formatTime(date)}`; }

export function calculatePlan({ date, time, prep = 20, walk = 8, ride = 35, now = new Date() }) {
  const target = parseLocal(date, time);
  const values = [prep, walk, ride].map(Number);
  if (!target || values.some(v => !Number.isFinite(v) || v < 0 || v > 240)) return { valid: false, reason: '날짜와 시간, 분 단위를 확인해 주세요.' };
  const [preparation, walking, riding] = values;
  const leave = addMinutes(target, -(walking + riding));
  const prepare = addMinutes(leave, -preparation);
  const remaining = Math.floor((target - now) / 60000);
  const walkingEnds = addMinutes(leave, walking);
  const stage = now >= target ? 'arrived' : now >= walkingEnds ? 'riding' : now >= leave ? 'walking' : now >= prepare ? 'preparing' : 'ready';
  const lateBy = Math.max(0, Math.ceil((now - leave) / 60000));
  const labels = {
    ready: { title: '아직 여유 있어', action: '조금 쉬어도 돼. 준비는 이때 시작해.', urgency: 'calm' },
    preparing: { title: '지금 준비 시작', action: '가방 챙기고 씻자. 늦어도 출발 시각엔 나가야 해.', urgency: 'soon' },
    walking: { title: '역까지 도보 중', action: '집을 나서 역으로 걷는 중이야. 걷는 시간은 네가 입력한 예상이야.', urgency: now > leave ? 'late' : 'moving' },
    riding: { title: '지하철 이동 중', action: '지하철로 이동 중이야. 노선과 열차 도착은 연결되지 않았어.', urgency: now > leave ? 'late' : 'moving' },
    arrived: { title: '도착 목표 시각 지남', action: '목표 도착 시각을 지났어. 실제 도착을 확인해 줘.', urgency: 'late' },
  };
  return { valid: true, target, leave, prepare, remaining, lateBy, stage, ...labels[stage], estimatesOnly: true };
}

export function nextRoutineDate(routine, now = new Date()) {
  const days = Array.isArray(routine.days) ? routine.days.map(Number) : [];
  const [h, m] = (routine.time || '').split(':').map(Number);
  if (!days.length || !Number.isInteger(h) || !Number.isInteger(m)) return null;
  const today = kstParts(now);
  const weekdayNumber = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[today.weekday];
  const todayKst = new Date(Date.UTC(Number(today.year), Number(today.month) - 1, Number(today.day)));
  for (let offset = 0; offset <= 7; offset++) {
    const day = new Date(todayKst.getTime() + offset * DAY);
    const candidate = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), h - 9, m, 0, 0));
    if (days.includes((weekdayNumber + offset) % 7) && candidate > now) return candidate;
  }
  return null;
}

export function escapeICS(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

function foldICSLine(line) {
  const chunks = [];
  let chunk = '';
  let bytes = 0;
  for (const char of line) {
    const size = new TextEncoder().encode(char).length;
    if (bytes + size > 75) { chunks.push(chunk); chunk = ' '; bytes = 1; }
    chunk += char; bytes += size;
  }
  chunks.push(chunk);
  return chunks.join('\r\n');
}

export function toICS(routine, { repeat = true, now = new Date() } = {}) {
  const occurrence = nextRoutineDate(routine, new Date(now.getTime() - 1));
  if (!occurrence) throw new Error('다음 일정을 계산할 수 없습니다.');
  const prep = Number(routine.prep ?? 20), walk = Number(routine.walk ?? 8), ride = Number(routine.ride ?? 35);
  const leave = addMinutes(occurrence, -(walk + ride));
  const prepare = addMinutes(leave, -prep);
  const utc = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const local = d => `${formatDate(d).replace(/-/g, '')}T${formatTime(d).replace(':', '')}00`;
  const alarm = (title, trigger) => [
    'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${escapeICS(title)}`,
    `TRIGGER;RELATED=START:${trigger}`, 'END:VALARM',
  ];
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//JAC//Arrival Coach//KO', 'CALSCALE:GREGORIAN',
    'BEGIN:VTIMEZONE', 'TZID:Asia/Seoul', 'BEGIN:STANDARD', 'DTSTART:19700101T000000', 'TZOFFSETFROM:+0900', 'TZOFFSETTO:+0900', 'TZNAME:KST', 'END:STANDARD', 'END:VTIMEZONE',
    'BEGIN:VEVENT', `UID:${crypto.randomUUID()}@arrival-coach.local`, `DTSTAMP:${utc(now)}`,
    `DTSTART;TZID=Asia/Seoul:${local(occurrence)}`, `DTEND;TZID=Asia/Seoul:${local(addMinutes(occurrence, 5))}`,
    `SUMMARY:${escapeICS(routine.name || '도착 준비')}`,
    `DESCRIPTION:${escapeICS(`${routine.from || '출발역 미입력'} → ${routine.to || '목적지 미입력'} · 예상 도착 목표`)}`,
  ];
  const reminders = [
    { title: '준비 시작', when: prepare, trigger: `-PT${prep + walk + ride}M` },
    { title: '출발 준비', when: leave, trigger: `-PT${walk + ride}M` },
  ];
  for (const reminder of reminders) {
    if (repeat || reminder.when > now) lines.push(...alarm(reminder.title, reminder.trigger));
  }
  if (repeat) {
    const selected = [...new Set(routine.days.map(Number))].sort((a, b) => a - b);
    const byday = selected.map(d => ['SU','MO','TU','WE','TH','FR','SA'][d]).join(',');
    lines.push(`RRULE:FREQ=WEEKLY;BYDAY=${byday}`);
  }
  lines.push('END:VEVENT', 'END:VCALENDAR');
  const folded = lines.map(foldICSLine).join('\r\n') + '\r\n';
  const pastForFirst = repeat ? Number(prepare <= now) + Number(leave <= now) : 0;
  const omitted = repeat ? 0 : reminders.filter(reminder => reminder.when <= now).length;
  return { content: folded, pastForFirst, omitted, alarmCount: 2 - omitted, start: occurrence };
}

