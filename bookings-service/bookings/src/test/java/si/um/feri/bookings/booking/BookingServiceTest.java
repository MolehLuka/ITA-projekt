package si.um.feri.bookings.booking;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import si.um.feri.bookings.booking.dto.BookingCreateRequest;
import si.um.feri.bookings.messaging.BookingEventPublisher;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private BookingEventPublisher bookingEventPublisher;

    @Test
    void createBookingThrowsWhenEndBeforeStart() {
        var service = new BookingService(bookingRepository, bookingEventPublisher);
        var request = request(OffsetDateTime.parse("2026-04-20T10:00:00Z"), OffsetDateTime.parse("2026-04-20T10:00:00Z"));

        assertThrows(IllegalArgumentException.class, () -> service.createBooking(request, UUID.randomUUID()));
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createBookingThrowsWhenOverlapping() {
        var service = new BookingService(bookingRepository, bookingEventPublisher);
        var request = request(OffsetDateTime.parse("2026-04-20T10:00:00Z"), OffsetDateTime.parse("2026-04-20T11:00:00Z"));

        when(bookingRepository.findOverlappingBookings(any(), any(), any())).thenReturn(List.of(existingBooking()));

        assertThrows(IllegalStateException.class, () -> service.createBooking(request, UUID.randomUUID()));
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void cancelBookingMarksCancelledAndPublishesEvent() {
        var service = new BookingService(bookingRepository, bookingEventPublisher);
        var booking = existingBooking();

        when(bookingRepository.findById(booking.getId())).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.cancelBooking(booking.getId());

        assertEquals("cancelled", response.getStatus());
        verify(bookingEventPublisher).publishCancelled(any());
    }

    private BookingCreateRequest request(OffsetDateTime start, OffsetDateTime end) {
        var request = new BookingCreateRequest();
        request.setFacilityId(UUID.randomUUID());
        request.setStartTime(start);
        request.setEndTime(end);
        return request;
    }

    private Booking existingBooking() {
        return new Booking(
            UUID.randomUUID(),
            UUID.randomUUID(),
            UUID.randomUUID(),
            OffsetDateTime.parse("2026-04-20T10:00:00Z"),
            OffsetDateTime.parse("2026-04-20T11:00:00Z"),
            "created",
            OffsetDateTime.parse("2026-04-01T10:00:00Z")
        );
    }
}
