package com.wms.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierResponse {
    private Long id;
    private String supplierName;
    private String companyName;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String state;
}
