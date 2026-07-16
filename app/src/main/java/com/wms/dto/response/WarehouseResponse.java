package com.wms.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarehouseResponse {
    private Long id;
    private String warehouseCode;
    private String warehouseName;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String phone;
    private String managerName;
    private String status;
    private LocalDateTime createdAt;
}
