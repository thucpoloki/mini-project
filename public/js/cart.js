/**
 * =================================================================
 * SHOPPING CART V4.0 - MODERN & PROFESSIONAL
 * =================================================================
 * Hệ thống giỏ hàng hiện đại với:
 * - Product Cache với ETag
 * - Merge cart khi đăng nhập
 * - Clear cart khi đăng xuất
 * - Normalize data từ nhiều nguồn API
 * - Event delegation (không inline JS)
 * - Modal sidebar slide từ phải
 * 
 * ARCHITECTURE:
 * 1. localStorage: Chỉ lưu {id, quantity}
 * 2. productCache: Cache thông tin sản phẩm với TTL và ETag
 * 3. Server sync: Merge cart khi login, verify trước checkout
 */

(function() {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    const CONFIG = {
        CACHE_TTL: 15 * 60 * 1000, // 15 phút
        STORAGE_KEY: 'shopping_cart_v4',
        CACHE_KEY: 'product_cache_v4',
        USER_KEY: 'loggedInUser',
        API_BASE: '/api',
        ENDPOINTS: {
            CART: '/api/cart',
            CART_MERGE: '/api/cart/merge',
            CART_VERIFY: '/api/cart/verify',
            BOOKS: '/api/fullbook',
            BOOK_DETAILS: '/api/books/details' // Endpoint giả định không tồn tại
        }
    };

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    /**
     * Chuẩn hóa dữ liệu sản phẩm từ nhiều nguồn API khác nhau
     */
    function normalizeProduct(raw) { 
        return {
            bookId: raw.bookId,
            name: raw.title || 'Unknown',
            price: Number(raw.price || raw.GiaTien || 0),
            image: raw.image || (Array.isArray(raw.HinhAnh) ? raw.HinhAnh[0] : ''),
            genre: raw.genre || null,
            author: raw.author || null,
            stock: raw.stock || raw.soLuongTon || 999,
            discount: raw.discount || 0
        };
    }

    /**
     * Kiểm tra xem người dùng đã đăng nhập chưa
     */
    function isLoggedIn() {
        try {
            const user = localStorage.getItem(CONFIG.USER_KEY);
            return !!user && user !== 'null';
        } catch {
            return false;
        }
    }

    /**
     * Lấy thông tin người dùng đã đăng nhập
     */
    function getUser() {
        try {
            return JSON.parse(localStorage.getItem(CONFIG.USER_KEY));
        } catch {
            return null;
        }
    }

    /**
     * Tạo khóa lưu trữ duy nhất dựa trên người dùng
     */
    function getStorageKey() {
        if (isLoggedIn()) {
            const user = getUser();
            return `${CONFIG.STORAGE_KEY}_${user.username || user.email || user.id}`;
        }
        return `${CONFIG.STORAGE_KEY}_guest`;
    }

    /**
     * API Fetch wrapper với auth token
     */
    async function apiFetch(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            // Giải thích cú 
            ...options.headers
        };

        // Thêm auth token nếu đã đăng nhập
        const user = getUser();
        if (user && user.token) {
            headers['Authorization'] = `Bearer ${user.token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Lỗi mạng' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        // Trích xuất ETag nếu có
        const etag = response.headers.get('ETag');
        const data = await response.json();
        
        if (etag) {
            data.__etag = etag;
        }

        return data;
    }

    // ============================================
    // QUẢN LÝ CACHE SẢN PHẨM
    // ============================================
    const ProductCache = {
        /**
         * Lấy cache từ localStorage
         */
        getAll() {
            try {
                const cache = localStorage.getItem(CONFIG.CACHE_KEY);
                return cache ? JSON.parse(cache) : {};
            } catch {
                return {};
            }
        },

        /**
         * Lưu cache vào localStorage
         */
        saveAll(cache) {
            try {
                localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(cache));
            } catch (e) {
                console.warn('⚠️ Không thể lưu cache:', e);
            }
        },

        /**
         * Lấy sản phẩm từ cache
         */
        get(id) {
            const cache = this.getAll();
            const item = cache[id];
            
            if (!item) return null;

            // Kiểm tra TTL
            const now = Date.now();
            if (now - item.timestamp > CONFIG.CACHE_TTL) {
                console.log(`⏰ Cache hết hạn cho sản phẩm ${id}`);
                return null;
            }

            return item.data;
        },

        /**
         * Đặt sản phẩm vào cache
         */
        set(id, data, etag = null) {
            const cache = this.getAll();
            cache[id] = {
                data: normalizeProduct(data),
                etag: etag,
                timestamp: Date.now()
            };
            this.saveAll(cache);
        },

        /**
         * Đặt nhiều sản phẩm vào cache
         */
        setMultiple(products) {
            const cache = this.getAll();
            products.forEach(product => {
                const normalized = normalizeProduct(product);
                cache[normalized.bookId] = {
                    data: normalized,
                    etag: product.__etag || null,
                    timestamp: Date.now()
                };
            });
            this.saveAll(cache);
        },

        /**
         * Lấy ETag cho sản phẩm
         */
        getETag(id) {
            const cache = this.getAll();
            return cache[id]?.etag || null;
        },

        /**
         * Xóa toàn bộ cache
         */
        clear() {
            localStorage.removeItem(CONFIG.CACHE_KEY);
            console.log('🗑️ Cache sản phẩm đã được xóa');
        },

        /**
         * Xóa các mục hết hạn
         */
        cleanup() {
            const cache = this.getAll();
            const now = Date.now();
            let cleaned = 0;

            Object.keys(cache).forEach(id => {
                if (now - cache[id].timestamp > CONFIG.CACHE_TTL) {
                    delete cache[id];
                    cleaned++;
                }
            });

            if (cleaned > 0) {
                this.saveAll(cache);
                console.log(`🧹 Đã dọn dẹp ${cleaned} mục cache hết hạn`);
            }
        }
    };

    // ============================================
    // QUẢN LÝ DỮ LIỆU GIỎ HÀNG
    // ============================================
    const CartData = {
        /**
         * Lấy các mục giỏ hàng từ localStorage
         */
        get() {
            try {
                const key = getStorageKey();
                const cart = localStorage.getItem(key);
                return cart ? JSON.parse(cart) : [];
            } catch {
                return [];
            }
        },

        /**
         * Lưu giỏ hàng vào localStorage
         */
        save(items) {
            try {
                const key = getStorageKey();
                localStorage.setItem(key, JSON.stringify(items));
                console.log(`💾 Giỏ hàng đã lưu (${items.length} mục)`);
            } catch (e) {
                console.error('❌ Không thể lưu giỏ hàng:', e);
            }
        },

        /**
         * Thêm mục vào giỏ hàng
         */
        add(productId, quantity = 1) {
            const cart = this.get();
            const existing = cart.find(item => item.bookId === productId);

            if (existing) {
                existing.quantity += quantity;
                console.log(`➕ Đã cập nhật số lượng cho ${productId}: ${existing.quantity}`);
            } else {
                cart.push({ bookId: productId, quantity });
                console.log(`✨ Đã thêm mục mới ${productId} vào giỏ hàng`);
            }

            this.save(cart);
            return cart;
        },

        /**
         * Xóa mục khỏi giỏ hàng
         */
        remove(productId) {
            let cart = this.get();
            cart = cart.filter(item => item.bookId !== productId);
            this.save(cart);
            console.log(`🗑️ Đã xóa ${productId} khỏi giỏ hàng`);
            return cart;
        },

        /**
         * Cập nhật số lượng
         */
        updateQuantity(productId, quantity) {
            if (quantity <= 0) {
                return this.remove(productId);
            }

            const cart = this.get();
            const item = cart.find(item => item.bookId === productId);
            
            if (item) {
                item.quantity = quantity;
                this.save(cart);
                console.log(`🔄 Đã cập nhật ${productId} số lượng thành ${quantity}`);
            }

            return cart;
        },

        /**
         * Xóa giỏ hàng
         */
        clear() {
            const key = getStorageKey();
            localStorage.removeItem(key);
            console.log('🗑️ Giỏ hàng đã được xóa');
        },

        /**
         * Lấy tổng số lượng mục
         */
        getTotalItems() {
            const cart = this.get();
            return cart.reduce((sum, item) => sum + item.quantity, 0);
        }
    };

    // ============================================
    // LỚP GIỎ HÀNG CHÍNH
    // ============================================
    const ShoppingCart = {
        isModalOpen: false,

        /**
         * Khởi tạo hệ thống giỏ hàng
         */
        init() {
            console.log('🛒 Khởi tạo Shopping Cart V4.0...');
            
            // Dọn dẹp cache hết hạn
            ProductCache.cleanup();

            // Tạo modal
            this.createCartModal();

            // Gắn sự kiện
            this.bindEvents();

            // Cập nhật icon ngay lập tức
            this.updateCartIcon();

            // Debug: Hiển thị dữ liệu giỏ hàng hiện tại
            const cartData = CartData.get();
            console.log('🛒 Dữ liệu giỏ hàng hiện tại khi khởi tạo:', cartData);
            console.log('🛒 Tổng số mục:', CartData.getTotalItems());

            // Hiển thị trang checkout nếu có
            this.renderCheckoutPage();

            console.log('✅ Shopping Cart đã được khởi tạo');
        },

        /**
         * Tạo HTML modal giỏ hàng
         */
        createCartModal() {
            if (document.getElementById('cart-modal')) {
                console.log('Modal đã tồn tại');
                return;
            }

            const modalHTML = `
                <div id="cart-modal" class="cart-modal">
                    <div class="cart-overlay"></div>
                    <div class="cart-sidebar">
                        <div class="cart-header">
                            <h3>
                                <i class="fas fa-shopping-cart"></i> 
                                Giỏ hàng (<span id="cart-modal-count">0</span>)
                            </h3>
                            <button class="cart-close" type="button" aria-label="Close cart">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="cart-body">
                            <div id="cart-modal-items">
                                <div class="loading">
                                    <i class="fas fa-spinner fa-spin"></i>
                                    <p>Đang tải...</p>
                                </div>
                            </div>
                        </div>
                        <div class="cart-footer">
                            <div class="cart-total">
                                <div class="total-row">
                                    <span>Tổng cộng:</span>
                                    <span id="cart-modal-total" class="total-price">0 đ</span>
                                </div>
                            </div>
                            <div class="group-btn d-flex justify-content-between align-items-center gap-2">
                                <button class="clear-cart-btn" type="button" data-action="clear-cart">
                                    <i class="fas fa-trash"></i> Xóa giỏ hàng
                                </button>
                                <button class="checkout-btn" type="button" data-action="checkout">
                                    <i class="fas fa-credit-card"></i> Xem giỏ hàng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHTML);
            console.log('✅ Modal giỏ hàng đã được tạo');
        },

        /**
         * Gắn tất cả event listeners
         */
        bindEvents() {
            // Click icon giỏ hàng
            document.addEventListener('click', (e) => {
                if (e.target.closest('.cart-icon')) {
                    this.openModal();
                }
            });

            // Đóng modal
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('cart-overlay') || 
                    e.target.closest('.cart-close')) {
                    this.closeModal();
                }
            });

            // Nút checkout
            document.addEventListener('click', (e) => {
                if (e.target.closest('[data-action="checkout"]')) {
                    window.location.href = '/checkout';
                }
            });

            // Nút thêm vào giỏ hàng
            document.addEventListener('click', (e) => {
                const addBtn = e.target.closest('[data-action="add-to-cart"]');
                if (addBtn) {
                    e.preventDefault();
                    const productId = addBtn.dataset.productId;
                    if (productId) {
                        this.addItem(productId);
                    }
                }
            });

            // Điều khiển số lượng trong modal
            document.addEventListener('click', async (e) => {
                const qtyBtn = e.target.closest('.qty-btn');
                if (!qtyBtn) return;

                const action = qtyBtn.dataset.action;
                const productId = qtyBtn.dataset.productId;
                
                const item = qtyBtn.closest('.cart-item');
                const qtySpan = item?.querySelector('.quantity');
                const currentQty = qtySpan ? parseInt(qtySpan.textContent) : 0;

                if (action === 'increase') {
                    await this.updateQuantity(productId, currentQty + 1);
                } else if (action === 'decrease') {
                    await this.updateQuantity(productId, currentQty - 1);
                }
            });

            // Nút xóa trong modal
            document.addEventListener('click', async (e) => {
                const removeBtn = e.target.closest('[data-action="remove"]');
                if (removeBtn) {
                    const productId = removeBtn.dataset.productId;
                    await this.removeItem(productId);
                }
            });

            // Phím ESC để đóng
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isModalOpen) {
                    this.closeModal();
                }
            });

            // Nút xóa giỏ hàng
            document.addEventListener('click', async (e) => {
                if (e.target.closest('[data-action="clear-cart"]')) {
                    await this.clearCart();
                }
            });

            console.log('✅ Đã gắn các sự kiện');
        },

        /**
         * Thêm mục vào giỏ hàng
         */
        async addItem(productId) {
            try {
                console.log(`🛒 Đang thêm sản phẩm ${productId} vào giỏ hàng...`);

                // Thêm vào dữ liệu giỏ hàng
                CartData.add(productId, 1);

                // Cập nhật UI
                this.updateCartIcon();

                // Hiển thị thông báo
                this.showNotification('Đã thêm vào giỏ hàng', 'success');

                // Đồng bộ với server nếu đã đăng nhập
                if (isLoggedIn()) {
                    await this.syncToServer();
                }

            } catch (error) {
                console.error('❌ Không thể thêm mục:', error);
                this.showNotification('Lỗi khi thêm sản phẩm', 'error');
            }
        },

        /**
         * Xóa mục khỏi giỏ hàng
         */
        async removeItem(productId) {
            try {
                CartData.remove(productId);
                this.updateCartIcon();
                await this.renderModal();

                this.showNotification('Đã xóa khỏi giỏ hàng', 'success');

                if (isLoggedIn()) {
                    await this.syncToServer();
                }
            } catch (error) {
                console.error('❌ Không thể xóa mục:', error);
            }
        },

        /**
         * Xóa giỏ hàng
         */
        async clearCart() {
            try {
                // Kiểm tra giỏ hàng không trống
                // CartData.isEmpty() is not a function
                if (CartData.getTotalItems() === 0) {
                    this.showNotification('Giỏ hàng hiện đang trống', 'info');
                    return;
                } else {
                    CartData.clear();
                    this.updateCartIcon();
                    await this.renderModal();
                }
                this.showNotification('Giỏ hàng đã được làm sạch', 'success');

                if (isLoggedIn()) {
                    await this.syncToServer();
                }
            } catch (error) {
                console.error('❌ Không thể xóa giỏ hàng:', error);
            }
        },

        /**
         * Cập nhật số lượng
         */
        async updateQuantity(productId, quantity) {
            try {
                CartData.updateQuantity(productId, quantity);
                this.updateCartIcon();
                await this.renderModal();

                if (isLoggedIn()) {
                    await this.syncToServer();
                }
            } catch (error) {
                console.error('❌ Không thể cập nhật số lượng:', error);
            }
        },

        /**
         * Lấy chi tiết sản phẩm với cache
         */
        async fetchProductDetails(productIds) {
            const needFetch = [];
            const cached = {};

            // Kiểm tra cache trước
            productIds.forEach(id => {
                const cachedProduct = ProductCache.get(id);
                if (cachedProduct) {
                    cached[id] = cachedProduct;
                } else {
                    needFetch.push(id);
                }
            });

            console.log(`📦 Cache hit: ${Object.keys(cached).length}, Cần fetch: ${needFetch.length}`);

            // Fetch các sản phẩm còn thiếu
            if (needFetch.length > 0) {
                try {
                    // Fetch từ BOOKS endpoint (fullbook) và lọc theo ID
                    console.log('📦 Fetch từ BOOKS endpoint và lọc theo bookId...');
                    const allBooksResponse = await apiFetch(CONFIG.ENDPOINTS.BOOKS);
                    const allBooks = Array.isArray(allBooksResponse) ? allBooksResponse : allBooksResponse.books || [];
                    
                    // Lọc ra các sách có bookId trong needFetch
                    const filteredBooks = allBooks.filter(book => 
                        needFetch.includes(String(book.bookId)) || needFetch.includes(book.bookId)
                    );
                    
                    console.log(`📦 Tìm thấy ${filteredBooks.length} sách từ BOOKS endpoint`);
                    
                    // Cache và thêm kết quả
                    ProductCache.setMultiple(filteredBooks);
                    filteredBooks.forEach(product => {
                        const normalized = normalizeProduct(product);
                        cached[normalized.bookId] = normalized;
                    });

                } catch (error) {
                    console.error('❌ Không thể fetch từ BOOKS endpoint:', error);
                    
                    // Fallback 1: Thử fetch từng sách một từ /fullbook/:id
                    console.log('🔄 Fallback: Fetch từng sách từ /fullbook/:id...');
                    for (const id of needFetch) {
                        try {
                            const singleBookResponse = await apiFetch(`/api/fullbook/${id}`);
                            if (singleBookResponse) {
                                const normalized = normalizeProduct(singleBookResponse);
                                ProductCache.set(normalized.bookId, normalized);
                                cached[normalized.bookId] = normalized;
                                console.log(`✅ Đã fetch thành công sách ${id}`);
                            }
                        } catch (singleError) {
                            console.warn(`⚠️ Không thể fetch sách ${id}:`, singleError);
                        }
                    }
                    
                    // Fallback 2: Thử trích xuất từ DOM
                    console.log('🔄 Fallback cuối: Trích xuất từ DOM...');
                    needFetch.forEach(id => {
                        if (!cached[id]) {
                            const product = this.extractProductFromDOM(id);
                            if (product) {
                                cached[id] = product;
                                console.log(`✅ Đã trích xuất sách ${id} từ DOM`);
                            }
                        }
                    });
                }
            }

            return cached;
        },

        /**
         * Mở modal giỏ hàng
         */
        async openModal() {
            const modal = document.getElementById('cart-modal');
            if (!modal) return;

            this.isModalOpen = true;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';

            await this.renderModal();
        },

        /**
         * Đóng modal giỏ hàng
         */
        closeModal() {
            const modal = document.getElementById('cart-modal');
            if (!modal) return;

            this.isModalOpen = false;
            modal.classList.remove('active');
            document.body.style.overflow = '';
        },

        /**
         * Hiển thị nội dung modal giỏ hàng
         */
        async renderModal() {
            const container = document.getElementById('cart-modal-items');
            const countEl = document.getElementById('cart-modal-count');
            const totalEl = document.getElementById('cart-modal-total');

            if (!container) return;

            const cart = CartData.get();
            console.log('🛒 Hiển thị modal với dữ liệu giỏ hàng:', cart);

            if (cart.length === 0) {
                container.innerHTML = `
                    <div class="empty-cart">
                        <i class="fas fa-shopping-cart"></i>
                        <p>Giỏ hàng trống</p>
                        <small>Hãy thêm sản phẩm để tiếp tục</small>
                    </div>
                `;
                if (countEl) countEl.textContent = '0';
                if (totalEl) totalEl.textContent = '0 đ';
                return;
            }

            // Hiển thị đang tải
            container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>Đang tải sản phẩm...</p></div>';

            try {
                // Lấy chi tiết sản phẩm
                const productIds = cart.map(item => item.bookId);
                console.log('📦 Đang fetch chi tiết cho sản phẩm:', productIds);
                
                const products = await this.fetchProductDetails(productIds);
                console.log('📦 Đã nhận chi tiết sản phẩm:', products);

                let total = 0;
                let totalQty = 0;

                const html = cart.map(item => {
                    const product = products[item.bookId];
                    if (!product) {
                        console.warn(`⚠️ Sản phẩm ${item.bookId} không tìm thấy trong kết quả`);
                        return `
                            <div class="cart-item" data-product-id="${item.bookId}">
                                <div class="item-details">
                                    <h4 class="item-title">Sản phẩm không tìm thấy</h4>
                                    <div class="item-price">
                                        <span class="final-price">0 đ</span>
                                        <span class="quantity-label">x ${item.quantity}</span>
                                    </div>
                                </div>
                                <button class="remove-item" type="button" 
                                        data-action="remove" data-product-id="${item.bookId}" 
                                        title="Xóa sản phẩm">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `;
                    }

                    const subtotal = product.price * item.quantity;
                    total += subtotal;
                    totalQty += item.quantity;

                    return `
                        <div class="cart-item" data-product-id="${item.bookId}">
                            <div class="item-image">
                                <img src="${product.image.replace(/^(\.\.\/)+/, '/public/')}" alt="${product.name}" 
                                     onerror="this.src='/public/img/avatar/uia.gif'">
                            </div>
                            <div class="item-details">
                                <h4 class="item-title">${product.name}</h4>
                                <div class="item-price">
                                    <span class="final-price">${product.price.toLocaleString('vi-VN')} đ</span>
                                    <span class="quantity-label">x ${item.quantity}</span>
                                </div>
                                <div class="item-subtotal">${subtotal.toLocaleString('vi-VN')} đ</div>
                                <div class="quantity-controls">
                                    <button class="qty-btn" type="button" 
                                            data-action="decrease" data-product-id="${item.bookId}">
                                        <i class="fas fa-minus"></i>
                                    </button>
                                    <span class="quantity">${item.quantity}</span>
                                    <button class="qty-btn" type="button" 
                                            data-action="increase" data-product-id="${item.bookId}">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                            </div>
                            <button class="remove-item" type="button" 
                                    data-action="remove" data-product-id="${item.bookId}" 
                                    title="Xóa sản phẩm">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `;
                }).join('');

                container.innerHTML = html;
                if (countEl) countEl.textContent = totalQty;
                if (totalEl) totalEl.textContent = `${total.toLocaleString('vi-VN')} đ`;

                console.log(`✅ Modal đã hiển thị: ${totalQty} mục, ${total} đ tổng cộng`);

            } catch (error) {
                console.error('❌ Không thể hiển thị giỏ hàng:', error);
                container.innerHTML = `
                    <div class="empty-cart">
                        <i class="fas fa-exclamation-triangle text-danger"></i>
                        <p>Có lỗi xảy ra khi tải giỏ hàng</p>
                        <small>Vui lòng thử lại sau</small>
                    </div>
                `;
            }
        },

        /**
         * Cập nhật badge icon giỏ hàng
         */
        updateCartIcon() {
            const badge = document.querySelector('.cart-count');
            if (!badge) {
                console.log('⚠️ Không tìm thấy badge giỏ hàng, sẽ thử lại sau 100ms...');
                // Thử lại sau một khoảng thời gian ngắn nếu không tìm thấy badge
                setTimeout(() => this.updateCartIcon(), 100);
                return;
            }

            const total = CartData.getTotalItems();
            console.log(`🔄 Cập nhật icon giỏ hàng: ${total} mục`);
            badge.textContent = total;
            badge.style.display = total > 0 ? 'flex' : 'none';
        },

        /**
         * Hiển thị trang checkout (trang giỏ hàng đầy đủ)
         */
        async renderCheckoutPage() {
            const container = document.getElementById('cart-items-container');
            if (!container) return; // Không phải trang checkout

            console.log('📄 Hiển thị trang checkout...');

            container.innerHTML = '<tr><td colspan="5" class="text-center">Đang tải...</td></tr>';

            try {
                const cart = CartData.get();
                
                if (cart.length === 0) {
                    container.innerHTML = `
                        <tr>
                            <td colspan="5" class="text-center">
                                Giỏ hàng trống. <a href="/">Tiếp tục mua sắm</a>
                            </td>
                        </tr>
                    `;
                    this.updateCheckoutTotal(0);
                    return;
                }

                // LUÔN verify với server trước khi checkout
                const verified = await this.verifyCart(cart);

                let total = 0;
                const html = verified.map(item => {
                    const subtotal = item.price * item.quantity;
                    total += subtotal;

                    return `
                        <tr>
                            <td>
                                <img src="${item.image}" alt="${item.name}" 
                                     style="width:60px;height:80px;object-fit:cover;border-radius:4px;">
                                <span class="ms-3 fw-bold">${item.name}</span>
                            </td>
                            <td>${item.price.toLocaleString('vi-VN')} đ</td>
                            <td>
                                <input type="number" class="form-control" style="width:70px;" 
                                       value="${item.quantity}" min="1" 
                                       onchange="ShoppingCart.updateQuantity('${item.bookId}', this.value)">
                            </td>
                            <td class="fw-bold">${subtotal.toLocaleString('vi-VN')} đ</td>
                            <td>
                                <button class="btn btn-outline-danger btn-sm" 
                                        onclick="ShoppingCart.removeItem('${item.bookId}')">Xóa</button>
                            </td>
                        </tr>
                    `;
                }).join('');

                container.innerHTML = html;
                this.updateCheckoutTotal(total);

            } catch (error) {
                console.error('❌ Không thể hiển thị checkout:', error);
                container.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center text-danger">
                            Có lỗi xảy ra. Vui lòng thử lại.
                        </td>
                    </tr>
                `;
            }
        },

        /**
         * Cập nhật tổng tiền trang checkout
         */
        updateCheckoutTotal(amount) {
            const totalEl = document.getElementById('cart-total');
            if (totalEl) {
                totalEl.textContent = `${amount.toLocaleString('vi-VN')} đ`;
            }
        },

        /**
         * Verify giỏ hàng với server (luôn fetch dữ liệu mới)
         */
        async verifyCart(cart) {
            try {
                const productIds = cart.map(item => item.bookId);
                const response = await apiFetch(CONFIG.ENDPOINTS.CART_VERIFY, {
                    method: 'POST',
                    body: JSON.stringify({ items: cart })
                });

                // Cập nhật cache với dữ liệu đã verify
                ProductCache.setMultiple(response.products || []);

                // Trả về sản phẩm đã verify với số lượng
                return cart.map(item => {
                    const product = (response.products || []).find(p => {
                        const normalized = normalizeProduct(p);
                        return normalized.bookId === item.bookId;
                    });

                    if (!product) {
                        console.warn(`⚠️ Sản phẩm ${item.bookId} không tìm thấy trên server`);
                        return null;
                    }

                    const normalized = normalizeProduct(product);
                    return {
                        ...normalized,
                        quantity: item.quantity
                    };
                }).filter(Boolean);

            } catch (error) {
                console.error('❌ Xác thực giỏ hàng thất bại:', error);
                // Fallback về cache
                const productIds = cart.map(item => item.bookId);
                const cached = await this.fetchProductDetails(productIds);
                
                return cart.map(item => ({
                    ...cached[item.bookId],
                    quantity: item.quantity
                }));
            }
        },

        /**
         * Đồng bộ giỏ hàng với server (nếu đã đăng nhập)
         */
        async syncToServer() {
            if (!isLoggedIn()) return;

            try {
                const cart = CartData.get();
                await apiFetch(CONFIG.ENDPOINTS.CART, {
                    method: 'POST',
                    body: JSON.stringify({ items: cart })
                });
                console.log('✅ Giỏ hàng đã đồng bộ với server');
            } catch (error) {
                console.warn('⚠️ Không thể đồng bộ giỏ hàng với server:', error);
            }
        },

        /**
         * Merge giỏ hàng khi đăng nhập
         */
        async mergeOnLogin() {
            try {
                console.log('🔄 Đang merge giỏ hàng khi đăng nhập...');

                // Lấy giỏ hàng khách
                const guestKey = `${CONFIG.STORAGE_KEY}_guest`;
                const guestCart = JSON.parse(localStorage.getItem(guestKey) || '[]');

                if (guestCart.length === 0) {
                    console.log('Không có giỏ hàng khách để merge');
                    return;
                }

                // Gửi đến server để merge
                const response = await apiFetch(CONFIG.ENDPOINTS.CART_MERGE, {
                    method: 'POST',
                    body: JSON.stringify({ guestCart })
                });

                // Xóa giỏ hàng khách
                localStorage.removeItem(guestKey);

                // Lưu giỏ hàng đã merge vào storage của user
                const userKey = getStorageKey();
                localStorage.setItem(userKey, JSON.stringify(response.cart || []));

                console.log('✅ Giỏ hàng đã merge thành công');

                // Cập nhật UI
                this.updateCartIcon();

            } catch (error) {
                console.error('❌ Không thể merge giỏ hàng:', error);
            }
        },

        /**
         * Xóa giỏ hàng khi đăng xuất
         */
        clearOnLogout() {
            const userKey = getStorageKey();
            localStorage.removeItem(userKey);
            this.updateCartIcon();
            console.log('✅ Giỏ hàng local đã xóa khi đăng xuất');
        },

        /**
         * Hiển thị thông báo
         */
        showNotification(message, type = 'success') {
            // Xóa thông báo hiện tại
            const existing = document.querySelector('.cart-notification');
            if (existing) existing.remove();

            const notification = document.createElement('div');
            notification.className = `cart-notification cart-notification-${type}`;
            notification.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
                <button class="notification-close" type="button" title="Đóng">
                    <i class="fas fa-times"></i>
                </button>
            `;

            // Thêm sự kiện cho nút đóng
            const closeBtn = notification.querySelector('.notification-close');
            closeBtn.addEventListener('click', () => {
                notification.classList.add('fade-out');
                setTimeout(() => notification.remove(), 300);
            });

            document.body.appendChild(notification);

            setTimeout(() => {
                notification.classList.add('fade-out');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        },

        /**
         * Fallback: Trích xuất thông tin sản phẩm từ DOM khi API thất bại
         */
        extractProductFromDOM(productId) {
            console.log(`🔍 Đang trích xuất sản phẩm ${productId} từ DOM...`);
            
            // Thử tìm sản phẩm trong trang hiện tại
            const productElement = document.querySelector(`[data-product-id="${productId}"]`)?.closest('.book-card, .product-card, .book-item');
            
            if (!productElement) {
                console.warn(`⚠️ Sản phẩm ${productId} không tìm thấy trong DOM`);
                return null;
            }

            try {
                // Trích xuất thông tin từ DOM
                const nameEl = productElement.querySelector('.book-title, .product-title, h3, h4, .title');
                const imageEl = productElement.querySelector('img');
                
                // ✨ Trích xuất giá thông minh - kiểm tra cấu trúc giảm giá
                const priceContainer = productElement.querySelector('.book-price, .price-container');
                let price = 0;
                let discount = 0;
                
                if (priceContainer) {
                    // Kiểm tra nếu có cấu trúc giảm giá
                    const originalPriceEl = priceContainer.querySelector('.original-price');
                    const discountEl = priceContainer.querySelector('.discount');
                    const finalPriceEl = priceContainer.querySelector('.price:not(.original-price)');
                    
                    if (originalPriceEl && discountEl) {
                        // Có giảm giá - sử dụng giá gốc
                        const originalText = originalPriceEl.textContent.replace(/[^\d]/g, '');
                        price = parseInt(originalText) || 0;
                        
                        // Trích xuất phần trăm giảm giá
                        const discountText = discountEl.textContent.replace(/[^\d]/g, '');
                        discount = parseInt(discountText) || 0;
                        
                        console.log(`💰 Đã trích xuất với giảm giá: gốc=${price}, giảm=${discount}%`);
                    } else {
                        // Không giảm giá - sử dụng giá cuối
                        const priceEl = finalPriceEl || priceContainer.querySelector('.price, .book-price, .gia-tien');
                        if (priceEl) {
                            const priceText = priceEl.textContent.replace(/[^\d]/g, '');
                            price = parseInt(priceText) || 0;
                        }
                        console.log(`💰 Đã trích xuất giá thường: ${price}`);
                    }
                }

                const product = {
                    bookId: productId,
                    name: nameEl?.textContent?.trim() || `Sản phẩm ${productId}`,
                    price: price,
                    image: imageEl?.src || '/public/img/avatar/uia.gif',
                    stock: 999, // Stock mặc định
                    discount: discount
                };

                console.log(`✅ Đã trích xuất sản phẩm từ DOM:`, product);
                
                // Cache nó
                ProductCache.set(productId, product);
                
                return product;
            } catch (error) {
                console.error(`❌ Không thể trích xuất sản phẩm ${productId}:`, error);
                return null;
            }
        }
    };

    // ============================================
    // KHỞI TẠO
    // ============================================
    
    // Xuất ra window
    window.ShoppingCart = ShoppingCart;

    // Khởi tạo khi DOM sẵn sàng
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ShoppingCart.init());
    } else {
        ShoppingCart.init();
    }

    // Theo dõi thay đổi storage (sự kiện login/logout)
    window.addEventListener('storage', (e) => {
        if (e.key === CONFIG.USER_KEY) {
            console.log('🔄 Phiên người dùng đã thay đổi');
            ShoppingCart.updateCartIcon();
        }
    });

    // Theo dõi header được tải (khi icon giỏ hàng khả dụng)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const cartIcon = document.querySelector('.cart-count');
                if (cartIcon && !cartIcon.dataset.initialized) {
                    console.log('🎯 Đã phát hiện icon giỏ hàng, đang cập nhật...');
                    cartIcon.dataset.initialized = 'true';
                    ShoppingCart.updateCartIcon();
                }
            }
        });
    });

    // Bắt đầu quan sát khi DOM sẵn sàng
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, { childList: true, subtree: true });
        });
    } else {
        observer.observe(document.body, { childList: true, subtree: true });
    }

})();
