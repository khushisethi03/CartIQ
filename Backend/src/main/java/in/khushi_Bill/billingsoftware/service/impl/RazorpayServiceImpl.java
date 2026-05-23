package in.khushi_Bill.billingsoftware.service.impl;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import in.khushi_Bill.billingsoftware.io.RazorpayOrderResponse;
import in.khushi_Bill.billingsoftware.service.RazorpayService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class RazorpayServiceImpl implements RazorpayService {

    private final RazorpayClient razorpayClient;

    // FIX: create client once as a bean — not on every request
    public RazorpayServiceImpl(
            @Value("${razorpay.key.id}") String keyId,
            @Value("${razorpay.key.secret}") String keySecret) throws RazorpayException {
        this.razorpayClient = new RazorpayClient(keyId, keySecret);
    }

    @Override
    public RazorpayOrderResponse createOrder(Double amount, String currency)
            throws RazorpayException {

        JSONObject orderRequest = new JSONObject();
        // FIX: Razorpay needs amount in paise as a whole integer
        // Math.round avoids floating-point issues e.g. 707.0 * 100 = 70699.99999...
        orderRequest.put("amount", Math.round(amount * 100));
        orderRequest.put("currency", currency != null ? currency : "INR");
        orderRequest.put("receipt", "rcpt_" + System.currentTimeMillis());
        orderRequest.put("payment_capture", 1);

        Order order = razorpayClient.orders.create(orderRequest);
        return convertToResponse(order);
    }

    private RazorpayOrderResponse convertToResponse(Order order) {
        return RazorpayOrderResponse.builder()
                .id(order.get("id"))
                .entity(order.get("entity"))
                .amount(order.get("amount"))
                .currency(order.get("currency"))
                .status(order.get("status"))
                .created_at(order.get("created_at"))
                .receipt(order.get("receipt"))
                .build();
    }
}
