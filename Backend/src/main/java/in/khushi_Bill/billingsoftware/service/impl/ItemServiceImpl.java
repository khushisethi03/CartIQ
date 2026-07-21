package in.khushi_Bill.billingsoftware.service.impl;

import in.khushi_Bill.billingsoftware.entity.CategoryEntity;
import in.khushi_Bill.billingsoftware.entity.ItemEntity;
import in.khushi_Bill.billingsoftware.io.ItemRequest;
import in.khushi_Bill.billingsoftware.io.ItemResponse;
import in.khushi_Bill.billingsoftware.repository.CategoryRepository;
import in.khushi_Bill.billingsoftware.repository.ItemRepository;
import in.khushi_Bill.billingsoftware.service.FileUploadService;
import in.khushi_Bill.billingsoftware.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItemServiceImpl implements ItemService {

    private final FileUploadService fileUploadService;
    private final CategoryRepository categoryRepository;
    private final ItemRepository itemRepository;

    @Override
    public ItemResponse add(ItemRequest request, MultipartFile file) {

        // Upload image to MinIO
        String imgUrl = fileUploadService.uploadFile(file);

        ItemEntity newItem = convertToEntity(request);
        CategoryEntity existingCategory = categoryRepository.findByCategoryId(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found: " + request.getCategoryId()));
        newItem.setCategory(existingCategory);
        newItem.setImgUrl(imgUrl);
        newItem = itemRepository.save(newItem);

        return convertToResponse(newItem);
    }

    public ItemResponse convertToResponse(ItemEntity item) {
        return ItemResponse.builder()
                .itemId(item.getItemId())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .imgUrl(item.getImgUrl())
                .categoryName(item.getCategory().getName())
                .categoryId(item.getCategory().getCategoryId())
                .stockQuantity(item.getStockQuantity() != null ? item.getStockQuantity() : 0)
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }

    private ItemEntity convertToEntity(ItemRequest request) {
        return ItemEntity.builder()
                .itemId(UUID.randomUUID().toString())
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stockQuantity(0)
                .build();
    }

    @Override
    public List<ItemResponse> fetchItems() {
        return itemRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteItem(String itemId) {
        ItemEntity existingItem = itemRepository.findByItemId(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found: " + itemId));

        try {
            fileUploadService.deleteFile(existingItem.getImgUrl());
        } catch (Exception e) {
            System.err.println("Warning: could not delete item image from MinIO: " + e.getMessage());
        }

        itemRepository.delete(existingItem);
    }
}
