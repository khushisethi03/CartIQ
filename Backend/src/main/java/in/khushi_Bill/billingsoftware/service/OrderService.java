package in.khushi_Bill.billingsoftware.service;

import in.khushi_Bill.billingsoftware.io.OrderRequest;
import in.khushi_Bill.billingsoftware.io.OrderResponse;
import in.khushi_Bill.billingsoftware.io.PaymentVerificationRequest;

import java.time.LocalDate;
import java.util.List;

public interface OrderService {
    OrderResponse createOrder(OrderRequest request);

    void deleteOrder(String orderId);
    List<OrderResponse> getLatestOrders();
    OrderResponse verifyPayment(PaymentVerificationRequest request);
    OrderResponse markOrderFailed(String orderId);  // NEW
    Double sumSalesByDate(LocalDate date);
    Long countByOrderDate(LocalDate date);
    List<OrderResponse> findRecentOrders();
}
