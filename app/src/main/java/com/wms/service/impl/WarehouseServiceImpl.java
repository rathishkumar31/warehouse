package com.wms.service.impl;

import com.wms.dto.request.WarehouseRequest;
import com.wms.dto.response.WarehouseResponse;
import com.wms.entity.Warehouse;
import com.wms.exception.ResourceNotFoundException;
import com.wms.mapper.AppMapper;
import com.wms.repository.WarehouseRepository;
import com.wms.service.WarehouseService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class WarehouseServiceImpl implements WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final AppMapper appMapper;

    public WarehouseServiceImpl(WarehouseRepository warehouseRepository, AppMapper appMapper) {
        this.warehouseRepository = warehouseRepository;
        this.appMapper = appMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarehouseResponse> getAllWarehouses() {
        return warehouseRepository.findAll().stream()
                .map(appMapper::toWarehouseResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public WarehouseResponse getWarehouseById(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + id));
        return appMapper.toWarehouseResponse(warehouse);
    }

    @Override
    public WarehouseResponse createWarehouse(WarehouseRequest request) {
        if (warehouseRepository.findByWarehouseCode(request.getWarehouseCode()).isPresent()) {
            throw new IllegalArgumentException("Warehouse code " + request.getWarehouseCode() + " already exists");
        }
        Warehouse warehouse = appMapper.toWarehouseEntity(request);
        Warehouse savedWarehouse = warehouseRepository.save(warehouse);
        return appMapper.toWarehouseResponse(savedWarehouse);
    }

    @Override
    public WarehouseResponse updateWarehouse(Long id, WarehouseRequest request) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + id));

        warehouseRepository.findByWarehouseCode(request.getWarehouseCode())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new IllegalArgumentException("Warehouse code " + request.getWarehouseCode() + " already exists");
                    }
                });

        warehouse.setWarehouseCode(request.getWarehouseCode());
        warehouse.setWarehouseName(request.getWarehouseName());
        warehouse.setAddress(request.getAddress());
        warehouse.setCity(request.getCity());
        warehouse.setState(request.getState());
        warehouse.setPincode(request.getPincode());
        warehouse.setPhone(request.getPhone());
        warehouse.setManagerName(request.getManagerName());
        warehouse.setStatus(request.getStatus());

        Warehouse updatedWarehouse = warehouseRepository.save(warehouse);
        return appMapper.toWarehouseResponse(updatedWarehouse);
    }

    @Override
    public void deleteWarehouse(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + id));
        warehouseRepository.delete(warehouse);
    }
}
