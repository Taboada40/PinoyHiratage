package com.PinoyHeritage.Backend.repository;

import com.PinoyHeritage.Backend.entity.Customer;
import com.PinoyHeritage.Backend.entity.Product;
import com.PinoyHeritage.Backend.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    
    // Find all wishlist items for a customer
    List<Wishlist> findByCustomerId(Long customerId);
    
    // Find a specific wishlist item
    Optional<Wishlist> findByCustomerAndProduct(Customer customer, Product product);
    
    // Check if product is already in customer's wishlist
    boolean existsByCustomerAndProduct(Customer customer, Product product);
    
    // Remove a specific item from wishlist
    @Modifying
    @Query("DELETE FROM Wishlist w WHERE w.customer.id = :customerId AND w.product.id = :productId")
    void deleteByCustomerIdAndProductId(@Param("customerId") Long customerId, @Param("productId") Long productId);
    
    // Count wishlist items for a customer
    long countByCustomerId(Long customerId);
    
    // Clear entire wishlist for a customer
    @Modifying
    @Query("DELETE FROM Wishlist w WHERE w.customer.id = :customerId")
    void deleteByCustomerId(@Param("customerId") Long customerId);
}