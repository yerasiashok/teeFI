package com.teefi.dto.response;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
@Data @Builder
public class CartResponse {
    private UUID cartId;
    private List<CartItemResponse> items;
    private BigDecimal total;
    private int itemCount;
}
