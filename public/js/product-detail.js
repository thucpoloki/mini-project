// Product Detail Page Handler
class ProductDetailPage {
    constructor() {
        this.currentBook = null;
        this.bookId = null;
        this.init();
    }

    init() {
        // Đợi DOM tải xong
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () =>
                this.initializePage()
            );
        } else {
            this.initializePage();
        }
    }

    initializePage() {
        console.log("🔍 Initializing Product Detail Page...");

        // Lấy book ID từ URL
        this.bookId = this.getBookIdFromURL();

        if (this.bookId) {
            console.log(`📚 Loading book with ID: ${this.bookId}`);
            this.loadBookDetail(this.bookId);
        } else {
            console.error("❌ No book ID found in URL");
            this.showError("Không tìm thấy thông tin sách");
        }
    }

    getBookIdFromURL() {
        // Lấy ID từ path parameter: /sanpham/14 -> 14
        const pathParts = window.location.pathname.split("/");
        const id = pathParts[pathParts.length - 1]; // Lấy phần cuối của path

        // Debug URL parsing
        console.log("🔍 Current URL:", window.location.href);
        console.log("🔍 Current pathname:", window.location.pathname);
        console.log("🔍 Path parts:", pathParts);
        console.log("🔍 Book ID from URL:", id);

        // Kiểm tra xem id có phải là số hợp lệ không
        return id && !isNaN(id) ? id : null;
    }

    async loadBookDetail(bookId) {
        try {
            console.log(`📖 Fetching book details for ID: ${bookId}`);

            // Call API to get book details
            const response = await fetch(`/api/fullbook/${bookId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.currentBook = await response.json();

            console.log("✅ Book details loaded:", this.currentBook);

            // Render book details
            this.renderBookDetail();

            // Load related books
            if (this.currentBook.genre) {
                this.loadRelatedBooks(this.currentBook.genre);
            }
        } catch (error) {
            console.error("❌ Error loading book details:", error);
            this.showError("Không thể tải thông tin sách. Vui lòng thử lại sau.");
        }
    }

    renderBookDetail() {
            const container = document.getElementById("product-detail-container");
            const loadingContainer = document.getElementById("loading-container");

            // Hide loading
            if (loadingContainer) {
                loadingContainer.style.display = "none";
            }

            const book = this.currentBook;
            const discountPrice =
                book.discount > 0 ?
                (book.price * (1 - book.discount / 100)).toFixed(0) :
                book.price;
            const imgPath = book.image.replace(/^(\.\.\/)+/, "/public/");
            container.innerHTML = `
            <div class="product-detail-grid">
                <!-- Left Column - Product Image & Actions -->
                <div class="product-left-column">
                    <div class="product-image-container">
                        <div class="main-image">
                            <img id="main-product-image" 
                                 src="${
                                   imgPath || "/public/img/placeholder-book.jpg"
                                 }" 
                                 alt="${book.title}"
                                 onerror="this.style.display='none'; this.onerror=null;">
                        </div>
                        ${
                          book.discount > 0
                            ? `<div class="discount-badge">-${book.discount}%</div>`
                            : ""
                        }
                    </div>
                    
                    <div class="product-actions">
                        <button 
                            class="action-btn btn-add-cart" 
                            id="add-to-cart-btn"
                            type="button"
                            data-product-id="${book.bookId}">
                            <i class="fas fa-cart-plus"></i>
                            Thêm vào giỏ hàng
                        </button>
                        <button class="action-btn btn-buy-now" id="buy-now-btn">
                            Mua
                        </button>
                    </div>
                    
                    <div class="product-features">
                        <div class="feature-item shipping">
                            <i class="fas fa-truck"></i>
                            <span>Miễn phí vận chuyển cho đơn hàng trên 200k</span>
                        </div>
                        <div class="feature-item warranty">
                            <i class="fas fa-shield-alt"></i>
                            <span>Kiểm tra hàng khi nhận hoàn trả lại hàng khi có lỗi</span>
                        </div>
                        <div class="feature-item payment">
                            <i class="fas fa-credit-card"></i>
                            <span>Thanh toán COD - Chuyển khoản hoặc Tiền mặt</span>
                        </div>
                    </div>
                </div>
                
                <!-- Right Column - Product Info -->
                <div class="product-right-column">
                    <h1 class="product-title">${book.title}</h1>
                    
                    <div class="product-meta">
                        <div class="meta-item">
                            <div class="meta-label">Tác giả:</div>
                            <div class="meta-value">${
                              book.author || "Cuttlefish That Loves Diving"
                            }</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-label">Hình thức bìa:</div>
                            <div class="meta-value">${book.cover}</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-label">Nhà cung cấp:</div>
                            <div class="meta-value">${
                              book.supplier || "KakaoPage"
                            }</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-label">Thể loại:</div>
                            <div class="meta-value">${book.genre}</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-label">Số trang:</div>
                            <div class="meta-value">${book.pages}</div>
                        </div>
                    </div>
                    
                    <div class="product-pricing">
                        <div class="price-display">
                            ${
                              book.discount > 0
                                ? `
                                <span class="current-price">${parseInt(
                                  discountPrice
                                ).toLocaleString()} đ</span>
                                <span class="original-price">${book.price.toLocaleString()} đ</span>
                                <span class="discount-percent">-${
                                  book.discount
                                }%</span>
                            `
                                : `
                                <span class="current-price">${book.price.toLocaleString()} đ</span>
                            `
                            }
                        </div>
                    </div>
                    
                    <div class="quantity-section">
                        <span class="quantity-label">Số lượng:</span>
                        <div class="quantity-selector">
                            <button class="qty-btn" id="decrease-qty">
                                <i class="fas fa-minus"></i>
                            </button>
                            <input type="number" class="qty-input" id="quantity" value="1" min="1" max="99" readonly>
                            <button class="qty-btn" id="increase-qty">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Product Description -->
            <div class="product-description">
                <h3 class="description-title">Thông tin chi tiết</h3>
                <div class="description-content">
                    ${
                      book.description ||
                      "Giá sản phẩm trên T-store đã bao gồm thuế theo luật hiện hành. Bên cạnh đó, tuỳ vào loại sản phẩm, hình thức và địa chỉ giao hàng mà có thể phát sinh thêm chi phí khác như Phụ phí đóng gói, phí vận chuyện, phụ phí hàng cồng kềnh,..."
                    }
                </div>
                
                <div class="product-warning">
                    <p><strong>Chính sách khuyến mãi trên T-store không áp dụng cho Hệ thống Nhà sách T-store trên toàn quốc</strong></p>
                </div>
            </div>
        `;

    // Cập nhật breadcrumb và tiêu đề trang
    this.updatePageInfo();

    // Khởi tạo sự kiện
    this.initEventListeners();
  }

  updatePageInfo() {
    const book = this.currentBook;

    // Cập nhật tiêu đề trang
    document.title = `${book.title} - T-Store`;

    // Cập nhật breadcrumb
    const genreBreadcrumb = document.getElementById("genre-breadcrumb");
    const bookBreadcrumb = document.getElementById("book-breadcrumb");

    if (genreBreadcrumb && book.genre) {
      genreBreadcrumb.textContent = book.genre;
      // Map thể loại sang route URL
      const genreRouteMap = {
        "Tiểu thuyết": "/tieuthuyet",
        "Văn học": "/vanhoc",
        "Truyện tranh": "/truyentranh",
        "Sách kinh tế": "/sachkinhte",
        "Tâm lý-Kỹ năng sống": "/tamly-kynangsong",
      };
      genreBreadcrumb.href =
        genreRouteMap[book.genre] ||
        `/theloai?genre=${encodeURIComponent(book.genre)}`;
    }

    if (bookBreadcrumb) {
      bookBreadcrumb.textContent = book.title;
    }
  }

  initEventListeners() {
    // Điều khiển số lượng
    const decreaseBtn = document.getElementById("decrease-qty");
    const increaseBtn = document.getElementById("increase-qty");
    const quantityInput = document.getElementById("quantity");

    if (decreaseBtn) {
      decreaseBtn.addEventListener("click", () => {
        const current = parseInt(quantityInput.value);
        if (current > 1) {
          quantityInput.value = current - 1;
        }
      });
    }

    if (increaseBtn) {
      increaseBtn.addEventListener("click", () => {
        const current = parseInt(quantityInput.value);
        if (current < 99) {
          quantityInput.value = current + 1;
        }
      });
    }

    // ✅ Nút thêm vào giỏ hàng - QUAN TRỌNG: Truyền số lượng
    const addToCartBtn = document.getElementById("add-to-cart-btn");
    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation(); // ✨ QUAN TRỌNG: Ngăn event delegation của cart.js
        
        const quantity = parseInt(quantityInput.value) || 1;
        const productId = addToCartBtn.dataset.productId;
        
        console.log(`🛒 Adding to cart: Product ${productId}, Quantity: ${quantity}`);
        
        // Kiểm tra ShoppingCart có sẵn không
        if (typeof ShoppingCart !== 'undefined') {
          try {
            // ✨ GỌI addItem nhiều lần theo số lượng
            // Vì ShoppingCart.addItem() chỉ thêm 1 item mỗi lần
            for (let i = 0; i < quantity; i++) {
              await ShoppingCart.addItem(productId);
            }
            
            console.log(`✅ Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
            
          } catch (error) {
            console.error('❌ Lỗi khi thêm vào giỏ hàng:', error);
            alert('Có lỗi xảy ra. Vui lòng thử lại.');
          }
        } else {
          console.error('❌ ShoppingCart không khả dụng');
          alert('Không thể thêm vào giỏ hàng. Vui lòng tải lại trang.');
        }
      });
    }

    // Nút mua ngay
    const buyNowBtn = document.getElementById("buy-now-btn");
    if (buyNowBtn) {
      buyNowBtn.addEventListener("click", () => this.handleBuyNow());
    }
  }

  handleBuyNow() {
    const quantityInput = document.getElementById("quantity");
    const quantity = parseInt(quantityInput.value) || 1;
    
    console.log(`🛒 Buy now: ${this.currentBook.title} (Quantity: ${quantity})`);

    // Thêm vào giỏ hàng với số lượng đã chọn
    if (typeof ShoppingCart !== 'undefined') {
      try {
        // Thêm sản phẩm nhiều lần theo số lượng
        for (let i = 0; i < quantity; i++) {
          ShoppingCart.addItem(this.currentBook.bookId);
        }
        
        // Chuyển đến trang thanh toán
        setTimeout(() => {
          window.location.href = '/checkout';
        }, 500);
      } catch (error) {
        console.error('❌ Lỗi khi mua ngay:', error);
        alert('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } else {
      alert(`Mua ngay ${quantity} cuốn "${this.currentBook.title}"`);
    }
  }

  async loadRelatedBooks(genre) {
    try {
      console.log(`🔗 Loading related books for genre: ${genre}`);

      const response = await fetch(
        `/api/books/genre/${encodeURIComponent(genre)}`
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const relatedBooks = await response.json();
      // Lọc sách theo sách hiện tại và lấy ra 6 cuốn sách ngẫu nhiên
      const filteredBooks = relatedBooks
        .filter((book) => book.bookId !== this.currentBook.bookId)
        .sort(() => 0.5 - Math.random())
        .slice(0, 6);

      if (filteredBooks.length > 0) {
        this.renderRelatedBooks(filteredBooks);
      }
    } catch (error) {
      console.error("❌ Error loading related books:", error);
    }
  }

  renderRelatedBooks(books) {
    const section = document.getElementById("related-products-section");
    const container = document.getElementById("related-books-container");

    if (!container) return;

    const booksHTML = books
      .map((book) => {
        const discountPrice =
          book.discount > 0
            ? (book.price * (1 - book.discount / 100)).toFixed(0)
            : book.price;
        const imgPath = book.image.replace(/^(\.\.\/)+/, "/public/");
        return `
                <div class="book-item">
                    <div class="book-image">
                        <img src="${imgPath}" 
                             alt="${book.title}"
                             onerror="this.style.display='none'; this.onerror=null;">
                        <div class="overlay-info">
                            <a href="/sanpham/${
                              book.bookId
                            }" class="info-btn">Thông tin sách</a>
                        </div>
                    </div>
                    <div class="book-info">
                        <div class="book-title">${book.title}</div>
                        <div class="book-price">
                            ${
                              book.discount > 0
                                ? `
                                <div>
                                    <span class="original-price">${book.price.toLocaleString()}đ</span>
                                    <span class="discount">-${
                                      book.discount
                                    }%</span>
                                </div>
                                <span class="price">${parseInt(
                                  discountPrice
                                ).toLocaleString()}đ</span>
                            `
                                : `
                                <span class="price">${book.price.toLocaleString()}đ</span>
                            `
                            }
                        </div>
                        <div class="book-actions">
                            <button 
                            class="add-to-cart-btn" 
                            type="button"
                            data-action="add-to-cart" 
                            data-product-id="${book.bookId}"
                            title="Thêm vào giỏ hàng" 
                            aria-label="Thêm vào giỏ hàng">
                            <i class="fas fa-cart-plus"></i>
                            </button>
                            <a href="#" class="buy-btn" style="text-decoration:none;">MUA</a>
                        </div>
                    </div>
                </div>
            `;
      })
      .join("");

    container.innerHTML = `
            <div class="related-books-grid">
                ${booksHTML}
            </div>
        `;
    section.style.display = "block";

    console.log(`✅ Rendered ${books.length} related books`);
  }

  showError(message) {
    const container = document.getElementById("product-detail-container");
    const loadingContainer = document.getElementById("loading-container");

    if (loadingContainer) {
      loadingContainer.style.display = "none";
    }

    container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger text-center" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    ${message}
                    <br>
                    <a href="/" class="btn btn-primary mt-3">Về trang chủ</a>
                </div>
            </div>
        `;
  }
}

// Initialize product detail page
const productDetailPage = new ProductDetailPage();

// Export for external use
window.ProductDetailPage = ProductDetailPage;