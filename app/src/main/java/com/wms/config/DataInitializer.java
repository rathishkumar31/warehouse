package com.wms.config;

import com.wms.entity.*;
import com.wms.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;

    public DataInitializer(CategoryRepository categoryRepository,
                           SupplierRepository supplierRepository,
                           WarehouseRepository warehouseRepository,
                           ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.supplierRepository = supplierRepository;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Only initialize if there are no categories
        if (categoryRepository.count() > 0) {
            return;
        }

        System.out.println("--- Seeding Warehouse Management System database with mock data ---");

        // 1. Seed Categories
        Category electronics = Category.builder().categoryName("Electronics").description("Devices, chargers, cables, and accessories").build();
        Category apparel = Category.builder().categoryName("Apparel").description("Clothing, textiles, safety uniforms, and boots").build();
        Category logistics = Category.builder().categoryName("Logistics Gear").description("Packaging boxes, tape, pallets, and shrink wraps").build();
        Category medical = Category.builder().categoryName("Medical Supply").description("First aid kits, masks, sanitizers, and gloves").build();
        categoryRepository.saveAll(Arrays.asList(electronics, apparel, logistics, medical));

        // 2. Seed Suppliers
        Supplier techDist = Supplier.builder()
                .supplierName("Jane Doe")
                .companyName("Matrix Tech Distributors")
                .email("jane@matrixtech.com")
                .phone("+91 9876543210")
                .address("12-A Industrial Sector, Sector 63")
                .city("Noida")
                .state("Uttar Pradesh")
                .build();
        Supplier apparelCo = Supplier.builder()
                .supplierName("Vijay Kumar")
                .companyName("StyleThread Apparel")
                .email("vijay@stylethread.in")
                .phone("+91 8765432109")
                .address("44 Textile Park, HSR Layout")
                .city("Bangalore")
                .state("Karnataka")
                .build();
        Supplier logiCorp = Supplier.builder()
                .supplierName("Robert Miller")
                .companyName("Apex Packaging Materials")
                .email("contact@apexpack.com")
                .phone("+91 7654321098")
                .address("88 Logistics Lane, Taloja")
                .city("Navi Mumbai")
                .state("Maharashtra")
                .build();
        supplierRepository.saveAll(Arrays.asList(techDist, apparelCo, logiCorp));

        // 3. Seed Warehouses
        Warehouse whMumbai = Warehouse.builder()
                .warehouseCode("WH-MUM-01")
                .warehouseName("Mumbai Western Hub")
                .address("Plot 404, MIDC Industrial Area, Andheri East")
                .city("Mumbai")
                .state("Maharashtra")
                .pincode("400069")
                .phone("+91 22 28475960")
                .managerName("Anil Kadam")
                .status("ACTIVE")
                .build();
        Warehouse whBangalore = Warehouse.builder()
                .warehouseCode("WH-BLR-02")
                .warehouseName("Bangalore Southern Depot")
                .address("Building B-3, Electronics City Phase I")
                .city("Bangalore")
                .state("Karnataka")
                .pincode("560100")
                .phone("+91 80 49586730")
                .managerName("Ramesh Naidu")
                .status("ACTIVE")
                .build();
        Warehouse whDelhi = Warehouse.builder()
                .warehouseCode("WH-DEL-03")
                .warehouseName("Delhi Northern Depot")
                .address("Khasra No. 12, Okhla Industrial Area")
                .city("New Delhi")
                .state("Delhi")
                .pincode("110020")
                .phone("+91 11 48576920")
                .managerName("Sanjay Sharma")
                .status("INACTIVE")
                .build();
        warehouseRepository.saveAll(Arrays.asList(whMumbai, whBangalore, whDelhi));

        // 4. Seed Products
        List<Product> products = Arrays.asList(
                // Active Products
                Product.builder()
                        .productCode("PRD-ELE-001")
                        .productName("USB-C Fast Charger 65W")
                        .description("GaN technology fast charger for laptops and phones")
                        .unitPrice(new BigDecimal("1899.00"))
                        .quantity(120)
                        .minimumStock(30)
                        .unit("PCS")
                        .status("ACTIVE")
                        .category(electronics)
                        .supplier(techDist)
                        .warehouse(whMumbai)
                        .build(),
                Product.builder()
                        .productCode("PRD-ELE-002")
                        .productName("HDMI Cable 2.1 (3 meters)")
                        .description("High-speed gold-plated HDMI cable supporting 8K")
                        .unitPrice(new BigDecimal("499.00"))
                        .quantity(250)
                        .minimumStock(50)
                        .unit("PCS")
                        .status("ACTIVE")
                        .category(electronics)
                        .supplier(techDist)
                        .warehouse(whBangalore)
                        .build(),
                
                // Low Stock Products
                Product.builder()
                        .productCode("PRD-APP-001")
                        .productName("Heavy-Duty Safety Boots (Size 10)")
                        .description("Steel-toe safety shoes with slip-resistant soles")
                        .unitPrice(new BigDecimal("2499.00"))
                        .quantity(12)
                        .minimumStock(25)
                        .unit("BOX")
                        .status("LOW_STOCK")
                        .category(apparel)
                        .supplier(apparelCo)
                        .warehouse(whMumbai)
                        .build(),
                Product.builder()
                        .productCode("PRD-LOG-001")
                        .productName("Bubble Wrap Roll 100m")
                        .description("Standard 10mm bubble packing roll for fragile goods")
                        .unitPrice(new BigDecimal("799.00"))
                        .quantity(8)
                        .minimumStock(10)
                        .unit("PCS")
                        .status("LOW_STOCK")
                        .category(logistics)
                        .supplier(logiCorp)
                        .warehouse(whBangalore)
                        .build(),
                        
                // Out of Stock Products
                Product.builder()
                        .productCode("PRD-MED-001")
                        .productName("N95 Protective Face Masks (Pack of 50)")
                        .description("High-filtration safety respirators")
                        .unitPrice(new BigDecimal("999.00"))
                        .quantity(0)
                        .minimumStock(20)
                        .unit("BOX")
                        .status("OUT_OF_STOCK")
                        .category(medical)
                        .supplier(apparelCo) // Shared relation
                        .warehouse(whMumbai)
                        .build(),
                Product.builder()
                        .productCode("PRD-ELE-003")
                        .productName("Wireless Ergonomic Mouse")
                        .description("2.4GHz rechargeable vertical mouse with adjustable DPI")
                        .unitPrice(new BigDecimal("1299.00"))
                        .quantity(0)
                        .minimumStock(15)
                        .unit("PCS")
                        .status("OUT_OF_STOCK")
                        .category(electronics)
                        .supplier(techDist)
                        .warehouse(whBangalore)
                        .build()
        );

        productRepository.saveAll(products);
        System.out.println("--- Seeding complete. Loaded " + products.size() + " products ---");
    }
}
