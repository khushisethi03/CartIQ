package in.khushi_Bill.billingsoftware.service.impl;

import in.khushi_Bill.billingsoftware.entity.OrderEntity;
import in.khushi_Bill.billingsoftware.entity.OrderItemEntity;
import in.khushi_Bill.billingsoftware.entity.UserEntity;
import in.khushi_Bill.billingsoftware.io.*;
import in.khushi_Bill.billingsoftware.repository.OrderEntityRepository;
import in.khushi_Bill.billingsoftware.repository.UserRepository;
import in.khushi_Bill.billingsoftware.service.ActivityLogService;
import in.khushi_Bill.billingsoftware.service.InventoryService;
import in.khushi_Bill.billingsoftware.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderEntityRepository orderEntityRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;
    private final InventoryService inventoryService;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Override
    public OrderResponse createOrder(OrderRequest request) {
        OrderEntity newOrder = convertToOrderEntity(request);

        PaymentDetails paymentDetails = new PaymentDetails();
        paymentDetails.setStatus(
                newOrder.getPaymentMethod() == PaymentMethod.CASH
                        ? PaymentDetails.PaymentStatus.COMPLETED
                        : PaymentDetails.PaymentStatus.PENDING);
        newOrder.setPaymentDetails(paymentDetails);

        newOrder.setItems(request.getCartItems().stream()
                .map(this::convertToOrderItemEntity)
                .collect(Collectors.toList()));

        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        Optional<UserEntity> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            newOrder.setCreatedByUserId(userOpt.get().getUserId());
            newOrder.setCreatedByUserName(userOpt.get().getName());
        }

        newOrder = orderEntityRepository.save(newOrder);

        Map<String, Integer> itemQtyMap = request.getCartItems().stream()
                .collect(Collectors.toMap(
                        OrderRequest.OrderItemRequest::getItemId,
                        OrderRequest.OrderItemRequest::getQuantity,
                        Integer::sum));
        inventoryService.decrementStock(itemQtyMap);

        if (userOpt.isPresent()) {
            activityLogService.log(userOpt.get().getId(), "ORDER",
                    userOpt.get().getName() + " placed an order");
        }

        return convertToResponse(newOrder);
    }

    @Override
    public OrderResponse verifyPayment(PaymentVerificationRequest request) {
        OrderEntity existingOrder = orderEntityRepository
                .findByOrderId(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found: " + request.getOrderId()));

        // If already COMPLETED, return as-is
        PaymentDetails existing = existingOrder.getPaymentDetails();
        if (existing != null &&
                PaymentDetails.PaymentStatus.COMPLETED.equals(existing.getStatus())) {
            return convertToResponse(existingOrder);
        }

        verifyRazorpaySignature(request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(), request.getRazorpaySignature());

        PaymentDetails pd = existing != null ? existing : new PaymentDetails();
        pd.setRazorpayOrderId(request.getRazorpayOrderId());
        pd.setRazorpayPaymentId(request.getRazorpayPaymentId());
        pd.setRazorpaySignature(request.getRazorpaySignature());
        pd.setStatus(PaymentDetails.PaymentStatus.COMPLETED);
        existingOrder.setPaymentDetails(pd);

        existingOrder = orderEntityRepository.save(existingOrder);
        return convertToResponse(existingOrder);
    }

    // NEW: Mark order as FAILED instead of deleting it
    @Override
    public OrderResponse markOrderFailed(String orderId) {
        OrderEntity existingOrder = orderEntityRepository
                .findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        // Don't downgrade a COMPLETED order
        PaymentDetails pd = existingOrder.getPaymentDetails();
        if (pd != null &&
                PaymentDetails.PaymentStatus.COMPLETED.equals(pd.getStatus())) {
            return convertToResponse(existingOrder);
        }

        if (pd == null) pd = new PaymentDetails();
        pd.setStatus(PaymentDetails.PaymentStatus.FAILED);
        existingOrder.setPaymentDetails(pd);

        existingOrder = orderEntityRepository.save(existingOrder);
        return convertToResponse(existingOrder);
    }

    private boolean verifyRazorpaySignature(String razorpayOrderId,
                                            String razorpayPaymentId,
                                            String razorpaySignature) {
        try {
            String payload = razorpayOrderId + "|" + razorpayPaymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(
                    razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                String h = Integer.toHexString(0xff & b);
                if (h.length() == 1) hex.append('0');
                hex.append(h);
            }
            return hex.toString().equals(razorpaySignature);
        } catch (Exception e) {
            return true;
        }
    }

    private OrderItemEntity convertToOrderItemEntity(OrderRequest.OrderItemRequest item) {
        return OrderItemEntity.builder()
                .itemId(item.getItemId()).name(item.getName())
                .price(item.getPrice()).quantity(item.getQuantity())
                .build();
    }

    private OrderResponse convertToResponse(OrderEntity order) {
        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .customerName(order.getCustomerName())
                .phoneNumber(order.getPhoneNumber())
                .subtotal(order.getSubtotal())
                .tax(order.getTax())
                .grandTotal(order.getGrandTotal())
                .paymentMethod(order.getPaymentMethod())
                .items(order.getItems().stream()
                        .map(this::convertToItemResponse)
                        .collect(Collectors.toList()))
                .paymentDetails(order.getPaymentDetails())
                .createdAt(order.getCreatedAt())
                .build();
    }

    private OrderResponse.OrderItemResponse convertToItemResponse(OrderItemEntity item) {
        return OrderResponse.OrderItemResponse.builder()
                .itemId(item.getItemId()).name(item.getName())
                .price(item.getPrice()).quantity(item.getQuantity())
                .build();
    }

    private OrderEntity convertToOrderEntity(OrderRequest request) {
        return OrderEntity.builder()
                .customerName(request.getCustomerName())
                .phoneNumber(request.getPhoneNumber())
                .subtotal(request.getSubtotal()).tax(request.getTax())
                .grandTotal(request.getGrandTotal())
                .paymentMethod(PaymentMethod.valueOf(request.getPaymentMethod()))
                .build();
    }

    @Override
    public void deleteOrder(String orderId) {
        // Only delete PENDING orders — never COMPLETED or FAILED
        OrderEntity existingOrder = orderEntityRepository
                .findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        PaymentDetails pd = existingOrder.getPaymentDetails();
        if (pd != null && !PaymentDetails.PaymentStatus.PENDING.equals(pd.getStatus())) {
            System.out.println("Skipping delete for non-PENDING order: " + orderId);
            return;
        }
        orderEntityRepository.delete(existingOrder);
    }

    @Override
    public List<OrderResponse> getLatestOrders() {
        return orderEntityRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    @Override
    public Double sumSalesByDate(LocalDate date) {
        return orderEntityRepository.sumSalesByDate(date);
    }

    @Override
    public Long countByOrderDate(LocalDate date) {
        return orderEntityRepository.countByOrderDate(date);
    }

    @Override
    public List<OrderResponse> findRecentOrders() {
        return orderEntityRepository.findRecentOrders(PageRequest.of(0, 5))
                .stream().map(this::convertToResponse).collect(Collectors.toList());
    }
}
