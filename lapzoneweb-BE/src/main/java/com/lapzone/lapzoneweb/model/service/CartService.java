package com.lapzone.lapzoneweb.model.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.lapzone.lapzoneweb.model.entity.CartItem;
import com.lapzone.lapzoneweb.model.entity.Product;
import com.lapzone.lapzoneweb.model.repository.CartItemRepository;
import com.lapzone.lapzoneweb.model.repository.ProductRepository;
import java.util.List;

@Service
public class CartService {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<CartItem> getCartItems(Long userId) {
        return cartItemRepository.findByUserId(userId);
    }

    public void addToCart(Long userId, Long productId, Integer quantity) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) return;

        CartItem existingItem = cartItemRepository.findByUserIdAndProduct(userId, product);

        if (existingItem != null) {

            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = new CartItem();
            newItem.setUserId(userId);
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            cartItemRepository.save(newItem);
        }
    }
    public void updateQuantity(Long cartItemId, Integer quantity) {
        CartItem item = cartItemRepository.findById(cartItemId).orElse(null);
        if (item != null) {
            if (quantity <= 0) {
                cartItemRepository.delete(item); 
            } else {
                item.setQuantity(quantity);
                cartItemRepository.save(item);
            }
        }
    }
    public void removeFromCart(Long cartItemId) {
        cartItemRepository.deleteById(cartItemId);
    }

    public Double getCartTotal(Long userId) {
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        double total = 0.0;
        for (CartItem item : cartItems) {
            total += item.getProduct().getPrice() * item.getQuantity();
        }
        return total;
    }
            // Lấy danh sách các CartItem dựa trên danh sách ID được truyền vào
        public List<CartItem> getSelectedCartItems(List<Long> cartItemIds) {
            return cartItemRepository.findAllById(cartItemIds);
        }

        // Tính tổng tiền chỉ cho những món được chọn
        public Double getSelectedCartTotal(List<Long> cartItemIds) {
            List<CartItem> selectedItems = cartItemRepository.findAllById(cartItemIds);
            double total = 0.0;
            for (CartItem item : selectedItems) {
                total += item.getProduct().getPrice() * item.getQuantity();
            }
            return total;
        }
}