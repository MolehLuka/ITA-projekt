package si.um.feri.bookings.booking;

import java.util.List;
import java.util.UUID;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import si.um.feri.bookings.booking.dto.BookingCreateRequest;
import si.um.feri.bookings.booking.dto.BookingResponse;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    private static final Logger logger = LoggerFactory.getLogger(BookingController.class);

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> create(@AuthenticationPrincipal String memberId,
                                                  @Valid @RequestBody BookingCreateRequest request) {
        try {
            var created = bookingService.createBooking(request, parseMemberId(memberId));
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException exception) {
            logger.warn("Booking create failed: {}", exception.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (IllegalStateException exception) {
            logger.warn("Booking create conflict: {}", exception.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @GetMapping
    public List<BookingResponse> listForMember(@AuthenticationPrincipal String memberId) {
        return bookingService.listForMember(parseMemberId(memberId));
    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<BookingResponse> cancel(@PathVariable UUID bookingId) {
        try {
            var cancelled = bookingService.cancelBooking(bookingId);
            return ResponseEntity.ok(cancelled);
        } catch (IllegalArgumentException exception) {
            logger.warn("Booking cancel failed: {}", exception.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    private UUID parseMemberId(String memberId) {
        if (memberId == null || memberId.isBlank()) {
            throw new IllegalArgumentException("missing member id in token");
        }

        try {
            return UUID.fromString(memberId);
        } catch (Exception ex) {
            throw new IllegalArgumentException("invalid member id");
        }
    }
}
