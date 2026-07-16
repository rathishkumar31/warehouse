package com.wms.mapper;

import com.wms.dto.request.*;
import com.wms.dto.response.*;
import com.wms.entity.*;
import org.springframework.stereotype.Component;

@Component
public class AppMapper {

    // Category mappings
    public Category toCategoryEntity(CategoryRequest request) {
        if (request == null) return null;
        return Category.builder()
                .categoryName(request.getCategoryName())
                .description(request.getDescription())
                .build();
    }

    public CategoryResponse toCategoryResponse(Category entity) {
        if (entity == null) return null;
        return CategoryResponse.builder()
                .id(entity.getId())
                .categoryName(entity.getCategoryName())
                .description(entity.getDescription())
                .build();
    }

    // Supplier mappings
    public Supplier toSupplierEntity(SupplierRequest request) {
        if (request == null) return null;
        return Supplier.builder()
                .supplierName(request.getSupplierName())
                .companyName(request.getCompanyName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .build();
    }

    public SupplierResponse toSupplierResponse(Supplier entity) {
        if (entity == null) return null;
        return SupplierResponse.builder()
                .id(entity.getId())
                .supplierName(entity.getSupplierName())
                .companyName(entity.getCompanyName())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .address(entity.getAddress())
                .city(entity.getCity())
                .state(entity.getState())
                .build();
    }

    // Warehouse mappings
    public Warehouse toWarehouseEntity(WarehouseRequest request) {
        if (request == null) return null;
        return Warehouse.builder()
                .warehouseCode(request.getWarehouseCode())
                .warehouseName(request.getWarehouseName())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .phone(request.getPhone())
                .managerName(request.getManagerName())
                .status(request.getStatus())
                .build();
    }

    public WarehouseResponse toWarehouseResponse(Warehouse entity) {
        if (entity == null) return null;
        return WarehouseResponse.builder()
                .id(entity.getId())
                .warehouseCode(entity.getWarehouseCode())
                .warehouseName(entity.getWarehouseName())
                .address(entity.getAddress())
                .city(entity.getCity())
                .state(entity.getState())
                .pincode(entity.getPincode())
                .phone(entity.getPhone())
                .managerName(entity.getManagerName())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    // Product mappings
    public Product toProductEntity(ProductRequest request, Category category, Supplier supplier, Warehouse warehouse) {
        if (request == null) return null;
        return Product.builder()
                .productCode(request.getProductCode())
                .productName(request.getProductName())
                .description(request.getDescription())
                .unitPrice(request.getUnitPrice())
                .quantity(request.getQuantity())
                .minimumStock(request.getMinimumStock())
                .unit(request.getUnit())
                .status(request.getStatus())
                .category(category)
                .supplier(supplier)
                .warehouse(warehouse)
                .build();
    }

    public ProductResponse toProductResponse(Product entity) {
        if (entity == null) return null;
        return ProductResponse.builder()
                .id(entity.getId())
                .productCode(entity.getProductCode())
                .productName(entity.getProductName())
                .description(entity.getDescription())
                .unitPrice(entity.getUnitPrice())
                .quantity(entity.getQuantity())
                .minimumStock(entity.getMinimumStock())
                .unit(entity.getUnit())
                .status(entity.getStatus())
                .categoryId(entity.getCategory() != null ? entity.getCategory().getId() : null)
                .categoryName(entity.getCategory() != null ? entity.getCategory().getCategoryName() : null)
                .supplierId(entity.getSupplier() != null ? entity.getSupplier().getId() : null)
                .supplierName(entity.getSupplier() != null ? entity.getSupplier().getSupplierName() : null)
                .warehouseId(entity.getWarehouse() != null ? entity.getWarehouse().getId() : null)
                .warehouseName(entity.getWarehouse() != null ? entity.getWarehouse().getWarehouseName() : null)
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
