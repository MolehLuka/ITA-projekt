import sys
from datetime import datetime, timezone
from unittest import TestCase
from unittest.mock import patch

sys.path.append("src")

import server
import facilities_pb2


class DummyContext:
    def __init__(self) -> None:
        self.code = None
        self.details = None

    def set_code(self, code):
        self.code = code

    def set_details(self, details):
        self.details = details


class FakeCursor:
    def __init__(self, rows):
        self._rows = rows
        self.executed = []

    def execute(self, query, params=None):
        self.executed.append((query, params))

    def fetchall(self):
        return self._rows

    def fetchone(self):
        return self._rows[0] if self._rows else None

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False


class FakeConn:
    def __init__(self, rows):
        self._rows = rows
        self.committed = False

    def cursor(self):
        return FakeCursor(self._rows)

    def commit(self):
        self.committed = True

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False


class FacilitiesServiceTests(TestCase):
    def test_list_facilities_returns_rows(self):
        rows = [
            {
                "id": "abc",
                "name": "Court A",
                "type": "court",
                "capacity": 10,
                "location": "Hall 1",
            }
        ]

        with patch.object(server, "get_connection", return_value=FakeConn(rows)):
            response = server.FacilitiesService().ListFacilities(
                facilities_pb2.ListFacilitiesRequest(), DummyContext()
            )

        self.assertEqual(len(response.facilities), 1)
        self.assertEqual(response.facilities[0].name, "Court A")

    def test_get_facility_not_found_sets_status(self):
        with patch.object(server, "get_connection", return_value=FakeConn([])):
            context = DummyContext()
            response = server.FacilitiesService().GetFacility(
                facilities_pb2.GetFacilityRequest(id="missing"), context
            )

        self.assertEqual(context.code, server.grpc.StatusCode.NOT_FOUND)
        self.assertEqual(response.id, "")

    def test_list_available_slots_requires_facility_id(self):
        context = DummyContext()
        response = server.FacilitiesService().ListAvailableSlots(
            facilities_pb2.ListAvailableSlotsRequest(date="2026-03-20"),
            context,
        )

        self.assertEqual(context.code, server.grpc.StatusCode.INVALID_ARGUMENT)
        self.assertEqual(len(response.slots), 0)

    def test_list_available_slots_requires_date(self):
        context = DummyContext()
        response = server.FacilitiesService().ListAvailableSlots(
            facilities_pb2.ListAvailableSlotsRequest(facility_id="abc"),
            context,
        )

        self.assertEqual(context.code, server.grpc.StatusCode.INVALID_ARGUMENT)
        self.assertEqual(len(response.slots), 0)

    def test_list_available_slots_returns_slots(self):
        rows = [
            {
                "start_time": datetime(2026, 3, 20, 9, 0, tzinfo=timezone.utc),
                "end_time": datetime(2026, 3, 20, 10, 0, tzinfo=timezone.utc),
            }
        ]

        with patch.object(server, "get_connection", return_value=FakeConn(rows)):
            response = server.FacilitiesService().ListAvailableSlots(
                facilities_pb2.ListAvailableSlotsRequest(
                    facility_id="abc", date="2026-03-20"
                ),
                DummyContext(),
            )

        self.assertEqual(len(response.slots), 1)
        self.assertIn("2026-03-20", response.slots[0].start_time)
