package si.um.feri.bookings.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import si.um.feri.bookings.booking.BookingRepository;

@Component
public class SlotReservationSagaListener {

    private static final Logger logger = LoggerFactory.getLogger(SlotReservationSagaListener.class);

    private final BookingRepository bookingRepository;
    private final ObjectMapper objectMapper;

    public SlotReservationSagaListener(BookingRepository bookingRepository, ObjectMapper objectMapper) {
        this.bookingRepository = bookingRepository;
        this.objectMapper = objectMapper;
    }

    @RabbitListener(queues = RabbitConfig.SLOT_RESERVED_QUEUE)
    @Transactional
    public void onSlotReserved(String message) {
        var payload = parsePayload(message);
        if (payload == null) {
            return;
        }

        bookingRepository.findById(payload.bookingId()).ifPresent(booking -> {
            if (!"pending".equals(booking.getStatus())) {
                return;
            }
            booking.setStatus("confirmed");
            bookingRepository.save(booking);
            logger.info("Saga completed: booking {} confirmed", payload.bookingId());
        });
    }

    @RabbitListener(queues = RabbitConfig.SLOT_RESERVATION_FAILED_QUEUE)
    @Transactional
    public void onSlotReservationFailed(String message) {
        var payload = parsePayload(message);
        if (payload == null) {
            return;
        }

        bookingRepository.findById(payload.bookingId()).ifPresent(booking -> {
            if (!"pending".equals(booking.getStatus())) {
                return;
            }
            booking.setStatus("cancelled");
            bookingRepository.save(booking);
            logger.info("Saga compensation: booking {} cancelled (no slot available)", payload.bookingId());
        });
    }

    private SagaPayload parsePayload(String message) {
        try {
            return objectMapper.readValue(message, SagaPayload.class);
        } catch (Exception ex) {
            logger.warn("Failed to parse saga event: {}", message, ex);
            return null;
        }
    }

    private record SagaPayload(
        UUID bookingId,
        UUID memberId,
        UUID facilityId,
        String startTime,
        String endTime,
        String status
    ) {}
}
