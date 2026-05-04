package in.khushi_Bill.billingsoftware.io;

import lombok.*;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class StockUpdateRequest {
    private Integer stockQuantity;
}
