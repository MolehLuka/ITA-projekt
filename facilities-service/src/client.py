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

    response = stub.ListFacilities(facilities_pb2.ListFacilitiesRequest())
    print("Facilities:")
    for facility in response.facilities:
        print(f"- {facility.id} | {facility.name} | {facility.type} | {facility.capacity} | {facility.location}")


if __name__ == "__main__":
    main()
