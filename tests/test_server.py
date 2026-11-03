import json
import os
import re
from io import BytesIO
import unittest
from types import SimpleNamespace
from html.parser import HTMLParser
from pathlib import Path
from unittest.mock import patch

import server


class FakeResponse:
    def __init__(self, value):
        self.body = json.dumps(value, ensure_ascii=False).encode("utf-8")

    def __enter__(self):
        return self

    def __exit__(self, *_):
        return False

    def read(self, size=-1):
        return self.body[:size]


class FakeHeaders(dict):
    def get(self, key, default=None):
        return super().get(key, default)


def dispatch_raw(method, path, payload=b"", headers=None):
    handler = object.__new__(server.Handler)
    handler.path = path
    handler.command = method
    handler.directory = str(server.ROOT)
    handler.request_version = "HTTP/1.1"
    handler.headers = FakeHeaders(headers or {})
    handler.rfile = BytesIO(payload)
    handler.wfile = BytesIO()
    handler.sent_status = []
    handler.sent_headers = []
    handler.send_response = lambda status, *args: handler.sent_status.append(status)
    handler.send_header = lambda key, value: handler.sent_headers.append((key, value))
    handler.end_headers = lambda: None
    if method == "GET":
        handler.do_GET()
    else:
        handler.do_POST()
    return handler.sent_status[-1], handler.wfile.getvalue()


def dispatch(method, path, payload=b"", headers=None):
    status, body = dispatch_raw(method, path, payload, headers)
    return status, json.loads(body.decode("utf-8"))


class IdParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []

    def handle_starttag(self, tag, attrs):
        self.ids.extend(value for key, value in attrs if key == "id")


class ServerContractTests(unittest.TestCase):
    def test_static_http_routes_serve_html_assets_and_reject_other_files(self):
        for path, expected_status, expected_file in (
            ("/", 200, "index.html"),
            ("/?reload=1", 200, "index.html"),
            ("/index.html", 200, "index.html"),
            ("/app.css", 200, "app.css"),
            ("/app.js", 200, "app.js"),
            ("/core.js", 200, "core.js"),
            ("/server.py", 404, None),
            ("/../server.py", 404, None),
        ):
            with self.subTest(path=path):
                output = BytesIO()
                request = SimpleNamespace(
                    makefile=lambda *args: BytesIO(f"GET {path} HTTP/1.0\r\n\r\n".encode()),
                    sendall=output.write,
                )
                with patch.object(server.Handler, "log_message"):
                    server.Handler(request, ("127.0.0.1", 0), None)
                headers, body = output.getvalue().split(b"\r\n\r\n", 1)
                self.assertEqual(int(headers.split()[1]), expected_status)
                if expected_file:
                    self.assertEqual(body, (server.ROOT / expected_file).read_bytes())
                else:
                    self.assertEqual(json.loads(body), {"error": "not found"})

    def test_homepage_get_serves_index_with_and_without_query(self):
        expected = (server.ROOT / "index.html").read_bytes()
        for path in ("/", "/?source=local", "/index.html"):
            with self.subTest(path=path):
                status, body = dispatch_raw("GET", path)
                self.assertEqual(status, 200)
                self.assertEqual(body, expected)

    def test_private_and_unknown_paths_remain_unavailable(self):
        for path in ("/.env", "/server.py", "/../server.py", "/unknown"):
            with self.subTest(path=path):
                status, _ = dispatch_raw("GET", path)
                self.assertEqual(status, 404)

    def test_ai_status_never_returns_key(self):
        with patch.dict(os.environ, {"OPENAI_API_KEY": "test-only-placeholder"}):
            result = server.ai_status()
        self.assertTrue(result["configured"])
        self.assertNotIn("test-only-placeholder", json.dumps(result))
        self.assertNotIn("key", result)

    def test_no_key_returns_503_without_upstream_request(self):
        with patch.dict(os.environ, {}, clear=True), patch("server.urllib.request.urlopen") as request:
            with self.assertRaises(server.ApiProblem) as raised:
                server.request_intent({"transcript": "이대 가야 해"})
        self.assertEqual(raised.exception.status, 503)
        request.assert_not_called()

    def test_transcription_keyless_is_503_without_upstream_request(self):
        payload = b"mock-only local audio payload"
        with patch.dict(os.environ, {}, clear=True), patch("server.urllib.request.urlopen") as request:
            status, result = dispatch("POST", "/api/transcribe", payload,
                                      {"Content-Length": str(len(payload)), "Content-Type": "audio/webm"})
        self.assertEqual(status, 503)
        self.assertIn("서버에 설정되지", result["error"])
        request.assert_not_called()

    def test_frontend_assets_and_selectors_exist(self):
        html = (Path(server.ROOT) / "index.html").read_text(encoding="utf-8")
        parser = IdParser(); parser.feed(html)
        self.assertEqual(len(parser.ids), len(set(parser.ids)), "HTML ids must be unique")
        js = (Path(server.ROOT) / "app.js").read_text(encoding="utf-8")
        selectors = set(re.findall(r"\$\('#([A-Za-z0-9_-]+)'\)", js))
        dynamic_ids = {"countdown"}  # Inserted when the goal summary is rendered.
        self.assertFalse(selectors - set(parser.ids) - dynamic_ids,
                         f"Missing HTML IDs: {sorted(selectors - set(parser.ids) - dynamic_ids)}")
        for asset in ("index.html", "app.css", "app.js", "core.js"):
            self.assertIn(asset, server.ALLOWED_STATIC)
            self.assertTrue((Path(server.ROOT) / asset).is_file())

    def test_mocked_openai_intent_uses_structured_output_and_store_false(self):
        intent = {"from": "신촌", "to": "이대", "date": "2026-10-29", "time": "09:00",
                  "prep": 30, "walk": 8, "ride": 35, "clarification": None}
        response = FakeResponse({"status": "completed", "output": [{"type": "message", "content": [
            {"type": "output_text", "text": json.dumps(intent, ensure_ascii=False)}]}]})
        with patch.dict(os.environ, {"OPENAI_API_KEY": "mock-only", "OPENAI_INTENT_MODEL": "gpt-4.1-mini"}), \
             patch("server.urllib.request.urlopen", return_value=response) as upstream:
            result = server.request_intent({"transcript": "내일 9시 이대, 준비 30분", "context": {"today": "2026-10-28"}})
        self.assertEqual(result["provider"], "openai")
        self.assertEqual(result["intent"]["to"], "이대")
        request = upstream.call_args.args[0]
        body = json.loads(request.data.decode("utf-8"))
        self.assertEqual(request.full_url, server.AI_URL)
        self.assertFalse(body["store"])
        self.assertEqual(body["text"]["format"]["type"], "json_schema")
        self.assertTrue(body["text"]["format"]["strict"])
        self.assertNotIn("mock-only", json.dumps(result))

    def test_mocked_transcription_is_multipart_and_keeps_audio_in_memory(self):
        response = FakeResponse({"text": "내일 9시 이대에 가야 해"})
        body = (b"--local-boundary\r\n"
                b"Content-Disposition: form-data; name=\"file\"; filename=\"voice.webm\"\r\n"
                b"Content-Type: audio/webm\r\n\r\nMOCKAUDIO\r\n"
                b"--local-boundary--\r\n")
        with patch.dict(os.environ, {"OPENAI_API_KEY": "mock-only"}), \
             patch("server.urllib.request.urlopen", return_value=response) as upstream:
            result = server.request_transcription("multipart/form-data; boundary=local-boundary", body)
        self.assertEqual(result["transcript"], "내일 9시 이대에 가야 해")
        request = upstream.call_args.args[0]
        self.assertEqual(request.full_url, server.TRANSCRIBE_URL)
        self.assertIn(b"MOCKAUDIO", request.data)
        self.assertNotIn("MOCKAUDIO", json.dumps(result))

    def test_mocked_seoul_realtime_position_response(self):
        response = FakeResponse({"RESULT": {"CODE": "INFO-000"}, "realtimePositionList": [
            {"statnNm": "시청", "statnTnm": "서울역", "trainSttus": "2", "updnLine": "0",
             "directAt": "0", "recptnDt": "2026-10-28 22:00:00"}
        ]})
        with patch.dict(os.environ, {"SEOUL_REALTIME_API_KEY": "mock-only"}), \
             patch("server.urllib.request.urlopen", return_value=response) as upstream:
            result = server._fetch_seoul_line("1호선")
        self.assertEqual(result["line"], "1호선")
        self.assertEqual(result["trains"][0]["station"], "시청")
        self.assertEqual(result["trains"][0]["destination"], "서울역")
        self.assertIsNone(result["error"])
        self.assertNotIn("mock-only", json.dumps(result))
        self.assertTrue(upstream.called)

    def test_refusal_is_reported_as_safe_message(self):
        response = FakeResponse({"status": "completed", "output": [{"type": "message", "content": [
            {"type": "refusal", "refusal": "private model text"}]}]})
        with patch.dict(os.environ, {"OPENAI_API_KEY": "mock-only"}), \
             patch("server.urllib.request.urlopen", return_value=response):
            with self.assertRaises(server.ApiProblem) as raised:
                server.request_intent({"transcript": "test"})
        self.assertEqual(raised.exception.status, 422)
        self.assertNotIn("private model text", raised.exception.message)

    def test_local_http_status_and_no_key_api_contract(self):
        with patch.dict(os.environ, {}, clear=True), patch("server.urllib.request.urlopen") as upstream:
            status, ai = dispatch("GET", "/api/ai/status")
            self.assertEqual(status, 200)
            self.assertFalse(ai["configured"])
            status, timetable = dispatch("GET", "/api/timetable/status")
            self.assertEqual(status, 200)
            self.assertFalse(timetable["connected"])
            self.assertIsNone(timetable["refreshMinutes"])
            self.assertIn("15143847", timetable["message"])
            status, body = dispatch("GET", "/api/timetable")
            self.assertEqual(status, 503)
            self.assertIn("연결되지 않았습니다", body["error"])
            status, realtime = dispatch("GET", "/api/realtime/status")
            self.assertEqual(status, 200)
            self.assertFalse(realtime["configured"])
            status, positions = dispatch("GET", "/api/realtime/positions")
            self.assertEqual(status, 503)
            self.assertIn("키가 서버에 설정되지", positions["error"])
            payload = b'{"transcript":"hello"}'
            status, result = dispatch("POST", "/api/intent", payload,
                                      {"Content-Length": str(len(payload)), "Content-Type": "application/json"})
            self.assertEqual(status, 503)
            self.assertIn("서버에 설정되지", result["error"])
            upstream.assert_not_called()


if __name__ == "__main__":
    unittest.main()
