package in.khushi_Bill.billingsoftware.controller;

import in.khushi_Bill.billingsoftware.io.InventoryResponse;
import in.khushi_Bill.billingsoftware.io.StockUpdateRequest;
import in.khushi_Bill.billingsoftware.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public List<InventoryResponse> getAllInventory() {
        return inventoryService.getAllInventory();
    }

    @PatchMapping("/{itemId}/stock")
    public ResponseEntity<InventoryResponse> updateStock(@PathVariable String itemId,
                                                         @RequestBody StockUpdateRequest request) {
        return ResponseEntity.ok(inventoryService.updateStock(itemId, request.getStockQuantity()));
    }

    @GetMapping("/low-stock")
    public List<InventoryResponse> getLowStockItems(@RequestParam(defaultValue = "5") int threshold) {
        return inventoryService.getLowStockItems(threshold);
    }
}