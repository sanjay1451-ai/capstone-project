package com.secondhand.electronics.service;

import com.secondhand.electronics.dto.CategoryDTO;
import com.secondhand.electronics.entity.Category;
import com.secondhand.electronics.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ConcurrentHashMap<Long, CategoryDTO> fallbackCache = new ConcurrentHashMap<>();
    private final AtomicLong fallbackIdGen = new AtomicLong(100);

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
        initFallbackData();
    }

    private void initFallbackData() {
        List<CategoryDTO> defaults = Arrays.asList(
            new CategoryDTO(1L, "Smartphones", "Pre-owned Apple iPhones, Samsung Galaxy, Google Pixel, and OnePlus mobile devices."),
            new CategoryDTO(2L, "Laptops & Computers", "Refurbished MacBooks, Dell XPS, ThinkPads, gaming laptops, and custom PC builds."),
            new CategoryDTO(3L, "Audio & Sound", "Noise-canceling headphones, Apple AirPods, Sony WH-1000XM series, and Bluetooth speakers."),
            new CategoryDTO(4L, "Gaming & Consoles", "PlayStation 5, Xbox Series X, Nintendo Switch OLED, and gaming accessories."),
            new CategoryDTO(5L, "Tablets & Readers", "Apple iPad Pro, iPad Air, Samsung Galaxy Tab, and Kindle e-readers."),
            new CategoryDTO(6L, "Wearables & Smartwatches", "Apple Watch Ultra, Garmin sports watches, and smart fitness bands."),
            new CategoryDTO(7L, "Cameras & Photography", "DSLRs, Sony Alpha mirrorless cameras, lenses, and creator streaming gear.")
        );
        for (CategoryDTO cat : defaults) {
            fallbackCache.put(cat.getId(), cat);
        }
    }

    public List<CategoryDTO> getAllCategories() {
        try {
            List<Category> dbList = categoryRepository.findAll();
            if (!dbList.isEmpty()) {
                return dbList.stream().map(this::mapToDTO).toList();
            }
        } catch (Exception ignored) {
            // DB temporarily unreachable; return fallback cache
        }
        return new ArrayList<>(fallbackCache.values());
    }

    public Optional<CategoryDTO> getCategoryById(Long id) {
        try {
            Optional<Category> fromDb = categoryRepository.findById(id);
            if (fromDb.isPresent()) {
                return fromDb.map(this::mapToDTO);
            }
        } catch (Exception ignored) {
            // DB temporarily unreachable
        }
        return Optional.ofNullable(fallbackCache.get(id));
    }

    public CategoryDTO createCategory(CategoryDTO dto) {
        try {
            if (categoryRepository.existsByNameIgnoreCase(dto.getName())) {
                throw new IllegalArgumentException("Category with name '" + dto.getName() + "' already exists");
            }
            Category category = new Category();
            category.setName(dto.getName());
            category.setDescription(dto.getDescription());
            Category saved = categoryRepository.save(category);
            return mapToDTO(saved);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception ignored) {
            Long newId = fallbackIdGen.incrementAndGet();
            CategoryDTO cached = new CategoryDTO(newId, dto.getName(), dto.getDescription());
            fallbackCache.put(newId, cached);
            return cached;
        }
    }

    private CategoryDTO mapToDTO(Category category) {
        return new CategoryDTO(
                category.getId(),
                category.getName(),
                category.getDescription()
        );
    }
}
