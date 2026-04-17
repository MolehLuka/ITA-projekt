package si.um.feri.bookings.booking;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import si.um.feri.bookings.booking.dto.BookingCreateRequest;
import si.um.feri.bookings.booking.dto.BookingResponse;

@ExtendWith(MockitoExtension.class)
class BookingControllerTest {

    @Mock
    private BookingService bookingService;

    @Test
    void createReturns201() {
        var controller = new BookingController(bookingService);
        var request = new BookingCreateRequest();
        request.setFacilityId(UUID.randomUUID());
        request.setStartTime(OffsetDateTime.parse("2026-04-20T10:00:00Z"));
        request.setEndTime(OffsetDateTime.parse("2026-04-20T11:00:00Z"));

        var responsePayload = new BookingResponse(
            UUID.randomUUID(),
            UUID.randomUUID(),
            request.getFacilityId(),
            request.getStartTime(),
            request.getEndTime(),
            "created",
            OffsetDateTime.parse("2026-04-01T10:00:00Z")
        );

        when(bookingService.createBooking(any(), any())).thenReturn(responsePayload);

        var response = controller.create(UUID.randomUUID().toString(), request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(responsePayload.getId(), response.getBody().getId());
    }

    @Test
    void createReturns400ForInvalidMemberId() {
        var controller = new BookingController(bookingService);
        var request = new BookingCreateRequest();
        request.setFacilityId(UUID.randomUUID());
        request.setStartTime(OffsetDateTime.parse("2026-04-20T10:00:00Z"));
        request.setEndTime(OffsetDateTime.parse("2026-04-20T11:00:00Z"));

        var response = controller.create("not-a-uuid", request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void listForMemberThrowsForInvalidMemberId() {
        var controller = new BookingController(bookingService);

        assertThrows(IllegalArgumentException.class, () -> controller.listForMember("bad-id"));
    }
}
