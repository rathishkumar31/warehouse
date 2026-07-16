package com.wms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarehouseRequest {

    @NotBlank(message = "Warehouse code is required")
    private String warehouseCode;

    @NotBlank(message = "Warehouse name is required")
    private String warehouseName;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "Pincode is required")
    @Pattern(regexp = "^[0-9]{5,6}$", message = "Pincode must be a 5 or 6 digit number")
    private String pincode;

    @NotBlank(message = "Phone is required")
    private String phone;

    @NotBlank(message = "Manager name is required")
    private String managerName;

    @NotBlank(message = "Status is required")
    private String status; // ACTIVE or INACTIVE
}
