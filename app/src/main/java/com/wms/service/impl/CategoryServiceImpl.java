package com.wms.service.impl;

import com.wms.dto.request.CategoryRequest;
import com.wms.dto.response.CategoryResponse;
import com.wms.entity.Category;
import com.wms.exception.ResourceNotFoundException;
import com.wms.mapper.AppMapper;
import com.wms.repository.CategoryRepository;
import com.wms.service.CategoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final AppMapper appMapper;

    // Constructor injection
    public CategoryServiceImpl(CategoryRepository categoryRepository, AppMapper appMapper) {
        this.categoryRepository = categoryRepository;
        this.appMapper = appMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(appMapper::toCategoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return appMapper.toCategoryResponse(category);
    }

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.findByCategoryName(request.getCategoryName()).isPresent()) {
            throw new IllegalArgumentException("Category name already exists");
        }
        Category category = appMapper.toCategoryEntity(request);
        Category savedCategory = categoryRepository.save(category);
        return appMapper.toCategoryResponse(savedCategory);
    }

    @Override
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        categoryRepository.findByCategoryName(request.getCategoryName())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new IllegalArgumentException("Category name already exists");
                    }
                });

        category.setCategoryName(request.getCategoryName());
        category.setDescription(request.getDescription());

        Category updatedCategory = categoryRepository.save(category);
        return appMapper.toCategoryResponse(updatedCategory);
    }

    @Override
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        categoryRepository.delete(category);
    }
}
