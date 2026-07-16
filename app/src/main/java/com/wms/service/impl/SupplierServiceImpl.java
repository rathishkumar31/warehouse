package com.wms.service.impl;

import com.wms.dto.request.SupplierRequest;
import com.wms.dto.response.SupplierResponse;
import com.wms.entity.Supplier;
import com.wms.exception.ResourceNotFoundException;
import com.wms.mapper.AppMapper;
import com.wms.repository.SupplierRepository;
import com.wms.service.SupplierService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final AppMapper appMapper;

    public SupplierServiceImpl(SupplierRepository supplierRepository, AppMapper appMapper) {
        this.supplierRepository = supplierRepository;
        this.appMapper = appMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierResponse> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(appMapper::toSupplierResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierResponse getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        return appMapper.toSupplierResponse(supplier);
    }

    @Override
    public SupplierResponse createSupplier(SupplierRequest request) {
        if (supplierRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Supplier with email " + request.getEmail() + " already exists");
        }
        Supplier supplier = appMapper.toSupplierEntity(request);
        Supplier savedSupplier = supplierRepository.save(supplier);
        return appMapper.toSupplierResponse(savedSupplier);
    }

    @Override
    public SupplierResponse updateSupplier(Long id, SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));

        supplierRepository.findByEmail(request.getEmail())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new IllegalArgumentException("Supplier with email " + request.getEmail() + " already exists");
                    }
                });

        supplier.setSupplierName(request.getSupplierName());
        supplier.setCompanyName(request.getCompanyName());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        supplier.setCity(request.getCity());
        supplier.setState(request.getState());

        Supplier updatedSupplier = supplierRepository.save(supplier);
        return appMapper.toSupplierResponse(updatedSupplier);
    }

    @Override
    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        supplierRepository.delete(supplier);
    }
}
