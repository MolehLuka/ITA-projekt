import os
from concurrent import futures

import grpc
from dotenv import load_dotenv

import facilities_pb2
import facilities_pb2_grpc
from db import get_connection


class FacilitiesService(facilities_pb2_grpc.FacilitiesServiceServicer):
    def ListFacilities(self, request, context):
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "select id, name, type, capacity, location from facilities order by created_at"
                )
                rows = cur.fetchall()

        facilities = [
            facilities_pb2.Facility(
                id=str(row["id"]),
                name=row["name"],
                type=row["type"],
                capacity=row["capacity"],
                location=row["location"],
            )
            for row in rows
        ]

        return facilities_pb2.ListFacilitiesResponse(facilities=facilities)

    def CreateFacility(self, request, context):
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    insert into facilities (name, type, capacity, location)
                    values (%s, %s, %s, %s)
                    returning id, name, type, capacity, location
                    """,
                    (request.name, request.type, request.capacity, request.location),
                )
                row = cur.fetchone()
                conn.commit()

        return facilities_pb2.Facility(
            id=str(row["id"]),
            name=row["name"],
            type=row["type"],
            capacity=row["capacity"],
            location=row["location"],
        )

    def GetFacility(self, request, context):
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "select id, name, type, capacity, location from facilities where id = %s",
                    (request.id,),
                )
                row = cur.fetchone()

        if not row:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details("facility not found")
            return facilities_pb2.Facility()

        return facilities_pb2.Facility(
            id=str(row["id"]),
            name=row["name"],
            type=row["type"],
            capacity=row["capacity"],
            location=row["location"],
        )

    def ListAvailableSlots(self, request, context):
        if not request.facility_id:
            context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
            context.set_details("facility_id is required")
            return facilities_pb2.ListAvailableSlotsResponse()

        if not request.date:
            context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
            context.set_details("date is required")
            return facilities_pb2.ListAvailableSlotsResponse()

        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    select start_time, end_time
                    from facility_slots
                    where facility_id = %s
                      and is_available = true
                      and start_time >= %s::date
                      and start_time < (%s::date + interval '1 day')
                    order by start_time
                    """,
                    (request.facility_id, request.date, request.date),
                )
                rows = cur.fetchall()

        slots = [
            facilities_pb2.TimeSlot(
                start_time=row["start_time"].isoformat(),
                end_time=row["end_time"].isoformat(),
            )
            for row in rows
        ]

        return facilities_pb2.ListAvailableSlotsResponse(slots=slots)

    def CreateSlot(self, request, context):
        if not request.facility_id:
            context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
            context.set_details("facility_id is required")
            return facilities_pb2.Slot()

        if not request.start_time or not request.end_time:
            context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
            context.set_details("start_time and end_time are required")
            return facilities_pb2.Slot()

        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    insert into facility_slots (facility_id, start_time, end_time, is_available)
                    values (%s, %s, %s, %s)
                    returning id, facility_id, start_time, end_time, is_available
                    """,
                    (
                        request.facility_id,
                        request.start_time,
                        request.end_time,
                        request.is_available,
                    ),
                )
                row = cur.fetchone()
                conn.commit()

        return facilities_pb2.Slot(
            id=str(row["id"]),
            facility_id=str(row["facility_id"]),
            start_time=row["start_time"].isoformat(),
            end_time=row["end_time"].isoformat(),
            is_available=row["is_available"],
        )


def serve() -> None:
    load_dotenv()
    port = os.getenv("PORT", "50052")

    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    facilities_pb2_grpc.add_FacilitiesServiceServicer_to_server(FacilitiesService(), server)
    server.add_insecure_port(f"[::]:{port}")
    server.start()
    print(f"facilities-service listening on {port}")
    server.wait_for_termination()


if __name__ == "__main__":
    serve()
