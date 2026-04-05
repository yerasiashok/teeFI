package com.teefi.service.impl;

import com.teefi.dto.request.AddToCartRequest;
import com.teefi.dto.response.CartItemResponse;
import com.teefi.dto.response.CartResponse;
import com.teefi.entity.Cart;
import com.teefi.entity.CartItem;
import com.teefi.entity.ProductVariant;
import com.teefi.entity.User;
import com.teefi.exception.BadRequestException;
import com.teefi.exception.ResourceNotFoundException;
import com.teefi.repository.CartRepository;
import com.teefi.repository.ProductVariantRepository;
import com.teefi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository variantRepository;

    public CartResponse getCart(String email) {
        Cart cart = getOrCreateCart(email);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse addItem(String email, AddToCartRequest request) {
        Cart cart = getOrCreateCart(email);
        ProductVariant variant = variantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Variant", request.getVariantId()));

        if (!variant.isAvailable()) {
            throw new BadRequestException("This variant is not available");
        }

        // If item already in cart, increment quantity
        cart.getItems().stream()
                .filter(i -> i.getVariant().getId().equals(request.getVariantId()))
                .findFirst()
                .ifPresentOrElse(
                        existing -> existing.setQuantity(existing.getQuantity() + request.getQuantity()),
                        () -> cart.getItems().add(CartItem.builder()
                                .cart(cart)
                                .variant(variant)
                                .quantity(request.getQuantity())
                                .build())
                );

        cartRepository.save(cart);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse updateItem(String email, UUID cartItemId, int quantity) {
        Cart cart = getOrCreateCart(email);
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item", cartItemId));

        if (quantity <= 0) {
            cart.getItems().remove(item);
        } else {
            item.setQuantity(quantity);
        }
        cartRepository.save(cart);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse removeItem(String email, UUID cartItemId) {
        Cart cart = getOrCreateCart(email);
        cart.getItems().removeIf(i -> i.getId().equals(cartItemId));
        cartRepository.save(cart);
        return toResponse(cart);
    }

    @Transactional
    public void clearCart(String email) {
        Cart cart = getOrCreateCart(email);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    private Cart getOrCreateCart(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Cart newCart = Cart.builder().user(user).build();
                    return cartRepository.save(newCart);
                });
    }

    private CartResponse toResponse(Cart cart) {
        var items = cart.getItems().stream().map(item -> {
            ProductVariant v = item.getVariant();
            BigDecimal lineTotal = v.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            return CartItemResponse.builder()
                    .cartItemId(item.getId())
                    .variantId(v.getId())
                    .productId(v.getProduct().getId())
                    .productName(v.getProduct().getName())
                    .movieTitle(v.getProduct().getMovieTitle())
                    .thumbnailUrl(v.getProduct().getThumbnailUrl())
                    .size(v.getSize())
                    .color(v.getColor())
                    .unitPrice(v.getPrice())
                    .quantity(item.getQuantity())
                    .lineTotal(lineTotal)
                    .build();
        }).toList();

        return CartResponse.builder()
                .cartId(cart.getId())
                .items(items)
                .total(cart.getTotal())
                .itemCount(cart.getItems().stream().mapToInt(CartItem::getQuantity).sum())
                .build();
    }
}
