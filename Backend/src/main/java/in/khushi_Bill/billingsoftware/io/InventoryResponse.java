package in.khushi_Bill.billingsoftware.io;

import lombok.*;
import java.math.BigDecimal;
import java.sql.Timestamp;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class InventoryResponse {
    private Long id;
    private String itemId;
    private String name;
    private BigDecimal price;
    private String description;
    private String categoryName;
    private String imgUrl;
    private Integer stockQuantity;
    private Timestamp createdAt;
    private Timestamp updatedAt;
}
