"""Local, standard-library-only app server. Run from PyCharm or `python3 server.py`."""
from __future__ import annotations

import json
import os
import re
import threading
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone, timedelta
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from email.parser import BytesParser
from email.policy import default

ROOT = Path(__file__).resolve().parent
HOST = "127.0.0.1"
PORT = int(os.environ.get("PORT", "5183"))
MAX_JSON = 32_000
MAX_AUDIO = 4 * 1024 * 1024
SEOUL_LINES = ["1호선", "2호선", "3호선", "4호선", "5호선", "6호선", "7호선", "8호선", "9호선", "경의중앙선", "공항철도", "경춘선", "수인분당선", "신분당선", "우이신설선", "GTX-A"]
SEOUL_POSITION_CACHE_SECONDS = 60
_seoul_cache_lock = threading.Lock()
_seoul_position_cache = {"until": 0.0, "payload": None}
AI_URL = "https://api.openai.com/v1/responses"
TRANSCRIBE_URL = "https://api.openai.com/v1/audio/transcriptions"
ALLOWED_STATIC = {"index.html", "app.css", "app.js", "core.js", "stations.js", "input-options.js", "input-helpers.js", "README.md", ".env.example"}


class ApiProblem(Exception):
    def __init__(self, status: int, message: str):
        self.status = status
        self.message = message


def ai_status() -> dict:
    configured = bool(os.environ.get("OPENAI_API_KEY", "").strip())
    return {"configured": configured, "provider": "OpenAI" if configured else None,
            "intentModel": os.environ.get("OPENAI_INTENT_MODEL", "gpt-4.1-mini"),
            "transcriptionModel": os.environ.get("OPENAI_TRANSCRIBE_MODEL", "gpt-transcribe")}


def _read_json_response(response) -> dict:
    raw = response.read(1_000_001)
    if len(raw) > 1_000_000:
        raise ApiProblem(502, "AI 응답이 허용 크기를 넘었습니다.")
    try:
        value = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        raise ApiProblem(502, "AI 응답 형식을 확인할 수 없습니다.")
    if not isinstance(value, dict):
        raise ApiProblem(502, "AI 응답 형식이 올바르지 않습니다.")
    return value


def _response_text(payload: dict) -> str:
    parts = []
    for item in payload.get("output", []):
        if not isinstance(item, dict) or item.get("type") != "message":
            continue
        for part in item.get("content", []):
            if isinstance(part, dict) and part.get("type") == "output_text":
                parts.append(part.get("text", ""))
    return "".join(parts)


def request_intent(data: dict) -> dict:
    if not ai_status()["configured"]:
        raise ApiProblem(503, "OpenAI API 키가 서버에 설정되지 않았습니다.")
    transcript = str(data.get("transcript", "")).strip()
    if not transcript or len(transcript) > 2_000:
        raise ApiProblem(400, "문장을 1~2,000자 안에서 입력해 주세요.")
    context = data.get("context", {})
    if not isinstance(context, dict):
        context = {}
    safe_context = {
        "today_kst": str(context.get("today", ""))[:10],
        "defaults": {key: context.get("defaults", {}).get(key) for key in ("from", "prep", "walk", "ride")}
        if isinstance(context.get("defaults"), dict) else {},
        "previous_intent": context.get("previous") if isinstance(context.get("previous"), dict) else {},
    }
    schema = {
        "type": "object", "additionalProperties": False,
        "properties": {
            "from": {"type": ["string", "null"]}, "to": {"type": ["string", "null"]},
            "date": {"type": ["string", "null"]}, "time": {"type": ["string", "null"]},
            "prep": {"type": ["integer", "null"]}, "walk": {"type": ["integer", "null"]},
            "ride": {"type": ["integer", "null"]}, "clarification": {"type": ["string", "null"]},
        },
        "required": ["from", "to", "date", "time", "prep", "walk", "ride", "clarification"],
    }
    body = {
        "model": os.environ.get("OPENAI_INTENT_MODEL", "gpt-4.1-mini"),
        "store": False,
        "instructions": (
            "Extract a Seoul subway trip intent from Korean text. Do not invent station names or dates. "
            "Use the supplied KST date to resolve relative dates. A bare ambiguous hour must remain null. "
            "Retain prior_intent values unless the new text changes them. Defaults apply only to optional minute fields. "
            "Use ISO YYYY-MM-DD date and 24-hour HH:MM time. clarification is a short Korean question only if a required value is missing or ambiguous; otherwise null."
        ),
        "input": json.dumps({"utterance": transcript, **safe_context}, ensure_ascii=False),
        "text": {"format": {"type": "json_schema", "name": "trip_intent", "strict": True, "schema": schema}},
    }
    req = urllib.request.Request(AI_URL, data=json.dumps(body, ensure_ascii=False).encode(),
                                 headers={"Authorization": "Bearer " + os.environ["OPENAI_API_KEY"].strip(),
                                          "Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=25) as response:
            payload = _read_json_response(response)
    except urllib.error.HTTPError as exc:
        # Never return upstream response text, which can contain account details.
        status = exc.code
        mapping = {401: "OpenAI 키를 확인해 주세요.", 429: "AI 요청 한도에 도달했습니다. 잠시 후 다시 시도해 주세요."}
        raise ApiProblem(503 if status in (401, 429) else 502, mapping.get(status, "AI 서비스에서 응답하지 않았습니다."))
    except (urllib.error.URLError, TimeoutError, OSError):
        raise ApiProblem(502, "AI 연결을 완료하지 못했습니다. 네트워크를 확인해 주세요.")
    refusal = any(isinstance(part, dict) and part.get("type") == "refusal"
                  for item in payload.get("output", []) if isinstance(item, dict)
                  for part in item.get("content", []) if isinstance(item, dict))
    if refusal:
        raise ApiProblem(422, "AI가 이 요청을 처리할 수 없다고 응답했습니다.")
    text = _response_text(payload)
    if payload.get("status") == "incomplete" or not text:
        raise ApiProblem(502, "AI가 문장을 처리하지 못했습니다. 내용을 줄여 다시 시도해 주세요.")
    try:
        result = json.loads(text)
    except json.JSONDecodeError:
        raise ApiProblem(502, "AI 결과를 읽지 못했습니다.")
    if not isinstance(result, dict) or set(result) != set(schema["required"]):
        raise ApiProblem(502, "AI 결과 항목이 올바르지 않습니다.")
    for key in ("from", "to"):
        value = result[key]
        if value is not None and (not isinstance(value, str) or len(value) > 80):
            raise ApiProblem(502, "역 이름 결과를 확인해 주세요.")
    if result["date"] is not None and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(result["date"])):
        result["date"] = None
    if result["time"] is not None and not re.fullmatch(r"(?:[01]\d|2[0-3]):[0-5]\d", str(result["time"])):
        result["time"] = None
    for key in ("prep", "walk", "ride"):
        value = result[key]
        if value is not None and (type(value) is not int or not 0 <= value <= 240):
            result[key] = None
    if result["clarification"] is not None:
        result["clarification"] = str(result["clarification"])[:160]
    return {"provider": "openai", "intent": result}


def request_transcription(content_type: str, body: bytes) -> dict:
    if not ai_status()["configured"]:
        raise ApiProblem(503, "OpenAI API 키가 서버에 설정되지 않았습니다.")
    if not body or len(body) > MAX_AUDIO:
        raise ApiProblem(413, "녹음 파일은 4MB 이하로 제한됩니다.")
    try:
        message = BytesParser(policy=default).parsebytes(
            b"Content-Type: " + content_type.encode("ascii", "ignore") + b"\r\nMIME-Version: 1.0\r\n\r\n" + body)
        part = next((p for p in message.iter_parts() if p.get_param("name", header="content-disposition") == "file"), None)
    except Exception:
        part = None
    if part is None:
        raise ApiProblem(400, "전사할 오디오 파일을 찾을 수 없습니다.")
    audio = part.get_payload(decode=True) or b""
    if not audio or len(audio) > MAX_AUDIO:
        raise ApiProblem(413, "녹음 파일은 4MB 이하로 제한됩니다.")
    filename = Path(part.get_filename() or "voice.webm").name
    suffix = Path(filename).suffix.lower()
    mime = part.get_content_type().lower()
    allowed = {".webm": "audio/webm", ".mp4": "audio/mp4", ".m4a": "audio/mp4", ".wav": "audio/wav", ".mp3": "audio/mpeg", ".ogg": "audio/ogg"}
    if suffix not in allowed:
        raise ApiProblem(415, "지원하는 오디오 형식(webm/mp4/wav/mp3)이 아닙니다.")
    boundary = "----ArrivalCoachBoundary7MA4YWxkTrZu0gW"
    filename = re.sub(r"[^\w.\-가-힣]", "_", filename)[:100]
    fields = [
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"model\"\r\n\r\n{os.environ.get('OPENAI_TRANSCRIBE_MODEL', 'gpt-transcribe')}\r\n".encode(),
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{filename}\"\r\nContent-Type: {allowed[suffix]}\r\n\r\n".encode() + audio + b"\r\n",
        f"--{boundary}--\r\n".encode(),
    ]
    req = urllib.request.Request(TRANSCRIBE_URL, data=b"".join(fields),
                                 headers={"Authorization": "Bearer " + os.environ["OPENAI_API_KEY"].strip(),
                                          "Content-Type": "multipart/form-data; boundary=" + boundary}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=35) as response:
            payload = _read_json_response(response)
    except urllib.error.HTTPError as exc:
        status = exc.code
        message = "AI 키를 확인해 주세요." if status == 401 else "AI 요청 한도에 도달했습니다." if status == 429 else "음성 전사 서비스가 응답하지 않았습니다."
        raise ApiProblem(503 if status in (401, 429) else 502, message)
    except (urllib.error.URLError, TimeoutError, OSError):
        raise ApiProblem(502, "음성 전사 서비스에 연결하지 못했습니다.")
    transcript = payload.get("text")
    if not isinstance(transcript, str) or not transcript.strip() or len(transcript) > 4_000:
        raise ApiProblem(502, "전사 결과가 비어 있거나 너무 깁니다.")
    return {"provider": "openai", "transcript": transcript.strip()}



def seoul_realtime_status() -> dict:
    configured = bool(os.environ.get("SEOUL_REALTIME_API_KEY", "").strip())
    return {"configured": configured, "provider": "서울 열린데이터광장" if configured else None,
            "lines": SEOUL_LINES, "cacheSeconds": SEOUL_POSITION_CACHE_SECONDS,
            "requestsPerRefresh": len(SEOUL_LINES), "dailyLimit": 1000, "refreshMinutes": 30}


def _fetch_seoul_line(line: str) -> dict:
    key = urllib.parse.quote(os.environ.get("SEOUL_REALTIME_API_KEY", "").strip(), safe="")
    name = urllib.parse.quote(line, safe="")
    url = f"http://swopenAPI.seoul.go.kr/api/subway/{key}/json/realtimePosition/0/100/{name}"
    req = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": "ArrivalCoach/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=8) as response:
            raw = response.read(1_000_001)
        if len(raw) > 1_000_000:
            return {"line": line, "trains": [], "error": "응답 크기 제한을 넘었습니다."}
        data = json.loads(raw.decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, OSError, UnicodeDecodeError, json.JSONDecodeError):
        return {"line": line, "trains": [], "error": "이 노선 정보를 가져오지 못했습니다."}
    result = data.get("RESULT", {}) if isinstance(data, dict) else {}
    if result and result.get("CODE") not in (None, "INFO-000"):
        return {"line": line, "trains": [], "error": "실시간 데이터가 없거나 API 응답에 문제가 있습니다."}
    rows = data.get("realtimePositionList", []) if isinstance(data, dict) else []
    trains = []
    for row in rows if isinstance(rows, list) else []:
        if isinstance(row, dict):
            trains.append({"station": str(row.get("statnNm", ""))[:60], "destination": str(row.get("statnTnm", ""))[:60],
                           "status": str(row.get("trainSttus", ""))[:20], "direction": str(row.get("updnLine", ""))[:10],
                           "express": str(row.get("directAt", "0")) in ("1", "7"), "receivedAt": str(row.get("recptnDt", ""))[:40]})
    return {"line": line, "trains": trains, "error": None}


def seoul_realtime_positions() -> dict:
    if not os.environ.get("SEOUL_REALTIME_API_KEY", "").strip():
        raise ApiProblem(503, "서울 열린데이터광장 API 키가 서버에 설정되지 않았습니다.")
    import time
    now = time.monotonic()
    with _seoul_cache_lock:
        if _seoul_position_cache["payload"] is not None and now < _seoul_position_cache["until"]:
            return {**_seoul_position_cache["payload"], "cached": True}
    results = {}
    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = {pool.submit(_fetch_seoul_line, line): line for line in SEOUL_LINES}
        for future in as_completed(futures):
            line = futures[future]
            try:
                results[line] = future.result()
            except Exception:
                results[line] = {"line": line, "trains": [], "error": "이 노선 정보를 가져오지 못했습니다."}
    payload = {"lines": [results[line] for line in SEOUL_LINES],
               "updatedAt": datetime.now(timezone(timedelta(hours=9))).isoformat(timespec="seconds"),
               "cached": False, "requests": len(SEOUL_LINES)}
    with _seoul_cache_lock:
        _seoul_position_cache.update({"until": time.monotonic() + SEOUL_POSITION_CACHE_SECONDS, "payload": payload})
    return payload


_arrival_cache = {}


def seoul_arrivals(station: str) -> dict:
    import time
    station = station.strip()
    if not station or len(station) > 60 or not re.fullmatch(r"[가-힣A-Za-z0-9 ·().-]+", station):
        raise ApiProblem(400, "조회할 역 이름을 입력해 주세요. 예: 서울, 시청, 이대")
    if not os.environ.get("SEOUL_REALTIME_API_KEY", "").strip():
        raise ApiProblem(503, "서울 API 키가 서버에 설정되지 않았습니다.")
    now = time.monotonic()
    with _seoul_cache_lock:
        cached = _arrival_cache.get(station)
        if cached and now < cached[0]:
            return {**cached[1], "cached": True}
    key = urllib.parse.quote(os.environ["SEOUL_REALTIME_API_KEY"].strip(), safe="")
    name = urllib.parse.quote(station, safe="")
    url = f"http://swopenAPI.seoul.go.kr/api/subway/{key}/json/realtimeStationArrival/0/100/{name}"
    try:
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=10) as response:
            raw = response.read(1_000_001)
        if len(raw) > 1_000_000:
            raise ApiProblem(502, "도착정보 응답이 너무 큽니다.")
        data = json.loads(raw.decode("utf-8"))
    except (urllib.error.URLError, OSError, TimeoutError, ValueError):
        raise ApiProblem(502, "서울 도착정보에 연결하지 못했습니다. 잠시 후 다시 조회해 주세요.")
    if not isinstance(data, dict):
        raise ApiProblem(502, "도착정보 응답 형식을 확인할 수 없습니다.")
    result = data.get("errorMessage") or data.get("RESULT") or {}
    if isinstance(result, dict) and result.get("code", result.get("CODE")) not in (None, "INFO-000", "INFO-200"):
        raise ApiProblem(502, "서울 API가 요청을 처리하지 못했습니다. 키의 실시간 지하철 이용 승인과 호출 한도를 확인해 주세요.")
    rows = data.get("realtimeArrivalList", [])
    if not isinstance(rows, list):
        raise ApiProblem(502, "도착정보 목록 형식이 올바르지 않습니다.")
    trains = []
    for row in rows[:100]:
        if not isinstance(row, dict):
            continue
        received = str(row.get("recptnDt", ""))[:40]
        received_epoch = None
        try:
            dt = datetime.fromisoformat(received)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone(timedelta(hours=9)))
            received_epoch = dt.timestamp()
        except ValueError:
            pass
        try:
            seconds = int(row.get("barvlDt", 0))
        except (ValueError, TypeError):
            seconds = 0
        trains.append({"line": str(row.get("subwayId", ""))[:20],
                       "direction": str(row.get("updnLine", ""))[:40],
                       "destination": str(row.get("trainLineNm") or row.get("bstatnNm", ""))[:100],
                       "message": str(row.get("arvlMsg2", ""))[:160],
                       "detail": str(row.get("arvlMsg3", ""))[:160],
                       "receivedAt": received, "receivedEpoch": received_epoch,
                       "arrivalEpoch": received_epoch + seconds if received_epoch and seconds > 0 else None})
    payload = {"station": station, "trains": trains, "cached": False,
               "fetchedAt": datetime.now(timezone(timedelta(hours=9))).isoformat(timespec="seconds")}
    with _seoul_cache_lock:
        if len(_arrival_cache) >= 128:
            _arrival_cache.pop(next(iter(_arrival_cache)))
        _arrival_cache[station] = (time.monotonic() + 60, payload)
    return payload


def timetable_status() -> dict:
    return {"connected": False, "provider": None, "lastUpdated": None,
            "refreshMinutes": None,
            "message": "시간표 API 미연결. OA-22750 서비스는 종료되었고, 15143847 호출 명세와 키가 확인되지 않았습니다."}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        # Avoid writing request bodies, query values or secret-bearing URLs to logs.
        print("[http]", self.address_string(), self.command, self.path.split("?", 1)[0], args[1] if len(args) > 1 else "")

    def _json(self, status: int, value: dict):
        raw = json.dumps(value, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def do_GET(self):
        route = urllib.parse.urlsplit(self.path)
        if route.path == "/api/ai/status":
            return self._json(200, ai_status())
        if route.path == "/api/realtime/status":
            return self._json(200, seoul_realtime_status())
        if route.path == "/api/realtime/arrivals":
            try:
                station = urllib.parse.parse_qs(route.query).get("station", [""])[0]
                return self._json(200, seoul_arrivals(station))
            except ApiProblem as exc:
                return self._json(exc.status, {"error": exc.message})
        if route.path == "/api/realtime/positions":
            try:
                return self._json(200, seoul_realtime_positions())
            except ApiProblem as exc:
                return self._json(exc.status, {"error": exc.message})
        if route.path == "/api/timetable/status":
            return self._json(200, timetable_status())
        if route.path == "/api/timetable":
            return self._json(503, {"error": "시간표 API가 연결되지 않았습니다."})
        path = "index.html" if route.path == "/" else urllib.parse.unquote(route.path).lstrip("/")
        if path not in ALLOWED_STATIC:
            return self._json(404, {"error": "not found"})
        self.path = "/" + path
        return super().do_GET()

    def do_POST(self):
        if self.headers.get("Origin") and self.headers.get("Origin") not in (f"http://{self.headers.get('Host')}", f"https://{self.headers.get('Host')}"):
            return self._json(403, {"error": "same-origin requests only"})
        length = self.headers.get("Content-Length")
        try:
            size = int(length or "0")
        except ValueError:
            return self._json(400, {"error": "invalid content length"})
        if size <= 0 or size > MAX_AUDIO + 64_000:
            return self._json(413, {"error": "request size limit exceeded"})
        body = self.rfile.read(size)
        try:
            if self.path == "/api/intent":
                if size > MAX_JSON:
                    raise ApiProblem(413, "요청 문장이 너무 깁니다.")
                try:
                    data = json.loads(body.decode("utf-8"))
                except (UnicodeDecodeError, json.JSONDecodeError):
                    raise ApiProblem(400, "JSON 요청 형식이 올바르지 않습니다.")
                if not isinstance(data, dict):
                    raise ApiProblem(400, "요청 형식이 올바르지 않습니다.")
                return self._json(200, request_intent(data))
            if self.path == "/api/transcribe":
                return self._json(200, request_transcription(self.headers.get("Content-Type", ""), body))
            return self._json(404, {"error": "not found"})
        except ApiProblem as exc:
            return self._json(exc.status, {"error": exc.message})
        except Exception:
            return self._json(500, {"error": "요청을 처리하지 못했습니다. 서버 로그와 입력 내용을 확인해 주세요."})


def main():
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    server.daemon_threads = True
    print(f"도착 코치 서버: http://{HOST}:{PORT}/")
    print("AI 연결 상태:", "키 설정됨" if ai_status()["configured"] else "미설정 (OPENAI_API_KEY 환경변수)")
    print("서울 시간표: 미연결 · 실시간 데이터로 표시하지 않음")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n서버를 종료합니다.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
