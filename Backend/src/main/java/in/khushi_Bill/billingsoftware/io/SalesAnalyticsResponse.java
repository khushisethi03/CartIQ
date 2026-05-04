package in.khushi_Bill.billingsoftware.io;

import lombok.*;
import java.util.List;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class SalesAnalyticsResponse {
    private Double todaySales;
    private Long todayOrderCount;
    private Double monthSales;
    private Long monthOrderCount;
    private Double totalRevenue;
    private Long totalOrders;
    private List<PaymentBreakdown> paymentBreakdown;
    private List<DailySales> weeklyTrend;
    private List<UserSalesSummary> userSalesSummary;

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class PaymentBreakdown {
        private String method;
        private Long count;
        private Double totalAmount;
    }

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class DailySales {
        private String date;
        private Double totalAmount;
        private Long orderCount;
    }

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class UserSalesSummary {
        private String userId;
        private String userName;
        private String userEmail;
        private Long totalOrders;
        private Double totalRevenue;
        private Double todaySales;
        private Long todayOrders;
    }
}
