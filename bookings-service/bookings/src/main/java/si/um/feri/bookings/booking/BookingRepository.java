package si.um.feri.bookings.booking;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, UUID> {

    List<Booking> findByMemberId(UUID memberId);

    @Query("""
        select b from Booking b
        where b.facilityId = :facilityId
          and b.startTime < :endTime
          and b.endTime > :startTime
          and b.status = 'created'
        """)
    List<Booking> findOverlappingBookings(
            @Param("facilityId") UUID facilityId,
            @Param("startTime") OffsetDateTime startTime,
            @Param("endTime") OffsetDateTime endTime);
}
