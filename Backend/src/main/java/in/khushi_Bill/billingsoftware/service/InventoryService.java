package in.khushi_Bill.billingsoftware.service;

import in.khushi_Bill.billingsoftware.io.InventoryResponse;
import java.util.List;
import java.util.Map;

public interface InventoryService {
    List<InventoryResponse> getAllInventory();
    InventoryResponse updateStock(String itemId, Integer quantity);
    List<InventoryResponse> getLowStockItems(int threshold);
    void decrementStock(Map<String, Integer> itemQuantities);
}