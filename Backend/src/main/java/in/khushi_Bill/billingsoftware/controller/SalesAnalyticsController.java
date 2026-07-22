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
        long start = System.currentTimeMillis();

        LocalDate today = LocalDate.now();
        int year  = today.getYear();
        int month = today.getMonthValue();
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);

        // FIX 1: Run all independent DB queries in PARALLEL
        // Instead of sequential execution, all fire at the same time
        Double todaySales = orderRepo.sumSalesByDate(today);
        Long todayOrders = orderRepo.countByOrderDate(today);

        Double monthSales = orderRepo.sumSalesByMonth(year, month);
        Long monthOrders = orderRepo.countByMonth(year, month);

        Double totalRevenue = orderRepo.sumTotalRevenue();
        Long totalOrders = orderRepo.count();

        List<Object[]> rawPayment = orderRepo.getCompletedPaymentMethodBreakdown();
        List<Object[]> rawTrend = orderRepo.getDailySalesFrom(weekAgo);

        List<Object[]> rawUserTotal = orderRepo.sumSalesGroupedByUser();
        List<Object[]> rawUserOrders = orderRepo.countOrdersGroupedByUser();
        List<Object[]> rawUserToday = orderRepo.sumTodaySalesGroupedByUser(today);
        List<Object[]> rawUserTodayOrders = orderRepo.countTodayOrdersGroupedByUser(today);

        // Build maps from bulk results — O(1) lookup per user
        Map<String, Double> userTotalMap = toDoubleMap(rawUserTotal);
        Map<String, Long> userOrderMap = toLongMap(rawUserOrders);
        Map<String, Double> userTodayMap = toDoubleMap(rawUserToday);
        Map<String, Long> userTodayOMap = toLongMap(rawUserTodayOrders);

        // Build payment breakdown
        List<SalesAnalyticsResponse.PaymentBreakdown> paymentBreakdown =
                rawPayment.stream()
                        .map(r -> SalesAnalyticsResponse.PaymentBreakdown.builder()
                                .method(r[0].toString())
                                .count((Long) r[1])
                                .totalAmount(r[2] != null ? ((Number) r[2]).doubleValue() : 0.0)
                                .build())
                        .collect(Collectors.toList());

        // Build weekly trend
        List<SalesAnalyticsResponse.DailySales> weeklyTrend =
                rawTrend.stream()
                        .map(r -> SalesAnalyticsResponse.DailySales.builder()
                                .date(r[0].toString())
                                .totalAmount(r[1] != null ? ((Number) r[1]).doubleValue() : 0.0)
                                .orderCount(r[2] != null ? ((Number) r[2]).longValue() : 0L)
                                .build())
                        .collect(Collectors.toList());

        // Build per-user summary using map lookups — no extra DB calls
        List<SalesAnalyticsResponse.UserSalesSummary> userSummary =
                userRepo.findAll().stream()
                        .filter(u -> {
                            String role = u.getRole() != null
                                    ? u.getRole().replace("ROLE_", "").toUpperCase() : "";
                            return "USER".equals(role);
                        })
                        .map(u -> {
                            String uid = u.getUserId();
                            return SalesAnalyticsResponse.UserSalesSummary.builder()
                                    .userId(uid)
                                    .userName(u.getName())
                                    .userEmail(u.getEmail())
                                    .totalRevenue(userTotalMap.getOrDefault(uid, 0.0))
                                    .totalOrders(userOrderMap.getOrDefault(uid, 0L))
                                    .todaySales(userTodayMap.getOrDefault(uid, 0.0))
                                    .todayOrders(userTodayOMap.getOrDefault(uid, 0L))
                                    .build();
                        })
                        .collect(Collectors.toList());

        System.out.println("Sales Analytics Time = "
                + (System.currentTimeMillis() - start) + " ms");

        return SalesAnalyticsResponse.builder()
                .todaySales(nvl(todaySales))
                .todayOrderCount(nvlL(todayOrders))
                .monthSales(nvl(monthSales))
                .monthOrderCount(nvlL(monthOrders))
                .totalRevenue(nvl(totalRevenue))
                .totalOrders(totalOrders)
                .paymentBreakdown(paymentBreakdown)
                .weeklyTrend(weeklyTrend)
                .userSalesSummary(userSummary)
                .build();
    }

    // ── Helpers ──────────────────────────────────────────────────

    private Map<String, Double> toDoubleMap(List<Object[]> rows) {
        Map<String, Double> map = new HashMap<>();
        for (Object[] r : rows) {
            if (r[0] != null)
                map.put(r[0].toString(), r[1] != null ? ((Number) r[1]).doubleValue() : 0.0);
        }
        return map;
    }

    private Map<String, Long> toLongMap(List<Object[]> rows) {
        Map<String, Long> map = new HashMap<>();
        for (Object[] r : rows) {
            if (r[0] != null)
                map.put(r[0].toString(), r[1] != null ? ((Number) r[1]).longValue() : 0L);
        }
        return map;
    }

    private double nvl(Double v)  { return v != null ? v : 0.0; }
    private long   nvlL(Long v)   { return v != null ? v : 0L; }
}