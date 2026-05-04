package in.khushi_Bill.billingsoftware.service;

import com.razorpay.RazorpayException;
import in.khushi_Bill.billingsoftware.io.RazorpayOrderResponse;

public interface RazorpayService {

    RazorpayOrderResponse createOrder(Double amount, String currency) throws RazorpayException;
}
