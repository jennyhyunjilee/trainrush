import json
import os
import unittest
from unittest.mock import patch
import server
from test_server import FakeResponse, dispatch


class ArrivalTests(unittest.TestCase):
    def setUp(self):
        server._arrival_cache.clear()

    def test_keyless_and_invalid_station_do_not_call_seoul(self):
        with patch.dict(os.environ, {}, clear=True), patch('server.urllib.request.urlopen') as request:
            status, _ = dispatch('GET', '/api/realtime/arrivals?station=서울')
            self.assertEqual(status, 503)
            status, _ = dispatch('GET', '/api/realtime/arrivals?station=../../secret')
            self.assertEqual(status, 400)
            request.assert_not_called()

    def test_arrivals_keep_absolute_generation_time_and_cache_station(self):
        fixture = {'errorMessage': {'code': 'INFO-000'}, 'realtimeArrivalList': [
            {'subwayId':'1002', 'updnLine':'내선', 'trainLineNm':'성수행',
             'barvlDt':'120', 'recptnDt':'2026-10-29 12:00:00', 'arvlMsg2':'2분 후'},
            {'subwayId':'1002', 'barvlDt':'0', 'recptnDt':'unknown', 'arvlMsg2':'진입'}]}
        with patch.dict(os.environ, {'SEOUL_REALTIME_API_KEY':'mock-secret'}), patch('server.urllib.request.urlopen', return_value=FakeResponse(fixture)) as request:
            first = server.seoul_arrivals('이대')
            cached = server.seoul_arrivals('이대')
            self.assertEqual(request.call_count, 1)
            self.assertIn('/realtimeStationArrival/0/100/', request.call_args.args[0].full_url)
            self.assertEqual(first['trains'][0]['arrivalEpoch'] - first['trains'][0]['receivedEpoch'], 120)
            self.assertIsNone(first['trains'][1]['arrivalEpoch'])
            self.assertFalse(first['cached'])
            self.assertTrue(cached['cached'])
            self.assertNotIn('mock-secret', json.dumps(cached))

    def test_provider_error_and_empty_service_are_distinct(self):
        with patch.dict(os.environ, {'SEOUL_REALTIME_API_KEY':'mock-secret'}):
            with patch('server.urllib.request.urlopen', return_value=FakeResponse({'errorMessage':{'code':'ERROR-340','message':'private upstream'}})):
                with self.assertRaises(server.ApiProblem) as raised:
                    server.seoul_arrivals('서울')
                self.assertEqual(raised.exception.status, 502)
                self.assertNotIn('private', raised.exception.message)
            with patch('server.urllib.request.urlopen', return_value=FakeResponse({'errorMessage':{'code':'INFO-200'}})):
                self.assertEqual(server.seoul_arrivals('서울')['trains'], [])
