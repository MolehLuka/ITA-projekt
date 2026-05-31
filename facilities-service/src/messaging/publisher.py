import json

import pika

from messaging.config import (
    BOOKING_EVENTS_EXCHANGE,
    SLOT_RESERVATION_FAILED_QUEUE,
    SLOT_RESERVED_QUEUE,
    rabbit_params,
)


def publish_saga_event(routing_key: str, payload: dict) -> None:
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
    channel.basic_publish(
        exchange=BOOKING_EVENTS_EXCHANGE,
        routing_key=routing_key,
        body=json.dumps(payload),
        properties=pika.BasicProperties(content_type="application/json", delivery_mode=2),
    )
    connection.close()


def publish_slot_reserved(payload: dict) -> None:
    publish_saga_event(SLOT_RESERVED_QUEUE, payload)


def publish_slot_reservation_failed(payload: dict) -> None:
    publish_saga_event(SLOT_RESERVATION_FAILED_QUEUE, payload)
