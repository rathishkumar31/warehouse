package com.wms.service;

import com.wms.dto.request.ProductRequest;
import com.wms.dto.response.ProductResponse;

import java.util.List;

public interface ProductService {
    List<ProductResponse> getAllProducts();
    ProductResponse getProductById(Long id);
    ProductResponse createProduct(ProductRequest request);
    ProductResponse updateProduct(Long id, ProductRequest request);
    void deleteProduct(Long id);
    
    // Additional endpoints
    List<ProductResponse> getLowStockProducts();
    List<ProductResponse> getOutOfStockProducts();
    List<ProductResponse> searchProducts(String keyword);
}
