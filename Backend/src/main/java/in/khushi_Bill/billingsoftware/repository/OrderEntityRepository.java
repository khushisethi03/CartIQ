package in.khushi_Bill.billingsoftware.repository;

import in.khushi_Bill.billingsoftware.entity.OrderEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.web.bind.annotation.PathVariable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderEntityRepository extends JpaRepository<OrderEntity, Long> {

    Optional<OrderEntity> findByOrderId(String orderId);

    List<OrderEntity> findAllByOrderByCreatedAtDesc();

    @Query("SELECT SUM(o.grandTotal) FROM OrderEntity o WHERE DATE(o.createdAt) = :date")
    Double sumSalesByDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(o) FROM OrderEntity o WHERE DATE(o.createdAt) = :date")
    Long countByOrderDate(@Param("date") LocalDate date);

    @Query("SELECT o FROM OrderEntity o ORDER BY o.createdAt DESC")
    List<OrderEntity> findRecentOrders(Pageable pageable);
    // ADD these methods to the interface

    @Query("SELECT SUM(o.grandTotal) FROM OrderEntity o WHERE YEAR(o.createdAt) = :year AND MONTH(o.createdAt) = :month")
    Double sumSalesByMonth(@Param("year") int year, @Param("month") int month);

    @Query("SELECT COUNT(o) FROM OrderEntity o WHERE YEAR(o.createdAt) = :year AND MONTH(o.createdAt) = :month")
    Long countByMonth(@Param("year") int year, @Param("month") int month);

    @Query("SELECT SUM(o.grandTotal) FROM OrderEntity o")
    Double sumTotalRevenue();

    @Query("SELECT o.paymentMethod, COUNT(o), SUM(o.grandTotal) FROM OrderEntity o GROUP BY o.paymentMethod")
    List<Object[]> getPaymentMethodBreakdown();

    @Query("SELECT DATE(o.createdAt), SUM(o.grandTotal), COUNT(o) FROM OrderEntity o WHERE o.createdAt >= :startDate GROUP BY DATE(o.createdAt) ORDER BY DATE(o.createdAt)")
    List<Object[]> getDailySalesFrom(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT SUM(o.grandTotal) FROM OrderEntity o WHERE o.createdByUserId = :userId")
    Double sumSalesByUser(@Param("userId") String userId);

    @Query("SELECT COUNT(o) FROM OrderEntity o WHERE o.createdByUserId = :userId")
    Long countOrdersByUser(@Param("userId") String userId);

    @Query("SELECT SUM(o.grandTotal) FROM OrderEntity o WHERE o.createdByUserId = :userId AND DATE(o.createdAt) = :date")
    Double sumTodaySalesByUser(@Param("userId") String userId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(o) FROM OrderEntity o WHERE o.createdByUserId = :userId AND DATE(o.createdAt) = :date")
    Long countTodayOrdersByUser(@Param("userId") String userId, @Param("date") LocalDate date);

    @Query("SELECT o.paymentMethod, COUNT(o), SUM(o.grandTotal) " +
            "FROM OrderEntity o " +
            "WHERE o.paymentDetails.status = in.khushi_Bill.billingsoftware.io.PaymentDetails.PaymentStatus.COMPLETED " +
            "GROUP BY o.paymentMethod")
    List<Object[]> getCompletedPaymentMethodBreakdown();
}
