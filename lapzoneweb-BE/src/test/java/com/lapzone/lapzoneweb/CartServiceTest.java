package com.lapzone.lapzoneweb;

import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.Mock;
import org.mockito.InjectMocks;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;
import static org.mockito.ArgumentMatchers.any;
import java.util.List;
import java.util.Optional;
import com.lapzone.lapzoneweb.model.repository.CartItemRepository;
import com.lapzone.lapzoneweb.model.service.CartService;
import com.lapzone.lapzoneweb.model.entity.CartItem;
import com.lapzone.lapzoneweb.model.repository.ProductRepository;
import com.lapzone.lapzoneweb.model.entity.Product;

@ExtendWith(MockitoExtension.class)
public class CartServiceTest {

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private CartService cartService;

    // TH1: Thêm sản phẩm chưa có trong giỏ → tạo CartItem mới
    @Test
    public void testAddToCart() {
        Product mockProduct = new Product();
        mockProduct.setId(1L);
        mockProduct.setPrice(100000.0);

        when(productRepository.findById(1L)).thenReturn(Optional.of(mockProduct));
        when(cartItemRepository.findByUserIdAndProduct(1L, mockProduct)).thenReturn(null);

        cartService.addToCart(1L, 1L, 1);

        verify(cartItemRepository, times(1)).save(any(CartItem.class));
    }

    // TH2: Xóa sản phẩm khỏi giỏ → gọi deleteById
    @Test
    public void testRemoveFromCart() {
        cartService.removeFromCart(1L);
        verify(cartItemRepository, times(1)).deleteById(1L);
    }

    // TH3: Lấy danh sách giỏ hàng → gọi findByUserId
    @Test
    public void testGetCartItems() {
        cartService.getCartItems(1L);
        verify(cartItemRepository, times(1)).findByUserId(1L);
    }

    // TH4: Tính tổng giỏ hàng → gọi findByUserId để lấy danh sách
    @Test
    public void testGetCartTotal() {
        when(cartItemRepository.findByUserId(1L)).thenReturn(List.of());
        cartService.getCartTotal(1L);
        verify(cartItemRepository, times(1)).findByUserId(1L);
    }

    // TH5: Cập nhật số lượng hợp lệ → lưu lại CartItem
    @Test
    public void testUpdateQuantity() {
        CartItem mockCartItem = new CartItem();
        mockCartItem.setId(1L);
        mockCartItem.setQuantity(1);

        when(cartItemRepository.findById(1L)).thenReturn(Optional.of(mockCartItem));

        cartService.updateQuantity(1L, 2);

        verify(cartItemRepository, times(1)).save(mockCartItem);
    }

}



