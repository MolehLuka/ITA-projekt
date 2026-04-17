package si.um.feri.bookings.booking.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class BookingResponse {

    private UUID id;
    private UUID memberId;
    private UUID facilityId;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private String status;
    private OffsetDateTime createdAt;

    public BookingResponse(UUID id,
                           UUID memberId,
                           UUID facilityId,
                           OffsetDateTime startTime,
                           OffsetDateTime endTime,
                           String status,
                           OffsetDateTime createdAt) {
        this.id = id;
        this.memberId = memberId;
        this.facilityId = facilityId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getMemberId() {
        return memberId;
    }

    public UUID getFacilityId() {
        return facilityId;
    }

    public OffsetDateTime getStartTime() {
        return startTime;
    }

    public OffsetDateTime getEndTime() {
        return endTime;
    }

    public String getStatus() {
        return status;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
