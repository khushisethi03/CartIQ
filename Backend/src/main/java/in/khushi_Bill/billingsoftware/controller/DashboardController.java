package in.khushi_Bill.billingsoftware.controller;

import in.khushi_Bill.billingsoftware.io.DashboardResponse;
import in.khushi_Bill.billingsoftware.io.OrderResponse;
import in.khushi_Bill.billingsoftware.io.SalesAnalyticsResponse;
import in.khushi_Bill.billingsoftware.repository.OrderEntityRepository;
import in.khushi_Bill.billingsoftware.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final OrderService orderService;
    private final OrderEntityRepository orderRepo;

    @GetMapping
    public DashboardResponse getDashboardData() {
        LocalDate today = LocalDate.now();
        int year = today.getYear();
        int month = today.getMonthValue();

        Double todaySale = orderService.sumSalesByDate(today);
        Long todayOrderCount = orderService.countByOrderDate(today);
        Double monthSales = orderRepo.sumSalesByMonth(year, month);
        Long monthOrderCount = orderRepo.countByMonth(year, month);
        List<OrderResponse> recentOrders = orderService.findRecentOrders();

        // Payment breakdown for pie chart
        List<Object[]> rawPayment = orderRepo.getCompletedPaymentMethodBreakdown();
        List<SalesAnalyticsResponse.PaymentBreakdown> paymentBreakdown = rawPayment.stream()
                .map(r -> SalesAnalyticsResponse.PaymentBreakdown.builder()
                        .method(r[0].toString())
                        .count((Long) r[1])
                        .totalAmount(r[2] != null ? (Double) r[2] : 0.0)
                        .build())
                .collect(Collectors.toList());

        // Weekly trend for bar chart
        List<Object[]> rawDaily = orderRepo.getDailySalesFrom(LocalDateTime.now().minusDays(7));
        List<SalesAnalyticsResponse.DailySales> weeklyTrend = rawDaily.stream()
                .map(r -> SalesAnalyticsResponse.DailySales.builder()
                        .date(r[0].toString())
                        .totalAmount(r[1] != null ? ((Number) r[1]).doubleValue() : 0.0)
                        .orderCount(r[2] != null ? ((Number) r[2]).longValue() : 0L)
                        .build())
                .collect(Collectors.toList());

        return new DashboardResponse(
                todaySale != null ? todaySale : 0.0,
                todayOrderCount != null ? todayOrderCount : 0L,
                monthSales != null ? monthSales : 0.0,
                monthOrderCount != null ? monthOrderCount : 0L,
                recentOrders,
                paymentBreakdown,
                weeklyTrend
        );
    }
}