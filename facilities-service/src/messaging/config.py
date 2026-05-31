import os

BOOKING_EVENTS_EXCHANGE = "booking.events"
BOOKING_CREATED_QUEUE = "booking.created"
BOOKING_CANCELLED_QUEUE = "booking.cancelled"
SLOT_RESERVED_QUEUE = "slot.reserved"
SLOT_RESERVATION_FAILED_QUEUE = "slot.reservation.failed"


def rabbit_params() -> dict[str, str | int]:
    return {
        "host": os.getenv("RABBIT_HOST", "localhost"),
        "port": int(os.getenv("RABBIT_PORT", "5672")),
        "username": os.getenv("RABBIT_USER", "guest"),
        "password": os.getenv("RABBIT_PASSWORD", "guest"),
    }
