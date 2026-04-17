package si.um.feri.bookings.messaging;

import java.time.OffsetDateTime;
import java.util.UUID;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class BookingEventPublisher {

    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    public BookingEventPublisher(RabbitTemplate rabbitTemplate, ObjectMapper objectMapper) {
        this.rabbitTemplate = rabbitTemplate;
        this.objectMapper = objectMapper;
    }

    public void publishCreated(BookingEventPayload payload) {
        rabbitTemplate.convertAndSend(
            RabbitConfig.BOOKING_EVENTS_EXCHANGE,
            RabbitConfig.BOOKING_CREATED_QUEUE,
            toJson(payload)
        );
    }

    public void publishCancelled(BookingEventPayload payload) {
        rabbitTemplate.convertAndSend(
            RabbitConfig.BOOKING_EVENTS_EXCHANGE,
            RabbitConfig.BOOKING_CANCELLED_QUEUE,
            toJson(payload)
        );
    }

    private String toJson(BookingEventPayload payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("failed to serialize booking event", ex);
        }
    }

    public record BookingEventPayload(
        UUID bookingId,
        UUID memberId,
        UUID facilityId,
        OffsetDateTime startTime,
        OffsetDateTime endTime,
        String status
    ) {}
}
