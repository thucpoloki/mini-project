// Checkout Page Handler
class CheckoutPage {
    constructor() {
        this.cartItems = [];
        this.shippingFee = 30000; // 30,000 VND
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializePage());
        } else {
            this.initializePage();
        }
    }

    initializePage() {
        console.log('🛒 Initializing Checkout Page...');
        
        // Load cart from localStorage
        this.loadCart();
        
        // Load user info if logged in
        this.loadUserInfo();
        
        // Render order items
        this.renderOrderItems();
        
        // Calculate totals
        this.calculateTotals();
        
        // Bind events
        this.bindEvents();
    }

    loadCart() {
        // Get cart key based on logged-in user (same logic as cart.js)
        const cartKey = this.getCartKey();
        const cartData = localStorage.getItem(cartKey);
        
        if (cartData) {
            this.cartItems = JSON.parse(cartData);
            console.log('✅ Loaded cart from:', cartKey, 'Items:', this.cartItems.length);
        }

        // If cart is empty, show message and redirect
        if (this.cartItems.length === 0) {
            this.showEmptyCart();
        }
    }
    
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

    loadUserInfo() {
        const userStr = localStorage.getItem('loggedInUser');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                
                // Pre-fill form with user data
                if (user.fullName) document.getElementById('fullName').value = user.fullName;
                if (user.email) document.getElementById('email').value = user.email;
                if (user.phone) document.getElementById('phone').value = user.phone;
                
                // Pre-fill address if available
                if (user.address) {
                    if (user.address.street) document.getElementById('address').value = user.address.street;
                    if (user.address.city) document.getElementById('city').value = user.address.city;
                    if (user.address.district) document.getElementById('district').value = user.address.district;
                    if (user.address.ward) document.getElementById('ward').value = user.address.ward;
                }
            } catch (error) {
                console.error('Error loading user info:', error);
            }
        }
    }

    renderOrderItems() {
        const orderItemsContainer = document.getElementById('orderItems');
        
        if (!orderItemsContainer || this.cartItems.length === 0) return;

        const itemsHTML = this.cartItems.map(item => {
            const finalPrice = item.discount > 0 
                ? Math.round(item.price * (1 - item.discount / 100))
                : item.price;
            
            const itemTotal = finalPrice * item.quantity;

            // Normalize image path
            const imagePath = this.normalizeImagePath(item.image);
            
            return `
                <div class="order-item">
                    <div class="order-item-image">
                        <img src="${imagePath}" alt="${item.title}" onerror="this.style.display='none'; this.onerror=null;">
                    </div>
                    <div class="order-item-details">
                        <h5 class="order-item-title">${item.title}</h5>
                        <div class="order-item-price">
                            ${item.discount > 0 ? `
                                <div>
                                    <span class="item-original-price">${this.formatPrice(item.price)}</span>
                                    <span class="item-discount-badge">-${item.discount}%</span>
                                </div>
                                <span class="item-final-price">${this.formatPrice(finalPrice)}</span>
                            ` : `
                                <span class="item-final-price">${this.formatPrice(finalPrice)}</span>
                            `}
                        </div>
                        <div class="order-item-quantity">
                            <i class="fas fa-times"></i> ${item.quantity}
                        </div>
                        <div class="order-item-subtotal">
                            ${this.formatPrice(itemTotal)}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        orderItemsContainer.innerHTML = itemsHTML;
    }

    calculateTotals() {
        const subtotal = this.cartItems.reduce((total, item) => {
            const finalPrice = item.discount > 0 
                ? Math.round(item.price * (1 - item.discount / 100))
                : item.price;
            return total + (finalPrice * item.quantity);
        }, 0);

        const totalAmount = subtotal + this.shippingFee;

        // Update UI
        document.getElementById('subtotal').textContent = this.formatPrice(subtotal);
        document.getElementById('shipping').textContent = this.formatPrice(this.shippingFee);
        document.getElementById('totalAmount').textContent = this.formatPrice(totalAmount);
    }

    bindEvents() {
        const placeOrderBtn = document.getElementById('placeOrderBtn');
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', () => this.handlePlaceOrder());
        }
    }

    async handlePlaceOrder() {
        // Validate form
        const form = document.getElementById('checkoutForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Get form data
        const orderData = {
            customer: {
                fullName: document.getElementById('fullName').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                email: document.getElementById('email').value.trim(),
                address: {
                    street: document.getElementById('address').value.trim(),
                    city: document.getElementById('city').value.trim(),
                    district: document.getElementById('district').value.trim(),
                    ward: document.getElementById('ward').value.trim()
                }
            },
            items: this.cartItems,
            paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
            notes: document.getElementById('notes').value.trim(),
            subtotal: this.getSubtotal(),
            shippingFee: this.shippingFee,
            total: this.getTotal(),
            orderDate: new Date().toISOString()
        };

        console.log('📦 Order Data:', orderData);

        // Show loading
        this.showLoading();

        try {
            // Simulate API call (replace with actual API endpoint)
            await this.submitOrder(orderData);

            // Success
            this.showSuccess();

            // Clear cart after 2 seconds
            setTimeout(() => {
                localStorage.removeItem('cart');
                localStorage.removeItem('checkoutCart');
                window.location.href = '/order-success?orderId=' + Date.now();
            }, 2000);

        } catch (error) {
            console.error('❌ Order submission error:', error);
            this.hideLoading();
            alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!');
        }
    }

    async submitOrder(orderData) {
        // Simulate API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Save to localStorage for now (replace with real API later)
                const orders = JSON.parse(localStorage.getItem('orders') || '[]');
                orders.push({
                    ...orderData,
                    orderId: 'ORD' + Date.now(),
                    status: 'pending'
                });
                localStorage.setItem('orders', JSON.stringify(orders));
                resolve();
            }, 1500);
        });
    }

    getSubtotal() {
        return this.cartItems.reduce((total, item) => {
            const finalPrice = item.discount > 0 
                ? Math.round(item.price * (1 - item.discount / 100))
                : item.price;
            return total + (finalPrice * item.quantity);
        }, 0);
    }

    getTotal() {
        return this.getSubtotal() + this.shippingFee;
    }

    formatPrice(price) {
        return price.toLocaleString('vi-VN') + ' đ';
    }

    showEmptyCart() {
        const main = document.querySelector('main .row');
        if (main) {
            main.innerHTML = `
                <div class="col-12">
                    <div class="empty-checkout">
                        <i class="fas fa-shopping-cart"></i>
                        <h3>Giỏ hàng trống</h3>
                        <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
                        <a href="/trangchu" class="btn">
                            <i class="fas fa-arrow-left me-2"></i>Tiếp tục mua sắm
                        </a>
                    </div>
                </div>
            `;
        }
    }

    showLoading() {
        const loadingHTML = `
            <div class="loading-overlay">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Đang xử lý đơn hàng...</p>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', loadingHTML);
    }

    hideLoading() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) overlay.remove();
    }

    showSuccess() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.innerHTML = `
                <div class="loading-spinner">
                    <i class="fas fa-check-circle" style="color: #27ae60;"></i>
                    <p>Đặt hàng thành công!</p>
                    <small>Đang chuyển hướng...</small>
                </div>
            `;
        }
    }

    // Normalize image path from database
    normalizeImagePath(imagePath) {
        if (!imagePath) {
            return 'https://via.placeholder.com/150x200?text=No+Image';
        }

        // If it's already a full URL, return as is
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }

        // Convert database path (../img/...) to web path (/public/img/...)
        if (imagePath.startsWith('../img/')) {
            return imagePath.replace('../img/', '/public/img/');
        }

        // If already starts with /public/, return as is
        if (imagePath.startsWith('/public/')) {
            return imagePath;
        }

        // Default fallback
        return imagePath;
    }
}

// Initialize checkout page
let checkoutPage;
document.addEventListener('DOMContentLoaded', () => {
    checkoutPage = new CheckoutPage();
});

// Export for external use
window.CheckoutPage = CheckoutPage;
