from db import get_connection


def reserve_slot(facility_id: str, start_time: str, end_time: str) -> bool:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                update facility_slots
                set is_available = false
                where facility_id = %s
                  and is_available = true
                  and start_time < %s
                  and end_time > %s
                """,
                (facility_id, end_time, start_time),
            )
            reserved = cur.rowcount > 0
            conn.commit()
    return reserved


def release_slot(facility_id: str, start_time: str, end_time: str) -> None:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                update facility_slots
                set is_available = true
                where facility_id = %s
                  and is_available = false
                  and start_time < %s
                  and end_time > %s
                """,
                (facility_id, end_time, start_time),
            )
            conn.commit()
