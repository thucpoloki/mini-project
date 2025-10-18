// Không sửa đổi gì trong file này, vì nó đã ổn định
// Mọi thay đổi sẽ được thực hiện trong cart.js
// File này chỉ để tham khảo và lưu trữ các phiên bản cũ
// ===== SHOPPING CART MANAGEMENT =====
class ShoppingCart {
    constructor() {
        this.items = this.loadFromStorage();
        this.isOpen = false;
        this.init();
    }

    init() {
        this.createCartModal();
        this.bindEvents();
        this.updateCartIcon();
    }

    // Get cart key based on logged-in user
    getCartKey() {
        try {
            const loggedInUser = localStorage.getItem('loggedInUser');
            if (loggedInUser) {
                const user = JSON.parse(loggedInUser);
                return `shopping_cart_${user.username || user.email}`;
            }
        } catch (error) {
            console.error('Error getting user info:', error);
        }
        return 'shopping_cart_guest'; // Fallback for guest users
    }

    // Load cart from localStorage
    loadFromStorage() {
        try {
            const cartKey = this.getCartKey();
            const stored = localStorage.getItem(cartKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading cart from storage:', error);
            return [];
        }
    }

    // Save cart to localStorage
    saveToStorage() {
        try {
            const cartKey = this.getCartKey();
            localStorage.setItem(cartKey, JSON.stringify(this.items));
        } catch (error) {
            console.error('Error saving cart to storage:', error);
        }
    }

    // Add item to cart
    addItem(book) {
        const existingItem = this.items.find(item => item.bookId === book.bookId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                bookId: book.bookId,
                title: book.title,
                price: this.parsePrice(book.price),
                originalPrice: book.price,
                image: book.image,
                quantity: 1,
                discount: book.discount || 0
            });
        }

        this.saveToStorage();
        this.updateCartUI();
        this.showNotification(`Đã thêm "${book.title}" vào giỏ hàng`);
    }

    // Remove item from cart
    removeItem(bookId) {
        console.log('🗑️ Removing item:', bookId);
        console.log('📦 Current items:', this.items.map(i => i.bookId));
        
        const initialLength = this.items.length;
        this.items = this.items.filter(item => item.bookId !== bookId);
        
        if (this.items.length < initialLength) {
            console.log('✅ Item removed successfully');
            this.saveToStorage();
            this.updateCartUI();
        } else {
            console.error('❌ Failed to remove item - bookId not found:', bookId);
        }
    }

    // Update item quantity
    updateQuantity(bookId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeItem(bookId);
            return;
        }

        const item = this.items.find(item => item.bookId === bookId);
        if (item) {
            item.quantity = newQuantity;
            this.saveToStorage();
            this.updateCartUI();
        }
    }

    // Parse price string to number
    parsePrice(priceString) {
        return parseInt(priceString.replace(/[^\d]/g, ''));
    }

    // Format price for display
    formatPrice(price) {
        return price.toLocaleString('vi-VN') + ' đ';
    }

    // Calculate total
    getTotal() {
        return this.items.reduce((total, item) => {
            const finalPrice = item.discount > 0 
                ? Math.round(item.price * (1 - item.discount / 100))
                : item.price;
            return total + (finalPrice * item.quantity);
        }, 0);
    }

    // Get total items count - Count UNIQUE items only
    getTotalItems() {
        return this.items.length; // Number of unique items, not total quantity
    }

    // Get total quantity (for display in cart body)
    getTotalQuantity() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    // Create cart modal HTML
    createCartModal() {
        const modalHTML = `
            <div id="cart-modal" class="cart-modal">
                <div class="cart-overlay" data-cart-action="close"></div>
                <div class="cart-sidebar">
                    <div class="cart-header">
                        <h3><i class="fas fa-shopping-cart"></i> Giỏ hàng (<span id="cart-count">0</span>)</h3>
                        <button class="cart-close" type="button" data-cart-action="close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="cart-body">
                        <div id="cart-items"></div>
                    </div>
                    <div class="cart-footer">
                        <div class="cart-total">
                            <div class="total-row">
                                <span>Tổng cộng (ước tính):</span>
                                <span id="cart-total" class="total-price">0 đ</span>
                            </div>
                        </div>
                        <button class="checkout-btn" type="button" data-cart-action="checkout">
                            <i class="fas fa-credit-card"></i> Xem giỏ hàng
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Insert modal into body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Bind events
    bindEvents() {
        // Global click handler for all cart-related buttons
        document.addEventListener('click', (e) => {
            const actionTrigger = e.target.closest('[data-cart-action]');
            if (actionTrigger) {
                const action = actionTrigger.dataset.cartAction;
                if (action === 'close') {
                    e.preventDefault();
                    this.closeCart();
                    return;
                }
                if (action === 'checkout') {
                    e.preventDefault();
                    this.checkout();
                    return;
                }
            }

            // Handle "MUA" buttons
            if (e.target.classList.contains('buy-btn') || e.target.closest('.buy-btn')) {
                e.preventDefault();
                this.handleBuyClick(e.target);
            }

            // Handle "Add to Cart" buttons
            const addToCartBtn = e.target.classList.contains('add-to-cart-btn') 
                ? e.target 
                : e.target.closest('.add-to-cart-btn'); // ✅ Fixed: Added dot
            
            if (addToCartBtn) {
                e.preventDefault();
                console.log('🛒 Add to cart button clicked');
                
                const bookItem = addToCartBtn.closest('.book-item');
                if (bookItem) {
                    console.log('📦 Book item found:', bookItem.dataset.bookId);
                    this.handleAddToCartClick(addToCartBtn, bookItem);
                } else {
                    console.error('❌ Book item not found for add-to-cart button');
                }
            }
            
            // Handle quantity controls (+ / -)
            const qtyBtn = e.target.closest('.qty-btn');
            if (qtyBtn) {
                e.preventDefault();
                const action = qtyBtn.dataset.action;
                const bookId = qtyBtn.dataset.bookId;
                const item = this.items.find(i => i.bookId === bookId);
                
                if (item) {
                    if (action === 'increase') {
                        this.updateQuantity(bookId, item.quantity + 1);
                    } else if (action === 'decrease') {
                        this.updateQuantity(bookId, item.quantity - 1);
                    }
                }
            }
            
            // Handle remove item button
            const removeBtn = e.target.closest('.remove-item');
            if (removeBtn) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('🖱️ Remove button clicked');
                
                // Try to get bookId from button itself first
                let bookId = removeBtn.dataset.bookId;
                
                // If not found, try from parent cart-item
                if (!bookId) {
                    const cartItem = removeBtn.closest('.cart-item');
                    if (cartItem) {
                        bookId = cartItem.dataset.bookId;
                    }
                }
                
                console.log('📋 BookId from button:', bookId);
                
                if (bookId) {
                    this.removeItem(bookId);
                } else {
                    console.error('❌ No bookId found on remove button or cart-item');
                }
            }
        });

        // Cart icon click
        document.addEventListener('click', (e) => {
            if (e.target.closest('.cart-icon')) {
                this.openCart();
            }
        });

        // Keyboard escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeCart();
            }
        });
    }

    // Handle buy button click
    handleBuyClick(button) {
        const bookItem = button.closest('.book-item');
        if (!bookItem) return;

        // Extract book data from DOM
        const bookData = this.extractBookData(bookItem);
        if (bookData) {
            this.addItem(bookData);
        }
    }

    // Handle add to cart button click (updated signature)
    handleAddToCartClick(button, bookItem) {
        if (!bookItem) {
            bookItem = button.closest('.book-item');
        }
        
        if (!bookItem) {
            console.warn('⚠️ Book item not found for add to cart');
            return;
        }

        // Extract book data from DOM
        const bookData = this.extractBookData(bookItem);
        if (bookData) {
            this.addItem(bookData);
            
            // Visual feedback - animate button
            button.classList.add('added');
            setTimeout(() => {
                button.classList.remove('added');
            }, 1000);
        }
    }

    // Extract book data from DOM element
    extractBookData(bookItem) {
        try {
            // 🔧 PRIORITY: Get bookId from data attribute (from database)
            const bookId = bookItem.dataset.bookId;
            
            const title = bookItem.querySelector('.book-title')?.textContent?.trim();
            const priceElement = bookItem.querySelector('.price');
            const priceText = priceElement?.textContent?.trim();
            const imageElement = bookItem.querySelector('.book-image img');
            let image = imageElement?.src || imageElement?.getAttribute('src');
            
            // Get discount from data attribute or DOM
            let discount = parseInt(bookItem.dataset.discount) || 0;
            if (!discount) {
                const discountElement = bookItem.querySelector('.discount');
                discount = discountElement ? parseInt(discountElement.textContent.replace(/[^\d]/g, '')) : 0;
            }
            
            // Parse price (remove currency and format)
            let price = 0;
            if (bookItem.dataset.price) {
                price = parseInt(bookItem.dataset.price);
            } else if (priceText) {
                price = parseInt(priceText.replace(/[^\d]/g, ''));
            }

            if (!title || !price) {
                console.warn('⚠️ Missing required book data:', { bookId, title, price });
                return null;
            }

            // Normalize image path
            image = this.normalizeImagePath(image);

            return {
                bookId: bookId || this.generateBookId(title), // Fallback to generated ID
                title,
                price,
                image,
                discount
            };
        } catch (error) {
            console.error('❌ Error extracting book data:', error);
            return null;
        }
    }

    // Generate book ID from title
    generateBookId(title) {
        return title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    }

    // Normalize image path from database
    normalizeImagePath(imagePath) {
        if (!imagePath) {
            return 'https://via.placeholder.com/150x200?text=No+Image';
        }

        // If it's already a full URL (http/https), return as is
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }

        // Remove hostname if present (e.g., http://localhost:3000/public/img/...)
        if (imagePath.includes('://')) {
            try {
                const urlObj = new URL(imagePath);
                imagePath = urlObj.pathname;
            } catch (e) {
                console.warn('Failed to parse URL:', imagePath);
            }
        }

        // Convert database path (../img/...) to web path (/public/img/...)
        if (imagePath.startsWith('../img/')) {
            return imagePath.replace('../img/', '/public/img/');
        }

        // If already starts with /public/, return as is
        if (imagePath.startsWith('/public/')) {
            return imagePath;
        }

        // If starts with ./img/, convert to /public/img/
        if (imagePath.startsWith('./img/')) {
            return imagePath.replace('./img/', '/public/img/');
        }

        // Default fallback
        return imagePath;
    }

    // Open cart modal
    openCart() {
        const modal = document.getElementById('cart-modal');
        if (modal) {
            modal.classList.add('active');
            this.isOpen = true;
            document.body.style.overflow = 'hidden';
        }
    }

    // Close cart modal
    closeCart() {
        const modal = document.getElementById('cart-modal');
        if (modal) {
            modal.classList.remove('active');
            this.isOpen = false;
            document.body.style.overflow = '';
        }
    }

    // Update cart UI
    updateCartUI() {
        this.updateCartIcon();
        this.renderCartItems();
    }

    // Update cart icon badge
    updateCartIcon() {
        const cartCount = document.getElementById('cart-count');
        const cartBadge = document.querySelector('.cart-badge');
        const totalItems = this.getTotalItems();

        if (cartCount) {
            cartCount.textContent = totalItems;
        } else {
            console.warn('⚠️ cart-count element not found');
        }

        if (cartBadge) {
            cartBadge.textContent = totalItems;
            // Show/hide badge
            cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
        } else {
            console.warn('⚠️ cart-badge element not found. Header may not be loaded yet.');
            // Retry after a short delay
            setTimeout(() => {
                const badge = document.querySelector('.cart-badge');
                if (badge) {
                    badge.textContent = totalItems;
                    badge.style.display = totalItems > 0 ? 'flex' : 'none';
                    console.log('✅ Badge updated on retry:', totalItems);
                }
            }, 100);
        }
        
        console.log('🔄 Cart icon updated:', totalItems, 'items');
    }

    // Render cart items
    renderCartItems() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');

        if (!cartItemsContainer) return;

        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Giỏ hàng trống</p>
                    <small>Hãy thêm sản phẩm để tiếp tục mua sắm</small>
                </div>
            `;
            if (cartTotal) cartTotal.textContent = '0 đ';
            return;
        }

        const itemsHTML = this.items.map(item => {
            const finalPrice = item.discount > 0 
                ? Math.round(item.price * (1 - item.discount / 100))
                : item.price;
            
            const itemTotal = finalPrice * item.quantity;

            return `
                <div class="cart-item" data-book-id="${item.bookId}">
                    <div class="item-image">
                        <img src="${item.image}" alt="${item.title}" onerror="this.style.display='none'; this.onerror=null;">
                    </div>
                    <div class="item-details">
                        <h4 class="item-title">${item.title}</h4>
                        <div class="item-price">
                            ${item.discount > 0 ? 
                                `<span class="original-price">${this.formatPrice(item.price)}</span>
                                 <span class="discount">-${item.discount}%</span><br>` : ''
                            }
                            <span class="final-price">${this.formatPrice(finalPrice)} x ${item.quantity}</span>
                            <div class="item-subtotal">= ${this.formatPrice(itemTotal)}</div>
                        </div>
                        <div class="quantity-controls">
                            <button class="qty-btn minus" data-action="decrease" data-book-id="${item.bookId}">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="qty-btn plus" data-action="increase" data-book-id="${item.bookId}">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    <button class="remove-item" data-book-id="${item.bookId}" title="Xóa sản phẩm">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }).join('');

        cartItemsContainer.innerHTML = itemsHTML;
        
        if (cartTotal) {
            cartTotal.textContent = this.formatPrice(this.getTotal());
        }
    }

    // Show notification
    showNotification(message) {
        // Remove existing notification
        const existing = document.querySelector('.cart-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
            <button class="notification-close" type="button">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.remove();
            });
        }

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    if (notification.parentElement) notification.remove();
                }, 300);
            }
        }, 3000);
    }

    // Checkout function
    checkout() {
        if (this.items.length === 0) {
            alert('Giỏ hàng trống!');
            return;
        }

        // Cart is already saved in localStorage with user-specific key
        // No need to save again, Checkout page will read from same key
        
        // Redirect to checkout page
        window.location.href = '/checkout';
    }

    // Clear entire cart
    clearCart() {
        this.items = [];
        this.saveToStorage();
        this.updateCartUI();
    }

    // Reload cart from storage (useful after login/logout)
    reloadCart() {
        this.items = this.loadFromStorage();
        this.updateCartUI();
        console.log('🔄 Cart reloaded:', this.items.length, 'items');
    }
    
    // Public method: Add book by data object (for product detail page)
    addBookByData(bookData, quantity = 1) {
        if (!bookData || !bookData.title || !bookData.price) {
            console.error('❌ Invalid book data:', bookData);
            return false;
        }
        
        // 🔧 CRITICAL: Use bookId from database, not generated
        if (!bookData.bookId) {
            console.warn('⚠️ bookId missing, generating from title');
            bookData.bookId = this.generateBookId(bookData.title);
        }
        
        // Normalize image path before saving
        const normalizedImage = this.normalizeImagePath(bookData.image);
        
        // Ensure bookData has required fields
        const completeBookData = {
            bookId: bookData.bookId, // Use database bookId
            title: bookData.title,
            price: typeof bookData.price === 'number' ? bookData.price : this.parsePrice(bookData.price),
            originalPrice: bookData.originalPrice || bookData.price,
            image: normalizedImage,
            discount: bookData.discount || 0,
            quantity: quantity
        };
        
        console.log('📦 Adding book to cart:', completeBookData);
        
        // Check if item already exists
        const existingItem = this.items.find(item => item.bookId === completeBookData.bookId);
        if (existingItem) {
            console.log('📌 Book already in cart, updating quantity:', existingItem.bookId);
            existingItem.quantity += quantity;
        } else {
            console.log('✨ New book added to cart:', completeBookData.bookId);
            this.items.push(completeBookData);
        }
        
        this.saveToStorage();
        this.updateCartUI();
        this.showNotification(`Đã thêm ${quantity} cuốn "${completeBookData.title}" vào giỏ hàng`);
        
        console.log('✅ Cart updated. Total items:', this.items.length);
        return true;
    }
    
    // Public method: Re-initialize add-to-cart buttons (for dynamic content)
    initAddToCartButtons(container = document) {
        const buttons = container.querySelectorAll('.add-to-cart-btn');
        console.log(`🔗 Found ${buttons.length} add-to-cart buttons to bind`);
        
        // Note: Main binding is done via event delegation in bindEvents()
        // This method is for logging/debugging only
        return buttons.length;
    }
    
    // Public method: Force update cart display (useful after DOM changes)
    forceUpdateDisplay() {
        console.log('🔄 Force updating cart display...');
        this.updateCartIcon();
        this.renderCartItems();
    }
}

// Initialize cart when DOM is ready
let cart;
document.addEventListener('DOMContentLoaded', () => {
    cart = new ShoppingCart();
    
    // Log available buttons
    console.log('🛒 Cart initialized. Available add-to-cart buttons:', cart.initAddToCartButtons());
    
    // Watch for header to be inserted (for pages where header loads async)
    const headerObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length) {
                const badge = document.querySelector('.cart-badge');
                if (badge && cart) {
                    console.log('✅ Header badge detected, updating...');
                    cart.updateCartIcon();
                    headerObserver.disconnect(); // Stop observing once found
                    break;
                }
            }
        }
    });
    
    // Start observing the document body for changes
    headerObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Also update after a short delay as fallback
    setTimeout(() => {
        if (cart) {
            console.log('⏰ Delayed cart update check...');
            cart.updateCartIcon();
        }
    }, 500);
});

// Listen for storage changes (login/logout events)
window.addEventListener('storage', (e) => {
    if (e.key === 'loggedInUser' && cart) {
        cart.reloadCart();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShoppingCart;
}
