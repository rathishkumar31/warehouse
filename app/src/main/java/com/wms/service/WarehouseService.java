package com.wms.service;

import com.wms.dto.request.WarehouseRequest;
import com.wms.dto.response.WarehouseResponse;

import java.util.List;

public interface WarehouseService {
    List<WarehouseResponse> getAllWarehouses();
    WarehouseResponse getWarehouseById(Long id);
    WarehouseResponse createWarehouse(WarehouseRequest request);
    WarehouseResponse updateWarehouse(Long id, WarehouseRequest request);
    void deleteWarehouse(Long id);
}
