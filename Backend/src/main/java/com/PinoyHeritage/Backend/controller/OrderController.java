package com.PinoyHeritage.Backend.controller;

import com.PinoyHeritage.Backend.entity.*;
import com.PinoyHeritage.Backend.repository.*;
import com.PinoyHeritage.Backend.service.CartService;
import com.PinoyHeritage.Backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private PaymentRepository paymentRepository;

    // --------------------------
    // CUSTOMER ORDER HISTORY API
    // --------------------------
    @GetMapping("/customer/{customerId}")
    public List<OrderHistoryItem> getOrdersForCustomer(@PathVariable Long customerId) {
        List<Order> orders = orderRepository.findByCustomerId(customerId);
        List<OrderHistoryItem> result = new ArrayList<>();

        for (Order order : orders) {
            OrderHistoryItem item = new OrderHistoryItem();
            item.setOrderId(order.getId());
            item.setTotalAmount(order.getTotalAmount());
            item.setStatus(order.getStatus());

            List<ProductLine> productLines = new ArrayList<>();
            if (order.getProducts() != null) {
                for (ProductOrder po : order.getProducts()) {
                    Product product = po.getProduct();

                    ProductLine line = new ProductLine();
                    line.setProductId(product != null ? product.getId() : null);
                    line.setProductName(product != null ? product.getName() : "Unknown");
                    line.setQuantity(po.getQuantity());

                    Double unitPrice = po.getUnitPrice() != null
                            ? po.getUnitPrice()
                            : (product != null ? product.getPrice() : 0.0);
                    line.setUnitPrice(unitPrice);

                    String img = (po.getProductImage() != null && !po.getProductImage().isEmpty())
                            ? po.getProductImage()
                            : (product != null ? product.getImageUrl() : null);
                    line.setProductImage(img);

                    productLines.add(line);
                }
            }
            item.setProducts(productLines);
            result.add(item);
        }

        return result;
    }

    // -------------------------------------------
    // CREATE ORDER FROM CART
    // -------------------------------------------
    @PostMapping("/customer/{customerId}/from-cart")
    public Order createOrderFromCart(
            @PathVariable Long customerId,
            @RequestBody(required = false) PaymentRequest paymentRequest) {

        List<CartItem> cartItems = cartService.getCartItems(customerId);
        if (cartItems == null || cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty; cannot create order.");
        }

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found."));

        Order order = new Order();
        order.setCustomer(customer);
        order.setStatus("Pending");

        List<ProductOrder> poList = new ArrayList<>();
        double total = 0.0;

        for (CartItem ci : cartItems) {
            ProductOrder po = new ProductOrder();
            po.setOrder(order);

            Integer qty = ci.getQuantity() != null ? ci.getQuantity() : 1;
            po.setQuantity(qty);

            Product product = null;
            if (ci.getProductName() != null) {
                product = productRepository.findByName(ci.getProductName()).orElse(null);
            }
            po.setProduct(product);

            Double unitPriceSnapshot = ci.getUnitPrice() != null ? ci.getUnitPrice()
                    : (product != null ? product.getPrice() : 0);
            po.setUnitPrice(unitPriceSnapshot);

            String imgSnapshot = ci.getProductImage() != null ? ci.getProductImage()
                    : (product != null ? product.getImageUrl() : null);
            po.setProductImage(imgSnapshot);

            if (product != null && product.getStock() != null) {
                int newStock = Math.max(0, product.getStock() - qty);
                product.setStock(newStock);
                productRepository.save(product);
            }

            poList.add(po);
            double lineAmount = (ci.getAmount() != null && ci.getAmount() > 0)
                    ? ci.getAmount()
                    : unitPriceSnapshot * qty;
            total += lineAmount;
        }

        order.setProducts(poList);
        order.setTotalAmount(total);

        Order saved = orderRepository.save(order);

        Payment payment = new Payment();
        payment.setOrder(saved);
        payment.setMethod(paymentRequest != null ? paymentRequest.getMethod() : "Unknown");
        payment.setStatus("Completed");
        paymentRepository.save(payment);

        cartService.clearCart(customerId);

        notificationService.createNotification(
                customerId,
                saved.getId(),
                "Your order #" + saved.getId() + " has been placed."
        );

        return saved;
    }

    // ---------------------------
    // ADMIN ORDER ENDPOINT
    // ---------------------------
    @GetMapping("/admin")
    public List<AdminOrderItem> getAllOrdersForAdmin() {
        List<Order> orders = orderRepository.findAll();
        List<AdminOrderItem> result = new ArrayList<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MM/dd/yy HH:mm");

        for (Order order : orders) {
            AdminOrderItem item = new AdminOrderItem();
            item.setId(order.getId());
            item.setStatus(order.getStatus());
            item.setTotalAmount(order.getTotalAmount());
            item.setCreatedAt(order.getCreatedAt() != null ? order.getCreatedAt().format(fmt) : null);

            if (order.getCustomer() != null) {
                String name = (order.getCustomer().getFirstName() == null ? "" : order.getCustomer().getFirstName())
                        + " " + (order.getCustomer().getLastName() == null ? "" : order.getCustomer().getLastName());
                item.setCustomerName(name.trim());
            }

            int count = 0;
            if (order.getProducts() != null) {
                for (ProductOrder po : order.getProducts()) {
                    if (po.getQuantity() != null) count += po.getQuantity();
                }
            }
            item.setItemsCount(count);

            result.add(item);
        }

        return result;
    }

    @PutMapping("/{orderId}/status")
    public void updateStatus(@PathVariable Long orderId, @RequestBody StatusUpdateRequest req) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found."));
        order.setStatus(req.getStatus());
        orderRepository.save(order);

        if (order.getCustomer() != null) {
            notificationService.createNotification(
                    order.getCustomer().getId(),
                    order.getId(),
                    "Your order #" + order.getId() + " is now " + req.getStatus()
            );
        }
    }

    // --------------------------
    // DTOs
    // --------------------------
    public static class PaymentRequest {
        private String method;
        public String getMethod() { return method; }
        public void setMethod(String method) { this.method = method; }
    }

    public static class OrderHistoryItem {
        private Long orderId;
        private Double totalAmount;
        private String status;
        private List<ProductLine> products;

        public Long getOrderId() { return orderId; }
        public void setOrderId(Long orderId) { this.orderId = orderId; }

        public Double getTotalAmount() { return totalAmount; }
        public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public List<ProductLine> getProducts() { return products; }
        public void setProducts(List<ProductLine> products) { this.products = products; }
    }

    public static class ProductLine {
        private Long productId;
        private String productName;
        private Integer quantity;
        private String productImage;
        private Double unitPrice;

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public String getProductImage() { return productImage; }
        public void setProductImage(String productImage) { this.productImage = productImage; }

        public Double getUnitPrice() { return unitPrice; }
        public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }
    }

    public static class AdminOrderItem {
        private Long id;
        private String customerName;
        private Double totalAmount;
        private String status;
        private String createdAt;
        private Integer itemsCount;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }

        public Double getTotalAmount() { return totalAmount; }
        public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

        public Integer getItemsCount() { return itemsCount; }
        public void setItemsCount(Integer itemsCount) { this.itemsCount = itemsCount; }
    }

    public static class StatusUpdateRequest {
        private String status;
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}
