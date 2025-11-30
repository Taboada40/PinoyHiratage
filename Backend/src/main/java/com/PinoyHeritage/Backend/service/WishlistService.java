package com.PinoyHeritage.Backend.service;

import com.PinoyHeritage.Backend.entity.Customer;
import com.PinoyHeritage.Backend.entity.Product;
import com.PinoyHeritage.Backend.entity.Wishlist;
import com.PinoyHeritage.Backend.repository.CustomerRepository;
import com.PinoyHeritage.Backend.repository.ProductRepository;
import com.PinoyHeritage.Backend.repository.WishlistRepository;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    // Add product to wishlist
    public Wishlist addToWishlist(Long customerId, Long productId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if already in wishlist
        if (wishlistRepository.existsByCustomerAndProduct(customer, product)) {
            throw new RuntimeException("Product already in wishlist");
        }

        Wishlist wishlist = new Wishlist(customer, product);
        return wishlistRepository.save(wishlist);
    }

    // Remove product from wishlist
    @Transactional
    public void removeFromWishlist(Long customerId, Long productId) {
        wishlistRepository.deleteByCustomerIdAndProductId(customerId, productId);
    }

    // Get customer's wishlist
    public List<Wishlist> getWishlistByCustomerId(Long customerId) {
        return wishlistRepository.findByCustomerId(customerId);
    }

    // Check if product is in wishlist
    public boolean isProductInWishlist(Long customerId, Long productId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return wishlistRepository.existsByCustomerAndProduct(customer, product);
    }

    // Get wishlist count for customer
    public long getWishlistCount(Long customerId) {
        return wishlistRepository.countByCustomerId(customerId);
    }

    // Clear entire wishlist
    public void clearWishlist(Long customerId) {
        wishlistRepository.deleteByCustomerId(customerId);
    }

    // Move from wishlist to cart (you'll need to integrate with your CartService)
    public void moveToCart(Long customerId, Long productId) {
        // First check if product exists in wishlist
        if (!isProductInWishlist(customerId, productId)) {
            throw new RuntimeException("Product not in wishlist");
        }
        
        // Remove from wishlist
        removeFromWishlist(customerId, productId);
    }
}