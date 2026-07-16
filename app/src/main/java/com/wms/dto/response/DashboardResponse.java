package com.wms.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private long totalProducts;
    private long totalCategories;
    private long totalSuppliers;
    private long totalWarehouses;
    private long lowStockCount;
    private long outOfStockCount;
}
