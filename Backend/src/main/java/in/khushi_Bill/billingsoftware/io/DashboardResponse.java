package in.khushi_Bill.billingsoftware.io;

import lombok.*;
import java.util.List;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class DashboardResponse {
    private Double todaySales;
    private Long todayOrderCount;
    private Double monthSales;
    private Long monthOrderCount;
    private List<OrderResponse> recentOrders;
    private List<SalesAnalyticsResponse.PaymentBreakdown> paymentBreakdown;
    private List<SalesAnalyticsResponse.DailySales> weeklyTrend;
}