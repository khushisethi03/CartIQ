package in.khushi_Bill.billingsoftware.controller;

import com.razorpay.RazorpayException;
import in.khushi_Bill.billingsoftware.io.OrderResponse;
import in.khushi_Bill.billingsoftware.io.PaymentRequest;
import in.khushi_Bill.billingsoftware.io.PaymentVerificationRequest;
import in.khushi_Bill.billingsoftware.io.RazorpayOrderResponse;
import in.khushi_Bill.billingsoftware.service.OrderService;
import in.khushi_Bill.billingsoftware.service.RazorpayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final RazorpayService razorpayService;
    private final OrderService orderService;

    @PostMapping("/create-order")
    @ResponseStatus(HttpStatus.CREATED)
    public RazorpayOrderResponse createRazorpayOrder(@RequestBody PaymentRequest request) throws RazorpayException {
        return razorpayService.createOrder(request.getAmount(), request.getCurrency());
    }

    @PostMapping("/verify")
    public OrderResponse verifyPayment(@RequestBody PaymentVerificationRequest request) {
        return orderService.verifyPayment(request);
    }
}
