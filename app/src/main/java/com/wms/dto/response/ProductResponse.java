package com.wms.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {
    private Long id;
    private String productCode;
    private String productName;
    private String description;
    private BigDecimal unitPrice;
    private Integer quantity;
    private Integer minimumStock;
    private String unit;
    private String status;
    
    // Category Details
    private Long categoryId;
    private String categoryName;
    
    // Supplier Details
    private Long supplierId;
    private String supplierName;
    
    // Warehouse Details
    private Long warehouseId;
    private String warehouseName;
    
    private LocalDateTime createdAt;
}
