package in.khushi_Bill.billingsoftware.service;

import in.khushi_Bill.billingsoftware.io.CategoryRequest;
import in.khushi_Bill.billingsoftware.io.CategoryResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface CategoryService {

    CategoryResponse add(CategoryRequest request, MultipartFile file) throws IOException;

    List<CategoryResponse> read();

    void delete(String categoryId);
}
