import json
import logging
import threading

import pika

from messaging.config import (
    BOOKING_CANCELLED_QUEUE,
    BOOKING_CREATED_QUEUE,
    BOOKING_EVENTS_EXCHANGE,
    rabbit_params,
)
from messaging.publisher import publish_slot_reservation_failed, publish_slot_reserved
from messaging.slot_reservation import release_slot, reserve_slot

logger = logging.getLogger(__name__)


def _handle_booking_created(payload: dict) -> None:
    facility_id = payload.get("facilityId")
    start_time = payload.get("startTime")
    end_time = payload.get("endTime")

    if not facility_id or not start_time or not end_time:
        logger.warning("booking.created payload missing required fields: %s", payload)
        publish_slot_reservation_failed(payload)
        return

    if reserve_slot(facility_id, start_time, end_time):
        publish_slot_reserved(payload)
    else:
        publish_slot_reservation_failed(payload)


def _handle_booking_cancelled(payload: dict) -> None:
    facility_id = payload.get("facilityId")
    start_time = payload.get("startTime")
    end_time = payload.get("endTime")

    if not facility_id or not start_time or not end_time:
        logger.warning("booking.cancelled payload missing required fields: %s", payload)
        return

    release_slot(facility_id, start_time, end_time)


def _on_message(channel, method, _properties, body) -> None:
    try:
        payload = json.loads(body.decode("utf-8"))
    except json.JSONDecodeError:
        logger.exception("invalid booking event payload")
        channel.basic_ack(delivery_tag=method.delivery_tag)
        return

    if method.routing_key == BOOKING_CREATED_QUEUE:
        _handle_booking_created(payload)
    elif method.routing_key == BOOKING_CANCELLED_QUEUE:
        _handle_booking_cancelled(payload)

    channel.basic_ack(delivery_tag=method.delivery_tag)


def _consume() -> None:
    params = rabbit_params()
    credentials = pika.PlainCredentials(params["username"], params["password"])
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(
            host=params["host"],
            port=params["port"],
            credentials=credentials,
        )
    )
    channel = connection.channel()
    channel.exchange_declare(
        exchange=BOOKING_EVENTS_EXCHANGE,
        exchange_type="direct",
        durable=True,
    )
    channel.queue_declare(queue=BOOKING_CREATED_QUEUE, durable=True)
    channel.queue_declare(queue=BOOKING_CANCELLED_QUEUE, durable=True)
    channel.queue_bind(
        exchange=BOOKING_EVENTS_EXCHANGE,
        queue=BOOKING_CREATED_QUEUE,
        routing_key=BOOKING_CREATED_QUEUE,
    )
    channel.queue_bind(
        exchange=BOOKING_EVENTS_EXCHANGE,
        queue=BOOKING_CANCELLED_QUEUE,
        routing_key=BOOKING_CANCELLED_QUEUE,
    )
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(
        queue=BOOKING_CREATED_QUEUE,
        on_message_callback=_on_message,
    )
    channel.basic_consume(
        queue=BOOKING_CANCELLED_QUEUE,
        on_message_callback=_on_message,
    )
    logger.info("facilities saga consumer listening on booking events")
    channel.start_consuming()


def start_saga_consumer() -> None:
    thread = threading.Thread(target=_consume, name="saga-consumer", daemon=True)
    thread.start()
