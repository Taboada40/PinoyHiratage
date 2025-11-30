package com.PinoyHeritage.Backend.dto;

public class WishlistRequest {
    private Long productId;

    // Constructors
    public WishlistRequest() {}

    public WishlistRequest(Long productId) {
        this.productId = productId;
    }

    // Getters and Setters
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
}