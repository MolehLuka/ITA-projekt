import sys
from unittest import TestCase
from unittest.mock import patch

sys.path.append("src")

from messaging.slot_reservation import reserve_slot


class FakeCursor:
    def __init__(self, rowcount: int):
        self.rowcount = rowcount
        self.executed = []

    def execute(self, query, params=None):
        self.executed.append((query, params))

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False


class FakeConn:
    def __init__(self, rowcount: int):
        self._rowcount = rowcount
        self.committed = False

    def cursor(self):
        return FakeCursor(self._rowcount)

    def commit(self):
        self.committed = True

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False


class SlotReservationTests(TestCase):
    def test_reserve_slot_returns_true_when_row_updated(self):
        with patch("messaging.slot_reservation.get_connection", return_value=FakeConn(1)):
            result = reserve_slot(
                "facility-id",
                "2026-05-08T10:00:00+00:00",
                "2026-05-08T11:00:00+00:00",
            )

        self.assertTrue(result)

    def test_reserve_slot_returns_false_when_no_slot(self):
        with patch("messaging.slot_reservation.get_connection", return_value=FakeConn(0)):
            result = reserve_slot(
                "facility-id",
                "2026-05-08T10:00:00+00:00",
                "2026-05-08T11:00:00+00:00",
            )

        self.assertFalse(result)
