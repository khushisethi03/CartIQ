package in.khushi_Bill.billingsoftware.service.impl;

import in.khushi_Bill.billingsoftware.entity.ItemEntity;
import in.khushi_Bill.billingsoftware.io.InventoryResponse;
import in.khushi_Bill.billingsoftware.repository.ItemRepository;
import in.khushi_Bill.billingsoftware.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final ItemRepository itemRepository;

    @Override
    public List<InventoryResponse> getAllInventory() {
        return itemRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public InventoryResponse updateStock(String itemId, Integer quantity) {
        ItemEntity item = itemRepository.findByItemId(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found: " + itemId));
        item.setStockQuantity(quantity);
        return toResponse(itemRepository.save(item));
    }

    @Override
    public List<InventoryResponse> getLowStockItems(int threshold) {
        return itemRepository.findAll().stream()
                .filter(i -> i.getStockQuantity() != null && i.getStockQuantity() <= threshold)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Decrements stock for each item in the order.
     * Called by OrderServiceImpl after a successful order save.
     * itemQuantities: Map of itemId -> quantity sold
     */
    @Override
    @Transactional
    public void decrementStock(Map<String, Integer> itemQuantities) {
        for (Map.Entry<String, Integer> entry : itemQuantities.entrySet()) {
            String itemId = entry.getKey();
            int qtySold = entry.getValue();
            itemRepository.findByItemId(itemId).ifPresent(item -> {
                int current = item.getStockQuantity() != null ? item.getStockQuantity() : 0;
                int updated = Math.max(0, current - qtySold);
                item.setStockQuantity(updated);
                itemRepository.save(item);
            });
        }
    }

    private InventoryResponse toResponse(ItemEntity item) {
        return InventoryResponse.builder()
                .id(item.getId())
                .itemId(item.getItemId())
                .name(item.getName())
                .price(item.getPrice())
                .description(item.getDescription())
                .categoryName(item.getCategory() != null ? item.getCategory().getName() : "")
                .imgUrl(item.getImgUrl())
                .stockQuantity(item.getStockQuantity() != null ? item.getStockQuantity() : 0)
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
