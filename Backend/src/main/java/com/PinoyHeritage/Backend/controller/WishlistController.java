package com.PinoyHeritage.Backend.controller;

import com.PinoyHeritage.Backend.dto.WishlistRequest;
import com.PinoyHeritage.Backend.dto.WishlistDTO;
import com.PinoyHeritage.Backend.entity.Wishlist;
import com.PinoyHeritage.Backend.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin(origins = "http://localhost:3000")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    // Add product to wishlist
    @PostMapping("/add")
    public ResponseEntity<?> addToWishlist(
            @RequestHeader("userId") Long customerId,
            @RequestBody WishlistRequest request) {
        try {
            Wishlist wishlist = wishlistService.addToWishlist(customerId, request.getProductId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Product added to wishlist");
            response.put("wishlistItemId", wishlist.getId());
            response.put("wishlistCount", wishlistService.getWishlistCount(customerId));
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Remove product from wishlist
    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<?> removeFromWishlist(
            @RequestHeader("userId") Long customerId,
            @PathVariable Long productId) {
        try {
            wishlistService.removeFromWishlist(customerId, productId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Product removed from wishlist");
            response.put("wishlistCount", wishlistService.getWishlistCount(customerId));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to remove from wishlist");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Get customer's wishlist
    @GetMapping
    public ResponseEntity<?> getWishlist(@RequestHeader("userId") Long customerId) {
        try {
            List<Wishlist> wishlistItems = wishlistService.getWishlistByCustomerId(customerId);
            
            // Convert to DTO
            List<WishlistDTO> wishlistDTOs = wishlistItems.stream().map(item -> {
                WishlistDTO dto = new WishlistDTO();
                dto.setId(item.getId());
                dto.setProductId(item.getProduct().getId());
                dto.setProductName(item.getProduct().getName());
                dto.setProductPrice(item.getProduct().getPrice());
                dto.setProductImage(item.getProduct().getImageUrl());
                dto.setAddedDate(item.getAddedDate());
                return dto;
            }).collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("wishlistItems", wishlistDTOs);
            response.put("totalItems", wishlistDTOs.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch wishlist");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Check if product is in wishlist
    @GetMapping("/check/{productId}")
    public ResponseEntity<?> checkInWishlist(
            @RequestHeader("userId") Long customerId,
            @PathVariable Long productId) {
        try {
            boolean isInWishlist = wishlistService.isProductInWishlist(customerId, productId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("isInWishlist", isInWishlist);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to check wishlist status");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Get wishlist count
    @GetMapping("/count")
    public ResponseEntity<?> getWishlistCount(@RequestHeader("userId") Long customerId) {
        try {
            long count = wishlistService.getWishlistCount(customerId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("count", count);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get wishlist count");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Clear entire wishlist
    @DeleteMapping("/clear")
    public ResponseEntity<?> clearWishlist(@RequestHeader("userId") Long customerId) {
        try {
            wishlistService.clearWishlist(customerId);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Wishlist cleared");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to clear wishlist");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}