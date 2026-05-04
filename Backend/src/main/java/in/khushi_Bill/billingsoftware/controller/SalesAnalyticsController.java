package in.khushi_Bill.billingsoftware.controller;

import in.khushi_Bill.billingsoftware.io.SalesAnalyticsResponse;
import in.khushi_Bill.billingsoftware.repository.OrderEntityRepository;
import in.khushi_Bill.billingsoftware.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/sales-analytics")
@RequiredArgsConstructor
public class SalesAnalyticsController {

    private final OrderEntityRepository orderRepo;
    private final UserRepository userRepo;

    @GetMapping
    public SalesAnalyticsResponse getAnalytics() {
        LocalDate today = LocalDate.now();
        int year = today.getYear();
        int month = today.getMonthValue();

        Double todaySales = orderRepo.sumSalesByDate(today);
        Long todayOrders = orderRepo.countByOrderDate(today);
        Double monthSales = orderRepo.sumSalesByMonth(year, month);
        Long monthOrders = orderRepo.countByMonth(year, month);
        Double totalRevenue = orderRepo.sumTotalRevenue();
        Long totalOrders = orderRepo.count();

        // Payment breakdown
        List<Object[]> rawPayment = orderRepo.getCompletedPaymentMethodBreakdown();
        List<SalesAnalyticsResponse.PaymentBreakdown> paymentBreakdown = rawPayment.stream()
                .map(r -> SalesAnalyticsResponse.PaymentBreakdown.builder()
                        .method(r[0].toString())
                        .count((Long) r[1])
                        .totalAmount(r[2] != null ? (Double) r[2] : 0.0)
                        .build())
                .collect(Collectors.toList());

        // Weekly trend (last 7 days)
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        List<Object[]> rawDaily = orderRepo.getDailySalesFrom(weekAgo);
        List<SalesAnalyticsResponse.DailySales> weeklyTrend = rawDaily.stream()
                .map(r -> SalesAnalyticsResponse.DailySales.builder()
                        .date(r[0].toString())
                        .totalAmount(r[1] != null ? ((Number) r[1]).doubleValue() : 0.0)
                        .orderCount(r[2] != null ? ((Number) r[2]).longValue() : 0L)
                        .build())
                .collect(Collectors.toList());

        // User sales summary
        List<SalesAnalyticsResponse.UserSalesSummary> userSummary = userRepo.findAll().stream()
                .filter(u -> "ROLE_USER".equals(u.getRole()))
                .map(u -> {
                    Double uTotal = orderRepo.sumSalesByUser(u.getUserId());
                    Long uOrders = orderRepo.countOrdersByUser(u.getUserId());
                    Double uToday = orderRepo.sumTodaySalesByUser(u.getUserId(), today);
                    Long uTodayOrders = orderRepo.countTodayOrdersByUser(u.getUserId(), today);
                    return SalesAnalyticsResponse.UserSalesSummary.builder()
                            .userId(u.getUserId())
                            .userName(u.getName())
                            .userEmail(u.getEmail())
                            .totalOrders(uOrders != null ? uOrders : 0L)
                            .totalRevenue(uTotal != null ? uTotal : 0.0)
                            .todaySales(uToday != null ? uToday : 0.0)
                            .todayOrders(uTodayOrders != null ? uTodayOrders : 0L)
                            .build();
                })
                .collect(Collectors.toList());

        return SalesAnalyticsResponse.builder()
                .todaySales(todaySales != null ? todaySales : 0.0)
                .todayOrderCount(todayOrders != null ? todayOrders : 0L)
                .monthSales(monthSales != null ? monthSales : 0.0)
                .monthOrderCount(monthOrders != null ? monthOrders : 0L)
                .totalRevenue(totalRevenue != null ? totalRevenue : 0.0)
                .totalOrders(totalOrders)
                .paymentBreakdown(paymentBreakdown)
                .weeklyTrend(weeklyTrend)
                .userSalesSummary(userSummary)
                .build();
    }
}
