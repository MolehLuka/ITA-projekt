package si.um.feri.bookings.booking;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import si.um.feri.bookings.messaging.BookingEventPublisher;
import si.um.feri.bookings.booking.dto.BookingCreateRequest;
import si.um.feri.bookings.booking.dto.BookingResponse;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingEventPublisher bookingEventPublisher;

    public BookingService(BookingRepository bookingRepository, BookingEventPublisher bookingEventPublisher) {
        this.bookingRepository = bookingRepository;
        this.bookingEventPublisher = bookingEventPublisher;
    }

    @Transactional
    public BookingResponse createBooking(BookingCreateRequest request, UUID memberId) {
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException("endTime must be after startTime");
        }

        var overlaps = bookingRepository.findOverlappingBookings(
            request.getFacilityId(),
            request.getStartTime(),
            request.getEndTime()
        );

        if (!overlaps.isEmpty()) {
            throw new IllegalStateException("booking overlaps with existing booking");
        }

        var now = OffsetDateTime.now();
        var booking = new Booking(
            UUID.randomUUID(),
            memberId,
            request.getFacilityId(),
            request.getStartTime(),
            request.getEndTime(),
            "created",
            now
        );

        var saved = bookingRepository.save(booking);
        bookingEventPublisher.publishCreated(toEventPayload(saved));
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> listForMember(UUID memberId) {
        return bookingRepository.findByMemberId(memberId).stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional
    public BookingResponse cancelBooking(UUID bookingId) {
        var booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new IllegalArgumentException("booking not found"));

        booking.setStatus("cancelled");
        var saved = bookingRepository.save(booking);
        bookingEventPublisher.publishCancelled(toEventPayload(saved));
        return toResponse(saved);
    }

    private BookingResponse toResponse(Booking booking) {
        return new BookingResponse(
            booking.getId(),
            booking.getMemberId(),
            booking.getFacilityId(),
            booking.getStartTime(),
            booking.getEndTime(),
            booking.getStatus(),
            booking.getCreatedAt()
        );
    }

    private BookingEventPublisher.BookingEventPayload toEventPayload(Booking booking) {
        return new BookingEventPublisher.BookingEventPayload(
            booking.getId(),
            booking.getMemberId(),
            booking.getFacilityId(),
            booking.getStartTime(),
            booking.getEndTime(),
            booking.getStatus()
        );
    }
}
