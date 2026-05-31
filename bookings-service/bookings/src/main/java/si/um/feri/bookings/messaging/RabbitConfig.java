package si.um.feri.bookings.messaging;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String BOOKING_EVENTS_EXCHANGE = "booking.events";
    public static final String BOOKING_CREATED_QUEUE = "booking.created";
    public static final String BOOKING_CANCELLED_QUEUE = "booking.cancelled";
    public static final String SLOT_RESERVED_QUEUE = "slot.reserved";
    public static final String SLOT_RESERVATION_FAILED_QUEUE = "slot.reservation.failed";

    @Bean
    public DirectExchange bookingEventsExchange() {
        return new DirectExchange(BOOKING_EVENTS_EXCHANGE);
    }

    @Bean
    public Queue bookingCreatedQueue() {
        return new Queue(BOOKING_CREATED_QUEUE, true);
    }

    @Bean
    public Queue bookingCancelledQueue() {
        return new Queue(BOOKING_CANCELLED_QUEUE, true);
    }

    @Bean
    public Binding bookingCreatedBinding(DirectExchange bookingEventsExchange, Queue bookingCreatedQueue) {
        return BindingBuilder.bind(bookingCreatedQueue).to(bookingEventsExchange).with(BOOKING_CREATED_QUEUE);
    }

    @Bean
    public Binding bookingCancelledBinding(DirectExchange bookingEventsExchange, Queue bookingCancelledQueue) {
        return BindingBuilder.bind(bookingCancelledQueue).to(bookingEventsExchange).with(BOOKING_CANCELLED_QUEUE);
    }

    @Bean
    public Queue slotReservedQueue() {
        return new Queue(SLOT_RESERVED_QUEUE, true);
    }

    @Bean
    public Queue slotReservationFailedQueue() {
        return new Queue(SLOT_RESERVATION_FAILED_QUEUE, true);
    }

    @Bean
    public Binding slotReservedBinding(DirectExchange bookingEventsExchange, Queue slotReservedQueue) {
        return BindingBuilder.bind(slotReservedQueue).to(bookingEventsExchange).with(SLOT_RESERVED_QUEUE);
    }

    @Bean
    public Binding slotReservationFailedBinding(DirectExchange bookingEventsExchange,
                                                Queue slotReservationFailedQueue) {
        return BindingBuilder.bind(slotReservationFailedQueue)
            .to(bookingEventsExchange)
            .with(SLOT_RESERVATION_FAILED_QUEUE);
    }

}
