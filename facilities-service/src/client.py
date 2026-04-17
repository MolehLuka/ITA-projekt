import os

import grpc
from dotenv import load_dotenv

import facilities_pb2
import facilities_pb2_grpc


def main() -> None:
    load_dotenv()
    host = os.getenv("FACILITIES_GRPC_HOST", "localhost")
    port = os.getenv("FACILITIES_GRPC_PORT", "50052")

    channel = grpc.insecure_channel(f"{host}:{port}")
    stub = facilities_pb2_grpc.FacilitiesServiceStub(channel)

    created = stub.CreateFacility(
        facilities_pb2.CreateFacilityRequest(
            name="Main Court",
            type="court",
            capacity=20,
            location="Gym Hall",
        )
    )
    print(f"Created facility: {created.id} | {created.name}")

    created_slot = stub.CreateSlot(
        facilities_pb2.CreateSlotRequest(
            facility_id=created.id,
            start_time="2026-03-20T09:00:00Z",
            end_time="2026-03-20T10:00:00Z",
            is_available=True,
        )
    )
    print(f"Created slot: {created_slot.id} | {created_slot.start_time} -> {created_slot.end_time}")

    response = stub.ListFacilities(facilities_pb2.ListFacilitiesRequest())
    print("Facilities:")
    for facility in response.facilities:
        print(f"- {facility.id} | {facility.name} | {facility.type} | {facility.capacity} | {facility.location}")

    available_slots_response = stub.ListAvailableSlots(
        facilities_pb2.ListAvailableSlotsRequest(facility_id=created.id, date="2026-03-20")
    )
    print("Available Slots:")
    for slot in available_slots_response.slots:
        print(f"- {slot.start_time} to {slot.end_time}")



if __name__ == "__main__":
    main()
